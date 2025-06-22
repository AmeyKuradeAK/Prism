// Client-side memfs manager for React Native app generation
// Handles base template + AI file merging in browser memory

interface FileSystem {
  [path: string]: string
}

interface MergeStrategy {
  action: 'keep' | 'replace' | 'merge'
  reason: string
}

class ClientMemFS {
  private baseFiles: FileSystem = {}
  private aiFiles: FileSystem = {}
  private mergedFiles: FileSystem = {}

  constructor() {
    console.log('📂 ClientMemFS initialized')
  }

  /**
   * Load base template into memfs
   */
  async loadBaseTemplate(appName: string = 'MyApp'): Promise<void> {
    console.log('📦 Loading base template into client memfs...')
    
    try {
      const { generateCompleteDemo1Template } = await import('@/lib/generators/templates/complete-demo1-template')
      this.baseFiles = generateCompleteDemo1Template(appName)
      this.mergedFiles = { ...this.baseFiles }
      
      console.log(`✅ Base template loaded: ${Object.keys(this.baseFiles).length} files`)
      console.log('📋 Base files:', Object.keys(this.baseFiles).sort())
    } catch (error) {
      console.error('❌ Failed to load base template:', error)
      throw error
    }
  }

  /**
   * Add AI-generated files and merge intelligently
   */
  mergeAIFiles(aiGeneratedFiles: { path: string, content: string }[]): void {
    console.log(`🤖 Merging ${aiGeneratedFiles.length} AI-generated files...`)
    
    // Convert AI files to FileSystem format
    const aiFiles: FileSystem = {}
    aiGeneratedFiles.forEach(file => {
      if (file.path && file.content) {
        // Ensure path starts with /
        const normalizedPath = file.path.startsWith('/') ? file.path : `/${file.path}`
        aiFiles[normalizedPath] = file.content
      }
    })
    
    this.aiFiles = aiFiles
    console.log('🔄 AI files to merge:', Object.keys(aiFiles))
    
    // Merge with intelligent strategy
    this.mergedFiles = { ...this.baseFiles }
    
    Object.entries(aiFiles).forEach(([path, content]) => {
      const strategy = this.getMergeStrategy(path)
      console.log(`🔄 ${path} → ${strategy.action} (${strategy.reason})`)
      
      switch (strategy.action) {
        case 'replace':
          this.mergedFiles[path] = content
          break
        case 'merge':
          // For certain files, we might want to merge content
          this.mergedFiles[path] = this.mergeFileContent(this.mergedFiles[path] || '', content, path)
          break
        case 'keep':
          // Keep base template version, but log AI version
          console.log(`  📝 AI suggested content for ${path} (keeping base):`, content.substring(0, 100) + '...')
          break
      }
    })
    
    console.log(`✅ Merge complete: ${Object.keys(this.mergedFiles).length} total files`)
    this.logMergeResults()
  }

