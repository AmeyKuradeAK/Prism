import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return new Response('Authentication required', { status: 401 })
    }

    // Validate API key server-side
    if (!process.env.MISTRAL_API_KEY || process.env.MISTRAL_API_KEY.length < 10) {
      return new Response('Server configuration error', { status: 500 })
    }

    const { messages, maxTokens = 2000, temperature = 0.1 } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages format', { status: 400 })
    }

    console.log(`🔄 AI Stream: Starting for user ${userId}`)

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder()
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial status
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start', message: 'Starting AI call...' })}\n\n`))

          // Make request to Mistral API
          const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
              'User-Agent': 'V0-Flutter-Stream/1.0'
            },
            body: JSON.stringify({
              model: 'mistral-small-latest',
              messages,
              temperature,
              max_tokens: maxTokens
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            console.error(`❌ Mistral API error: ${response.status} - ${errorText}`)
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              message: `AI service error: ${response.status}`,
              details: errorText.substring(0, 200)
            })}\n\n`))
            controller.close()
            return
          }

          const data = await response.json()
          const content = data.choices?.[0]?.message?.content

          console.log('AI Response Debug:', {
            hasChoices: !!data.choices,
            choicesLength: data.choices?.length,
            hasMessage: !!data.choices?.[0]?.message,
            contentLength: content?.length,
            fullResponse: JSON.stringify(data, null, 2)
          })

          if (!content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              message: 'Invalid AI response',
              debug: {
                hasChoices: !!data.choices,
                choicesLength: data.choices?.length,
                hasMessage: !!data.choices?.[0]?.message,
                response: JSON.stringify(data, null, 2).substring(0, 500)
              }
            })}\n\n`))
            controller.close()
            return
          }

          // Send the successful result
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'success', 
            content,
            usage: data.usage 
          })}\n\n`))

          console.log(`✅ AI Stream: Success (${content.length} chars)`)
          controller.close()

        } catch (error: any) {
          console.error('❌ AI Stream: Error:', error.message)
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'error', 
            message: 'Network error',
            details: error.message 
          })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    console.error('❌ AI Stream: Server error:', error)
    return new Response('Server error', { status: 500 })
  }
} 