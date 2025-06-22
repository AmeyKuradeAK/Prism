// Client-side decryption utility for encrypted API keys
// Uses Web Crypto API for browser-safe decryption

/**
 * Decrypt an encrypted API key on the client side
 */
export async function decryptApiKey(encryptedKey: string, iv: string): Promise<string> {
  try {
    console.log('🔍 Decryption inputs - encryptedKey length:', encryptedKey.length, 'iv length:', iv.length)
    
    // Get encryption key from environment (this should be the same as server-side)
    const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY
    console.log('🔍 Encryption key available:', !!encryptionKey)
    console.log('🔍 Encryption key length:', encryptionKey?.length || 0)
    
    if (!encryptionKey) {
      throw new Error('NEXT_PUBLIC_ENCRYPTION_KEY not configured in environment')
    }

    // Convert hex strings to Uint8Array
    const encryptedData = hexToUint8Array(encryptedKey)
    const ivArray = hexToUint8Array(iv)
    
    // Derive the same key using Web Crypto API (matching server-side scrypt)
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(encryptionKey),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    )
    
    const cryptoKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('salt'), // Same salt as server
        iterations: 1, // Match server-side scrypt
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-CBC', length: 256 },
      false,
      ['decrypt']
    )

    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: ivArray },
      cryptoKey,
      encryptedData
    )

    // Convert back to string
    const decryptedKey = new TextDecoder().decode(decryptedBuffer)
    return decryptedKey

  } catch (error) {
    console.error('❌ Failed to decrypt API key:', error)
    throw new Error('Failed to decrypt API key')
  }
}

/**
 * Get encrypted API key from server and decrypt it
 */
export async function getDecryptedApiKey(): Promise<string> {
  try {
    console.log('🔐 Fetching encrypted API key from server...')
    
    const response = await fetch('/api/get-ai-token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log('🔍 Server response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Server error response:', errorText)
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText }
      }
      throw new Error(errorData.error || `Server error: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Encrypted key received from server')
    console.log('🔍 Response data keys:', Object.keys(data))
    
    // Decrypt the key
    console.log('🔓 Decrypting API key...')
    const decryptedKey = await decryptApiKey(data.encryptedKey, data.iv)
    console.log('✅ API key decrypted successfully')
    
    return decryptedKey

  } catch (error) {
    console.error('❌ Failed to get decrypted API key:', error)
    throw error
  }
}

/**
 * Convert hex string to Uint8Array
 */
function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

/**
 * Simple cache for decrypted API key to avoid repeated decryption
 */
let cachedApiKey: string | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getCachedDecryptedApiKey(): Promise<string> {
  const now = Date.now()
  
  // Return cached key if still valid
  if (cachedApiKey && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('🔄 Using cached decrypted API key')
    return cachedApiKey
  }
  
  // Get fresh key
  cachedApiKey = await getDecryptedApiKey()
  cacheTimestamp = now
  
  return cachedApiKey
} 