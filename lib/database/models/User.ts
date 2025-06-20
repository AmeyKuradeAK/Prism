import mongoose, { Document, Model } from 'mongoose'

export interface IUser extends Document {
  _id: string
  clerkId: string
  email?: string
  firstName?: string
  lastName?: string
  avatar?: string
  plan: 'free'  // Only free plan now
  credits: number  // Unlimited but tracked for analytics
  preferences: {
    expoVersion: string
    codeStyle: 'typescript' | 'javascript'
    theme: 'light' | 'dark'
  }
  usage: {
    generationsThisMonth: number
    buildsThisMonth: number
    storageUsed: number
  }
  analytics: {
    totalGenerations: number
    totalBuilds: number
    totalProjects: number
    lastActiveAt: Date
  }
  bio?: string
  website?: string
  location?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new mongoose.Schema<IUser>({
  clerkId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    sparse: true 
  },
  firstName: { 
    type: String 
  },
  lastName: { 
    type: String 
  },
  avatar: { 
    type: String 
  },
  plan: { 
    type: String, 
    enum: ['free'], 
    default: 'free' 
  },
  credits: { 
    type: Number, 
    default: 999999  // Unlimited for free users
  },
  preferences: {
    expoVersion: { 
      type: String, 
      default: '50.0.0' 
    },
    codeStyle: { 
      type: String, 
      enum: ['typescript', 'javascript'], 
      default: 'typescript' 
    },
    theme: { 
      type: String, 
      enum: ['light', 'dark'], 
      default: 'light' 
    }
  },
  usage: {
    generationsThisMonth: { 
      type: Number, 
      default: 0 
    },
    buildsThisMonth: { 
      type: Number, 
      default: 0 
    },
    storageUsed: { 
      type: Number, 
      default: 0 
    }
  },
  analytics: {
    totalGenerations: { 
      type: Number, 
      default: 0 
    },
    totalBuilds: { 
      type: Number, 
      default: 0 
    },
    totalProjects: { 
      type: Number, 
      default: 0 
    },
    lastActiveAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  bio: { 
    type: String 
  },
  website: { 
    type: String 
  },
  location: { 
    type: String 
  }
}, {
  timestamps: true
})

// Create indexes for better performance
UserSchema.index({ clerkId: 1 })
UserSchema.index({ email: 1 })
UserSchema.index({ plan: 1 })

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User 