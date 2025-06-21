import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'

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

    // Validate API key server-side
    if (!process.env.MISTRAL_API_KEY || process.env.MISTRAL_API_KEY.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { messages, maxTokens = 1200, temperature = 0.1 } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`🔐 Secure AI Proxy: Making request for user ${userId}`)
    console.log(`📊 Request: ${maxTokens} tokens, ${messages.length} messages`)

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, 8000) // 8 seconds to be safe on Netlify

    try {
      // Make request to Mistral API with server-side API key
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'User-Agent': 'V0-Flutter-Proxy/1.0'
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages,
          temperature,
          max_tokens: maxTokens
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Mistral API error: ${response.status} - ${errorText}`)
        
        return new Response(
          JSON.stringify({ 
            error: 'AI service error',
            details: response.status === 401 ? 'Invalid API key' : 'Service temporarily unavailable'
          }),
          { status: response.status, headers: { 'Content-Type': 'application/json' } }
        )
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        return new Response(
          JSON.stringify({ error: 'Invalid AI response' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }

      console.log(`✅ AI Proxy: Success (${content.length} chars)`)

      return new Response(
        JSON.stringify({
          success: true,
          content,
          usage: data.usage
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )

    } catch (error: any) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        console.error('⏰ AI Proxy: Request timed out')
        return new Response(
          JSON.stringify({ 
            error: 'Request timeout',
            details: 'AI service took too long to respond'
          }),
          { status: 408, headers: { 'Content-Type': 'application/json' } }
        )
      }

      console.error('❌ AI Proxy: Network error:', error.message)
      return new Response(
        JSON.stringify({ 
          error: 'Network error',
          details: 'Unable to connect to AI service'
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('❌ AI Proxy: Server error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Server error',
        details: 'Internal server error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 