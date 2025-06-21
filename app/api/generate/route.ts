import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { generateExpoApp } from '@/lib/generators/expo-generator'
import { generateExpoBaseTemplate } from '@/lib/generators/templates/expo-base-template'

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

    let files: { [key: string]: string } = {}

    try {
      // Try the full generation first
      console.log('🔄 Attempting full generation with generateExpoApp...')
      files = await generateExpoApp(
        prompt,
        userId,
        (progress: { message: string }) => {
          console.log(`📋 Progress: ${progress.message}`)
        }
      )
      console.log(`✅ Full generation successful: ${Object.keys(files).length} files`)
    } catch (mainError) {
      console.error('❌ Main generation failed:', mainError)
      console.log('🔄 Falling back to base template only...')
      
      try {
        // Fallback to just the base template
        const appName = prompt.split(' ').slice(0, 2).join(' ').replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'ExpoApp'
        files = generateExpoBaseTemplate(appName)
        console.log(`✅ Base template fallback successful: ${Object.keys(files).length} files`)
      } catch (baseError) {
        console.error('❌ Even base template failed:', baseError)
        throw new Error(`Both main generation and base template failed. Main: ${mainError}. Base: ${baseError}`)
      }
    }

    if (Object.keys(files).length === 0) {
      throw new Error('No files were generated')
    }

    console.log(`✅ Final result: ${Object.keys(files).length} files successfully generated`)
    console.log(`📁 Files: ${Object.keys(files).slice(0, 5).join(', ')}${Object.keys(files).length > 5 ? '...' : ''}`)

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
    console.error('❌ Generation completely failed:', error)
    
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