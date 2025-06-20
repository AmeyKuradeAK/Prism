import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { generateV0StyleApp } from '@/lib/generators/expo-v0-generator'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required. Please sign in to generate apps.' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Valid prompt is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate environment setup
    const hasApiKey = !!process.env.MISTRAL_API_KEY && process.env.MISTRAL_API_KEY.length > 10
    console.log(`🔑 API Key Status: ${hasApiKey ? 'Valid' : 'Missing/Invalid'}`)

    // Set up Server-Sent Events
    const encoder = new TextEncoder()
    let controller: ReadableStreamDefaultController<Uint8Array> | null = null

    // Function to send SSE data
    const sendData = (data: { 
      type: string; 
      message?: string; 
      files?: any[];
      file?: { path: string; content: string; isComplete: boolean }
    }) => {
      if (controller) {
        try {
          const message = `data: ${JSON.stringify(data)}\n\n`
          controller.enqueue(encoder.encode(message))
        } catch (error) {
          console.error('Error sending SSE data:', error)
        }
      }
    }

    // Function to send logs
    const sendLog = (message: string) => {
      console.log(`📱 [${new Date().toISOString()}] ${message}`)
      sendData({ type: 'log', message })
    }

    const stream = new ReadableStream({
      start(streamController) {
        controller = streamController
        console.log('🚀 Started generation stream')
      },
      cancel() {
        // Cleanup if stream is cancelled
        console.log('🛑 Generation stream cancelled')
        controller = null
      }
    })

    // Start generation process asynchronously
    ;(async () => {
      try {
        sendLog('🔍 Starting AI app generation...')
        sendLog(`📋 User Request: "${prompt.substring(0, 150)}${prompt.length > 150 ? '...' : ''}"`)
        sendLog(`🔑 AI Features: ${hasApiKey ? 'Available' : 'Limited (using template only)'}`)
        
        const startTime = Date.now()
        
        // Validate API key format
        if (hasApiKey) {
          const apiKeyLength = process.env.MISTRAL_API_KEY?.length || 0
          sendLog(`🔑 API Key length: ${apiKeyLength} characters`)
          
          if (apiKeyLength < 20) {
            sendLog('⚠️ Warning: API key seems too short')
          }
        }
        
        sendLog('🚀 Initializing V0.dev-style generation...')
        
        // Use V0.dev-style generation for better results
        const files = await generateV0StyleApp(prompt, userId, (progress: { 
          type: string; 
          message: string; 
          file?: { path: string; content: string; isComplete: boolean } 
        }) => {
          if (progress.type === 'log') {
            sendLog(progress.message)
          } else if (progress.type === 'file_start' && progress.file) {
            sendLog(`📄 Starting ${progress.file.path}...`)
            sendData({ 
              type: 'file_start', 
              file: progress.file 
            })
          } else if (progress.type === 'file_progress' && progress.file) {
            sendData({ 
              type: 'file_progress', 
              file: progress.file 
            })
          } else if (progress.type === 'file_complete' && progress.file) {
            sendLog(`✅ Completed ${progress.file.path}`)
            sendData({ 
              type: 'file_complete', 
              file: progress.file 
            })
          }
        })
        
        // Send final completion with all files
        const duration = Date.now() - startTime
        const fileCount = Object.keys(files).length
        
        sendLog(`⏱️ Generation completed in ${Math.round(duration / 1000)}s`)
        sendLog(`📦 Created ${fileCount} files with production-ready structure`)
        
        if (hasApiKey) {
          sendLog('🤖 Enhanced with AI-generated custom features')
        } else {
          sendLog('📋 Using enhanced template (set MISTRAL_API_KEY for AI features)')
        }
        
        sendLog('🎨 Includes TypeScript, modern React Native patterns')
        sendLog('⚡ Expo SDK 53 with latest dependencies')
        sendLog('✅ Your React Native app is ready!')
        
        // Convert files object to array format expected by frontend
        const filesArray = Object.entries(files).map(([path, content]) => ({
          path,
          content,
          type: path.endsWith('.tsx') ? 'tsx' : 
                path.endsWith('.ts') ? 'ts' :
                path.endsWith('.js') ? 'js' :
                path.endsWith('.json') ? 'json' :
                path.endsWith('.md') ? 'md' : 'txt'
        }))
        
        // Final validation and send
        const hasAppTsx = filesArray.some(f => f.path === 'App.tsx')
        const hasPackageJson = filesArray.some(f => f.path === 'package.json')
        const hasAppJson = filesArray.some(f => f.path === 'app.json')
        
        if (!hasAppTsx || !hasPackageJson || !hasAppJson) {
          sendLog('⚠️ Warning: Some essential files may be missing')
          sendLog(`App.tsx: ${hasAppTsx ? '✓' : '✗'} | package.json: ${hasPackageJson ? '✓' : '✗'} | app.json: ${hasAppJson ? '✓' : '✗'}`)
        }
        
        // Send files data
        sendData({ type: 'files', files: filesArray })
        
        // Mark as complete
        sendData({ type: 'complete' })
        
        console.log(`✅ Generation completed successfully: ${fileCount} files in ${duration}ms`)
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        console.error('❌ Generation failed:', error)
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
        
        sendLog(`❌ Generation Error: ${errorMessage}`)
        
        // Try to provide helpful debugging info
        if (errorMessage.includes('API') || errorMessage.includes('401')) {
          sendLog('🔍 This might be an API key issue. Check your MISTRAL_API_KEY.')
        } else if (errorMessage.includes('timeout') || errorMessage.includes('ECONNRESET')) {
          sendLog('🔍 This might be a network issue. Please try again.')
        } else if (errorMessage.includes('parse') || errorMessage.includes('JSON')) {
          sendLog('🔍 This might be an AI response parsing issue.')
        }
        
        sendData({ type: 'error', message: errorMessage })
              } finally {
          // Always close the stream
          if (controller) {
            try {
              (controller as ReadableStreamDefaultController<Uint8Array>).close()
            } catch (error) {
              console.error('Error closing stream:', error)
            }
          }
        }
    })()

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })

  } catch (error) {
    console.error('❌ Generate API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : 'No stack trace') : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 