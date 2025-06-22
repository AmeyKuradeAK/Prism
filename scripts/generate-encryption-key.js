#!/usr/bin/env node

const crypto = require('crypto')

console.log('🔐 Generating Encryption Key for v0-flutter...\n')

// Generate a secure 32-byte (256-bit) key
const encryptionKey = crypto.randomBytes(32).toString('hex')

console.log('✅ Generated secure encryption key!')
console.log('')
console.log('📋 Copy these lines to your .env.local file:')
console.log('')
console.log('ENCRYPTION_KEY=' + encryptionKey)
console.log('NEXT_PUBLIC_ENCRYPTION_KEY=' + encryptionKey)
console.log('')
console.log('🛡️ Security Notes:')
console.log('- Keep this key secret and secure')
console.log('- Never commit this to version control')  
console.log('- Both server and client need the same key')
console.log('- This key encrypts your Mistral API key for secure client-side usage') 