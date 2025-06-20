import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { generateRealExpoApp } from '@/lib/generators/real-expo-generator'

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
        const message = `data: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(message))
      }
    }

    // Function to send logs
    const sendLog = (message: string) => {
      sendData({ type: 'log', message })
    }

    const stream = new ReadableStream({
      start(streamController) {
        controller = streamController
      },
      cancel() {
        // Cleanup if stream is cancelled
        controller = null
      }
    })

    // Start generation process asynchronously
    ;(async () => {
      try {
        sendLog('🔍 Analyzing your app requirements...')
        sendLog(`📋 Prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`)
        
        const startTime = Date.now()
        const allFiles: { [key: string]: string } = {}
        
        // Use the new progressive generation with callbacks
        const files = await generateRealExpoApp(prompt, userId, (progress: { type: string; message: string; file?: { path: string; content: string; isComplete: boolean } }) => {
          if (progress.type === 'log') {
            sendLog(progress.message)
          } else if (progress.type === 'file_start') {
            sendLog(progress.message)
            sendData({ 
              type: 'file_start', 
              file: progress.file 
            })
          } else if (progress.type === 'file_progress') {
            sendData({ 
              type: 'file_progress', 
              file: progress.file 
            })
          } else if (progress.type === 'file_complete') {
            sendLog(`✅ ${progress.message}`)
            sendData({ 
              type: 'file_complete', 
              file: progress.file 
            })
            // Store completed file
            if (progress.file) {
              allFiles[progress.file.path] = progress.file.content
            }
          }
        })
        
        const duration = Date.now() - startTime
        sendLog(`⏱️ Generation completed in ${Math.round(duration / 1000)}s`)
        
        sendLog('📱 Generated Expo SDK 53 app with latest React Native patterns')
        sendLog(`📄 Created ${Object.keys(files).length} files with production-ready code`)
        
        sendLog('🎨 Applied modern UI components and navigation')
        sendLog('🔧 Configured TypeScript, ESLint, and build settings')
        
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
        
        sendData({ type: 'files', files: filesArray })
        sendData({ type: 'complete' })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Generation failed'
        sendLog(`❌ Error: ${errorMessage}`)
        sendData({ type: 'error', message: errorMessage })
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
    console.error('Generate API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 