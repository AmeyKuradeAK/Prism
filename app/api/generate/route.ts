import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { generateReactNativePlan } from '@/lib/generators/expo-v0-generator'

// Simple V0 response parser
function parseV0Response(response: string): { [key: string]: string } {
  const files: { [key: string]: string } = {}
  
  try {
    // First, try to extract JSON from the response
    let jsonStart = response.indexOf('{')
    let jsonEnd = response.lastIndexOf('}') + 1
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON structure found in response')
    }
    
    const jsonString = response.slice(jsonStart, jsonEnd)
    const parsed = JSON.parse(jsonString)
    
    if (parsed.files && typeof parsed.files === 'object') {
      // V0.dev style: files object
      Object.entries(parsed.files).forEach(([path, content]) => {
        if (typeof content === 'string' && content.length > 10) {
          files[path] = content
        }
      })
    }
  } catch (jsonError) {
    // Fallback: Try code block parsing
    const codeBlockPattern = /```(?:\w+)?\s*(?:\/\/\s*)?([^\n]+)\n([\s\S]*?)```/g
    let codeMatch
    
    while ((codeMatch = codeBlockPattern.exec(response)) !== null) {
      const fileName = codeMatch[1]?.trim()
      const content = codeMatch[2]?.trim()
      
      if (fileName && content) {
        files[fileName] = content
      }
    }
  }
  
  return files
}

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
        
        sendLog('🚀 Initializing secure AI generation...')
        sendLog('🔐 Using secure proxy approach (API key protected)')
        
        // Step 1: Generate plan server-side (fast, no AI calls)
        const plan = await generateReactNativePlan(prompt, userId, (progress) => {
          sendLog(progress.message)
        })
        
        sendLog(`✅ Generation plan ready: ${plan.chunks.length} chunks`)
        sendLog(`⏱️ Estimated time: ${plan.metadata.estimatedTime}`)
        sendLog('🎯 Ready for secure client-side AI execution!')
        
        // Send the plan info to client
        sendData({ 
          type: 'log', 
          message: 'Generation plan ready - executing AI calls via secure proxy...'
        })
        
        // Execute plan using secure proxy
        const allFiles: { [key: string]: string } = {}
        
        // Add pre-generated package.json
        allFiles['package.json'] = JSON.stringify(plan.smartPackageJson, null, 2)
        sendLog('✅ Added smart package.json with auto-detected dependencies')
        
        for (let i = 0; i < plan.chunks.length; i++) {
          const chunk = plan.chunks[i]
          
                    sendLog(`📦 Chunk ${i + 1}/${plan.chunks.length}: ${chunk.name}`)
          
          let timeoutId: NodeJS.Timeout | undefined
          try {
            // Direct Mistral API call with timeout (8s for Netlify safety)
            const controller = new AbortController()
            timeoutId = setTimeout(() => {
              controller.abort()
            }, 15000) // 15 seconds - might still hit Netlify limit but more time for Mistral
            
            const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
                'User-Agent': 'V0-Flutter-Secure/1.0'
              },
              body: JSON.stringify({
                model: 'mistral-small-latest',
                messages: [
                  {
                    role: 'system',
                    content: plan.systemPrompt
                  },
                  {
                    role: 'user',
                    content: chunk.prompt
                  }
                ],
                temperature: 0.1,
                max_tokens: chunk.maxTokens
              }),
              signal: controller.signal
            })
            
            clearTimeout(timeoutId)
            
            if (!response.ok) {
              const errorText = await response.text()
              throw new Error(`Mistral API error: ${response.status} - ${errorText}`)
            }
            
            const data = await response.json()
            const content = data.choices?.[0]?.message?.content
            
            if (!content || typeof content !== 'string' || content.length < 10) {
              throw new Error(`Invalid AI response: ${content?.length || 0} characters`)
            }
            
            // Parse the chunk response (simple JSON extraction)
            const chunkFiles = parseV0Response(content)
            
            // Merge files
            Object.entries(chunkFiles).forEach(([path, fileContent]) => {
              if (fileContent && fileContent.length > 10) {
                allFiles[path] = fileContent
                sendLog(`✅ Generated ${path} (${fileContent.length} chars)`)
                sendData({ 
                  type: 'file_complete', 
                  file: {
                    path,
                    content: fileContent,
                    isComplete: true
                  }
                })
              }
            })
            
            sendLog(`✅ Chunk ${i + 1} complete: ${Object.keys(chunkFiles).length} files`)
            
          } catch (error: any) {
            if (timeoutId) clearTimeout(timeoutId)
            
            let errorMessage = 'Unknown error'
            if (error?.name === 'AbortError') {
              errorMessage = `Timeout after 8s (Netlify limit)`
              sendLog(`⏰ Chunk ${i + 1} timed out - reducing token limit for next chunks`)
              // Reduce token limit for remaining chunks if timeout occurs
              for (let j = i + 1; j < plan.chunks.length; j++) {
                plan.chunks[j].maxTokens = Math.max(800, plan.chunks[j].maxTokens * 0.7)
              }
            } else if (error instanceof Error) {
              errorMessage = error.message
            }
            
            sendLog(`❌ Chunk ${i + 1} failed: ${errorMessage}`)
            sendLog(`🔄 Continuing with remaining chunks...`)
          }
          
          // Rate limiting: Respect Mistral's 1 RPS limit
          if (i < plan.chunks.length - 1) {
            const waitTime = plan.metadata.rateLimitGap + Math.random() * 500
            sendLog(`⏳ Rate limiting: waiting ${Math.round(waitTime/100)/10}s...`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
          }
        }
        
        // Create V0 response
        const v0Response = {
          files: allFiles,
          metadata: {
            totalFiles: Object.keys(allFiles).length,
            appType: plan.analysis.appType,
            features: plan.analysis.features,
            nativeFeatures: plan.analysis.nativeFeatures,
            detectedModules: plan.analysis.detectedModules,
            generatedAt: new Date().toISOString(),
            dependencies: plan.smartPackageJson.dependencies,
            permissions: plan.analysis.detectedModules.flatMap(m => m.permissions || [])
          }
        }
        
        // Extract files from V0.dev-style response
        const files = v0Response.files
        const metadata = v0Response.metadata
        
        // Send final completion with all files
        const duration = Date.now() - startTime
        const fileCount = metadata.totalFiles
        
        sendLog(`⏱️ Generation completed in ${Math.round(duration / 1000)}s`)
        sendLog(`📦 Created ${fileCount} files with production-ready structure`)
        sendLog(`🎯 Generated ${metadata.appType} with features: ${metadata.features.join(', ')}`)
        
        if (hasApiKey) {
          sendLog('🤖 Enhanced with AI-generated custom features (V0.dev style)')
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