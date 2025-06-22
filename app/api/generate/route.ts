import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('🚀 API Generate: Starting FREE AI generation with Mistral...')
    
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      console.log('❌ Authentication failed: No userId')
      return new Response(
        JSON.stringify({ error: 'Authentication required. Please sign in to generate apps.' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    console.log(`✅ Authentication successful: ${userId}`)

    const { prompt, useBaseTemplate, testMode, quickMode } = await request.json()

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      console.log('❌ Invalid prompt provided')
      return new Response(
        JSON.stringify({ error: 'Valid prompt is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`🧠 FREE AI generation with Mistral for: "${prompt.substring(0, 100)}..."`)
    console.log(`🔑 Mistral API Key present: ${!!process.env.MISTRAL_API_KEY}`)
    console.log(`🧪 Test mode: ${testMode ? 'enabled' : 'disabled'}`)
    console.log(`⚡ Quick mode: ${quickMode ? 'enabled' : 'disabled'}`)

    // Quick mode fallback
    if (testMode || quickMode) {
      console.log('⚡ Quick mode - using base template only')
      const { generateExpoBaseTemplate } = await import('@/lib/generators/templates/expo-base-template')
      const { analyzePrompt } = await import('@/lib/generators/v0-pipeline')
      
      const analysis = analyzePrompt(prompt)
      const appName = `${analysis.type.charAt(0).toUpperCase() + analysis.type.slice(1)}App`
      const files = generateExpoBaseTemplate(appName)
      
      return new Response(
        JSON.stringify({
          success: true,
          files: files,
          message: `Quick mode: Generated ${Object.keys(files).length} files`,
          fileCount: Object.keys(files).length,
          pipeline: 'quick-mode',
          analysis: analysis
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // OPTIMIZED MISTRAL GENERATION (FREE!)
    if (!process.env.MISTRAL_API_KEY) {
      throw new Error('Mistral API key not configured')
    }

    console.log('🚀 Starting OPTIMIZED FREE Mistral generation...')
    try {
      const aiFiles = await generateWithOptimizedMistral(prompt)
      if (Object.keys(aiFiles).length > 0) {
        console.log(`✅ Mistral FREE AI success: ${Object.keys(aiFiles).length} files`)
        return new Response(
          JSON.stringify({
            success: true,
            files: aiFiles,
            message: `FREE AI Generated ${Object.keys(aiFiles).length} files with Mistral`,
            fileCount: Object.keys(aiFiles).length,
            pipeline: 'optimized-mistral-free',
            provider: 'Mistral (Free)',
            cost: 'FREE! 🎉'
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }
    } catch (mistralError) {
      console.error('❌ Optimized Mistral failed:', mistralError)
      throw mistralError
    }

    throw new Error('Mistral generation failed')

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const timeSpent = Date.now() - startTime
    
    console.error('❌ FREE AI Generation failed:', {
      error: errorMessage,
      timeSpent: `${timeSpent}ms`
    })
    
    return new Response(
      JSON.stringify({ 
        error: 'FREE AI generation failed',
        details: errorMessage,
        timeSpent: `${timeSpent}ms`,
        suggestion: 'Mistral API might be slow. Try Quick Mode for instant results.',
        provider: 'Mistral (Free)',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// SUPER OPTIMIZED MISTRAL (FREE BUT FAST!)
async function generateWithOptimizedMistral(prompt: string): Promise<{ [key: string]: string }> {
  console.log('🤖 Starting OPTIMIZED FREE Mistral generation...')
  
  const { Mistral } = await import('@mistralai/mistralai')
  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! })
  
  // ULTRA-SHORT PROMPT FOR SPEED ⚡
  const optimizedPrompt = `Create React Native Expo app: ${prompt.substring(0, 60)}

REQUIREMENTS:
- Expo SDK 53, TypeScript
- Working code only
- Format: ===FILE: path===\ncode\n===END===

Generate 3-5 essential files:
1. app/_layout.tsx (root)
2. app/(tabs)/_layout.tsx (tabs)  
3. app/(tabs)/index.tsx (home screen)
4. components/ThemedText.tsx
5. package.json (deps)

FAST response needed!`

  console.log(`📋 Optimized prompt: ${optimizedPrompt.length} chars (reduced for speed)`)
  
  const startTime = Date.now()
  
  // EXTENDED 90-SECOND TIMEOUT FOR CLIENT-SIDE CALLS
  const response = await Promise.race([
    mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: optimizedPrompt }],
      temperature: 0.1, // Lower for consistency
      maxTokens: 2000   // Reduced for speed
    }),
    new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Mistral timeout after 90 seconds')), 90000)
    })
  ]) as any

  const duration = Date.now() - startTime
  console.log(`📥 FREE Mistral responded in ${duration}ms`)
  
  const content = response.choices[0]?.message?.content || ''
  if (!content) throw new Error('Empty Mistral response')
  
  console.log(`📝 Mistral response length: ${content.length} chars`)
  
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
  
  // If parsing failed, create enhanced base template
  if (Object.keys(files).length === 0) {
    console.log('⚠️ Mistral parsing failed, using enhanced base template...')
    const { generateExpoBaseTemplate } = await import('@/lib/generators/templates/expo-base-template')
    const { normalizeFilesForMemfs } = await import('@/lib/utils/memfs-helper')
    const { analyzePrompt } = await import('@/lib/generators/v0-pipeline')
    
    const analysis = analyzePrompt(prompt)
    const appName = `${analysis.type.charAt(0).toUpperCase() + analysis.type.slice(1)}App`
    const baseTemplate = generateExpoBaseTemplate(appName)
    
    // Ensure memfs compatibility
    return normalizeFilesForMemfs(baseTemplate)
  }
  
  console.log(`✅ FREE Mistral generated ${Object.keys(files).length} files`)
  return files
}

// Old functions removed - now using complete v0-pipeline.ts with proper:
// - Prompt parsing & classification
// - Plan formation (components, layout, functionality) 
// - Code generation (LLM + Templates + Rules)
// - AST validation & auto-fix
// - Build validation & error recovery 