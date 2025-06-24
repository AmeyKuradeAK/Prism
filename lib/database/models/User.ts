import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  clerkId: string
  email?: string
  firstName?: string
  lastName?: string
  avatar?: string
  plan: 'free' | 'plus' | 'pro' | 'team' | 'enterprise'
  credits: number
  subscription: {
    planId?: string
    status: 'active' | 'canceled' | 'past_due' | 'trialing'
    currentPeriodEnd?: Date
    cancelAtPeriodEnd: boolean
    stripeSubscriptionId?: string
    stripeCustomerId?: string
  }
  preferences: {
    expoVersion: string
    codeStyle: 'typescript' | 'javascript'
    theme: 'light' | 'dark'
    preferredProvider: string
    preferredModel: string
    useOwnKeys: boolean
  }
  usage: {
    promptsThisMonth: number
    projectsThisMonth: number
    storageUsed: number
    lastResetAt: Date
    dailyUsage: Array<{
      date: Date
      promptsUsed: number
      projectsCreated: number
    }>
  }
  analytics: {
    totalPrompts: number
    totalProjects: number
    lastActiveAt: Date
    accountAge: number
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
    enum: ['free', 'plus', 'pro', 'team', 'enterprise'], 
    default: 'free' 
  },
  credits: { 
    type: Number, 
    default: 30  // Based on free plan limits
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
    promptsThisMonth: { 
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
    },
    dailyUsage: [{
      date: { type: Date, required: true },
      promptsUsed: { type: Number, default: 0 },
      projectsCreated: { type: Number, default: 0 }
    }]
  },
  analytics: {
    totalPrompts: { 
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
    },
    accountAge: { 
      type: Number, 
      default: 0 
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

// Index for efficient queries
UserSchema.index({ clerkId: 1 })
UserSchema.index({ plan: 1 })
UserSchema.index({ 'usage.lastResetAt': 1 })

// Pre-save middleware to update account age
UserSchema.pre('save', function(next) {
  if (this.isModified('createdAt') || this.isNew) {
    const now = new Date()
    const created = this.createdAt || now
    this.analytics.accountAge = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
  }
  next()
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema) 