import { useState } from 'react'
import ClientAIGenerator from './client-generation'

// Example usage of secure client-side generation
export async function exampleUsage() {
  // Initialize generator (no API key needed!)
  const generator = new ClientAIGenerator((progress) => {
    console.log(`[${progress.type}] ${progress.message}`)
    
    if (progress.progress) {
      console.log(`Progress: ${progress.progress.percentage}% (${progress.progress.current}/${progress.progress.total})`)
    }
    
    if (progress.file) {
      console.log(`File: ${progress.file.path} (${progress.file.content.length} chars)`)
    }
  })

  try {
    // Generate a complete React Native app
    const result = await generator.generateApp(
      "Build a Todo app with Pomodoro Timer. Features: Add/edit/delete tasks with priority levels, toggle completion, 25-minute focus timer with breaks"
    )

    console.log('🎉 Generation Complete!')
    console.log(`📦 Created ${result.metadata.totalFiles} files`)
    console.log(`🎯 App Type: ${result.metadata.appType}`)
    console.log(`🔧 Features: ${result.metadata.features.join(', ')}`)
    console.log(`📲 Native Modules: ${result.metadata.detectedModules.map(m => m.name).join(', ')}`)

    // Access generated files
    Object.entries(result.files).forEach(([path, content]) => {
      console.log(`📄 ${path}: ${content.length} characters`)
    })

    return result

  } catch (error) {
    console.error('❌ Generation failed:', error)
    throw error
  }
}

// Example for React component usage
export function useSecureGeneration() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [files, setFiles] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const generateApp = async (prompt: string) => {
    setIsGenerating(true)
    setError(null)
    setFiles([])
    setProgress('Starting generation...')

    const generator = new ClientAIGenerator((progressUpdate) => {
      setProgress(progressUpdate.message)
      
      if (progressUpdate.file) {
        setFiles((prev: any[]) => [...prev, progressUpdate.file])
      }
      
      if (progressUpdate.type === 'error') {
        setError(progressUpdate.message)
      }
    })

    try {
      const result = await generator.generateApp(prompt)
      setProgress('✅ Generation complete!')
      
      // Convert to array format for UI
      const filesArray = Object.entries(result.files).map(([path, content]) => ({
        path,
        content,
        type: path.split('.').pop() || 'txt'
      }))
      
      setFiles(filesArray)
      return result
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setProgress('❌ Generation failed')
      throw err
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    generateApp,
    isGenerating,
    progress,
    files,
    error
  }
} 