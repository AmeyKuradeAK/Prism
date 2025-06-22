'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Smartphone, 
  Play, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Loader,
  Eye,
  Code,
  FileText,
  Package
} from 'lucide-react'

interface ReactNativePreviewProps {
  files: { [key: string]: string }
  isGenerating?: boolean
  projectName?: string
}

interface PreviewState {
  status: 'loading' | 'ready' | 'error' | 'validating'
  errors: string[]
  warnings: string[]
  entryPoint: string | null
  memfsLoaded: boolean
}

export default function ReactNativePreview({ 
  files, 
  isGenerating = false, 
  projectName = 'React Native App' 
}: ReactNativePreviewProps) {
  const [previewState, setPreviewState] = useState<PreviewState>({
    status: 'loading',
    errors: [],
    warnings: [],
    entryPoint: null,
    memfsLoaded: false
  })

  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Load files into memfs when files change
  useEffect(() => {
    if (Object.keys(files).length === 0) {
      setPreviewState({
        status: 'loading',
        errors: [],
        warnings: [],
        entryPoint: null,
        memfsLoaded: false
      })
      return
    }

    loadFilesIntoMemfs()
  }, [files])

  const loadFilesIntoMemfs = async () => {
    try {
      setPreviewState(prev => ({ ...prev, status: 'validating' }))

      // Dynamic import to avoid SSR issues
      if (typeof window === 'undefined') return

      const { createVirtualFS, validateReactNativeProject, normalizeFilesForMemfs } = 
        await import('@/lib/utils/memfs-helper')

      console.log('🚀 Loading React Native project into memfs...')
      console.log(`📄 Files to load: ${Object.keys(files).length}`)

      // Create virtual filesystem
      const vfs = createVirtualFS()
      
      // Normalize files for memfs (ensure absolute paths)
      const normalizedFiles = normalizeFilesForMemfs(files)
      
      // Load files into memfs
      vfs.loadFiles(normalizedFiles)
      
      // Validate the loaded project
      const validation = validateReactNativeProject(vfs)
      
      console.log('📊 Project validation:', validation)
      
      if (validation.isValid) {
        setPreviewState({
          status: 'ready',
          errors: validation.errors,
          warnings: validation.warnings,
          entryPoint: validation.entryPoint,
          memfsLoaded: true
        })
        
        console.log('✅ memfs loaded successfully')
        console.log(`📱 Entry point: ${validation.entryPoint}`)
        
        // Load preview in iframe (simulated)
        loadPreviewInIframe(validation.entryPoint)
        
      } else {
        setPreviewState({
          status: 'error',
          errors: validation.errors,
          warnings: validation.warnings,
          entryPoint: validation.entryPoint,
          memfsLoaded: false
        })
        
        console.error('❌ Project validation failed:', validation.errors)
      }
      
    } catch (error) {
      console.error('❌ Failed to load files into memfs:', error)
      setPreviewState({
        status: 'error',
        errors: [`Failed creating with base template: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        entryPoint: null,
        memfsLoaded: false
      })
    }
  }

  const loadPreviewInIframe = (entryPoint: string | null) => {
    if (!iframeRef.current || !entryPoint) return

    // In a real implementation, this would:
    // 1. Create a temporary Expo web server
    // 2. Mount the memfs files 
    // 3. Start Metro bundler with memfs
    // 4. Load the preview URL in iframe

    console.log(`🌐 Loading preview for entry point: ${entryPoint}`)
    
    // For demo purposes, show a simulated React Native preview
    const previewHTML = generatePreviewHTML(entryPoint)
    const blob = new Blob([previewHTML], { type: 'text/html' })
    const previewUrl = URL.createObjectURL(blob)
    
    iframeRef.current.src = previewUrl
  }

  const generatePreviewHTML = (entryPoint: string) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${projectName} - React Native Preview</title>
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .preview-container {
          text-align: center;
          max-width: 400px;
          padding: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .phone-mockup {
          width: 200px;
          height: 400px;
          background: #000;
          border-radius: 25px;
          margin: 20px auto;
          padding: 20px;
          border: 3px solid #333;
          position: relative;
        }
        .screen {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: white;
          font-size: 14px;
        }
        .status {
          margin-top: 20px;
          opacity: 0.8;
        }
        .entry-point {
          font-family: monospace;
          background: rgba(0,0,0,0.2);
          padding: 5px 10px;
          border-radius: 5px;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="preview-container">
        <h2>📱 ${projectName}</h2>
        <div class="phone-mockup">
          <div class="screen">
            <div style="font-size: 18px; margin-bottom: 10px;">⚛️</div>
            <div>React Native App</div>
            <div style="font-size: 12px; opacity: 0.8; margin-top: 10px;">
              Running from memfs
            </div>
          </div>
        </div>
        <div class="status">
          <div>✅ memfs loaded successfully</div>
          <div class="entry-point">Entry: ${entryPoint}</div>
        </div>
      </div>
    </body>
    </html>
    `
  }

  const retryLoad = () => {
    loadFilesIntoMemfs()
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
            {previewState.memfsLoaded && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">memfs loaded</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {previewState.status === 'ready' && (
              <button
                onClick={retryLoad}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded border transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            )}
            
            <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
              previewState.status === 'ready' ? 'bg-green-100 text-green-700' :
              previewState.status === 'error' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {previewState.status === 'loading' && <Loader className="w-3 h-3 animate-spin" />}
              {previewState.status === 'validating' && <Loader className="w-3 h-3 animate-spin" />}
              {previewState.status === 'ready' && <CheckCircle className="w-3 h-3" />}
              {previewState.status === 'error' && <AlertCircle className="w-3 h-3" />}
              <span>
                {previewState.status === 'loading' && 'Loading...'}
                {previewState.status === 'validating' && 'Validating...'}
                {previewState.status === 'ready' && 'Ready'}
                {previewState.status === 'error' && 'Error'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        {previewState.status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Preview Failed</h3>
              <div className="space-y-2 mb-4">
                {previewState.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                ))}
              </div>
              <button
                onClick={retryLoad}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {(previewState.status === 'loading' || previewState.status === 'validating') && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {previewState.status === 'loading' ? 'Loading Preview...' : 'Validating Project...'}
              </h3>
              <p className="text-slate-600 text-sm">
                {previewState.status === 'loading' ? 'Setting up virtual filesystem' : 'Checking project structure'}
              </p>
            </div>
          </div>
        )}

        {Object.keys(files).length === 0 && !isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Preview Available</h3>
              <p className="text-sm">Generate a React Native app to see the preview</p>
            </div>
          </div>
        )}

        {/* Preview iframe */}
        {previewState.status === 'ready' && (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title="React Native Preview"
          />
        )}

        {/* Warnings panel */}
        {previewState.warnings.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Warnings</h4>
            <div className="space-y-1">
              {previewState.warnings.map((warning, index) => (
                <div key={index} className="text-xs text-yellow-700">
                  • {warning}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      {previewState.entryPoint && (
        <div className="bg-slate-100 border-t border-slate-200 px-4 py-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center space-x-4">
              <span>📱 Entry: {previewState.entryPoint}</span>
              <span>📄 Files: {Object.keys(files).length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Package className="w-3 h-3" />
              <span>memfs</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
} 