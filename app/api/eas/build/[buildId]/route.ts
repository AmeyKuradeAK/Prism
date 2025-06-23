import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

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

    console.log(`🔍 Fetching real EAS Build status for: ${buildId}`)

    try {
      // Use EAS CLI to get real build status
      const env = {
        ...process.env,
        EXPO_TOKEN: expoToken,
      }

      const easCommand = `npx eas-cli build:view ${buildId} --json`
      console.log(`Running: ${easCommand}`)

      const { stdout, stderr } = await execAsync(easCommand, {
        env,
        timeout: 30000 // 30 second timeout
      })

      if (stderr) {
        console.log('EAS CLI stderr:', stderr)
      }

      // Parse the JSON output from EAS CLI
      let buildStatus
      try {
        const jsonMatch = stdout.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          buildStatus = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON output from EAS CLI')
        }
      } catch (parseError) {
        console.error('Failed to parse EAS CLI output:', parseError)
        throw new Error('Could not parse build status from EAS CLI')
      }

      console.log('✅ Real EAS Build status fetched:', buildStatus)

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
        error: buildStatus.error
      }

      return NextResponse.json(transformedStatus)

    } catch (execError) {
      console.error('EAS CLI execution error:', execError)
      
      // If EAS CLI fails, provide helpful error messages
      const errorMessage = execError instanceof Error ? execError.message : 'Unknown error'
      
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        return NextResponse.json({ 
          error: 'Build not found. It may have been deleted or the build ID is invalid.',
          buildId 
        }, { status: 404 })
      } else if (errorMessage.includes('authentication') || errorMessage.includes('401')) {
        return NextResponse.json({ 
          error: 'Authentication failed. Please check your EXPO_TOKEN.',
        }, { status: 401 })
      } else {
        return NextResponse.json({ 
          error: `Failed to fetch build status: ${errorMessage}`,
          troubleshooting: {
            docs: 'https://docs.expo.dev/build-reference/cli/',
            status: 'https://status.expo.dev/'
          }
        }, { status: 500 })
      }
    }

  } catch (error) {
    console.error('Error fetching real build status:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch build status'
    
    return NextResponse.json({
      error: errorMessage,
      timestamp: new Date().toISOString()
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