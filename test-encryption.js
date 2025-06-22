// Test encryption system
const crypto = require('crypto')

console.log('🧪 Testing encryption system...')

// Test server-side encryption
const ENCRYPTION_KEY = 'ed513c694f3d9c486e16e5fcbc8a738e9600584421e4a745b3cc8ae46bcf4e8e'
const TEST_API_KEY = 'test-mistral-key-12345'

function encryptApiKey(apiKey) {
  const iv = crypto.randomBytes(16)
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return {
    encryptedKey: encrypted,
    iv: iv.toString('hex')
  }
}

console.log('🔐 Testing server-side encryption...')
const encrypted = encryptApiKey(TEST_API_KEY)
console.log('✅ Encrypted successfully')
console.log('📋 Encrypted key length:', encrypted.encryptedKey.length)
console.log('📋 IV length:', encrypted.iv.length)

// Test server-side decryption
function decryptApiKey(encryptedKey, iv) {
  const ivBuffer = Buffer.from(iv, 'hex')
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer)
  
  let decrypted = decipher.update(encryptedKey, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

console.log('🔓 Testing server-side decryption...')
const decrypted = decryptApiKey(encrypted.encryptedKey, encrypted.iv)
console.log('✅ Decrypted successfully')
console.log('📋 Original:', TEST_API_KEY)
console.log('📋 Decrypted:', decrypted)
console.log('📋 Match:', TEST_API_KEY === decrypted ? '✅' : '❌')

console.log('\n🌐 Environment variables needed:')
console.log('MISTRAL_API_KEY=your_actual_mistral_key')
console.log('ENCRYPTION_KEY=' + ENCRYPTION_KEY)
console.log('NEXT_PUBLIC_ENCRYPTION_KEY=' + ENCRYPTION_KEY) 