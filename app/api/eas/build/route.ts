import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

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

    if (!platform || !['android', 'ios', 'all'].includes(platform)) {
      return NextResponse.json({ error: 'Valid platform is required (android, ios, all)' }, { status: 400 })
    }

    // 🚀 React Native V0: EAS Build API Integration
    console.log('🔨 Starting EAS Build...')
    console.log(`📱 Project: ${projectName}`)
    console.log(`🎯 Platform: ${platform}`)
    console.log(`📄 Files: ${Object.keys(files).length}`)

    // In a real implementation, this would:
    // 1. Create a temporary Expo project
    // 2. Write files to temp directory
    // 3. Configure eas.json for build
    // 4. Run `eas build --platform ${platform}` via EAS Build API
    // 5. Return build ID and polling URL

    // For demo purposes, we'll simulate the EAS Build process
    const buildId = `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Mock EAS Build configuration
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
          distribution: "internal"
        },
        production: {}
      },
      submit: {
        production: {}
      }
    }

    // Add eas.json to files if not present
    if (!files['eas.json']) {
      files['eas.json'] = JSON.stringify(easConfig, null, 2)
    }

    // Extract dependencies for build validation
    const packageJson = files['package.json']
    const dependencies = packageJson ? JSON.parse(packageJson).dependencies : {}
    
    // Validate native modules for build
    const nativeModules = extractNativeModules(dependencies)
    
    console.log(`🔧 Native modules detected: ${nativeModules.join(', ')}`)
    console.log(`✅ Build queued: ${buildId}`)

    // Initialize build status for polling
    const { initializeBuildStatus } = await import('@/lib/eas-build/build-status')
    initializeBuildStatus(buildId, platform)

    return NextResponse.json({
      success: true,
      buildId,
      buildUrl: `https://expo.dev/accounts/${userId}/projects/${projectName}/builds/${buildId}`,
      platform,
      status: 'in-queue',
      nativeModules,
      estimatedDuration: '5-10 minutes',
      queuePosition: Math.floor(Math.random() * 5) + 1,
      metadata: {
        projectName,
        platform,
        userId,
        createdAt: new Date().toISOString(),
        expoSdkVersion: '53.0.0'
      },
      message: `EAS Build started for ${platform}`
    })

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