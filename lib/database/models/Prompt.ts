import mongoose from 'mongoose'

export interface IPrompt extends mongoose.Document {
  userId?: string // null for public templates
  title: string
  description: string
  content: string
  category: string
  tags: string[]
  type: 'template' | 'history' | 'favorite'
  isPublic: boolean
  complexity: 'simple' | 'medium' | 'complex'
  estimatedTime: number // in minutes
  features: string[]
  usage: {
    timesUsed: number
    successRate: number // percentage of successful generations
    avgRating: number
  }
  metadata: {
    expoFeatures: string[]
    targetPlatforms: ('ios' | 'android' | 'web')[]
    uiComponents: string[]
  }
  analytics: {
    views: number
    likes: number
    forks: number
    reports: number
  }
  versions: {
    version: number
    content: string
    changes: string
    createdAt: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

const PromptSchema = new mongoose.Schema<IPrompt>({
  userId: {
    type: String,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 300
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'business',
      'productivity',
      'social',
      'entertainment',
      'education',
      'health',
      'fitness',
      'travel',
      'finance',
      'utility',
      'game',
      'other'
    ],
    default: 'utility'
  },
  tags: [String],
  type: {
    type: String,
    enum: ['template', 'history', 'favorite'],
    default: 'history'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  complexity: {
    type: String,
    enum: ['simple', 'medium', 'complex'],
    default: 'medium'
  },
  estimatedTime: {
    type: Number,
    default: 5 // minutes
  },
  features: [String],
  usage: {
    timesUsed: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  metadata: {
    expoFeatures: [String],
    targetPlatforms: [{
      type: String,
      enum: ['ios', 'android', 'web']
    }],
    uiComponents: [String]
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    forks: {
      type: Number,
      default: 0
    },
    reports: {
      type: Number,
      default: 0
    }
  },
  versions: [{
    version: Number,
    content: String,
    changes: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
})

// Create indexes for better performance
PromptSchema.index({ userId: 1, type: 1, updatedAt: -1 })
PromptSchema.index({ isPublic: 1, category: 1, updatedAt: -1 })
PromptSchema.index({ tags: 1 })
PromptSchema.index({ complexity: 1 })
PromptSchema.index({ 'usage.timesUsed': -1 })
PromptSchema.index({ 'analytics.views': -1 })

// Text search index
PromptSchema.index({
  title: 'text',
  description: 'text',
  content: 'text',
  tags: 'text'
})

export default mongoose.models.Prompt || mongoose.model<IPrompt>('Prompt', PromptSchema) 