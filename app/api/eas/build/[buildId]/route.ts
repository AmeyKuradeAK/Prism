import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

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

    // Check for EXPO_TOKEN environment variable
    const expoToken = process.env.EXPO_TOKEN
    if (!expoToken) {
      return NextResponse.json({ 
        error: 'EXPO_TOKEN not configured. Cannot fetch build status.',
      }, { status: 500 })
    }

    console.log(`🔍 Fetching serverless EAS Build status for: ${buildId}`)

    try {
      // Check if this is a demo build
      if (buildId.startsWith('demo-')) {
        // Simulate demo build progression
        const createdTime = parseInt(buildId.split('-')[1])
        const elapsed = Date.now() - createdTime
        
        let status = 'pending'
        let artifacts: Array<{url: string, type: string}> = []
        
        if (elapsed > 30000) { // 30 seconds
          status = 'building'
        }
        if (elapsed > 120000) { // 2 minutes
          status = 'success'
          artifacts = [{
            url: `https://github.com/expo/expo/releases/download/sdk-53.0.0/expo-template-default.apk`,
            type: 'application/vnd.android.package-archive'
          }]
        }
        
        return NextResponse.json({
          id: buildId,
          status,
          platform: 'android',
          createdAt: new Date(createdTime).toISOString(),
          completedAt: status === 'success' ? new Date().toISOString() : undefined,
          artifacts,
          demo: true,
          message: 'Demo build simulation'
        })
      }

      // ✅ SERVERLESS APPROACH: Use EAS Build REST API
      const easApiResponse = await fetch(`https://api.expo.dev/v2/builds/${buildId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${expoToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!easApiResponse.ok) {
        if (easApiResponse.status === 404) {
          return NextResponse.json({ 
            error: 'Build not found. It may have been deleted or the build ID is invalid.',
            buildId 
          }, { status: 404 })
        } else if (easApiResponse.status === 401) {
          return NextResponse.json({ 
            error: 'Authentication failed. Please check your EXPO_TOKEN.',
          }, { status: 401 })
        } else {
          const errorData = await easApiResponse.text()
          throw new Error(`EAS API error (${easApiResponse.status}): ${errorData}`)
        }
      }

      const buildStatus = await easApiResponse.json()
      console.log('✅ Serverless EAS Build status fetched:', buildStatus)

      // Transform EAS Build API response to our format
      const transformedStatus = {
        id: buildStatus.id,
        status: transformEASStatus(buildStatus.status),
        platform: buildStatus.platform,
        createdAt: buildStatus.createdAt,
        completedAt: buildStatus.completedAt,
        buildLogsUrl: buildStatus.buildLogsUrl,
        artifacts: buildStatus.artifacts?.map((artifact: any) => ({
          url: artifact.url,
          type: artifact.type
        })) || [],
        error: buildStatus.error,
        serverless: true
      }

      return NextResponse.json(transformedStatus)

    } catch (apiError) {
      console.error('EAS REST API Error:', apiError)
      const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error'
      
      return NextResponse.json({ 
        error: `Serverless API Error: ${errorMessage}`,
        serverless: true,
        troubleshooting: {
          docs: 'https://docs.expo.dev/build-reference/build-webhooks/',
          status: 'https://status.expo.dev/',
          deployment: 'Netlify serverless environment'
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error fetching serverless build status:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch build status'
    
    return NextResponse.json({
      error: `Serverless Error: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      serverless: true
    }, { status: 500 })
  }
}

// Transform EAS Build status to our expected format
function transformEASStatus(easStatus: string): string {
  switch (easStatus?.toLowerCase()) {
    case 'new':
    case 'pending':
    case 'in-queue':
      return 'pending'
    case 'in-progress':
    case 'building':
      return 'building'
    case 'finished':
    case 'completed':
      return 'success'
    case 'errored':
    case 'failed':
      return 'error'
    case 'canceled':
    case 'cancelled':
      return 'error'
    default:
      return easStatus || 'pending'
  }
} 