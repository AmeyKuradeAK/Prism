import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('🚀 API Generate: Starting request processing...')
    
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

    console.log(`🚀 V0-style React Native generation for: "${prompt.substring(0, 100)}..."`)
    console.log(`🌐 Environment: ${process.env.NODE_ENV}`)
    console.log(`🔑 Mistral API Key present: ${!!process.env.MISTRAL_API_KEY}`)
    console.log(`🧪 Test mode: ${testMode ? 'enabled' : 'disabled'}`)
    console.log(`⚡ Quick mode: ${quickMode ? 'enabled' : 'disabled'}`)

    // NETLIFY 10-SECOND STRATEGY: 
    // - Always use base template for production reliability
    // - Only attempt AI generation in development or with explicit quick=false
    const timeElapsed = Date.now() - startTime
    const shouldUseBaseTemplate = testMode || quickMode || 
      !process.env.MISTRAL_API_KEY || 
      timeElapsed > 500 || // If already spent 500ms, use base template
      process.env.NODE_ENV === 'production' // Always use base template in production
    
    if (shouldUseBaseTemplate) {
      console.log('⚡ Using base template (optimized for Netlify 10s limit)')
      try {
        const { generateExpoBaseTemplate } = await import('@/lib/generators/templates/expo-base-template')
        const { analyzePrompt } = await import('@/lib/generators/v0-pipeline')
        
        // Analyze prompt to customize the app name
        const analysis = analyzePrompt(prompt)
        const appName = `${analysis.type.charAt(0).toUpperCase() + analysis.type.slice(1)}App`
        
        const files = generateExpoBaseTemplate(appName)
        
        console.log(`⚡ Base template successful: ${Object.keys(files).length} files`)
        
        return new Response(
          JSON.stringify({
            success: true,
            files: files,
            message: `Generated ${Object.keys(files).length} files with React Native base template`,
            fileCount: Object.keys(files).length,
            totalSize: Object.values(files).reduce((size: number, content: string) => size + content.length, 0),
            pipeline: quickMode ? 'quick-mode' : 'base-template',
            mode: 'netlify-optimized',
            analysis: analysis
          }),
          { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      } catch (baseError) {
        console.error('❌ Base template failed:', baseError)
        throw new Error(`Base template generation failed: ${baseError instanceof Error ? baseError.message : 'Unknown error'}`)
      }
    }

    // AI Generation (only in development - risky for Netlify 10s limit)
    console.log('🧠 Attempting AI generation (risky with Netlify 10s limit)...')
    try {
      const { runV0Pipeline } = await import('@/lib/generators/v0-pipeline')
      
      // Very aggressive timeout for Netlify (5 seconds max)
      const validatedFiles = await Promise.race([
        runV0Pipeline(prompt),
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Pipeline timeout after 5s (Netlify protection)'))
          }, 5000)
        })
      ]) as { [key: string]: string }
      
      console.log(`📊 AI pipeline returned ${Object.keys(validatedFiles).length} files`)
      
      if (Object.keys(validatedFiles).length === 0) {
        throw new Error('AI pipeline returned no files')
      }
      
      console.log(`✅ AI generation complete: ${Object.keys(validatedFiles).length} files`)
      
      return new Response(
        JSON.stringify({
          success: true,
          files: validatedFiles,
          message: `AI Generated ${Object.keys(validatedFiles).length} files`,
          fileCount: Object.keys(validatedFiles).length,
          totalSize: Object.values(validatedFiles).reduce((size: number, content: string) => size + content.length, 0),
          pipeline: 'ai-generation',
          mode: 'risky-netlify-timing'
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
      
    } catch (pipelineError) {
      console.error('❌ AI pipeline failed:', pipelineError)
      
      // Emergency fallback to base template
      console.log('🆘 Emergency fallback to base template...')
      try {
        const { generateExpoBaseTemplate } = await import('@/lib/generators/templates/expo-base-template')
        const fallbackFiles = generateExpoBaseTemplate('EmergencyApp')
        
        console.log(`🆘 Emergency fallback successful: ${Object.keys(fallbackFiles).length} files`)
        
        return new Response(
          JSON.stringify({
            success: true,
            files: fallbackFiles,
            message: `Emergency fallback: Generated ${Object.keys(fallbackFiles).length} files`,
            fileCount: Object.keys(fallbackFiles).length,
            totalSize: Object.values(fallbackFiles).reduce((size: number, content: string) => size + content.length, 0),
            pipeline: 'emergency-fallback',
            warning: 'AI generation failed, used base template'
          }),
          { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      } catch (fallbackError) {
        console.error('❌ Even emergency fallback failed:', fallbackError)
        throw new Error(`Both AI and fallback failed: ${pipelineError instanceof Error ? pipelineError.message : 'Unknown error'}`)
      }
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const timeSpent = Date.now() - startTime
    
    console.error('❌ Generation failed:', {
      error: errorMessage,
      timeSpent: `${timeSpent}ms`,
      netlifyLimit: '10 seconds hard limit'
    })
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate app',
        details: errorMessage,
        timeSpent: `${timeSpent}ms`,
        netlifyLimit: 'Hit 10-second Netlify function limit',
        suggestion: 'Use Quick Mode for reliable generation',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 

// Old functions removed - now using complete v0-pipeline.ts with proper:
// - Prompt parsing & classification
// - Plan formation (components, layout, functionality) 
// - Code generation (LLM + Templates + Rules)
// - AST validation & auto-fix
// - Build validation & error recovery 