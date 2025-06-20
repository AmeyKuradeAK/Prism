import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectToDatabase from '@/lib/database/mongodb'
import Project from '@/lib/database/models/Project'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const project = await Project.findOne({ 
      _id: params.id, 
      userId 
    })

    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 })
    }

    return Response.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return Response.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
} 