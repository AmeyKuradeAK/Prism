'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  X
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

interface ProjectBuilderProps {
  projectId?: string
}

export default function ProjectBuilder({ projectId }: ProjectBuilderProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [files, setFiles] = useState<{ [key: string]: string }>({})
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [progressFiles, setProgressFiles] = useState<{ [key: string]: FileProgress }>({})
  const [project, setProject] = useState<any>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'build' | 'deploy'>('code')
  const [buildStatuses, setBuildStatuses] = useState<BuildStatus[]>([])
  const [isBuilding, setIsBuilding] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']))
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(['android']))
  
  const consoleRef = useRef<HTMLDivElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()

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
          name: extractProjectName(prompt) || 'Untitled Project',
          prompt,
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

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [logs])

  const generateApp = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    setLogs([])
    setFiles({})
    setProgressFiles({})
    setActiveFile(null)
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      if (!response.ok) throw new Error('Generation failed')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Failed to get reader')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = new TextDecoder().decode(value)
        const lines = text.split('\n').filter(line => line.trim())

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: GenerationProgress = JSON.parse(line.slice(6))
              
              if (data.type === 'log') {
                setLogs(prev => [...prev, data.message || ''])
              } else if (data.type === 'file_start' && data.file) {
                setProgressFiles(prev => ({
                  ...prev,
                  [data.file!.path]: { ...data.file!, isComplete: false }
                }))
                setActiveFile(data.file.path)
              } else if (data.type === 'file_progress' && data.file) {
                setProgressFiles(prev => ({
                  ...prev,
                  [data.file!.path]: { ...data.file!, isComplete: false }
                }))
              } else if (data.type === 'file_complete' && data.file) {
                setProgressFiles(prev => ({
                  ...prev,
                  [data.file!.path]: { ...data.file!, isComplete: true }
                }))
                setFiles(prev => ({
                  ...prev,
                  [data.file!.path]: data.file!.content
                }))
              } else if (data.type === 'files' && data.files) {
                const finalFiles: { [key: string]: string } = {}
                data.files.forEach(file => {
                  finalFiles[file.path] = file.content
                })
                setFiles(finalFiles)
              } else if (data.type === 'complete') {
                setLogs(prev => [...prev, '🎉 Generation complete!'])
                setIsGenerating(false)
              } else if (data.type === 'error') {
                setLogs(prev => [...prev, `❌ Error: ${data.message}`])
                setIsGenerating(false)
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e)
            }
          }
        }
      }
    } catch (error) {
      setLogs(prev => [...prev, `❌ Failed to generate: ${error}`])
      setIsGenerating(false)
    }
  }

  // Build functionality
  const startBuild = async (platform: string) => {
    setIsBuilding(true)
    const buildId = `build-${Date.now()}-${platform}`
    
    const newBuild: BuildStatus = {
      id: buildId,
      status: 'building',
      platform: platform as 'android' | 'ios' | 'web',
      progress: 0
    }
    
    setBuildStatuses(prev => [newBuild, ...prev])
    
    try {
      const response = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          files,
          projectName: project?.name || 'generated-app'
        })
      })
      
      if (!response.ok) throw new Error('Build failed to start')
      
      const result = await response.json()
      
      // Poll for build status
      const pollBuild = async () => {
        try {
          const statusResponse = await fetch(`/api/build?buildId=${result.buildId}`)
          const buildStatus = await statusResponse.json()
          
          setBuildStatuses(prev => prev.map(build => 
            build.id === buildId 
              ? { ...build, ...buildStatus, id: buildId }
              : build
          ))
          
          if (buildStatus.status === 'building') {
            setTimeout(pollBuild, 2000)
          } else {
            setIsBuilding(false)
          }
        } catch (error) {
          setBuildStatuses(prev => prev.map(build => 
            build.id === buildId 
              ? { ...build, status: 'error', error: 'Build monitoring failed' }
              : build
          ))
          setIsBuilding(false)
        }
      }
      
      setTimeout(pollBuild, 2000)
      
    } catch (error) {
      setBuildStatuses(prev => prev.map(build => 
        build.id === buildId 
          ? { ...build, status: 'error', error: error instanceof Error ? error.message : 'Build failed' }
          : build
      ))
      setIsBuilding(false)
    }
  }

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.ts')) return <Code className="w-4 h-4 text-blue-400" />
    if (fileName.endsWith('.json')) return <FileText className="w-4 h-4 text-yellow-400" />
    if (fileName.endsWith('.js')) return <Code className="w-4 h-4 text-yellow-500" />
    if (fileName.endsWith('.md')) return <FileText className="w-4 h-4 text-gray-400" />
    return <FileText className="w-4 h-4 text-gray-500" />
  }

  const getFileTree = () => {
    const tree: { [key: string]: string[] } = {}
    Object.keys(files).forEach(path => {
      const parts = path.split('/')
      if (parts.length === 1) {
        if (!tree['root']) tree['root'] = []
        tree['root'].push(path)
      } else {
        const dir = parts[0]
        if (!tree[dir]) tree[dir] = []
        tree[dir].push(path)
      }
    })
    return tree
  }

  const extractProjectName = (prompt: string) => {
    const words = prompt.split(' ').slice(0, 4).join(' ')
    return words.length > 30 ? words.substring(0, 30) + '...' : words
  }

  const downloadProject = () => {
    // Implementation for downloading project as ZIP
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

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-100">
                  {project?.name || extractProjectName(prompt) || 'New React Native Project'}
                </h1>
                <div className="flex items-center space-x-3 text-sm text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>Expo SDK 53</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Package className="w-3 h-3" />
                    <span>React Native 0.76</span>
                  </span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    {autoSaveStatus === 'saving' && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
                    {autoSaveStatus === 'saved' && <CheckCircle className="w-3 h-3 text-green-400" />}
                    {autoSaveStatus === 'error' && <AlertCircle className="w-3 h-3 text-red-400" />}
                    <span>
                      {autoSaveStatus === 'saving' ? 'Saving...' : 
                       autoSaveStatus === 'saved' ? 'Saved' : 'Save failed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={downloadProject}
              disabled={Object.keys(files).length === 0}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <Cloud className="w-4 h-4" />
              <span>Deploy</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 mt-4">
          {[
            { id: 'code', label: 'Code', icon: Code },
            { id: 'preview', label: 'Preview', icon: Eye },
            { id: 'build', label: 'Build', icon: Hammer },
            { id: 'deploy', label: 'Deploy', icon: Cloud }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'bg-gray-800 text-white border border-gray-700' 
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Prompt & Generation */}
        <div className="w-80 border-r border-gray-800 bg-gray-900 flex flex-col">
          {/* Prompt Input */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center space-x-2 mb-3">
              <Palette className="w-4 h-4 text-purple-400" />
              <label className="text-sm font-medium text-gray-200">
                Describe your app
              </label>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Build a todo app with camera integration, user authentication, and offline storage..."
              className="w-full h-32 p-3 bg-gray-800 border border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-400"
              disabled={isGenerating}
            />
            <button
              onClick={generateApp}
              disabled={isGenerating || !prompt.trim()}
              className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Generate App</span>
                </>
              )}
            </button>
          </div>

          {/* Console */}
          <div className="flex-1 flex flex-col">
            <div className="px-6 py-3 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-gray-200">Generation Log</span>
              </div>
              <button 
                onClick={() => setLogs([])}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div 
              ref={consoleRef}
              className="flex-1 p-4 overflow-auto bg-gray-950 text-green-400 font-mono text-sm"
            >
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-1 leading-relaxed"
                >
                  {log}
                </motion.div>
              ))}
              {isGenerating && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="flex items-center space-x-2 mt-2"
                >
                  <span className="text-blue-400">▊</span>
                  <span className="text-gray-400">Generating...</span>
                </motion.div>
              )}
              {logs.length === 0 && !isGenerating && (
                <div className="text-gray-500 text-center mt-8">
                  <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Generation logs will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Panel - File Tree */}
        <div className="w-64 border-r border-gray-800 bg-gray-900">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-200 flex items-center space-x-2">
                <Folder className="w-4 h-4 text-blue-400" />
                <span>Project Files</span>
              </h3>
              <span className="text-xs text-gray-500">
                {Object.keys(files).length} files
              </span>
            </div>
          </div>
          <div className="p-2 overflow-auto">
            <AnimatePresence>
              {Object.entries(getFileTree()).map(([folder, fileList]) => (
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
                    const progress = progressFiles[filePath]
                    const isActive = activeFile === filePath
                    const isComplete = files[filePath] !== undefined
                    
                    return (
                      <motion.div
                        key={filePath}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center space-x-2 p-2 ml-6 rounded cursor-pointer transition-colors ${
                          isActive ? 'bg-blue-900/50 border border-blue-700/50' : 
                          isComplete ? 'hover:bg-gray-800' : 'opacity-50'
                        }`}
                        onClick={() => isComplete && setActiveFile(filePath)}
                      >
                        {getFileIcon(filePath)}
                        <span className="text-sm truncate flex-1 text-gray-300">
                          {filePath.split('/').pop()}
                        </span>
                        {progress && !progress.isComplete && (
                          <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                        )}
                        {isComplete && (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              ))}
            </AnimatePresence>
            
            {Object.keys(files).length === 0 && !isGenerating && (
              <div className="text-center mt-8 text-gray-500">
                <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No files generated yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Dynamic Content Based on Tab */}
        <div className="flex-1 bg-gray-900">
          {activeTab === 'code' && (
            <>
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-200">
                    {activeFile || 'Select a file'}
                  </span>
                </div>
                {activeFile && (
                  <button
                    onClick={() => copyToClipboard(files[activeFile] || '')}
                    className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                )}
              </div>
              <div className="h-full overflow-auto">
                {activeFile ? (
                  <div className="p-4">
                    <pre className="bg-gray-950 p-4 rounded-lg overflow-auto text-sm border border-gray-800">
                      <code className="text-gray-300">
                        {progressFiles[activeFile]?.content || files[activeFile] || ''}
                      </code>
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Code className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                      <p className="text-lg font-medium mb-2">Select a file to view</p>
                      <p className="text-sm text-gray-600">Choose from the file tree to see the code</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'build' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-2">Expo EAS Build</h3>
                <p className="text-sm text-gray-400">Build your app for production deployment</p>
              </div>

              {/* Platform Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Select Platforms</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'android', label: 'Android', icon: Smartphone },
                    { id: 'ios', label: 'iOS', icon: Smartphone },
                    { id: 'web', label: 'Web', icon: Monitor }
                  ].map(platform => (
                    <button
                      key={platform.id}
                      onClick={() => {
                        const newSet = new Set(selectedPlatforms)
                        if (newSet.has(platform.id)) {
                          newSet.delete(platform.id)
                        } else {
                          newSet.add(platform.id)
                        }
                        setSelectedPlatforms(newSet)
                      }}
                      className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                        selectedPlatforms.has(platform.id)
                          ? 'bg-blue-900/30 border-blue-600 text-blue-300'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <platform.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{platform.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Build Button */}
              <button
                onClick={() => selectedPlatforms.forEach(platform => startBuild(platform))}
                disabled={isBuilding || selectedPlatforms.size === 0 || Object.keys(files).length === 0}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-6"
              >
                {isBuilding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Building...</span>
                  </>
                ) : (
                  <>
                                         <Hammer className="w-4 h-4" />
                     <span>Start Build</span>
                  </>
                )}
              </button>

              {/* Build History */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Build History</h4>
                <div className="space-y-3">
                  {buildStatuses.map(build => (
                    <motion.div
                      key={build.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            build.status === 'building' ? 'bg-yellow-400 animate-pulse' :
                            build.status === 'success' ? 'bg-green-400' :
                            build.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
                          }`} />
                          <span className="text-sm font-medium text-gray-200">
                            {build.platform.charAt(0).toUpperCase() + build.platform.slice(1)} Build
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          build.status === 'building' ? 'bg-yellow-900 text-yellow-300' :
                          build.status === 'success' ? 'bg-green-900 text-green-300' :
                          build.status === 'error' ? 'bg-red-900 text-red-300' : 'bg-gray-700 text-gray-300'
                        }`}>
                          {build.status}
                        </span>
                      </div>
                      
                      {build.status === 'building' && (
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${build.progress || 0}%` }}
                          />
                        </div>
                      )}
                      
                      {build.downloadUrl && (
                        <button className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300">
                          <Download className="w-4 h-4" />
                          <span>Download APK</span>
                        </button>
                      )}
                      
                      {build.error && (
                        <p className="text-sm text-red-400 mt-2">{build.error}</p>
                      )}
                    </motion.div>
                  ))}
                  
                  {buildStatuses.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                                             <Hammer className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No builds yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Eye className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                <p className="text-lg font-medium mb-2">Live Preview</p>
                <p className="text-sm text-gray-600">App preview will be available soon</p>
              </div>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Cloud className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                <p className="text-lg font-medium mb-2">Deploy to Stores</p>
                <p className="text-sm text-gray-600">Deployment options coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 