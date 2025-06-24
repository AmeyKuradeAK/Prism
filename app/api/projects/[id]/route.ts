import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectToDatabase from '@/lib/database/mongodb'
import Project from '@/lib/database/models/Project'
import { writeProjectToTempDir } from '@/lib/utils/project-to-temp'

// GET - Fetch a specific project with all files
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    await connectToDatabase()
    
    // Fetch the specific project with all files
    const project = await Project.findOne({ 
      _id: id, 
      userId // Ensure user can only access their own projects
    }).lean()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Transform files array back to object format for frontend
    const filesObject: { [key: string]: string } = {}
    project.files.forEach(file => {
      filesObject[file.path] = file.content
    })

    // Increment view count
    await Project.findByIdAndUpdate(id, {
      $inc: { 'analytics.views': 1 }
    })

    const response = {
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      prompt: project.prompt,
      files: filesObject,
      status: project.status,
      analytics: project.analytics,
      metadata: project.metadata,
      tags: project.tags,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      fileCount: project.files.length
    }

    return NextResponse.json({
      success: true,
      project: response
    })

  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

// PUT - Update project (rename, change description, etc.)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const { id } = params
    const { name, description, tags } = await request.json()

    await connectToDatabase()
    
    // Update project
    const updatedProject = await Project.findOneAndUpdate(
      { _id: id, userId },
      { 
        name,
        description,
        tags,
        updatedAt: new Date()
      },
      { new: true }
    ).lean()

    if (!updatedProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      project: {
        id: updatedProject._id.toString(),
        name: updatedProject.name,
        description: updatedProject.description,
        tags: updatedProject.tags,
        updatedAt: updatedProject.updatedAt
      },
      message: 'Project updated successfully'
    })

  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a project
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const { id } = params

    await connectToDatabase()
    
    // Delete project
    const deletedProject = await Project.findOneAndDelete({ 
      _id: id, 
      userId 
    })

    if (!deletedProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // Export project to temp dir
  const project = await Project.findById(params.id)
  if (!project) {
    return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404 })
  }
  const tempDir = await writeProjectToTempDir(project.files, project._id.toString())
  return new Response(JSON.stringify({ tempDir }), { status: 200 })
} 