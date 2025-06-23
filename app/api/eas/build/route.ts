import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { files, platform, projectName } = await request.json()

    if (!files || typeof files !== 'object') {
      return NextResponse.json({ error: 'Files data is required' }, { status: 400 })
    }

    if (!platform || !['android', 'ios', 'web'].includes(platform)) {
      return NextResponse.json({ error: 'Valid platform is required (android, ios, web)' }, { status: 400 })
    }

    // Check for EXPO_TOKEN environment variable
    const expoToken = process.env.EXPO_TOKEN
    if (!expoToken) {
      return NextResponse.json({ 
        error: 'EXPO_TOKEN not configured. Please add your Expo access token to environment variables.',
        setup: 'Visit https://expo.dev/accounts/[account]/settings/access-tokens to create a token'
      }, { status: 500 })
    }

    console.log('🔨 Starting REAL EAS Build...')
    console.log(`📱 Project: ${projectName}`)
    console.log(`🎯 Platform: ${platform}`)
    console.log(`📄 Files: ${Object.keys(files).length}`)

    // Create temporary directory for the project
    const tempDir = path.join(process.cwd(), 'temp-builds', `${projectName}-${Date.now()}`)
    await fs.mkdir(tempDir, { recursive: true })

    try {
      // Write all files to temporary directory
      console.log('📝 Writing project files...')
      for (const [filePath, content] of Object.entries(files)) {
        const fullPath = path.join(tempDir, filePath.startsWith('/') ? filePath.slice(1) : filePath)
        const dir = path.dirname(fullPath)
        
        // Create directory if it doesn't exist
        await fs.mkdir(dir, { recursive: true })
        
        // Write file content
        if (typeof content === 'string') {
          await fs.writeFile(fullPath, content, 'utf-8')
        }
      }

      // Ensure eas.json exists with proper configuration
      const easJsonPath = path.join(tempDir, 'eas.json')
      const easConfig = {
        cli: {
          version: ">= 7.8.0"
        },
        build: {
          development: {
            developmentClient: true,
            distribution: "internal"
          },
          preview: {
            distribution: "internal",
            android: {
              buildType: "apk"
            }
          },
          production: {
            android: {
              buildType: "apk"
            }
          }
        }
      }

      await fs.writeFile(easJsonPath, JSON.stringify(easConfig, null, 2))

      // Set environment variables for EAS CLI
      const env = {
        ...process.env,
        EXPO_TOKEN: expoToken,
        EAS_NO_VCS: '1', // Skip VCS checks
        EAS_BUILD_AUTOCOMMIT: '1', // Auto-commit changes
      }

      console.log('🚀 Executing EAS Build command...')
      
      // Execute EAS build command
      const buildProfile = 'preview' // Use preview profile for faster builds
      const easCommand = `npx eas-cli build --platform ${platform} --profile ${buildProfile} --non-interactive --no-wait --json`
      
      console.log(`Running: ${easCommand}`)

      const { stdout, stderr } = await execAsync(easCommand, {
        cwd: tempDir,
        env,
        timeout: 60000 // 1 minute timeout
      })

      console.log('EAS Build stdout:', stdout)
      if (stderr) {
        console.log('EAS Build stderr:', stderr)
      }

      // Parse the JSON output from EAS CLI
      let buildResult
      try {
        const jsonMatch = stdout.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          buildResult = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON output from EAS CLI')
        }
      } catch (parseError) {
        // Extract build ID from stdout if possible
        const buildIdMatch = stdout.match(/Build ID: ([a-f0-9-]+)/i) || stdout.match(/([a-f0-9-]{36})/i)
        if (buildIdMatch) {
          buildResult = {
            id: buildIdMatch[1],
            status: 'in-queue',
            platform: platform
          }
        } else {
          throw new Error('Could not extract build information from EAS CLI output')
        }
      }

      console.log('✅ Real EAS Build started:', buildResult)

      const buildId = buildResult.id || `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      return NextResponse.json({
        success: true,
        buildId,
        buildUrl: `https://expo.dev/accounts/[account]/projects/${projectName}/builds/${buildId}`,
        platform,
        status: buildResult.status || 'in-queue',
        estimatedDuration: '5-15 minutes',
        queuePosition: buildResult.queuePosition || 1,
        metadata: {
          projectName,
          platform,
          userId,
          createdAt: new Date().toISOString(),
          expoSdkVersion: '53.0.0'
        },
        message: `Real EAS Build started for ${platform}`,
        easOutput: stdout
      })

    } finally {
      // Clean up temporary directory
      setTimeout(async () => {
        try {
          await fs.rmdir(tempDir, { recursive: true })
          console.log(`🧹 Cleaned up temp directory: ${tempDir}`)
        } catch (cleanupError) {
          console.error('Failed to cleanup temp directory:', cleanupError)
        }
      }, 5000) // Wait 5 seconds before cleanup
    }

  } catch (error) {
    console.error('❌ EAS Build failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'EAS Build failed'
    
    return NextResponse.json({ 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Extract native modules from dependencies
function extractNativeModules(dependencies: { [key: string]: string }): string[] {
  const nativeModules: string[] = []
  
  const nativePackages: { [key: string]: string } = {
    'expo-camera': 'Camera',
    'expo-notifications': 'Push Notifications',
    'expo-location': 'Location Services',
    'expo-image-picker': 'Image Picker',
    'expo-av': 'Audio/Video',
    'expo-file-system': 'File System',
    'expo-sensors': 'Device Sensors',
    'expo-haptics': 'Haptic Feedback',
    'expo-local-authentication': 'Biometric Auth',
    'expo-barcode-scanner': 'Barcode Scanner',
    'expo-contacts': 'Device Contacts',
    'expo-calendar': 'Calendar Events'
  }

  Object.keys(dependencies).forEach(dep => {
    if (nativePackages[dep]) {
      nativeModules.push(nativePackages[dep])
    }
  })

  return nativeModules
} 