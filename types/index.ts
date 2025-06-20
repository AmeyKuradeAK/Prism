export interface GeneratedFile {
  path: string
  content: string
  type: 'tsx' | 'ts' | 'json' | 'js' | 'jsx' | 'md' | 'txt'
}

export interface BuildInfo {
  status: 'building' | 'success' | 'failed'
  buildId: string
  downloadUrl: string
  logs: string[]
}

export interface AppState {
  isGenerating: boolean
  generatedFiles: GeneratedFile[]
  buildInfo: BuildInfo | null
  error: string | null
}

export interface MistralMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface StreamResponse {
  type: 'log' | 'files' | 'error' | 'complete'
  message?: string
  files?: GeneratedFile[]
}

export interface PromptInputProps {
  onGenerate: (prompt: string) => void
  onStop: () => void
  isGenerating: boolean
  disabled: boolean
  mode?: string
}

export interface StreamingConsoleProps {
  logs: string[]
  isGenerating: boolean
  error: string | null
}

export interface CodePreviewProps {
  files: GeneratedFile[]
  isGenerating: boolean
  prompt: string
}

export interface BuildStatusProps {
  buildInfo: BuildInfo | null
  onBuild: () => void
  onDownload: () => void
  onSave?: (projectName: string, description: string) => Promise<any>
  hasFiles: boolean
  isGenerating: boolean
}

// User and project types for the multi-user platform
export interface User {
  _id: string
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
  plan: 'free' | 'pro' | 'enterprise'
  credits: number
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
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  _id: string
  name: string
  description: string
  prompt: string
  userId: string
  files: GeneratedFile[]
  status: 'draft' | 'generating' | 'completed' | 'building' | 'built' | 'failed'
  buildInfo?: BuildInfo
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

export interface Prompt {
  _id: string
  title: string
  description: string
  content: string
  category: string
  tags: string[]
  isPublic: boolean
  userId: string
  usage: {
    timesUsed: number
    likes: number
    rating: number
  }
  metadata: {
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimatedTime: string
    features: string[]
  }
  createdAt: Date
  updatedAt: Date
} 