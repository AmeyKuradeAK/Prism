import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { generateExpoApp } from '@/lib/generators/expo-generator'

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

    console.log(`🚀 Single call generation for: "${prompt.substring(0, 100)}..."`)
    console.log(`📱 Using solid expo-base-template: ${useBaseTemplate ? 'YES' : 'NO'}`)

    // Generate complete Expo app with solid base template
    const files = await generateExpoApp(
      prompt,
      userId,
      (progress: { message: string }) => {
        console.log(`📋 Progress: ${progress.message}`)
      }
    )

    console.log(`✅ Generated ${Object.keys(files).length} files successfully`)

    return new Response(
      JSON.stringify({
        success: true,
        files,
        message: `Generated ${Object.keys(files).length} files with solid Expo base template`,
        fileCount: Object.keys(files).length,
        totalSize: Object.values(files).reduce((size, content) => size + content.length, 0)
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('❌ Generation failed:', error)

    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate app',
        details: errorMessage
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 