import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

interface BuildStatus {
  id: string
  status: 'in-queue' | 'in-progress' | 'finished' | 'errored' | 'canceled'
  platform: 'android' | 'ios' | 'all'
  createdAt: string
  completedAt?: string
  artifacts?: Array<{
    url: string
    type: 'application/vnd.android.package-archive' | 'application/octet-stream'
  }>
  buildLogsUrl?: string
  error?: string
}

// In-memory build status storage (in production, use Redis or database)
const buildStatuses = new Map<string, BuildStatus>()

export async function GET(
  request: NextRequest,
  { params }: { params: { buildId: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const buildId = params.buildId

    // Check if build exists
    if (!buildStatuses.has(buildId)) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 })
    }

    const buildStatus = buildStatuses.get(buildId)!

    // Simulate EAS build progression for demo
    const now = Date.now()
    const createdTime = new Date(buildStatus.createdAt).getTime()
    const elapsed = now - createdTime

    // Simulate build phases
    if (buildStatus.status === 'in-queue' && elapsed > 30000) { // 30 seconds
      buildStatus.status = 'in-progress'
      buildStatuses.set(buildId, buildStatus)
    }
    
    if (buildStatus.status === 'in-progress' && elapsed > 300000) { // 5 minutes
      buildStatus.status = 'finished'
      buildStatus.completedAt = new Date().toISOString()
      
      // Add download artifacts
      if (buildStatus.platform === 'android' || buildStatus.platform === 'all') {
        buildStatus.artifacts = [
          {
            url: `https://expo.dev/artifacts/eas/${buildId}/android-build.apk`,
            type: 'application/vnd.android.package-archive'
          }
        ]
      }
      
      if (buildStatus.platform === 'ios' || buildStatus.platform === 'all') {
        buildStatus.artifacts = [
          ...buildStatus.artifacts || [],
          {
            url: `https://expo.dev/artifacts/eas/${buildId}/ios-build.ipa`,
            type: 'application/octet-stream'
          }
        ]
      }
      
      buildStatuses.set(buildId, buildStatus)
    }

    return NextResponse.json(buildStatus)

  } catch (error) {
    console.error('Error fetching build status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch build status' },
      { status: 500 }
    )
  }
}

// Initialize build status when build is created
export function initializeBuildStatus(buildId: string, platform: 'android' | 'ios' | 'all') {
  const buildStatus: BuildStatus = {
    id: buildId,
    status: 'in-queue',
    platform,
    createdAt: new Date().toISOString()
  }
  
  buildStatuses.set(buildId, buildStatus)
  return buildStatus
} 