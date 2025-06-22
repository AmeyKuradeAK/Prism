'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Wand2, 
  Code, 
  Smartphone, 
  Settings, 
  Play, 
  Save,
  ChevronLeft,
  ChevronRight,
  File,
  Folder,
  Download,
  Hammer,
  Package,
  Loader,
  Eye,
  EyeOff,
  X,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import PromptInput from './PromptInput'
import ReactNativePreview from './ReactNativePreview'
import { runV0Pipeline } from '@/lib/generators/v0-pipeline'

interface BuildInfo {
  status: 'idle' | 'generating' | 'completed' | 'error'
  progress: number
  currentStep: string
  files: { [key: string]: string }
  message?: string
}

interface BuildStatusInfo {
  status: 'building' | 'success' | 'failed'
  buildId: string
  downloadUrl: string
  logs: string[]
}

export default function AppBuilder() {
  const { userId } = useAuth()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') || 'ai'
  const projectId = searchParams.get('projectId')
  
  const [buildInfo, setBuildInfo] = useState<BuildInfo>({
    status: 'idle',
    progress: 0,
    currentStep: '',
    files: {}
  })
  
  const [buildStatusInfo, setBuildStatusInfo] = useState<BuildStatusInfo | null>(null)
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  
  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeView, setActiveView] = useState<'code' | 'preview'>('code')
  const [selectedFile, setSelectedFile] = useState<string>('')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')

  // Track which file is currently being written for UI feedback
  const [currentlyWritingFile, setCurrentlyWritingFile] = useState<string>('')

  // React Native V0 specific state
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [easBuildStatus, setEasBuildStatus] = useState<'idle' | 'building' | 'success' | 'failed'>('idle')
  const [snackUrl, setSnackUrl] = useState<string>('')
  const [nativeModules, setNativeModules] = useState<any[]>([])
  const [appPermissions, setAppPermissions] = useState<string[]>([])

  // Load manual template if mode is manual
  useEffect(() => {
    if (mode === 'manual') {
      handleLoadTemplate()
    } else if (projectId) {
      loadProject(projectId)
    }
  }, [mode, projectId])

  // Auto-select first file when files are generated
  useEffect(() => {
    const fileNames = Object.keys(buildInfo.files)
    if (fileNames.length > 0 && !selectedFile) {
      setSelectedFile(fileNames.find(f => f.includes('App.tsx')) || fileNames[0])
    }
  }, [buildInfo.files, selectedFile])

  // Extract native modules and permissions from AI response
  useEffect(() => {
    if (buildInfo.status === 'completed' && Object.keys(buildInfo.files).length > 0) {
      // Extract metadata if available (from V0StyleResponse)
      const content = Object.values(buildInfo.files).join('\n')
      
      // Extract native modules
      const modules = []
      if (content.includes('expo-camera')) modules.push({ name: 'Camera', icon: '📷' })
      if (content.includes('expo-notifications')) modules.push({ name: 'Push Notifications', icon: '🔔' })
      if (content.includes('expo-location')) modules.push({ name: 'Location Services', icon: '📍' })
      if (content.includes('expo-image-picker')) modules.push({ name: 'Image Picker', icon: '🖼️' })
      if (content.includes('expo-av')) modules.push({ name: 'Audio/Video', icon: '🎵' })
      if (content.includes('expo-haptics')) modules.push({ name: 'Haptic Feedback', icon: '📳' })
      if (content.includes('expo-local-authentication')) modules.push({ name: 'Biometric Auth', icon: '🔐' })
      if (content.includes('expo-barcode-scanner')) modules.push({ name: 'Barcode Scanner', icon: '📱' })
      
      setNativeModules(modules)
      
      // Extract permissions
      const permissions = []
      if (content.includes('CAMERA')) permissions.push('Camera')
      if (content.includes('NOTIFICATIONS')) permissions.push('Notifications')
      if (content.includes('LOCATION')) permissions.push('Location')
      if (content.includes('RECORD_AUDIO')) permissions.push('Microphone')
      if (content.includes('READ_CONTACTS')) permissions.push('Contacts')
      
      setAppPermissions(permissions)
    }
  }, [buildInfo.status, buildInfo.files])

  const handleLoadTemplate = async () => {
    setBuildInfo(prev => ({
      ...prev,
      status: 'generating',
      progress: 50,
      currentStep: 'Loading template...'
    }))

    try {
      const templateFiles = await runV0Pipeline('Basic Expo Template')
      
      setBuildInfo({
        status: 'completed',
        progress: 100,
        currentStep: 'Template loaded',
        files: templateFiles
      })
    } catch (error) {
      console.error('Failed to load template:', error)
      setBuildInfo(prev => ({
        ...prev,
        status: 'error',
        message: 'Failed to load template'
      }))
    }
  }

  const handleStop = () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
    setBuildInfo(prev => ({
      ...prev,
      status: 'idle',
      currentStep: 'Generation stopped',
      progress: 0
    }))
  }

  const handleGenerate = async (prompt: string, useExtendedTimeout = false) => {
    setCurrentPrompt(prompt)
    setBuildInfo({
      status: 'generating',
      progress: 0,
      currentStep: useExtendedTimeout 
        ? 'Initializing extended timeout generation (up to 90s)...' 
        : 'Initializing quick generation (6s timeout)...',
      files: {}
    })

    const controller = new AbortController()
    setAbortController(controller)

    try {
      const apiEndpoint = useExtendedTimeout ? '/api/ai-stream' : '/api/generate'
      console.log(`🚀 Starting generation with ${useExtendedTimeout ? 'extended timeout' : 'quick mode'}:`, prompt)
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body reader available')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

              for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            
            if (data.type === 'progress') {
              setBuildInfo(prev => ({
                ...prev,
                currentStep: data.message,
                progress: Math.min(prev.progress + 5, 95)
              }))
            } else if (data.type === 'complete') {
              // Final result with all files
              setBuildInfo({
                status: 'completed',
                progress: 100,
                currentStep: `✅ Generated ${data.fileCount} files in ${Math.ceil(data.duration/1000)}s!`,
                files: data.files
              })
              
              // Auto-select first file for preview
              const firstFile = Object.keys(data.files)[0]
              if (firstFile) {
                setSelectedFile(firstFile)
                setActiveView('code')
              }
              setCurrentlyWritingFile('')
              
              console.log(`✅ Generation complete: ${data.fileCount} files in ${data.duration}ms`)
            } else if (data.type === 'error') {
              throw new Error(data.message || 'Generation failed')
            }
            
            // Legacy support for old format (if needed)
            else if (data.type === 'log') {
              setBuildInfo(prev => ({
                ...prev,
                currentStep: data.message,
                progress: Math.min(prev.progress + 10, 90)
              }))
            } else if (data.type === 'file_start' && data.file) {
              setBuildInfo(prev => ({
                ...prev,
                currentStep: `Creating ${data.file.path}...`,
                progress: Math.min(prev.progress + 5, 85)
              }))
              setCurrentlyWritingFile(data.file.path)
            } else if (data.type === 'file_progress' && data.file) {
              setBuildInfo(prev => ({
                ...prev,
                files: {
                  ...prev.files,
                  [data.file.path]: data.file.content
                },
                currentStep: data.message || `Writing ${data.file.path}...`,
                progress: Math.min(prev.progress + 1, 89)
              }))
              
              if (!selectedFile || selectedFile !== data.file.path) {
                setSelectedFile(data.file.path)
                setActiveView('code')
              }
              setCurrentlyWritingFile(data.file.path)
            } else if (data.type === 'file_complete' && data.file) {
              setBuildInfo(prev => ({
                ...prev,
                files: {
                  ...prev.files,
                  [data.file.path]: data.file.content
                },
                currentStep: `✅ Completed ${data.file.path}`,
                progress: Math.min(prev.progress + 8, 90)
              }))
              
              if (!selectedFile && data.file.path) {
                setSelectedFile(data.file.path)
                setActiveView('code')
              }
              setCurrentlyWritingFile('')
            } else if (data.type === 'files') {
              const filesObject: { [key: string]: string } = {}
              data.files.forEach((file: any) => {
                filesObject[file.path] = file.content
              })
              
              setBuildInfo({
                status: 'completed',
                progress: 100,
                currentStep: 'Generation complete!',
                files: filesObject
              })
              
              setActiveView('code')
              setCurrentlyWritingFile('')
            }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError)
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      
      console.error('Generation failed:', error)
      setBuildInfo({
        status: 'error',
        progress: 0,
        currentStep: 'Generation failed',
        files: {},
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setAbortController(null)
    }
  }

  const handleBuild = async () => {
    if (Object.keys(buildInfo.files).length === 0) {
      alert('No files to build. Please generate an app first.')
      return
    }

    // Show platform selection modal
    const platform = await showPlatformSelection()
    if (!platform) return

    const buildProfile = 'preview' // Can be made configurable

    setBuildStatusInfo({
      status: 'building',
      buildId: `build_${Date.now()}`,
      downloadUrl: '',
      logs: []
    })

    try {
      const response = await fetch('/api/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: currentPrompt.slice(0, 50) || 'Generated App',
          files: buildInfo.files,
          platform,
          buildProfile
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start build')
      }

      const buildResult = await response.json()
      
      setBuildStatusInfo({
        status: 'building',
        buildId: buildResult.buildId,
        downloadUrl: '',
        logs: buildResult.logs || ['🚀 Build started successfully!']
      })

      // Poll for build updates
      pollBuildStatus(buildResult.buildId)

    } catch (error) {
      console.error('Build failed:', error)
      setBuildStatusInfo({
        status: 'failed',
        buildId: `build_${Date.now()}`,
        downloadUrl: '',
        logs: [`❌ Build failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      })
    }
  }

  const showPlatformSelection = (): Promise<'android' | 'ios' | 'all' | null> => {
    return new Promise((resolve) => {
      const modal = document.createElement('div')
      modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'
      modal.innerHTML = `
        <div class="bg-black/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full mx-4">
          <h3 class="text-2xl font-bold text-white mb-4">Select Build Platform</h3>
          <p class="text-white/70 mb-6">Choose which platform(s) to build for:</p>
          <div class="space-y-3">
            <button id="android-btn" class="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-all">
              🤖 Android APK
            </button>
            <button id="ios-btn" class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all">
              🍎 iOS IPA
            </button>
            <button id="both-btn" class="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 px-4 rounded-xl font-semibold transition-all">
              📱 Both Platforms
            </button>
            <button id="cancel-btn" class="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl font-semibold transition-all">
              Cancel
            </button>
          </div>
        </div>
      `

      document.body.appendChild(modal)

      const cleanup = () => document.body.removeChild(modal)

      document.getElementById('android-btn')?.addEventListener('click', () => {
        cleanup()
        resolve('android')
      })

      document.getElementById('ios-btn')?.addEventListener('click', () => {
        cleanup()
        resolve('ios')
      })

      document.getElementById('both-btn')?.addEventListener('click', () => {
        cleanup()
        resolve('all')
      })

      document.getElementById('cancel-btn')?.addEventListener('click', () => {
        cleanup()
        resolve(null)
      })

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          cleanup()
          resolve(null)
        }
      })
    })
  }

  const pollBuildStatus = async (buildId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/build?buildId=${buildId}`)
        if (response.ok) {
          const build = await response.json()
          
          setBuildStatusInfo(prev => prev ? {
            ...prev,
            status: build.status,
            downloadUrl: build.downloadUrl || prev.downloadUrl,
            logs: build.logs || prev.logs
          } : null)

          if (build.status === 'completed') {
            setBuildStatusInfo(prev => prev ? {
              ...prev,
              status: 'success',
              downloadUrl: build.downloadUrl
            } : null)
          } else if (build.status === 'failed') {
            setBuildStatusInfo(prev => prev ? {
              ...prev,
              status: 'failed'
            } : null)
          } else if (build.status === 'in-progress') {
            // Continue polling
            setTimeout(poll, 5000) // Poll every 5 seconds
          }
        }
      } catch (error) {
        console.error('Failed to poll build status:', error)
      }
    }

    poll()
  }

  const handleDownload = () => {
    const downloadFiles = async () => {
      try {
        // V0.dev Style: Create ZIP in browser using JSZip
        const JSZip = (await import('jszip')).default
        const zip = new JSZip()

        // Add all files to ZIP
        Object.entries(buildInfo.files).forEach(([path, content]) => {
          zip.file(path, content as string)
        })

        // Add README with instructions (V0.dev style)
        const readme = `# ${currentPrompt.slice(0, 50) || 'Generated Expo App'}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npx expo start
   \`\`\`

3. Use Expo Go app on your phone to scan the QR code, or:
   - Press 'a' for Android emulator
   - Press 'i' for iOS simulator  
   - Press 'w' for web

## Features

This app was generated using V0.dev-style AI generation.

Generated files: ${Object.keys(buildInfo.files).length}
Generated on: ${new Date().toLocaleString()}
`
        
        zip.file('README.md', readme)

        // Generate ZIP blob in browser (V0.dev approach)
        const blob = await zip.generateAsync({ type: 'blob' })
        
        // Trigger download directly from browser
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${currentPrompt.slice(0, 50) || 'expo-app'}.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
      } catch (error) {
        console.error('V0.dev-style download failed:', error)
        alert('Download failed. Please try again.')
      }
    }

    downloadFiles()
  }

  const handleSaveProject = async () => {
    if (!projectName.trim()) return
    
    setIsSaving(true)
    try {
      // Convert files object to array format expected by the database
      const filesArray = Object.entries(buildInfo.files).map(([path, content]) => ({
        path,
        content: content as string,
        type: path.endsWith('.tsx') ? 'tsx' as const :
              path.endsWith('.ts') ? 'ts' as const :
              path.endsWith('.js') ? 'js' as const :
              path.endsWith('.jsx') ? 'jsx' as const :
              path.endsWith('.json') ? 'json' as const :
              path.endsWith('.md') ? 'md' as const : 'txt' as const
      }))

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName.trim(),
          description: projectDescription.trim(),
          prompt: currentPrompt,
          files: filesArray,
          status: 'completed'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save project')
      }

      setShowSaveModal(false)
      setProjectName('')
      setProjectDescription('')
      alert('Project saved successfully!')
    } catch (error) {
      console.error('Failed to save project:', error)
      alert('Failed to save project. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return <Code className="w-4 h-4 text-blue-400" />
    if (filename.endsWith('.json')) return <File className="w-4 h-4 text-yellow-400" />
    if (filename.endsWith('.md')) return <File className="w-4 h-4 text-gray-400" />
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) return <Code className="w-4 h-4 text-yellow-600" />
    if (filename.includes('app.json')) return <Smartphone className="w-4 h-4 text-green-400" />
    if (filename.includes('package.json')) return <Package className="w-4 h-4 text-orange-400" />
    return <File className="w-4 h-4 text-gray-400" />
  }

  const organizeFiles = (files: { [key: string]: string }) => {
    const organized: { [key: string]: string[] } = {}
    
    Object.keys(files).forEach(filepath => {
      const parts = filepath.split('/')
      if (parts.length === 1) {
        // Root file
        if (!organized['📱 Root']) organized['📱 Root'] = []
        organized['📱 Root'].push(filepath)
      } else {
        // File in directory
        const dir = parts[0]
        const dirIcon = dir === 'app' ? '📱 Screens' : 
                       dir === 'components' ? '🧩 Components' :
                       dir === 'types' ? '📝 Types' :
                       dir === 'hooks' ? '🪝 Hooks' :
                       dir === 'constants' ? '⚙️ Constants' :
                       dir === 'utils' ? '🛠️ Utils' : `📁 ${dir}`
        
        if (!organized[dirIcon]) organized[dirIcon] = []
        organized[dirIcon].push(filepath)
      }
    })
    
    return organized
  }

  const organizedFiles = organizeFiles(buildInfo.files)

  // React Native specific features detection
  const detectReactNativeFeatures = (files: { [key: string]: string }) => {
    const features = new Set<string>()
    const content = Object.values(files).join('\n')
    
    // Navigation
    if (content.includes('expo-router')) features.add('📱 Expo Router Navigation')
    if (content.includes('Tabs')) features.add('📑 Tab Navigation')
    if (content.includes('Stack')) features.add('📚 Stack Navigation')
    if (content.includes('Drawer')) features.add('📂 Drawer Navigation')
    
    // Native Features
    if (content.includes('expo-camera')) features.add('📷 Camera')
    if (content.includes('expo-location')) features.add('📍 Location Services')
    if (content.includes('expo-notifications')) features.add('🔔 Push Notifications')
    if (content.includes('AsyncStorage')) features.add('💾 Local Storage')
    if (content.includes('expo-image-picker')) features.add('🖼️ Image Picker')
    if (content.includes('expo-sensors')) features.add('📱 Device Sensors')
    if (content.includes('expo-av')) features.add('🎵 Audio/Video')
    if (content.includes('expo-haptics')) features.add('📳 Haptic Feedback')
    
    // UI Features
    if (content.includes('nativewind') || content.includes('tailwind')) features.add('🎨 Tailwind Styling')
    if (content.includes('SafeAreaView')) features.add('📱 Safe Area')
    if (content.includes('StatusBar')) features.add('📊 Status Bar')
    if (content.includes('FlatList')) features.add('📋 Optimized Lists')
    if (content.includes('ScrollView')) features.add('📜 Scrollable Views')
    
    return Array.from(features)
  }

  const reactNativeFeatures = detectReactNativeFeatures(buildInfo.files)

  const loadProject = async (id: string) => {
    setBuildInfo(prev => ({
      ...prev,
      status: 'generating',
      progress: 50,
      currentStep: 'Loading project...'
    }))

    try {
      const response = await fetch(`/api/projects/${id}`)
      if (!response.ok) {
        throw new Error('Failed to load project')
      }

      const project = await response.json()
      
      // Convert files array back to object format
      const filesObject: { [key: string]: string } = {}
      project.files.forEach((file: any) => {
        filesObject[file.path] = file.content
      })
      
      setBuildInfo({
        status: 'completed',
        progress: 100,
        currentStep: 'Project loaded',
        files: filesObject
      })
      
      setCurrentPrompt(project.prompt)
      setProjectName(project.name)
      setProjectDescription(project.description)
      setActiveView('code')
      
    } catch (error) {
      console.error('Failed to load project:', error)
      setBuildInfo(prev => ({
        ...prev,
        status: 'error',
        message: 'Failed to load project'
      }))
    }
  }

  // React Native V0: Expo Web Preview
  const handleExpoPreview = async () => {
    setIsPreviewMode(true)
    
    try {
      const response = await fetch('/api/expo/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: buildInfo.files,
          projectName: currentPrompt.slice(0, 50) || 'React Native App'
        }),
      })

      if (!response.ok) {
        throw new Error('Preview generation failed')
      }

      const { previewUrl } = await response.json()
      window.open(previewUrl, '_blank')
      
    } catch (error) {
      console.error('Expo preview failed:', error)
      alert('Expo preview failed. Please try again.')
    } finally {
      setIsPreviewMode(false)
    }
  }

  // React Native V0: Snack SDK Integration
  const handleSnackUpload = async () => {
    try {
      const response = await fetch('/api/snack/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: buildInfo.files,
          name: currentPrompt.slice(0, 50) || 'React Native App',
          description: `Generated with React Native V0: ${currentPrompt}`
        }),
      })

      if (!response.ok) {
        throw new Error('Snack upload failed')
      }

      const { snackUrl: url } = await response.json()
      setSnackUrl(url)
      window.open(url, '_blank')
      
    } catch (error) {
      console.error('Snack upload failed:', error)
      alert('Snack upload failed. Please try again.')
    }
  }

  // React Native V0: EAS Build API Integration
  const handleEASBuild = async (platform: 'android' | 'ios' | 'all') => {
    setEasBuildStatus('building')
    
    try {
      const response = await fetch('/api/eas/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: buildInfo.files,
          platform,
          projectName: currentPrompt.slice(0, 50) || 'React Native App'
        }),
      })

      if (!response.ok) {
        throw new Error('EAS Build failed')
      }

      const { buildId, buildUrl } = await response.json()
      
      // Poll build status
      const pollBuild = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/eas/build/${buildId}`)
          const { status, artifacts } = await statusResponse.json()
          
          if (status === 'finished') {
            setEasBuildStatus('success')
            clearInterval(pollBuild)
            
            // Download APK/IPA
            if (artifacts && artifacts.length > 0) {
              window.open(artifacts[0].url, '_blank')
            }
          } else if (status === 'errored') {
            setEasBuildStatus('failed')
            clearInterval(pollBuild)
          }
        } catch (error) {
          console.error('Build status check failed:', error)
          setEasBuildStatus('failed')
          clearInterval(pollBuild)
        }
      }, 10000) // Check every 10 seconds
      
    } catch (error) {
      console.error('EAS Build failed:', error)
      setEasBuildStatus('failed')
      alert('EAS Build failed. Please try again.')
    }
  }

  return (
    <div className="h-screen bg-black flex overflow-hidden">
      {/* Collapsible Sidebar */}
      <motion.div
        className={`${sidebarCollapsed ? 'w-0' : 'w-80'} bg-white/5 backdrop-blur-xl border-r border-white/10 transition-all duration-300 overflow-hidden`}
        initial={false}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/dashboard"
              className="text-white/60 hover:text-white transition-colors flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Prompt Input */}
          <div className="flex-1 overflow-y-auto">
            <PromptInput 
              onGenerate={handleGenerate}
              onStop={handleStop}
              isGenerating={buildInfo.status === 'generating'}
              disabled={buildInfo.status === 'generating'}
              mode={mode}
            />
          </div>

          {/* Action Buttons */}
          {Object.keys(buildInfo.files).length > 0 && (
            <div className="space-y-3 mt-6">
              {/* React Native V0 Features Panel */}
              {(reactNativeFeatures.length > 0 || nativeModules.length > 0) && (
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-4">
                  <h3 className="text-white font-medium mb-3 flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-green-400" />
                    <span>📱 React Native V0 Features</span>
                  </h3>
                  
                  {/* Native Modules */}
                  {nativeModules.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-white/70 text-sm mb-2">🔧 Native Modules:</h4>
                      <div className="grid grid-cols-1 gap-1">
                        {nativeModules.map((module, index) => (
                          <div key={index} className="text-sm text-white/70 bg-white/5 rounded px-3 py-1 flex items-center space-x-2">
                            <span>{module.icon}</span>
                            <span>{module.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Permissions */}
                  {appPermissions.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-white/70 text-sm mb-2">🔐 Permissions:</h4>
                      <div className="flex flex-wrap gap-1">
                        {appPermissions.map((permission, index) => (
                          <span key={index} className="text-xs text-white/60 bg-white/10 rounded px-2 py-1">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Auto-detected Features */}
                  {reactNativeFeatures.length > 0 && (
                    <div>
                      <h4 className="text-white/70 text-sm mb-2">✨ Auto-detected:</h4>
                      <div className="grid grid-cols-1 gap-1">
                        {reactNativeFeatures.map((feature, index) => (
                          <div key={index} className="text-sm text-white/70 bg-white/5 rounded px-3 py-1">
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* React Native V0 Action Buttons */}
              {Object.keys(buildInfo.files).length > 0 && (
                <div className="space-y-2 mb-4">
                  <h3 className="text-white font-medium flex items-center space-x-2">
                    <Play className="w-4 h-4 text-blue-400" />
                    <span>🚀 Preview & Build</span>
                  </h3>
                  
                  {/* Expo Web Preview */}
                  <button
                    onClick={handleExpoPreview}
                    disabled={isPreviewMode}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all"
                  >
                    {isPreviewMode ? <Loader className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                    <span>{isPreviewMode ? 'Generating Preview...' : '📱 Expo Web Preview'}</span>
                  </button>

                  {/* Snack Upload */}
                  <button
                    onClick={handleSnackUpload}
                    disabled={buildInfo.status === 'generating'}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>📦 Upload to Snack</span>
                  </button>

                  {/* EAS Build */}
                  <button
                    onClick={() => handleEASBuild('android')}
                    disabled={easBuildStatus === 'building'}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all"
                  >
                    {easBuildStatus === 'building' ? <Loader className="w-4 h-4 animate-spin" /> : <Hammer className="w-4 h-4" />}
                    <span>
                      {easBuildStatus === 'building' ? 'Building APK...' : 
                       easBuildStatus === 'success' ? '✅ APK Ready!' :
                       easBuildStatus === 'failed' ? '❌ Build Failed' : '🔨 Build Android APK'}
                    </span>
                  </button>

                  {/* Snack URL Display */}
                  {snackUrl && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/70 text-sm mb-2">📦 Snack URL:</p>
                      <a 
                        href={snackUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm break-all"
                      >
                        {snackUrl}
                      </a>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowSaveModal(true)}
                disabled={buildInfo.status === 'generating'}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Project</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleBuild}
                  disabled={buildInfo.status === 'generating' || buildStatusInfo?.status === 'building'}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-2 px-3 rounded-xl flex items-center justify-center space-x-1 transition-all text-sm"
                >
                  {buildStatusInfo?.status === 'building' ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Hammer className="w-4 h-4" />
                  )}
                  <span>Build</span>
                </button>

                <button
                  onClick={handleDownload}
                  disabled={buildInfo.status === 'generating'}
                  className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-2 px-3 rounded-xl flex items-center justify-center space-x-1 transition-all text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}

          {/* Build Status */}
          {buildStatusInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 bg-white/5 border border-white/10 rounded-2xl"
            >
              <div className="flex items-center space-x-2 mb-3">
                <Package className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium text-sm">EAS Build</span>
              </div>

              {buildStatusInfo.status === 'building' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Loader className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-blue-400 text-sm font-medium">Building...</span>
                  </div>
                  
                  {buildStatusInfo.logs.length > 0 && (
                    <div className="bg-black/40 rounded-lg p-3 max-h-32 overflow-y-auto">
                      {buildStatusInfo.logs.slice(-5).map((log, index) => (
                        <div key={index} className="text-xs text-white/70 mb-1 last:mb-0">
                          {log}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {buildStatusInfo.status === 'success' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">Build Complete!</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={buildStatusInfo.downloadUrl}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-3 rounded-xl flex items-center justify-center space-x-1 transition-all text-xs"
                    >
                      <Package className="w-3 h-3" />
                      <span>APK</span>
                    </a>
                    
                    <button
                      onClick={handleDownload}
                      className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white py-2 px-3 rounded-xl flex items-center justify-center space-x-1 transition-all text-xs"
                    >
                      <Download className="w-3 h-3" />
                      <span>Source</span>
                    </button>
                  </div>
                </div>
              )}

              {buildStatusInfo.status === 'failed' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <X className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm font-medium">Build Failed</span>
                  </div>
                  
                  <button
                    onClick={handleBuild}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all text-sm"
                  >
                    <Hammer className="w-4 h-4" />
                    <span>Retry Build</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-black/50 backdrop-blur-xl border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5 text-white/60" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-white/60" />
                )}
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Wand2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    {mode === 'manual' ? 'Manual Builder' : 'AI App Builder'}
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              {Object.keys(buildInfo.files).length > 0 && (
                <div className="flex bg-white/5 rounded-xl p-1">
                  <button
                    onClick={() => setActiveView('code')}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      activeView === 'code'
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Code className="w-4 h-4 inline mr-2" />
                    Code
                  </button>
                  <button
                    onClick={() => setActiveView('preview')}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      activeView === 'preview'
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 inline mr-2" />
                    Preview
                  </button>
                </div>
              )}

              {buildInfo.status === 'completed' && (
                <button
                  onClick={() => window.open('https://expo.dev', '_blank')}
                  className="flex items-center space-x-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all"
                >
                  <Play className="w-4 h-4" />
                  <span>Test in Expo</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Explorer */}
          {Object.keys(buildInfo.files).length > 0 && (
            <div className="w-64 bg-white/5 border-r border-white/10 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-white/80 mb-3">Files</h3>
                <div className="space-y-1">
                  {Object.entries(organizedFiles).map(([dir, files]) => (
                    <div key={dir}>
                      {dir !== '📱 Root' && (
                        <div className="flex items-center space-x-2 text-white/60 text-sm py-1">
                          <Folder className="w-4 h-4" />
                          <span>{dir}</span>
                        </div>
                      )}
                      {files.map(filepath => (
                        <button
                          key={filepath}
                          onClick={() => setSelectedFile(filepath)}
                          className={`w-full flex items-center space-x-2 px-2 py-1 text-sm rounded-lg transition-colors ${
                            selectedFile === filepath
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'text-white/70 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {getFileIcon(filepath)}
                          <span className={`flex-1 text-left ${dir !== '📱 Root' ? 'ml-4' : ''}`}>
                            {filepath.split('/').pop()}
                          </span>
                          
                          {/* Show writing indicator */}
                          {currentlyWritingFile === filepath && (
                            <div className="flex items-center space-x-1">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-400">Writing</span>
                            </div>
                          )}
                          
                          {/* Show character count for completed files */}
                          {buildInfo.files[filepath] && currentlyWritingFile !== filepath && (
                            <span className="text-xs text-white/40">
                              {buildInfo.files[filepath].length}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Code/Preview Area */}
          <div className="flex-1 flex flex-col">
            {buildInfo.status === 'generating' && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  >
                    <Wand2 className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">{buildInfo.currentStep}</h3>
                  <div className="w-64 h-2 bg-white/10 rounded-full mx-auto">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${buildInfo.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-white/60 mt-2">{buildInfo.progress}% complete</p>
                </div>
              </div>
            )}

            {buildInfo.status === 'completed' && activeView === 'code' && selectedFile && (
              <div className="flex-1 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(selectedFile)}
                      <span className="text-white font-medium">{selectedFile}</span>
                      {currentlyWritingFile === selectedFile && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-400">Writing...</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-white/60">
                      {buildInfo.files[selectedFile]?.length || 0} characters
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 relative">
                  <pre className="text-sm text-white/80 bg-black/40 rounded-xl p-4 overflow-x-auto">
                    <code>{buildInfo.files[selectedFile]}</code>
                  </pre>
                  
                  {/* Show typing cursor when this file is being written */}
                  {currentlyWritingFile === selectedFile && buildInfo.files[selectedFile] && (
                    <div className="absolute bottom-6 right-6">
                      <div className="flex items-center space-x-2 bg-black/60 text-white px-3 py-2 rounded-lg text-xs backdrop-blur-sm border border-white/10">
                        <div className="w-1 h-4 bg-green-400 animate-pulse"></div>
                        <span>AI is writing this file...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Show generation progress even when files are being created */}
            {buildInfo.status === 'generating' && Object.keys(buildInfo.files).length > 0 && activeView === 'code' && selectedFile && (
              <div className="flex-1 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(selectedFile)}
                      <span className="text-white font-medium">{selectedFile}</span>
                      {currentlyWritingFile === selectedFile && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-400">Writing...</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-white/60">
                      {buildInfo.files[selectedFile]?.length || 0} characters
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 relative">
                  <pre className="text-sm text-white/80 bg-black/40 rounded-xl p-4 overflow-x-auto">
                    <code>{buildInfo.files[selectedFile] || ''}</code>
                  </pre>
                  
                  {/* Show typing cursor when this file is being written */}
                  {currentlyWritingFile === selectedFile && (
                    <div className="absolute bottom-6 right-6">
                      <div className="flex items-center space-x-2 bg-black/60 text-white px-3 py-2 rounded-lg text-xs backdrop-blur-sm border border-white/10">
                        <div className="w-1 h-4 bg-green-400 animate-pulse"></div>
                        <span>AI is writing this file...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeView === 'preview' && (
              <div className="flex-1">
                <ReactNativePreview 
                  files={buildInfo.files}
                  isGenerating={buildInfo.status === 'generating'}
                  projectName={currentPrompt.slice(0, 50) || 'React Native App'}
                />
              </div>
            )}

            {buildInfo.status === 'idle' && Object.keys(buildInfo.files).length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Wand2 className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {sidebarCollapsed ? 'Open the sidebar to start building' : 'Describe your app idea'}
                  </h3>
                  <p className="text-white/60 max-w-md">
                    {sidebarCollapsed 
                      ? 'Click the arrow button to open the prompt sidebar and start creating your app.'
                      : 'Enter a detailed description of the React Native app you want to build and let AI generate it for you.'
                    }
                  </p>
                </div>
              </div>
            )}

            {buildInfo.status === 'error' && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <X className="w-10 h-10 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Generation Failed</h3>
                  <p className="text-white/60 mb-6">{buildInfo.message}</p>
                  <button
                    onClick={() => setBuildInfo(prev => ({ ...prev, status: 'idle' }))}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Project Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Save Project</h3>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Describe your project"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProject}
                  disabled={!projectName.trim() || isSaving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-2xl transition-all flex items-center justify-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Project</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 