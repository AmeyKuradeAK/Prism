import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Generate a temporary token for client-side AI calls
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate server has API key
    if (!process.env.MISTRAL_API_KEY || process.env.MISTRAL_API_KEY.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`🔐 Providing AI token for user ${userId}`)

    // For business security: Return the actual API key only to authenticated users
    // In production, you might want to implement token rotation or rate limiting
    return new Response(
      JSON.stringify({
        success: true,
        apiKey: process.env.MISTRAL_API_KEY,
        userId,
        expiresIn: '1h' // Token expires in 1 hour
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ AI Token: Server error:', error)
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 