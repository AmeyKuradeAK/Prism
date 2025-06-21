import { NextRequest, NextResponse } from 'next/server'
import { generateV0StyleApp } from '@/lib/generators/expo-v0-generator'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    console.log('🧪 Testing React Native V0 generation...')
    console.log(`📝 Prompt: ${prompt}`)

    const logs: string[] = []
    
    // Capture all progress logs
    const onProgress = (progress: { type: string; message: string; file?: any }) => {
      const logMessage = `[${progress.type}] ${progress.message}`
      console.log(logMessage)
      logs.push(logMessage)
      
      if (progress.file) {
        console.log(`📄 File: ${progress.file.path} (${progress.file.content?.length || 0} chars)`)
        logs.push(`📄 File: ${progress.file.path} (${progress.file.content?.length || 0} chars)`)
      }
    }

    const startTime = Date.now()
    
    try {
      const result = await generateV0StyleApp(prompt, 'test-user', onProgress)
      const duration = Date.now() - startTime
      
      console.log(`✅ Generation completed in ${duration}ms`)
      console.log(`📁 Generated ${result.metadata.totalFiles} files`)
      
      return NextResponse.json({
        success: true,
        duration: `${duration}ms`,
        files: Object.keys(result.files),
        metadata: result.metadata,
        logs,
        message: 'React Native V0 generation test completed successfully'
      })
      
    } catch (generationError) {
      const duration = Date.now() - startTime
      const errorMessage = generationError instanceof Error ? generationError.message : 'Generation failed'
      
      console.error(`❌ Generation failed after ${duration}ms:`, errorMessage)
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        duration: `${duration}ms`,
        logs,
        message: 'React Native V0 generation test failed'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Test API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Test failed'
    
    return NextResponse.json({ 
      success: false,
      error: errorMessage,
      message: 'Test API request failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'React Native V0 Test API',
    usage: 'POST with { "prompt": "your app description" }',
    example: {
      prompt: "Build a simple todo app with task management"
    }
  })
} 