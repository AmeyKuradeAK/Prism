import mongoose from 'mongoose'

declare global {
  var mongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
  
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string
      MISTRAL_API_KEY: string
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string
      CLERK_SECRET_KEY: string
      EXPO_ACCESS_TOKEN?: string
      NEXTAUTH_SECRET: string
      NEXTAUTH_URL: string
    }
  }
}

export {} 