import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { runV0Pipeline } from '@/lib/generators/v0-pipeline'
import { generateStandardReactNativeTemplate } from '@/lib/generators/templates/standard-react-native-template'
import { trackPromptUsage } from '@/lib/utils/usage-tracker'
import connectToDatabase from '@/lib/database/mongodb'
import User from '@/lib/database/models/User'

// Extended timeout API with streaming support
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('🚀 AI Stream: Starting extended timeout generation...')
    
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt } = await request.json()
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    console.log('🚀 Starting AI stream generation for user:', userId)
    console.log('📝 Prompt:', prompt.substring(0, 100) + '...')

    // Check usage limits
    try {
      await connectToDatabase()
      const user = await User.findOne({ clerkId: userId })
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const canGenerate = await trackPromptUsage(userId)
      if (!canGenerate) {
        return NextResponse.json({ 
          error: 'Prompt limit reached for this month',
          limitReached: true
        }, { status: 429 })
      }
    } catch (error) {
      console.error('❌ Usage check failed:', error)
      // Continue with generation but log the error
    }

    let files: { [key: string]: string } = {}
    let appName = 'MyReactNativeApp'

    // Try AI generation first
    try {
      console.log('🧠 Attempting AI generation...')
      files = await runV0Pipeline(prompt)
      appName = extractAppName(prompt)
      console.log('✅ AI generation successful')
    } catch (aiError) {
      console.error('❌ AI generation failed:', aiError)
      
      // Fallback to template generation
      try {
        console.log('📱 Falling back to template generation...')
        const { generateStandardReactNativeTemplate } = await import('@/lib/generators/templates/standard-react-native-template')
        appName = extractAppName(prompt)
        const files = generateStandardReactNativeTemplate(appName)
        console.log('✅ Template generation successful')
      } catch (templateError) {
        console.error('❌ Template generation failed:', templateError)
        return NextResponse.json({ 
          error: 'Failed to generate app. Please try again.',
          details: templateError instanceof Error ? templateError.message : 'Unknown error'
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      appName,
      files,
      message: 'App generated successfully!'
    })

  } catch (error) {
    console.error('❌ Generation failed:', error)
    return NextResponse.json({
      error: 'Failed to generate app',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to extract app name from prompt
function extractAppName(prompt: string): string {
  // Look for app name patterns in the prompt
  const nameMatch = prompt.match(/(?:create|build|make)\s+(?:a|an)\s+(?:app|application)\s+(?:called\s+)?([A-Za-z][A-Za-z0-9\s]+?)(?:\s|$|\.|,)/i)
  if (nameMatch && nameMatch[1]) {
    return nameMatch[1].trim().replace(/\s+/g, '')
  }
  
  // Fallback to default name
  return 'MyReactNativeApp'
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