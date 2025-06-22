import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Extended timeout API with streaming support
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('🚀 AI Stream: Starting extended timeout generation...')
    
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { prompt } = await request.json()
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Valid prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!process.env.MISTRAL_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Mistral API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`🧠 Extended AI generation for: "${prompt.substring(0, 100)}..."`)

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send progress updates
          const sendProgress = (message: string) => {
            const data = JSON.stringify({ type: 'progress', message, timestamp: Date.now() })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }

          sendProgress('🔑 Initializing AI generation...')
          
          // Generate with extended timeout
          const files = await generateWithExtendedTimeout(prompt, sendProgress)
          
          // Send final result
          const result = JSON.stringify({ 
            type: 'complete', 
            files, 
            fileCount: Object.keys(files).length,
            duration: Date.now() - startTime 
          })
          controller.enqueue(encoder.encode(`data: ${result}\n\n`))
          controller.close()
          
        } catch (error) {
          const errorData = JSON.stringify({
            type: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
            duration: Date.now() - startTime
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    console.error('❌ AI Stream failed:', error)
    return new Response(
      JSON.stringify({ 
        error: 'AI Stream generation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// Extended timeout generation with progress updates
async function generateWithExtendedTimeout(
  prompt: string, 
  onProgress: (message: string) => void
): Promise<{ [key: string]: string }> {
  const maxRetries = 3
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      onProgress(`🤖 Connecting to Mistral AI (attempt ${attempt}/${maxRetries})...`)
      
      // Import Mistral client
      const { Mistral } = await import('@mistralai/mistralai')
      const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! })
      
      // Rate limiting
      if (attempt > 1) {
        const waitTime = 2000 * attempt
        onProgress(`🚦 Rate limiting: waiting ${waitTime}ms...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
      
      // Generate optimized prompt
      const optimizedPrompt = generateOptimizedPrompt(prompt)
      onProgress(`📝 Generating AI response (${optimizedPrompt.length} chars)...`)
      
      const startTime = Date.now()
      
      // Extended timeout: 90 seconds (1.5 minutes)
      const response = await Promise.race([
        mistral.chat.complete({
          model: 'mistral-small-latest',
          messages: [{ role: 'user', content: optimizedPrompt }],
          temperature: 0.2,
          maxTokens: 3500
        }),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Mistral timeout after 90 seconds')), 90000)
        })
      ]) as { choices: [{ message: { content: string } }] }

      const duration = Date.now() - startTime
      onProgress(`📥 AI response received in ${duration}ms`)
      
      const content = response.choices[0]?.message?.content || ''
      if (!content) {
        throw new Error('Empty response from Mistral API')
      }
      
      onProgress('🔍 Parsing generated files...')
      
      // Parse response into files
      const { parseCodeFromResponse } = await import('@/lib/utils/code-parser')
      const generatedFiles = parseCodeFromResponse(content)
      
      // Convert to files object
      const files: { [key: string]: string } = {}
      generatedFiles.forEach(file => {
        if (file.path && file.content) {
          files[file.path] = file.content
        }
      })
      
      // If no files generated, create demo-1 base template
      if (Object.keys(files).length === 0) {
        onProgress('⚠️ No files parsed, generating COMPLETE demo-1 base template...')
        const { generateDemo1BaseTemplate } = await import('@/lib/generators/templates/complete-demo1-template')
        const analysis = analyzePromptServer(prompt)
        const appName = `${analysis.type.charAt(0).toUpperCase() + analysis.type.slice(1)}App`
        return generateDemo1BaseTemplate(appName)
      }
      
      onProgress(`✅ Generated ${Object.keys(files).length} files successfully`)
      return files
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      console.error(`❌ Extended AI generation attempt ${attempt}/${maxRetries} failed:`, lastError.message)
      onProgress(`❌ Attempt ${attempt} failed: ${lastError.message}`)
      
      // Check if error is retryable
      const isRetryableError = lastError.message.includes('timeout') || 
        lastError.message.includes('500') || 
        lastError.message.includes('502') || 
        lastError.message.includes('503') ||
        lastError.message.includes('network')
      
      // Don't retry auth errors
      if (lastError.message.includes('401') || lastError.message.includes('unauthorized')) {
        throw lastError
      }
      
      // If this is the last attempt or non-retryable error, throw
      if (attempt === maxRetries || !isRetryableError) {
        throw lastError
      }
      
      // Exponential backoff for retries
      const backoffTime = Math.min(3000 * Math.pow(2, attempt - 1), 20000)
      onProgress(`⏳ Retrying in ${Math.ceil(backoffTime/1000)}s...`)
      await new Promise(resolve => setTimeout(resolve, backoffTime))
    }
  }
  
  throw lastError || new Error('All extended AI generation attempts failed')
}

// Server-side prompt analysis
function analyzePromptServer(prompt: string) {
  const lowerPrompt = prompt.toLowerCase()
  
  let type = 'other'
  if (lowerPrompt.includes('todo') || lowerPrompt.includes('task')) type = 'todo'
  else if (lowerPrompt.includes('social') || lowerPrompt.includes('chat')) type = 'social'
  else if (lowerPrompt.includes('shop') || lowerPrompt.includes('store')) type = 'ecommerce'
  else if (lowerPrompt.includes('fitness') || lowerPrompt.includes('workout')) type = 'fitness'
  
  return { type, complexity: 'medium' }
}

// Generate optimized prompt for server-side generation
function generateOptimizedPrompt(prompt: string): string {
  const analysis = analyzePromptServer(prompt)
  
  return `Create React Native Expo app: ${prompt.substring(0, 100)}

REQUIREMENTS:
- Expo SDK 53, TypeScript
- Working, production-ready code
- Modern UI with clean styling
- Format: ===FILE: path===\ncode\n===END===

Generate essential files for ${analysis.type} app:
1. app/_layout.tsx (root layout)
2. app/(tabs)/_layout.tsx (tab navigation)
3. app/(tabs)/index.tsx (home screen)
4. app/(tabs)/explore.tsx (second screen)
5. components/ThemedText.tsx (themed text)
6. components/ThemedView.tsx (themed view)
7. package.json (dependencies)

Focus on ${analysis.type} functionality. Make it beautiful and functional!`
} 