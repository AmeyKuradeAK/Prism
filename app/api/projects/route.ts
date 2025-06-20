import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectToDatabase from '@/lib/database/mongodb'
import Project from '@/lib/database/models/Project'

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

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try MongoDB first, fall back to dev storage
    try {
      await connectToDatabase()
      
      const projects = await Project.find({ userId })
        .sort({ updatedAt: -1 })
        .select('name description status createdAt updatedAt files analytics')
        .lean()
        .limit(50)

      const formattedProjects = projects.map(project => ({
        ...project,
        description: project.description || 'No description',
        files: project.files || [],
        analytics: project.analytics || {
          views: 0,
          downloads: 0,
          likes: 0,
          shares: 0
        }
      }))

      return NextResponse.json(formattedProjects)
    } catch (dbError) {
      console.log('📦 Using development storage - MongoDB unavailable')
      
      if (isDevelopment) {
        const devProjectsList = await getDevProjects(userId)
        return NextResponse.json(devProjectsList)
      }
      
      throw dbError
    }
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, prompt, files } = body

    const projectData = {
      name,
      description,
      prompt,
      userId,
      files: files || [],
      status: files?.length > 0 ? 'completed' : 'draft',
      analytics: {
        views: 0,
        downloads: 0,
        likes: 0,
        shares: 0
      },
      metadata: {
        version: '1.0.0',
        expoVersion: '53.0.0',
        dependencies: [],
        size: 0
      },
      isPublic: false,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Try MongoDB first, fall back to dev storage
    try {
      await connectToDatabase()
      const project = new Project(projectData)
      await project.save()
      return NextResponse.json(project, { status: 201 })
    } catch (dbError) {
      console.log('📦 Saving to development storage - MongoDB unavailable')
      
      if (isDevelopment) {
        const newProject = {
          ...projectData,
          _id: `dev-project-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        devProjects.push(newProject)
        return NextResponse.json(newProject, { status: 201 })
      }
      
      throw dbError
    }
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
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