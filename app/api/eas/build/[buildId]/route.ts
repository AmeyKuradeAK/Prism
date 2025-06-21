import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getBuildStatus } from '@/lib/eas-build/build-status'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ buildId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { buildId } = await params

    // Get build status from utility
    const buildStatus = getBuildStatus(buildId)

    if (!buildStatus) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 })
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