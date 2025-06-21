import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'

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

    const { prompt, useBaseTemplate } = await request.json()

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Valid prompt is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`🚀 V0-style React Native generation for: "${prompt.substring(0, 100)}..."`)

    // 🚀 USE COMPLETE V0.DEV PIPELINE
    console.log('📦 Importing V0 pipeline...')
    const { runV0Pipeline } = await import('@/lib/generators/v0-pipeline')
    
    console.log('🔄 Starting V0 pipeline execution...')
    const validatedFiles = await runV0Pipeline(prompt)
    
    console.log(`📊 V0 pipeline returned ${Object.keys(validatedFiles).length} files`)
    
    // 📊 FINAL RESULT - Enhanced debugging
    console.log(`✅ V0-style generation complete: ${Object.keys(validatedFiles).length} files`)
    console.log(`📁 All files: ${Object.keys(validatedFiles).join(', ')}`)
    
    // Verify files have content
    const filesWithContent = Object.entries(validatedFiles).filter(([_, content]) => content && content.length > 0)
    console.log(`📊 Files with content: ${filesWithContent.length}/${Object.keys(validatedFiles).length}`)
    
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
        firstFileSize: validatedFiles[Object.keys(validatedFiles)[0]]?.length || 0
      }
    }
    
    console.log(`📤 Returning response with ${Object.keys(responseData.files).length} files`)

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('❌ V0-style generation failed:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate app',
        details: errorMessage,
        pipeline: 'v0-style generation pipeline error',
        stack: error instanceof Error ? error.stack : undefined
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