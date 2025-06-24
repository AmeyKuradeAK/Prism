import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectToDatabase from '@/lib/database/mongodb'
import Project from '@/lib/database/models/Project'
import User from '@/lib/database/models/User'

// Development mode helpers
const isDevelopment = process.env.NODE_ENV === 'development'

// In-memory storage for development (resets on server restart)
let devProjects: any[] = []

async function getDevProjects(userId: string) {
  // Simulate some default projects for development
  if (devProjects.length === 0) {
    devProjects = [
      {
        _id: 'dev-project-1',
        name: 'My First App',
        description: 'A sample React Native app built with AI',
        userId,
        status: 'completed',
        files: [
          { name: 'App.tsx', content: 'export default function App() { return <div>Hello World</div> }' }
        ],
        analytics: { views: 10, downloads: 5, likes: 3, shares: 1 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'dev-project-2',
        name: 'E-commerce Mobile App',
        description: 'Shopping app with React Native',
        userId,
        status: 'draft',
        files: [],
        analytics: { views: 0, downloads: 0, likes: 0, shares: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }
  return devProjects.filter(p => p.userId === userId)
}

// GET - Fetch all projects for the authenticated user
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('📁 Fetching projects for user:', userId)

    try {
      await connectToDatabase()
      console.log('✅ Database connected successfully')
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError)
      return NextResponse.json({
        error: 'Database connection failed',
        message: 'Unable to connect to database. Please try again later.',
        offline: true
      }, { status: 503 })
    }
    
    try {
      // Fetch user's projects sorted by most recent
      const projects = await Project.find({ userId })
        .sort({ updatedAt: -1 })
        .select('_id name description prompt status createdAt updatedAt analytics metadata tags')
        .lean()
      
      console.log(`📁 Found ${projects.length} projects for user`)
      
      // Transform to include file count and size info
      const projectsWithStats = projects.map(project => ({
        ...project,
        fileCount: project.metadata?.size || 0,
        lastModified: project.updatedAt,
        id: project._id.toString()
      }))

      return NextResponse.json({
        success: true,
        projects: projectsWithStats,
        count: projects.length
      })
    } catch (queryError) {
      console.error('❌ Database query failed:', queryError)
      return NextResponse.json({
        error: 'Failed to fetch projects',
        message: 'Database query failed. Please try again later.',
        offline: true
      }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ General error fetching projects:', error)
    return NextResponse.json({
      error: 'Failed to fetch projects',
      message: 'An unexpected error occurred. Please try again later.',
      offline: true
    }, { status: 500 })
  }
}

// POST - Save a new project with generated files
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, prompt, files, provider, model } = await request.json()

    if (!name || !prompt || !files) {
      return NextResponse.json(
        { error: 'Name, prompt, and files are required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Transform files object to array format expected by the model
    const filesArray = Object.entries(files).map(([path, content]) => {
      const extension = path.split('.').pop()?.toLowerCase() || 'txt'
      
      let fileType = 'txt'
      if (['tsx', 'ts', 'js', 'jsx', 'json', 'md'].includes(extension)) {
        fileType = extension
      }

      return {
        path,
        content: content as string,
        type: fileType
      }
    })

    // Generate project name if not provided
    const projectName = name || `${prompt.slice(0, 30)}...`
    
    // Calculate project metadata
    const totalSize = filesArray.reduce((sum, file) => sum + file.content.length, 0)
    const dependencies = extractDependencies(filesArray)

    // Create new project
    const project = new Project({
      name: projectName,
      description: description || `Generated from: ${prompt}`,
      prompt,
      userId,
      files: filesArray,
      status: 'completed',
      metadata: {
        version: '1.0.0',
        expoVersion: '50.0.0',
        dependencies,
        size: filesArray.length
      },
      analytics: {
        views: 0,
        downloads: 0,
        likes: 0,
        shares: 0
      },
      tags: extractTags(prompt)
    })

    const savedProject = await project.save()

    // Track project creation using the usage tracker
    const { trackProjectCreation } = await import('@/lib/utils/usage-tracker')
    const projectTracked = await trackProjectCreation(userId)
    if (!projectTracked) {
      console.log('⚠️ Failed to track project creation in projects API')
      
      // Fallback to direct database update if tracking fails
      await User.findOneAndUpdate(
        { clerkId: userId },
        { 
          $inc: { 
            'usage.projectsThisMonth': 1,
            'analytics.totalProjects': 1
          },
          $set: {
            'analytics.lastActiveAt': new Date()
          }
        }
      )
    }

    console.log(`✅ Project saved: "${projectName}" with ${filesArray.length} files`)

    return NextResponse.json({
      success: true,
      project: {
        id: savedProject._id.toString(),
        name: savedProject.name,
        description: savedProject.description,
        fileCount: filesArray.length,
        createdAt: savedProject.createdAt
      },
      message: `Project "${projectName}" saved successfully with ${filesArray.length} files`
    }, { status: 201 })

  } catch (error) {
    console.error('Error saving project:', error)
    return NextResponse.json(
      { error: 'Failed to save project' },
      { status: 500 }
    )
  }
}

// Helper function to extract dependencies from package.json
function extractDependencies(files: Array<{ path: string; content: string; type: string }>): string[] {
  const packageJsonFile = files.find(file => file.path.includes('package.json'))
  
  if (!packageJsonFile) return []
  
  try {
    const packageJson = JSON.parse(packageJsonFile.content)
    const dependencies = Object.keys(packageJson.dependencies || {})
    const devDependencies = Object.keys(packageJson.devDependencies || {})
    return [...dependencies, ...devDependencies]
  } catch {
    return []
  }
}

// Helper function to extract tags from prompt
function extractTags(prompt: string): string[] {
  const commonTags = ['react-native', 'expo', 'mobile', 'app']
  const promptWords = prompt.toLowerCase().split(' ')
  
  const additionalTags = []
  
  // Add tags based on keywords in prompt
  if (promptWords.some(word => ['todo', 'task', 'list'].includes(word))) {
    additionalTags.push('productivity')
  }
  if (promptWords.some(word => ['game', 'play', 'puzzle'].includes(word))) {
    additionalTags.push('games')
  }
  if (promptWords.some(word => ['shop', 'store', 'buy', 'commerce'].includes(word))) {
    additionalTags.push('e-commerce')
  }
  if (promptWords.some(word => ['social', 'chat', 'message'].includes(word))) {
    additionalTags.push('social')
  }
  if (promptWords.some(word => ['weather', 'news', 'api'].includes(word))) {
    additionalTags.push('utilities')
  }
  
  return [...commonTags, ...additionalTags]
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, description, prompt, files, lastModified } = body

    const updateData = {
      name,
      description,
      prompt,
      files: files || [],
      status: files?.length > 0 ? 'completed' : 'draft',
      metadata: {
        version: '1.0.0',
        expoVersion: '53.0.0',
        dependencies: [],
        size: Object.keys(files || {}).length
      },
      updatedAt: new Date()
    }

    // Try MongoDB first, fall back to dev storage
    try {
      await connectToDatabase()
      
      const project = await Project.findOneAndUpdate(
        { _id: id, userId },
        updateData,
        { new: true, runValidators: true }
      )

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }

      return NextResponse.json(project)
    } catch (dbError) {
      console.log('📦 Updating in development storage - MongoDB unavailable')
      
      if (isDevelopment) {
        const projectIndex = devProjects.findIndex(p => p._id === id && p.userId === userId)
        if (projectIndex === -1) {
          return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        
        devProjects[projectIndex] = {
          ...devProjects[projectIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        }
        
        return NextResponse.json(devProjects[projectIndex])
      }
      
      throw dbError
    }
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
} 