  /**
   * Determine merge strategy for each file
   */
  private getMergeStrategy(path: string): MergeStrategy {
    // Core config files - keep base template
    if (path.match(/\/(package\.json|app\.json|tsconfig\.json|babel\.config\.js|metro\.config\.js|eslint\.config\.js)$/)) {
      return { action: 'keep', reason: 'Core config file - base template preferred' }
    }
    
    // App layout files - keep base template (they're structural)
    if (path.match(/\/app\/_layout\.tsx$/)) {
      return { action: 'keep', reason: 'App layout is structural - base template preferred' }
    }
    
    // Tab layout - keep base template
    if (path.match(/\/app\/\(tabs\)\/_layout\.tsx$/)) {
      return { action: 'keep', reason: 'Tab layout is structural - base template preferred' }
    }
    
    // Screen files - AI can replace/add
    if (path.match(/\/app\/\(tabs\)\/(index|explore|[^_].*)\.tsx$/)) {
      return { action: 'replace', reason: 'Screen content - AI enhancement welcome' }
    }
    
    // New screens - AI can add
    if (path.match(/\/app\/.*\.tsx$/) && !this.baseFiles[path]) {
      return { action: 'replace', reason: 'New screen - AI addition' }
    }
    
    // Components - AI can add/replace non-core ones
    if (path.match(/\/components\/[^/]+\.tsx$/)) {
      const isCore = path.match(/\/(ThemedText|ThemedView|HelloWave|ParallaxScrollView)\.tsx$/)
      if (isCore) {
        return { action: 'keep', reason: 'Core component - base template preferred' }
      }
      return { action: 'replace', reason: 'Custom component - AI enhancement welcome' }
    }
    
    // UI components - AI can add new ones
    if (path.match(/\/components\/ui\/.*\.tsx$/)) {
      return { action: 'replace', reason: 'UI component - AI enhancement welcome' }
    }
    
    // Hooks - AI can add new ones, keep core ones
    if (path.match(/\/hooks\/.*\.ts$/)) {
      const isCore = path.match(/\/(useColorScheme|useThemeColor)\.ts$/)
      if (isCore) {
        return { action: 'keep', reason: 'Core hook - base template preferred' }
      }
      return { action: 'replace', reason: 'Custom hook - AI enhancement welcome' }
    }
    
    // Constants - AI can modify/add
    if (path.match(/\/constants\/.*\.ts$/)) {
      return { action: 'replace', reason: 'Constants - AI enhancement welcome' }
    }
    
    // Lib/utils - AI can add
    if (path.match(/\/(lib|utils)\/.*\.(ts|tsx)$/)) {
      return { action: 'replace', reason: 'Utility/library - AI addition welcome' }
    }
    
    // Types - AI can add
    if (path.match(/\/types\/.*\.ts$/)) {
      return { action: 'replace', reason: 'Type definitions - AI addition welcome' }
    }
    
    // Assets - AI can add
    if (path.match(/\/assets\//)) {
      return { action: 'replace', reason: 'Asset - AI addition welcome' }
    }
    
    // Default: AI can add new files
    return { action: 'replace', reason: 'New file - AI addition' }
  }

  /**
   * Merge file content intelligently
   */
  private mergeFileContent(baseContent: string, aiContent: string, path: string): string {
    // For now, just replace. Later we could implement smart merging
    // based on file type (e.g., merge imports, combine functions, etc.)
    return aiContent
  }

  /**
   * Log merge results for debugging
   */
  private logMergeResults(): void {
    const baseCount = Object.keys(this.baseFiles).length
    const aiCount = Object.keys(this.aiFiles).length
    const totalCount = Object.keys(this.mergedFiles).length
    
    console.log('📊 Merge Results:')
    console.log(`  📦 Base template: ${baseCount} files`)
    console.log(`  🤖 AI generated: ${aiCount} files`)
    console.log(`  🔄 Total merged: ${totalCount} files`)
    
    // Show what AI added
    const aiAdditions = Object.keys(this.aiFiles).filter(path => !this.baseFiles[path])
    const aiReplacements = Object.keys(this.aiFiles).filter(path => this.baseFiles[path])
    
    if (aiAdditions.length > 0) {
      console.log(`  ➕ AI additions (${aiAdditions.length}):`, aiAdditions)
    }
    if (aiReplacements.length > 0) {
      console.log(`  🔄 AI replacements (${aiReplacements.length}):`, aiReplacements)
    }
  }

  /**
   * Get all merged files
   */
  getAllFiles(): FileSystem {
    return { ...this.mergedFiles }
  }

  /**
   * Get files organized by folder structure (VS Code style)
   */
  getOrganizedFiles(): { [folder: string]: string[] } {
    const organized: { [folder: string]: string[] } = {}
    
    // Separate root files and folder files
    const rootFiles: string[] = []
    const folderFiles: { [key: string]: string[] } = {}
    
    Object.keys(this.mergedFiles).forEach(path => {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path
      const parts = cleanPath.split('/')
      
      if (parts.length === 1) {
        // Root files (package.json, app.json, etc.)
        rootFiles.push(path)
      } else {
        // Files in folders
        let folderName = ''
        
        if (parts[0] === 'app') {
          if (parts.length === 2) {
            folderName = '📱 app'
          } else if (parts[1] === '(tabs)') {
            folderName = '📱 app/(tabs)'
          } else {
            folderName = '📱 app'
          }
        } else if (parts[0] === 'components') {
          if (parts.length === 2) {
            folderName = '🧩 components'
          } else if (parts[1] === 'ui') {
            folderName = '🧩 components/ui'
          } else {
            folderName = '🧩 components'
          }
        } else if (parts[0] === 'hooks') {
          folderName = '🪝 hooks'
        } else if (parts[0] === 'constants') {
          folderName = '⚙️ constants'
        } else if (parts[0] === 'lib') {
          folderName = '📚 lib'
        } else if (parts[0] === 'utils') {
          folderName = '🔧 utils'
        } else if (parts[0] === 'types') {
          folderName = '📝 types'
        } else if (parts[0] === 'assets') {
          folderName = '🖼️ assets'
        } else {
          folderName = `📁 ${parts[0]}`
        }
        
        if (!folderFiles[folderName]) {
          folderFiles[folderName] = []
        }
        folderFiles[folderName].push(path)
      }
    })
    
    // Add root files first (if any)
    if (rootFiles.length > 0) {
      organized['root'] = rootFiles.sort()
    }
    
    // Add folder files
    Object.entries(folderFiles).forEach(([folder, files]) => {
      organized[folder] = files.sort()
    })
    
    return organized
  }

  /**
   * Get file count
   */
  getFileCount(): { base: number, ai: number, total: number } {
    return {
      base: Object.keys(this.baseFiles).length,
      ai: Object.keys(this.aiFiles).length,
      total: Object.keys(this.mergedFiles).length
    }
  }

  /**
   * Clear all files
   */
  clear(): void {
    this.baseFiles = {}
    this.aiFiles = {}
    this.mergedFiles = {}
    console.log('🗑️ ClientMemFS cleared')
  }
}

// Export singleton instance
export const clientMemFS = new ClientMemFS()
export default clientMemFS 