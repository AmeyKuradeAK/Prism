import mongoose from 'mongoose'

// Check for required environment variable
const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/v0-flutter-dev'

// Development mode flag
const isDevelopment = process.env.NODE_ENV === 'development'
const useLocalFallback = isDevelopment && (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost'))

console.log('🔧 Database Config:', {
  isDevelopment,
  useLocalFallback,
  hasMongoURI: !!process.env.MONGODB_URI
})

// Define the global mongoose interface
declare global {
  var mongoose: {
    conn: typeof import('mongoose') | null
    promise: Promise<typeof import('mongoose')> | null
  }
}

// Initialize cached connection
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectToDatabase() {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn
  }

  // For development without MongoDB Atlas, return a mock connection
  if (useLocalFallback) {
    console.log('🔄 Using development mode - no database connection required')
    // Create a minimal mock connection object
    const mockConnection = {
      connection: { readyState: 1 },
      models: {},
      model: () => ({
        find: () => ({ sort: () => ({ lean: () => ({ limit: () => Promise.resolve([]) }) }) }),
        findOne: () => Promise.resolve(null),
        findOneAndUpdate: () => Promise.resolve(null),
        save: () => Promise.resolve({ _id: 'mock-id', createdAt: new Date() }),
        create: () => Promise.resolve({ _id: 'mock-id', createdAt: new Date() })
      })
    }
    cached.conn = mockConnection as any
    return mockConnection
  }

  // Create new connection if no promise exists
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 3000, // Faster timeout for development
      socketTimeoutMS: 10000, // Shorter timeout
      maxPoolSize: 5, // Smaller pool for development
      minPoolSize: 1,
      maxIdleTimeMS: 10000,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB')
      return mongoose
    }).catch((error) => {
      console.error('❌ MongoDB connection failed:', error.message)
      cached.promise = null
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (error) {
    cached.promise = null
    console.error('❌ MongoDB connection error:', error)
    
    // In development, fall back to mock mode instead of throwing
    if (isDevelopment) {
      console.log('🔄 Falling back to development mode')
      return connectToDatabase() // This will use the mock connection
    }
    
    throw error
  }

  return cached.conn
}

export default connectToDatabase 