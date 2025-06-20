import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { easBuildService } from '@/lib/eas-build/eas-service'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectName, files, platform, buildProfile } = await request.json()

    if (!projectName || !files || !platform) {
      return Response.json({ 
        error: 'Missing required fields: projectName, files, platform' 
      }, { status: 400 })
    }

    // Initialize the build
    const buildResult = await easBuildService.initializeBuild({
      projectName,
      files,
      platform,
      buildProfile: buildProfile || 'preview',
      userId
    })

    return Response.json(buildResult)
  } catch (error) {
    console.error('Build API error:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Build failed' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const buildId = url.searchParams.get('buildId')

    if (buildId) {
      // Get specific build status
      const build = easBuildService.getBuildStatus(buildId)
      if (!build) {
        return Response.json({ error: 'Build not found' }, { status: 404 })
      }
      return Response.json(build)
    } else {
      // Get all builds for user
      const builds = easBuildService.getAllBuilds(userId)
      return Response.json(builds)
    }
  } catch (error) {
    console.error('Build status API error:', error)
    return Response.json({ 
      error: 'Failed to get build status' 
    }, { status: 500 })
  }
} 