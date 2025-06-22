'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import JSZip from 'jszip'
import { fixProjectStructure, analyzeProjectStructure } from '@/lib/utils/project-structure-fixer'
import { 
  Play, 
  FileText, 
  Folder, 
  FolderOpen, 
  Download, 
  Save, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Smartphone,
  Code,
  Eye,
  Terminal,
  Settings,
  Zap,
  Package,
  Cloud,
  Monitor,
  Moon,
  Sun,
  Copy,
  ExternalLink,
  RefreshCw,
  Hammer,
  Palette,
  ChevronDown,
  ChevronRight,
  X,
  Send,
  User,
  Bot,
  Plus,
  MessageSquare,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react'

interface FileProgress {
  path: string
  content: string
  isComplete: boolean
}

interface GenerationProgress {
  type: 'log' | 'file_start' | 'file_progress' | 'file_complete' | 'complete' | 'error' | 'files'
  message?: string
  file?: FileProgress
  files?: any[]
}

interface BuildStatus {
  id: string
  status: 'pending' | 'building' | 'success' | 'error'
  platform: 'android' | 'ios' | 'web'
  downloadUrl?: string
  error?: string
  progress?: number
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isGenerating?: boolean
}

interface ProjectBuilderProps {
  projectId?: string
}

export default function ProjectBuilder({ projectId }: ProjectBuilderProps) {
  // Chat and conversation state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome! I\'ll help you build your React Native app. Describe what you want to create, and I\'ll generate a complete project for you.',
      timestamp: new Date()
    }
  ])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Project state
  const [files, setFiles] = useState<{ [key: string]: string }>({})
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [progressFiles, setProgressFiles] = useState<{ [key: string]: FileProgress }>({})
  const [project, setProject] = useState<any>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  
  // UI state
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']))
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(['android']))
  const [buildStatuses, setBuildStatuses] = useState<BuildStatus[]>([])
  const [isBuilding, setIsBuilding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Refs
  const chatRef = useRef<HTMLDivElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-save functionality
  const triggerAutoSave = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }
    
    setAutoSaveStatus('saving')
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveProject()
        setAutoSaveStatus('saved')
      } catch (error) {
        setAutoSaveStatus('error')
      }
    }, 1000)
  }

  // Save project to database
  const saveProject = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: projectId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: projectId,
          name: extractProjectName(chatMessages.find(m => m.type === 'user')?.content || '') || 'Untitled Project',
          prompt: chatMessages.find(m => m.type === 'user')?.content || '',
          files,
          lastModified: new Date().toISOString()
        })
      })
      
      if (!response.ok) throw new Error('Failed to save project')
      
      const savedProject = await response.json()
      setProject(savedProject)
      
      if (!projectId) {
        window.history.replaceState({}, '', `/builder?project=${savedProject.id}`)
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
      throw error
    }
  }

  // Auto-save when files change
  useEffect(() => {
    if (Object.keys(files).length > 0) {
      triggerAutoSave()
    }
  }, [files])

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [chatMessages])

  // Load base template
  const handleLoadTemplate = async () => {
    console.log('📂 Loading COMPLETE demo-1 base template...')
    setIsGenerating(true)
    
    // Add loading message
    const loadingMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content: '📂 Loading base React Native template...',
      timestamp: new Date(),
      isGenerating: true
    }
    setChatMessages(prev => [...prev, loadingMessage])

    try {
      // Import and generate template
      const { generateCompleteDemo1Template } = await import('@/lib/generators/templates/complete-demo1-template')
      const templateFiles = generateCompleteDemo1Template('BaseTemplate')
      
      console.log(`✅ Base template loaded: ${Object.keys(templateFiles).length} files`)
      console.log('📋 All template files:', Object.keys(templateFiles).sort())
      
      // Set files
      setFiles(templateFiles)
      
      // Auto-select first file
      const firstFile = Object.keys(templateFiles)[0]
      if (firstFile) {
        setActiveFile(firstFile)
      }
      
      // Update chat with success message
      setChatMessages(prev => 
        prev.map(msg => 
          msg.isGenerating ? {
            ...msg,
            content: `✅ Base template loaded successfully! ${Object.keys(templateFiles).length} files created.`,
            isGenerating: false
          } : msg
        )
      )
      
    } catch (error) {
      console.error('Failed to load template:', error)
      setChatMessages(prev => 
        prev.map(msg => 
          msg.isGenerating ? {
            ...msg,
            content: `❌ Failed to load template: ${error instanceof Error ? error.message : 'Unknown error'}`,
            isGenerating: false
          } : msg
        )
      )
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle chat message submission
  const handleSendMessage = async (e: React.FormEvent, quickMode: boolean = false) => {
    e.preventDefault()
    if (!currentMessage.trim() || isGenerating) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsGenerating(true)

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: quickMode ? '⚡ Quick generating (base template only)...' : 'Generating your app...',
      timestamp: new Date(),
      isGenerating: true
    }
    setChatMessages(prev => [...prev, loadingMessage])

    try {
      await generateApp(userMessage.content, false, quickMode)
    } catch (error) {
      // Update loading message with error
      setChatMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? { ...msg, content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`, isGenerating: false }
          : msg
      ))
    } finally {
      setIsGenerating(false)
    }
  }

  const generateApp = async (prompt: string, testMode: boolean = false, quickMode: boolean = false) => {
    try {
      console.log('🚀 Starting hybrid client-side AI + base template generation...')
      console.log('📝 Prompt:', prompt)
      console.log('🧪 Test mode:', testMode)
      
      // Step 1: Always load base template first (into virtual memfs)
      console.log('📦 Step 1: Loading base template into memfs...')
      const { generateCompleteDemo1Template } = await import('@/lib/generators/templates/complete-demo1-template')
      const { loadFilesIntoMemfs } = await import('@/lib/utils/simple-memfs')
      
      const baseFiles = generateCompleteDemo1Template('BaseApp')
      await loadFilesIntoMemfs(baseFiles)
      console.log(`✅ Base template loaded: ${Object.keys(baseFiles).length} files in memfs`)
      
      // Set base files immediately so user sees progress
      setFiles(baseFiles)
      setActiveFile(Object.keys(baseFiles)[0])
      
      // Quick mode: Just return base template
      if (quickMode) {
        console.log('⚡ Quick mode: Using base template only')
        setChatMessages(prev => prev.map(msg => 
          msg.isGenerating 
            ? { 
                ...msg, 
                content: `⚡ Quick mode: Base template loaded with ${Object.keys(baseFiles).length} files!`,
                isGenerating: false 
              }
            : msg
        ))
        return
      }
      
      // Step 2: Generate AI enhancements directly from client
      console.log('🤖 Step 2: Getting secure encrypted API key...')
      console.log('🔍 Debug - testMode:', testMode, 'quickMode:', quickMode)
      
      // TEMPORARY: Check if .env.local exists and has required vars
      const hasEncryptionKey = !!process.env.NEXT_PUBLIC_ENCRYPTION_KEY
      console.log('🔍 Environment check:')
      console.log('  - NEXT_PUBLIC_ENCRYPTION_KEY:', hasEncryptionKey ? '✅ Present' : '❌ Missing')
      
      if (!hasEncryptionKey) {
        console.error('❌ Missing environment variables! Please create .env.local file')
        setChatMessages(prev => prev.map(msg => 
          msg.isGenerating 
            ? { 
                ...msg, 
                content: `📦 Base template loaded with ${Object.keys(baseFiles).length} files! 
                
❌ **Missing .env.local file!** 

Please create a \`.env.local\` file with:
\`\`\`
MISTRAL_API_KEY=your_mistral_key_here
ENCRYPTION_KEY=ed513c694f3d9c486e16e5fcbc8a738e9600584421e4a745b3cc8ae46bcf4e8e
NEXT_PUBLIC_ENCRYPTION_KEY=ed513c694f3d9c486e16e5fcbc8a738e9600584421e4a745b3cc8ae46bcf4e8e
\`\`\`

Then restart the dev server.`,
                isGenerating: false 
              }
            : msg
        ))
        return
      }
      
      let apiKey: string
      try {
        const { getCachedDecryptedApiKey } = await import('@/lib/utils/crypto-client')
        console.log('🔍 Debug - About to call getCachedDecryptedApiKey...')
        apiKey = await getCachedDecryptedApiKey()
        console.log('🔐 API key decrypted successfully, length:', apiKey.length)
      } catch (keyError) {
        console.error('❌ Failed to get API key, detailed error:', keyError)
        console.error('❌ Error stack:', keyError instanceof Error ? keyError.stack : 'No stack')
        setChatMessages(prev => prev.map(msg => 
          msg.isGenerating 
            ? { 
                ...msg, 
                content: `📦 Base template loaded with ${Object.keys(baseFiles).length} files! (API key error: ${keyError instanceof Error ? keyError.message : 'Unknown'})`,
                isGenerating: false 
              }
            : msg
        ))
        return
      }
      
      console.log('🤖 Step 3: Calling Mistral AI with encrypted key...')
      const aiResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            {
              role: 'system',
              content: `Generate React Native/Expo code files to enhance the existing base template based on the user's request. Only return NEW or MODIFIED files that add functionality. Format as JSON array with {path, content} objects. Use modern React Native patterns.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      })
      
      if (!aiResponse.ok) {
        console.log('⚠️ AI generation failed, using base template only')
        setChatMessages(prev => prev.map(msg => 
          msg.isGenerating 
            ? { 
                ...msg, 
                content: `📦 Base template loaded with ${Object.keys(baseFiles).length} files! (AI generation failed)`,
                isGenerating: false 
              }
            : msg
        ))
        return
      }
      
      const aiData = await aiResponse.json()
      console.log('🤖 AI Response received:', aiData.choices?.[0]?.message?.content?.substring(0, 200))
      
      // Step 3: Parse AI-generated files
      const { parseCodeFromResponse } = await import('@/lib/utils/code-parser')
      const aiGeneratedFiles = parseCodeFromResponse(aiData.choices?.[0]?.message?.content || '')
      
             console.log(`🔄 Step 4: Parsed ${aiGeneratedFiles.length} AI-generated files`)
       
       // Step 5: Merge AI files into base template (in memfs)
      const mergedFiles = { ...baseFiles }
      let aiFileCount = 0
      
      aiGeneratedFiles.forEach(file => {
        if (file.path && file.content) {
          console.log(`🔄 Merging AI file: ${file.path}`)
          mergedFiles[file.path] = file.content
          aiFileCount++
        }
      })
      
             console.log(`✅ Step 5: Merged ${aiFileCount} AI files into base template`)
      console.log(`📊 Final result: ${Object.keys(mergedFiles).length} total files`)
      
      // Update memfs with merged files
      await loadFilesIntoMemfs(mergedFiles)
      
      // Set all merged files in state
      setFiles(mergedFiles)
      
      // Update progress files for UI
      Object.entries(mergedFiles).forEach(([path, fileContent]) => {
        if (typeof fileContent === 'string' && fileContent.length > 0) {
          setProgressFiles(prev => ({
            ...prev,
            [path]: {
              path,
              content: fileContent,
              isComplete: true
            }
          }))
        }
      })
      
      // Update success message
      setChatMessages(prev => prev.map(msg => 
        msg.isGenerating 
          ? { 
              ...msg, 
              content: `✅ Generated enhanced React Native app! Base template (${Object.keys(baseFiles).length} files) + AI enhancements (${aiFileCount} files) = ${Object.keys(mergedFiles).length} total files in memfs.`,
              isGenerating: false 
            }
          : msg
      ))

      // Trigger auto-save
      triggerAutoSave()

    } catch (error) {
      console.error('❌ Hybrid generation error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      
      // Fallback to base template on any error
      const { generateCompleteDemo1Template } = await import('@/lib/generators/templates/complete-demo1-template')
      const fallbackFiles = generateCompleteDemo1Template('FallbackApp')
      setFiles(fallbackFiles)
      
      setChatMessages(prev => prev.map(msg => 
        msg.isGenerating 
          ? { 
              ...msg, 
              content: `⚠️ AI generation failed, using base template (${Object.keys(fallbackFiles).length} files). Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              isGenerating: false 
            }
          : msg
      ))
    }
  }

  // File tree utilities
  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.ts')) return <Code className="w-4 h-4 text-blue-400" />
    if (fileName.endsWith('.json')) return <FileText className="w-4 h-4 text-yellow-400" />
    if (fileName.endsWith('.js')) return <Code className="w-4 h-4 text-yellow-500" />
    if (fileName.endsWith('.md')) return <FileText className="w-4 h-4 text-gray-400" />
    return <FileText className="w-4 h-4 text-gray-500" />
  }

  const getFileTree = () => {
    console.log('🗂️ Organizing files into tree structure...')
    console.log('📋 Raw file paths:', Object.keys(files).sort())
    
    const organized: { [key: string]: string[] } = {}
    
    Object.keys(files).forEach(path => {
      console.log(`🔍 Processing file: ${path}`)
      
      // Remove leading slash if it exists
      const cleanPath = path.startsWith('/') ? path.slice(1) : path
      const parts = cleanPath.split('/')
      
      let folderName = ''
      
      // Root files (package.json, app.json, etc.)
      if (parts.length === 1) {
        folderName = '📄 Project Files'
      }
      // App files
      else if (parts[0] === 'app') {
        if (parts.length === 2) {
          folderName = '📱 app'
        } else if (parts[1] === '(tabs)') {
          folderName = '📱 app/(tabs)'
        } else {
          folderName = '📱 app'
        }
      }
      // Components
      else if (parts[0] === 'components') {
        if (parts.length === 2) {
          folderName = '🧩 components'
        } else if (parts[1] === 'ui') {
          folderName = '🧩 components/ui'
        } else {
          folderName = '🧩 components'
        }
      }
      // Hooks
      else if (parts[0] === 'hooks') {
        folderName = '🪝 hooks'
      }
      // Constants
      else if (parts[0] === 'constants') {
        folderName = '⚙️ constants'
      }
      // Assets
      else if (parts[0] === 'assets') {
        folderName = '🖼️ assets'
      }
      // Scripts
      else if (parts[0] === 'scripts') {
        folderName = '📜 scripts'
      }
      // Other directories
      else {
        folderName = `📁 ${parts[0]}`
      }
      
      if (!organized[folderName]) {
        organized[folderName] = []
      }
      organized[folderName].push(path)
      
      console.log(`  → Added to folder: ${folderName}`)
    })
    
    // Sort files within each folder
    Object.keys(organized).forEach(folder => {
      organized[folder].sort()
    })
    
    console.log('✅ Final organization:', organized)
    console.log(`📊 Total folders: ${Object.keys(organized).length}`)
    
    return organized
  }

  const filteredFiles = () => {
    if (!searchQuery) return getFileTree()
    
    const filtered: { [key: string]: string[] } = {}
    Object.entries(getFileTree()).forEach(([folder, fileList]) => {
      const matchingFiles = fileList.filter(file => 
        file.toLowerCase().includes(searchQuery.toLowerCase())
      )
      if (matchingFiles.length > 0) {
        filtered[folder] = matchingFiles
      }
    })
    return filtered
  }

  const extractProjectName = (prompt: string) => {
    const words = prompt.split(' ').slice(0, 4).join(' ')
    return words.length > 30 ? words.substring(0, 30) + '...' : words
  }

  const downloadProject = async () => {
    if (Object.keys(files).length === 0) return

    try {
      const zip = new JSZip()
      
      Object.entries(files).forEach(([path, content]) => {
        zip.file(path, content)
      })
      
      const projectName = extractProjectName(chatMessages.find(m => m.type === 'user')?.content || '') || 'react-native-app'
      const fileName = `${projectName.replace(/[^a-zA-Z0-9-]/g, '-')}-${Date.now()}.zip`
      
      const content = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      })
      
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folder)) {
        newSet.delete(folder)
      } else {
        newSet.add(folder)
      }
      return newSet
    })
  }

  // Debug function to test generation directly
  const testGeneration = async () => {
    console.log('🧪 Testing generation directly (test mode)...')
    
    // Add test message to chat
    const testMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: '🧪 Running production test - Base template only (no external APIs)',
      timestamp: new Date()
    }
    setChatMessages(prev => [...prev, testMessage])
    
    try {
      await generateApp('Create a simple todo app', true) // Test mode enabled
    } catch (error) {
      console.error('🧪 Test generation failed:', error)
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    }
  }

  return (
    <div className="h-screen flex flex-col bg-black text-gray-100">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-100">
                {project?.name || extractProjectName(chatMessages.find(m => m.type === 'user')?.content || '') || 'React Native Project'}
              </h1>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <span className="flex items-center space-x-1">
                  <Package className="w-3 h-3" />
                  <span>Expo SDK 53</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  {autoSaveStatus === 'saving' && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
                  {autoSaveStatus === 'saved' && <CheckCircle className="w-3 h-3 text-green-400" />}
                  {autoSaveStatus === 'error' && <AlertCircle className="w-3 h-3 text-red-400" />}
                  <span>
                    {autoSaveStatus === 'saving' ? 'Saving...' : 
                     autoSaveStatus === 'saved' ? 'Saved' : 'Save failed'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={downloadProject}
            disabled={Object.keys(files).length === 0}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
            {Object.keys(files).length > 0 && (
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                {Object.keys(files).length}
              </span>
            )}
          </button>
          
          {/* Quick Mode Button */}
          <button
            onClick={(e) => {
              if (currentMessage.trim()) {
                handleSendMessage(e as any, true) // Quick mode
              }
            }}
            disabled={isGenerating || !currentMessage.trim()}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Quick Gen</span>
          </button>
          
          {/* Debug Test Button */}
          <button
            onClick={testGeneration}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Test Gen</span>
          </button>
          
          {/* Load Template Button */}
          <button
            onClick={handleLoadTemplate}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Folder className="w-4 h-4" />
            <span>📂 Load Template</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - VS Code style file explorer */}
        <div className="w-80 border-r border-gray-800 bg-gray-900 flex flex-col">
          {/* Explorer Header */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-200 flex items-center space-x-2">
                <Folder className="w-4 h-4 text-blue-400" />
                <span>EXPLORER</span>
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {Object.keys(files).length} files
                </span>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* File Tree - Scrollable */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
            <div className="p-2">
              <AnimatePresence>
                {Object.entries(filteredFiles()).map(([folder, fileList]) => (
                  <div key={folder} className="mb-1">
                    {folder !== 'root' && (
                      <button
                        onClick={() => toggleFolder(folder)}
                        className="flex items-center space-x-2 w-full p-2 text-sm font-medium text-gray-300 hover:bg-gray-800 rounded transition-colors"
                      >
                        {expandedFolders.has(folder) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <FolderOpen className="w-4 h-4 text-blue-400" />
                        <span>{folder}</span>
                      </button>
                    )}
                    
                    {(folder === 'root' || expandedFolders.has(folder)) && fileList.map(filePath => {
                      const isActive = activeFile === filePath
                      const isComplete = files[filePath] !== undefined
                      
                      return (
                        <motion.div
                          key={filePath}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-center space-x-2 p-2 ml-6 rounded cursor-pointer transition-colors ${
                            isActive ? 'bg-blue-900/50 border-l-2 border-blue-400' : 
                            isComplete ? 'hover:bg-gray-800' : 'opacity-50'
                          }`}
                          onClick={() => isComplete && setActiveFile(filePath)}
                        >
                          {getFileIcon(filePath)}
                          <span className="text-sm truncate flex-1 text-gray-300">
                            {filePath.split('/').pop()}
                          </span>
                          {isComplete && (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                ))}
              </AnimatePresence>
              
              {Object.keys(files).length === 0 && (
                <div className="text-center mt-8 text-gray-500">
                  <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No files yet</p>
                  <p className="text-xs text-gray-600 mt-2">Start a conversation to generate your app</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Code Editor Area */}
          <div className="flex-1 bg-gray-900">
            {activeFile ? (
              <>
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-200">
                      {activeFile}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(files[activeFile] || '')}
                    className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="h-full overflow-auto">
                  <div className="p-4">
                    <pre className="bg-black p-4 rounded-lg overflow-auto text-sm border border-gray-800 h-full">
                      <code className="text-gray-300">
                        {progressFiles[activeFile]?.content || files[activeFile] || ''}
                      </code>
                    </pre>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Code className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                  <p className="text-lg font-medium mb-2">Select a file to view</p>
                  <p className="text-sm text-gray-600">Choose from the file explorer to see the code</p>
                </div>
              </div>
            )}
          </div>

          {/* Chat Interface - ChatGPT Style */}
          <div className="h-80 border-t border-gray-800 bg-black flex flex-col">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-200">AI Assistant</span>
              </div>
              <div className="flex items-center space-x-2">
                {isGenerating && (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span className="text-xs text-blue-400">Generating...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Messages - Scrollable */}
            <div 
              ref={chatRef}
              className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800 p-4 space-y-4"
            >
              {chatMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start space-x-3 ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-blue-600' 
                      : message.type === 'assistant' 
                        ? 'bg-purple-600' 
                        : 'bg-gray-600'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : message.type === 'assistant' ? (
                      <Bot className="w-4 h-4 text-white" />
                    ) : (
                      <Settings className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <div className={`max-w-[80%] ${
                    message.type === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    <div className={`inline-block p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.type === 'assistant'
                          ? 'bg-gray-800 text-gray-200'
                          : 'bg-gray-700 text-gray-300'
                    }`}>
                      {message.isGenerating ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{message.content}</span>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-800">
              <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Describe your app or ask for changes..."
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-200 placeholder-gray-400"
                    rows={3}
                    disabled={isGenerating}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!currentMessage.trim() || isGenerating}
                  className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 