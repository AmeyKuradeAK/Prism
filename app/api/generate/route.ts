import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { runV0Pipeline } from '@/lib/generators/v0-pipeline'
import { generateStandardReactNativeTemplate } from '@/lib/generators/templates/standard-react-native-template'
import { trackPromptUsage } from '@/lib/utils/usage-tracker'
import { checkUsageLimits, createUsageLimitResponse } from '@/lib/utils/plan-protection'
import connectToDatabase from '@/lib/database/mongodb'
import User from '@/lib/database/models/User'
import Project from '@/lib/database/models/Project'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt, projectId } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    console.log('🚀 Starting app generation for user:', userId)
    console.log('📝 Prompt:', prompt.substring(0, 100) + '...')

    // Check usage limits before generation
    try {
      const usageCheck = await checkUsageLimits(userId)
      if (!usageCheck.allowed) {
        console.log('❌ Usage limit reached:', usageCheck.reason)
        return createUsageLimitResponse(usageCheck.limit || 0, 'prompts')
      }
    } catch (error) {
      console.error('❌ Usage check failed:', error)
      // Continue with generation but log the error
    }

    let files: { [key: string]: string } = {}
    let appName = 'MyReactNativeApp'

    // Try AI generation first
    try {
      console.log('🧠 Attempting AI generation...')
      files = await runV0Pipeline(prompt)
      appName = extractAppName(prompt)
      console.log('✅ AI generation successful')
    } catch (aiError) {
      console.error('❌ AI generation failed:', aiError)
      
      // Fallback to template generation
      try {
        console.log('📱 Falling back to template generation...')
        const { generateStandardReactNativeTemplate } = await import('@/lib/generators/templates/standard-react-native-template')
        appName = extractAppName(prompt)
        files = generateStandardReactNativeTemplate(appName)
        console.log('✅ Template generation successful')
      } catch (templateError) {
        console.error('❌ Template generation failed:', templateError)
        return NextResponse.json({ 
          error: 'Failed to generate app. Please try again.',
          details: templateError instanceof Error ? templateError.message : 'Unknown error'
        }, { status: 500 })
      }
    }

    // Track prompt usage after successful generation
    try {
      const usageTracked = await trackPromptUsage(userId)
      if (!usageTracked) {
        console.warn('⚠️ Failed to track prompt usage, but generation succeeded')
      } else {
        console.log('✅ Prompt usage tracked successfully')
      }
    } catch (usageError) {
      console.error('❌ Usage tracking failed:', usageError)
      // Don't fail the request if usage tracking fails
    }

    // Save project to database
    try {
      await connectToDatabase()
      
      let project: any = null
      if (projectId) {
        // Update existing project
        project = await Project.findOneAndUpdate(
          { _id: projectId, userId },
          {
            name: appName,
            description: prompt,
            files: files,
            lastModified: new Date(),
            version: 1
          },
          { new: true }
        )
      } else {
        // Create new project
        project = await Project.create({
          userId,
          name: appName,
          description: prompt,
          files: files,
          version: 1
        })
      }

      if (!project) {
        throw new Error('Failed to save project')
      }

      console.log('✅ Project saved:', project._id)

      return NextResponse.json({
        success: true,
        projectId: project._id,
        appName,
        files,
        message: 'App generated successfully!'
      })

    } catch (dbError) {
      console.error('❌ Database save failed:', dbError)
      
      // Return files even if save fails
      return NextResponse.json({
        success: true,
        appName,
        files,
        message: 'App generated successfully! (Project save failed)',
        warning: 'Project was not saved to database'
      })
    }

  } catch (error) {
    console.error('❌ Generation failed:', error)
    return NextResponse.json({
      error: 'Failed to generate app',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to extract app name from prompt
function extractAppName(prompt: string): string {
  // Look for app name patterns in the prompt
  const nameMatch = prompt.match(/(?:create|build|make)\s+(?:a|an)\s+(?:app|application)\s+(?:called\s+)?([A-Za-z][A-Za-z0-9\s]+?)(?:\s|$|\.|,)/i)
  if (nameMatch && nameMatch[1]) {
    return nameMatch[1].trim().replace(/\s+/g, '')
  }
  
  // Fallback to default name
  return 'MyReactNativeApp'
}

// GET endpoint for testing
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return a simple test response
    const { generateStandardReactNativeTemplate } = await import('@/lib/generators/templates/standard-react-native-template')
    const templateFiles = generateStandardReactNativeTemplate('TestApp')
    
    return NextResponse.json({
      success: true,
      message: 'Generation endpoint is working',
      templateFiles: Object.keys(templateFiles),
      sampleFile: Object.keys(templateFiles)[0]
    })

  } catch (error) {
    console.error('❌ GET test failed:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT endpoint for updating projects
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, prompt } = await request.json()
    
    if (!projectId || !prompt) {
      return NextResponse.json({ error: 'Project ID and prompt are required' }, { status: 400 })
    }

    console.log('🔄 Updating project:', projectId)

    // Check usage limits before generation
    try {
      const usageCheck = await checkUsageLimits(userId)
      if (!usageCheck.allowed) {
        console.log('❌ Usage limit reached:', usageCheck.reason)
        return createUsageLimitResponse(usageCheck.limit || 0, 'prompts')
      }
    } catch (error) {
      console.error('❌ Usage check failed:', error)
    }

    // Generate new files
    let files: { [key: string]: string } = {}
    let appName = 'MyReactNativeApp'

    try {
      console.log('🧠 Attempting AI generation for update...')
      files = await runV0Pipeline(prompt)
      appName = extractAppName(prompt)
      console.log('✅ AI generation successful')
    } catch (aiError) {
      console.error('❌ AI generation failed:', aiError)
      
      // Fallback to template generation
      try {
        console.log('📱 Falling back to template generation...')
        const { generateStandardReactNativeTemplate } = await import('@/lib/generators/templates/standard-react-native-template')
        appName = extractAppName(prompt)
        files = generateStandardReactNativeTemplate(appName)
        console.log('✅ Template generation successful')
      } catch (templateError) {
        console.error('❌ Template generation failed:', templateError)
        return NextResponse.json({ 
          error: 'Failed to generate app. Please try again.',
          details: templateError instanceof Error ? templateError.message : 'Unknown error'
        }, { status: 500 })
      }
    }

    // Track prompt usage after successful generation
    try {
      const usageTracked = await trackPromptUsage(userId)
      if (!usageTracked) {
        console.warn('⚠️ Failed to track prompt usage, but generation succeeded')
      } else {
        console.log('✅ Prompt usage tracked successfully')
      }
    } catch (usageError) {
      console.error('❌ Usage tracking failed:', usageError)
    }

    // Update project in database
    try {
      await connectToDatabase()
      
      const project = await Project.findOneAndUpdate(
        { _id: projectId, userId },
        {
          name: appName,
          description: prompt,
          files: files,
          lastModified: new Date(),
          $inc: { version: 1 }
        },
        { new: true }
      )

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }

      console.log('✅ Project updated:', project._id)

      return NextResponse.json({
        success: true,
        projectId: project._id,
        appName,
        files,
        message: 'App updated successfully!'
      })

    } catch (dbError) {
      console.error('❌ Database update failed:', dbError)
      return NextResponse.json({
        error: 'Failed to update project',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Update failed:', error)
    return NextResponse.json({
      error: 'Failed to update app',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE endpoint for deleting projects
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    console.log('🗑️ Deleting project:', projectId)

    try {
      await connectToDatabase()
      
      const project = await Project.findOneAndDelete({ _id: projectId, userId })

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }

      console.log('✅ Project deleted:', projectId)

      return NextResponse.json({
        success: true,
        message: 'Project deleted successfully!'
      })

    } catch (dbError) {
      console.error('❌ Database delete failed:', dbError)
      return NextResponse.json({
        error: 'Failed to delete project',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Delete failed:', error)
    return NextResponse.json({
      error: 'Failed to delete project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 