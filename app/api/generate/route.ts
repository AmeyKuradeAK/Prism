import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
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

    const { prompt, useBaseTemplate } = await request.json()

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

    try {
      // 🚀 USE COMPLETE V0.DEV PIPELINE
      console.log('📦 Importing V0 pipeline...')
      const { runV0Pipeline } = await import('@/lib/generators/v0-pipeline')
      
      console.log('🔄 Starting V0 pipeline execution...')
      const validatedFiles = await runV0Pipeline(prompt)
      
      console.log(`📊 V0 pipeline returned ${Object.keys(validatedFiles).length} files`)
      
      // Verify files have content
      const filesWithContent = Object.entries(validatedFiles).filter(([_, content]) => content && content.length > 0)
      console.log(`📊 Files with content: ${filesWithContent.length}/${Object.keys(validatedFiles).length}`)
      
      if (Object.keys(validatedFiles).length === 0) {
        throw new Error('V0 pipeline returned no files')
      }
      
      // 📊 FINAL RESULT - Enhanced debugging
      console.log(`✅ V0-style generation complete: ${Object.keys(validatedFiles).length} files`)
      console.log(`📁 File list: ${Object.keys(validatedFiles).slice(0, 10).join(', ')}${Object.keys(validatedFiles).length > 10 ? '...' : ''}`)
      
      const responseData = {
        success: true,
        files: validatedFiles,
        message: `Generated ${Object.keys(validatedFiles).length} files with v0.dev-style pipeline`,
        fileCount: Object.keys(validatedFiles).length,
        totalSize: Object.values(validatedFiles).reduce((size, content) => size + content.length, 0),
        pipeline: 'v0-style: base-template + llm-injection + ast-validation',
        debug: {
          hasFiles: Object.keys(validatedFiles).length > 0,
          firstFile: Object.keys(validatedFiles)[0],
          firstFileSize: validatedFiles[Object.keys(validatedFiles)[0]]?.length || 0,
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        }
      }
      
      console.log(`📤 Returning response with ${Object.keys(responseData.files).length} files`)
      console.log(`📊 Response size: ${JSON.stringify(responseData).length} chars`)

      return new Response(
        JSON.stringify(responseData),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
      
    } catch (pipelineError) {
      console.error('❌ V0 pipeline failed:', {
        message: pipelineError instanceof Error ? pipelineError.message : 'Unknown pipeline error',
        stack: pipelineError instanceof Error ? pipelineError.stack : undefined
      })
      
      // Try emergency fallback - direct base template
      console.log('🆘 Attempting emergency fallback...')
      try {
        const { generateExpoBaseTemplate } = await import('@/lib/generators/templates/expo-base-template')
        const fallbackFiles = generateExpoBaseTemplate('EmergencyApp')
        
        console.log(`🆘 Emergency fallback successful: ${Object.keys(fallbackFiles).length} files`)
        
        return new Response(
          JSON.stringify({
            success: true,
            files: fallbackFiles,
            message: `Emergency fallback: Generated ${Object.keys(fallbackFiles).length} base template files`,
            fileCount: Object.keys(fallbackFiles).length,
            totalSize: Object.values(fallbackFiles).reduce((size, content) => size + content.length, 0),
            pipeline: 'emergency-fallback: base-template-only',
            warning: 'Used emergency fallback due to pipeline failure'
          }),
          { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      } catch (fallbackError) {
        console.error('❌ Even emergency fallback failed:', fallbackError)
        throw new Error(`Both pipeline and fallback failed: ${pipelineError instanceof Error ? pipelineError.message : 'Unknown error'}`)
      }
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('❌ V0-style generation failed:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      environment: process.env.NODE_ENV
    })
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate app',
        details: errorMessage,
        pipeline: 'v0-style generation pipeline error',
        stack: error instanceof Error ? error.stack?.substring(0, 1000) : undefined,
        environment: process.env.NODE_ENV,
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