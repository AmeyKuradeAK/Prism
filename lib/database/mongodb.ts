import mongoose from 'mongoose'

// Check for required environment variable
const MONGODB_URI: string = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env'
  )
}

// Define the global mongoose interface for caching
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

async function connectToDatabase(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn
  }

  // Create new connection if no promise exists
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      
      // Connection timeouts
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      
      // Connection pool settings
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5,  // Maintain a minimum of 5 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      
      // Heartbeat settings
      heartbeatFrequencyMS: 10000, // Check server status every 10 seconds
      
      // Retry settings
      retryWrites: true,
      retryReads: true,
    }

    console.log('🔗 Connecting to MongoDB...')
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Successfully connected to MongoDB')
      
      // Set up connection event listeners
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error)
      })
      
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected')
      })
      
      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected')
      })
      
      return mongoose
    }).catch((error) => {
      console.error('❌ Failed to connect to MongoDB:', error.message)
      cached.promise = null
      throw new Error(`MongoDB connection failed: ${error.message}`)
    })
  }

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (error) {
    cached.promise = null
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const connection = await connectToDatabase()
    const state = connection.connection.readyState
    return state === 1 // 1 = connected
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

// Close database connection
export async function closeDatabaseConnection(): Promise<void> {
  try {
    if (cached.conn) {
      await cached.conn.connection.close()
      cached.conn = null
      cached.promise = null
      console.log('🔒 MongoDB connection closed')
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error)
  }
}

export default connectToDatabase 