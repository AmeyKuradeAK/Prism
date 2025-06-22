import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import crypto from 'crypto'

// Simple encryption for client-side API key usage
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here'
const ENCRYPTION_IV_LENGTH = 16

function encryptApiKey(apiKey: string): { encryptedKey: string, iv: string } {
  const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH)
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY)
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return {
    encryptedKey: encrypted,
    iv: iv.toString('hex')
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if Mistral API key exists
    if (!process.env.MISTRAL_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Mistral API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Encrypt the API key for client-side use
    const { encryptedKey, iv } = encryptApiKey(process.env.MISTRAL_API_KEY)

    return new Response(
      JSON.stringify({
        success: true,
        encryptedKey,
        iv,
        timestamp: Date.now()
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    )

  } catch (error) {
    console.error('❌ Get AI Token failed:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get AI token',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 