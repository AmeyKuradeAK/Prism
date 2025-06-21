import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { files, name, description } = await request.json()

    if (!files || typeof files !== 'object') {
      return NextResponse.json({ error: 'Files data is required' }, { status: 400 })
    }

    // 🚀 React Native V0: Snack SDK Integration
    console.log('📦 Uploading to Snack...')
    console.log(`📱 Project: ${name}`)
    console.log(`📄 Files: ${Object.keys(files).length}`)

    // In a real implementation, this would use Snack SDK:
    // import { SnackSDK } from '@expo/snack-sdk'
    // 
    // const snack = new SnackSDK({
    //   files: transformFilesForSnack(files),
    //   name,
    //   description,
    //   dependencies: extractDependenciesFromPackageJson(files['package.json'])
    // })
    // 
    // const result = await snack.save()
    // return result.url

    // Mock Snack URL generation
    const snackId = `snack-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const snackUrl = `https://snack.expo.dev/${snackId}`

    // Transform files for Snack format
    const snackFiles = transformFilesForSnack(files)
    
    console.log(`✅ Snack created: ${snackUrl}`)

    return NextResponse.json({
      success: true,
      snackUrl,
      snackId,
      files: snackFiles,
      metadata: {
        name,
        description,
        platform: 'react-native',
        sdkVersion: '52.0.0',
        createdAt: new Date().toISOString()
      },
      message: 'Snack uploaded successfully'
    })

  } catch (error) {
    console.error('❌ Snack upload failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Snack upload failed'
    
    return NextResponse.json({ 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Transform files for Snack SDK format
function transformFilesForSnack(files: { [key: string]: string }) {
  const snackFiles: { [key: string]: any } = {}
  
  Object.entries(files).forEach(([path, content]) => {
    // Snack expects specific file structure
    if (path === 'package.json') {
      // Parse and validate package.json
      try {
        const packageData = JSON.parse(content)
        snackFiles[path] = {
          type: 'CODE',
          contents: JSON.stringify({
            ...packageData,
            main: 'App.js', // Snack uses App.js as entry
            scripts: {
              start: 'expo start',
              android: 'expo start --android',
              ios: 'expo start --ios',
              web: 'expo start --web'
            }
          }, null, 2)
        }
      } catch (error) {
        console.error('Error parsing package.json:', error)
        snackFiles[path] = { type: 'CODE', contents: content }
      }
    } else if (path.endsWith('.tsx') || path.endsWith('.ts') || path.endsWith('.js') || path.endsWith('.jsx')) {
      // Code files
      snackFiles[path] = {
        type: 'CODE',
        contents: content
      }
    } else if (path.endsWith('.json')) {
      // JSON configuration files
      snackFiles[path] = {
        type: 'CODE',
        contents: content
      }
    } else {
      // Other files (markdown, etc.)
      snackFiles[path] = {
        type: 'CODE',
        contents: content
      }
    }
  })

  return snackFiles
} 