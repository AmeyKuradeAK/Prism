import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { generateReactNativePlan } from '@/lib/generators/expo-v0-generator'

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

    console.log(`🧠 Generating plan for: "${prompt.substring(0, 100)}..."`)

    // Generate the plan (fast, no AI calls)
    const plan = await generateReactNativePlan(prompt, userId, (progress) => {
      console.log(`📋 Plan: ${progress.message}`)
    })

    console.log(`✅ Plan generated: ${plan.chunks.length} chunks, estimated ${plan.metadata.estimatedTime}`)

    return new Response(
      JSON.stringify({
        success: true,
        plan,
        message: 'Generation plan ready for client-side execution'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('❌ Plan generation failed:', error)

    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate plan',
        details: errorMessage
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 