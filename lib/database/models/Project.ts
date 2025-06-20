import mongoose, { Document, Model } from 'mongoose'
import { GeneratedFile } from '@/types'

export interface IProject extends Document {
  _id: string
  name: string
  description: string
  prompt: string
  userId: string
  files: GeneratedFile[]
  status: 'draft' | 'generating' | 'completed' | 'building' | 'built' | 'failed'
  buildInfo?: {
    status: 'building' | 'success' | 'failed'
    buildId: string
    downloadUrl: string
    logs: string[]
  }
  analytics: {
    views: number
    downloads: number
    likes: number
    shares: number
  }
  metadata: {
    version: string
    expoVersion: string
    dependencies: string[]
    size: number
  }
  isPublic: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const ProjectSchema = new mongoose.Schema<IProject>({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  prompt: { 
    type: String, 
    required: true 
  },
  userId: { 
    type: String, 
    required: true,
    index: true
  },
  files: [{
    path: { 
      type: String, 
      required: true 
    },
    content: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      enum: ['tsx', 'ts', 'json', 'js', 'jsx', 'md', 'txt'], 
      required: true 
    }
  }],
  status: { 
    type: String, 
    enum: ['draft', 'generating', 'completed', 'building', 'built', 'failed'], 
    default: 'draft' 
  },
  buildInfo: {
    status: { 
      type: String, 
      enum: ['building', 'success', 'failed'] 
    },
    buildId: { 
      type: String 
    },
    downloadUrl: { 
      type: String 
    },
    logs: [{ 
      type: String 
    }]
  },
  analytics: {
    views: { 
      type: Number, 
      default: 0 
    },
    downloads: { 
      type: Number, 
      default: 0 
    },
    likes: { 
      type: Number, 
      default: 0 
    },
    shares: { 
      type: Number, 
      default: 0 
    }
  },
  metadata: {
    version: { 
      type: String, 
      default: '1.0.0' 
    },
    expoVersion: { 
      type: String, 
      default: '50.0.0' 
    },
    dependencies: [{ 
      type: String 
    }],
    size: { 
      type: Number, 
      default: 0 
    }
  },
  isPublic: { 
    type: Boolean, 
    default: false 
  },
  tags: [{ 
    type: String 
  }]
}, {
  timestamps: true
})

// Create indexes for better performance
ProjectSchema.index({ userId: 1, updatedAt: -1 })
ProjectSchema.index({ isPublic: 1, updatedAt: -1 })
ProjectSchema.index({ tags: 1 })
ProjectSchema.index({ 'buildInfo.buildId': 1 })

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema)

export default Project 