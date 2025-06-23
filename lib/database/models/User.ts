import mongoose, { Document, Model } from 'mongoose'

export interface IUser extends Document {
  _id: string
  clerkId: string
  email?: string
  firstName?: string
  lastName?: string
  avatar?: string
  plan: 'spark' | 'pro' | 'premium' | 'team' | 'enterprise'
  credits: number  // Based on plan
  subscription?: {
    planId: string
    status: 'active' | 'canceled' | 'past_due' | 'trialing'
    currentPeriodEnd: Date
    cancelAtPeriodEnd: boolean
    stripeSubscriptionId?: string
    stripeCustomerId?: string
  }
  preferences: {
    expoVersion: string
    codeStyle: 'typescript' | 'javascript'
    theme: 'light' | 'dark'
    preferredProvider?: string
    preferredModel?: string
    useOwnKeys?: boolean
  }
  usage: {
    generationsThisMonth: number
    buildsThisMonth: number
    projectsThisMonth: number
    storageUsed: number
    lastResetAt: Date
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
    enum: ['spark', 'pro', 'premium', 'team', 'enterprise'], 
    default: 'spark' 
  },
  credits: { 
    type: Number, 
    default: 10  // Based on plan limits
  },
  subscription: {
    planId: { type: String },
    status: { 
      type: String, 
      enum: ['active', 'canceled', 'past_due', 'trialing'],
      default: 'active'
    },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    stripeSubscriptionId: { type: String },
    stripeCustomerId: { type: String }
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
    },
    preferredProvider: {
      type: String,
      default: 'mistral'
    },
    preferredModel: {
      type: String,
      default: 'Mistral Large'
    },
    useOwnKeys: {
      type: Boolean,
      default: false
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
    projectsThisMonth: { 
      type: Number, 
      default: 0 
    },
    storageUsed: { 
      type: Number, 
      default: 0 
    },
    lastResetAt: { 
      type: Date, 
      default: Date.now 
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