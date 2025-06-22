'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Smartphone, 
  AlertCircle, 
  CheckCircle,
  Loader,
  Eye
} from 'lucide-react'

interface SimpleReactNativePreviewProps {
  files: { [key: string]: string }
  isGenerating?: boolean
  projectName?: string
}

interface PreviewState {
  status: 'loading' | 'ready' | 'error'
  message: string
  memfsLoaded: boolean
}

export default function SimpleReactNativePreview({ 
  files, 
  isGenerating = false, 
  projectName = 'React Native App' 
}: SimpleReactNativePreviewProps) {
  const [previewState, setPreviewState] = useState<PreviewState>({
    status: 'loading',
    message: 'Initializing preview...',
    memfsLoaded: false
  })

  // Load files into memfs when files change
  useEffect(() => {
    if (Object.keys(files).length === 0) {
      setPreviewState({
        status: 'loading',
        message: 'No files to preview',
        memfsLoaded: false
      })
      return
    }

    loadFiles()
  }, [files])

  const loadFiles = async () => {
    try {
      setPreviewState(prev => ({ ...prev, status: 'loading', message: 'Loading files into memfs...' }))

      // Only load memfs in browser
      if (typeof window === 'undefined') {
        setPreviewState({
          status: 'error',
          message: 'Preview only available in browser',
          memfsLoaded: false
        })
        return
      }

      console.log('🚀 Loading files into memfs...')
      console.log(`📄 Files to load: ${Object.keys(files).length}`)

      // Dynamic import to avoid SSR issues
      const { loadFilesIntoMemfs, validateMemfsFiles } = await import('@/lib/utils/simple-memfs')
      
      // Load files into memfs
      const loadSuccess = loadFilesIntoMemfs(files)
      
      if (!loadSuccess) {
        setPreviewState({
          status: 'error',
          message: 'Failed to load files into memfs',
          memfsLoaded: false
        })
        return
      }
      
      // Validate loaded files
      const validation = validateMemfsFiles()
      
      if (validation.isValid) {
        setPreviewState({
          status: 'ready',
          message: `✅ Preview ready with ${Object.keys(files).length} files`,
          memfsLoaded: true
        })
        console.log('✅ memfs loaded successfully')
      } else {
        setPreviewState({
          status: 'error',
          message: `Validation failed: ${validation.errors.join(', ')}`,
          memfsLoaded: false
        })
        console.error('❌ Validation failed:', validation.errors)
      }
      
    } catch (error) {
      console.error('❌ Failed to load files:', error)
      setPreviewState({
        status: 'error',
        message: `Failed to load files: ${error instanceof Error ? error.message : 'Unknown error'}`,
        memfsLoaded: false
      })
    }
  }

  const getStatusIcon = () => {
    switch (previewState.status) {
      case 'loading':
        return <Loader className="w-4 h-4 animate-spin text-blue-500" />
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = () => {
    switch (previewState.status) {
      case 'loading':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'ready':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-800">React Native Preview</h3>
          </div>

          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm ${getStatusColor()}`}>
            {getStatusIcon()}
            <span>{previewState.status}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        {/* Preview Content */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            {/* Phone Mockup */}
            <div className="w-48 h-96 bg-black rounded-3xl mx-auto mb-6 p-3 shadow-2xl">
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center relative overflow-hidden">
                {previewState.status === 'ready' ? (
                  <div className="text-center text-white">
                    <div className="text-3xl mb-2">⚛️</div>
                    <div className="text-lg font-semibold mb-1">{projectName}</div>
                    <div className="text-sm opacity-75">Running from memfs</div>
                    <div className="text-xs opacity-50 mt-2">{Object.keys(files).length} files loaded</div>
                  </div>
                ) : previewState.status === 'error' ? (
                  <div className="text-center text-white">
                    <div className="text-3xl mb-2">❌</div>
                    <div className="text-sm">Preview Error</div>
                  </div>
                ) : (
                  <div className="text-center text-white">
                    <div className="text-3xl mb-2">
                      <Loader className="w-8 h-8 animate-spin mx-auto" />
                    </div>
                    <div className="text-sm">Loading...</div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Message */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">
                {previewState.status === 'ready' && '✅ Preview Ready'}
                {previewState.status === 'loading' && '🔄 Loading Preview'}
                {previewState.status === 'error' && '❌ Preview Failed'}
              </h3>
              <p className="text-slate-600 text-sm">{previewState.message}</p>
              
              {previewState.status === 'error' && (
                <button
                  onClick={loadFiles}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {Object.keys(files).length === 0 && !isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Preview Available</h3>
              <p className="text-sm">Generate a React Native app to see the preview</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-100 border-t border-slate-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-4">
            <span>📄 Files: {Object.keys(files).length}</span>
            {previewState.memfsLoaded && (
              <span className="text-green-600">📦 memfs loaded</span>
            )}
          </div>
          <div>
            React Native Preview
          </div>
        </div>
      </div>
    </motion.div>
  )
} 