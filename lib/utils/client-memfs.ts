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
  private isBaseLoaded: boolean = false
  private loadPromise: Promise<void> | null = null
  private writeQueue: Array<() => Promise<void>> = []

  constructor() {
    console.log('📂 ClientMemFS initialized with sequencing support')
  }

  /**
   * Load base template into memfs with proper sequencing
   */
  async loadBaseTemplate(appName: string = 'MyApp'): Promise<void> {
    // If already loading, wait for that to complete
    if (this.loadPromise) {
      console.log('⏳ Base template already loading, waiting...')
      await this.loadPromise
      return
    }

    // If already loaded, return immediately
    if (this.isBaseLoaded) {
      console.log('✅ Base template already loaded')
      return
    }

    console.log('📦 Loading base template into client memfs...')
    
    // Create load promise to prevent concurrent loads
    this.loadPromise = this._performBaseLoad(appName)
    
    try {
      await this.loadPromise
      this.isBaseLoaded = true
      console.log('✅ Base template load complete, processing queued operations...')
      
      // Process any queued write operations
      await this._processWriteQueue()
      
    } finally {
      this.loadPromise = null
    }
  }

  /**
   * Internal base load implementation
   */
  private async _performBaseLoad(appName: string): Promise<void> {
    try {
      const { generateCompleteDemo1Template } = await import('@/lib/generators/templates/complete-demo1-template')
      
      // Simulate shell commands for better debugging
      await this._simulateShellCommand(`mkdir -p /tmp/base-template`)
      await this._simulateShellCommand(`cd /tmp/base-template`)
      
      this.baseFiles = generateCompleteDemo1Template(appName)
      this.mergedFiles = { ...this.baseFiles }
      
      // Simulate creating files
      for (const [path, content] of Object.entries(this.baseFiles)) {
        await this._simulateShellCommand(`touch ${path}`, `Created ${path} (${content.length} chars)`)
      }
      
      console.log(`✅ Base template loaded: ${Object.keys(this.baseFiles).length} files`)
      console.log('📋 Base files:', Object.keys(this.baseFiles).sort())
      
      // Simulate file verification
      await this._simulateShellCommand(`ls -la`, `Total: ${Object.keys(this.baseFiles).length} files in virtual filesystem`)
      
    } catch (error) {
      console.error('❌ Failed to load base template:', error)
      throw error
    }
  }

  /**
   * Add AI-generated files with proper sequencing
   */
  async mergeAIFiles(aiGeneratedFiles: { path: string, content: string }[]): Promise<void> {
    console.log(`🤖 Queueing merge of ${aiGeneratedFiles.length} AI-generated files...`)
    
    // If base template isn't loaded yet, queue this operation
    if (!this.isBaseLoaded) {
      console.log('⏳ Base template not ready, queueing AI file merge...')
      return new Promise((resolve, reject) => {
        this.writeQueue.push(async () => {
          try {
            await this._performAIMerge(aiGeneratedFiles)
            resolve()
          } catch (error) {
            reject(error)
          }
        })
      })
    }
    
    // Base is loaded, proceed immediately
    await this._performAIMerge(aiGeneratedFiles)
  }

  /**
   * Internal AI merge implementation
   */
  private async _performAIMerge(aiGeneratedFiles: { path: string, content: string }[]): Promise<void> {
    console.log(`🤖 Merging ${aiGeneratedFiles.length} AI-generated files (base template confirmed loaded)...`)
    
    // Simulate shell commands for AI file operations
    await this._simulateShellCommand(`mkdir -p /tmp/ai-files`)
    await this._simulateShellCommand(`cd /tmp/ai-files`)
    
    // Convert AI files to FileSystem format
    const aiFiles: FileSystem = {}
    for (const file of aiGeneratedFiles) {
      if (file.path && file.content) {
        // Ensure path starts with /
        const normalizedPath = file.path.startsWith('/') ? file.path : `/${file.path}`
        aiFiles[normalizedPath] = file.content
        
        // Simulate creating AI file
        await this._simulateShellCommand(`touch ${normalizedPath}`, `AI file: ${normalizedPath} (${file.content.length} chars)`)
      }
    }
    
    this.aiFiles = aiFiles
    console.log('🔄 AI files to merge:', Object.keys(aiFiles))
    
    // Simulate merge operation
    await this._simulateShellCommand(`cp -r /tmp/base-template/* /tmp/merged/`, 'Copying base template...')
    await this._simulateShellCommand(`cp -r /tmp/ai-files/* /tmp/merged/`, 'Merging AI files...')
    
    // Merge with intelligent strategy
    this.mergedFiles = { ...this.baseFiles }
    
    for (const [path, content] of Object.entries(aiFiles)) {
      const strategy = this.getMergeStrategy(path)
      console.log(`🔄 ${path} → ${strategy.action} (${strategy.reason})`)
      
      switch (strategy.action) {
        case 'replace':
          this.mergedFiles[path] = content
          await this._simulateShellCommand(`cp ${path} /tmp/merged${path}`, `Replaced with AI version`)
          break
        case 'merge':
          this.mergedFiles[path] = this.mergeFileContent(this.mergedFiles[path] || '', content, path)
          await this._simulateShellCommand(`merge ${path}`, `Merged AI content with base`)
          break
        case 'keep':
          console.log(`  📝 AI suggested content for ${path} (keeping base):`, content.substring(0, 100) + '...')
          await this._simulateShellCommand(`# skipped ${path}`, `Kept base template version`)
          break
      }
    }
    
    console.log(`✅ Merge complete: ${Object.keys(this.mergedFiles).length} total files`)
    await this._simulateShellCommand(`ls -la /tmp/merged/`, `Final: ${Object.keys(this.mergedFiles).length} files`)
    this.logMergeResults()
  }

  /**
   * Process queued write operations
   */
  private async _processWriteQueue(): Promise<void> {
    if (this.writeQueue.length === 0) return
    
    console.log(`📝 Processing ${this.writeQueue.length} queued operations...`)
    
    for (const operation of this.writeQueue) {
      try {
        await operation()
      } catch (error) {
        console.error('❌ Queued operation failed:', error)
      }
    }
    
    this.writeQueue = []
    console.log('✅ All queued operations completed')
  }

  /**
   * Simulate shell commands for debugging and state visibility
   */
  private async _simulateShellCommand(command: string, result?: string): Promise<void> {
    // Add small delay to simulate real file operations
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const timestamp = new Date().toLocaleTimeString()
    console.log(`🐚 [${timestamp}] $ ${command}`)
    
    if (result) {
      console.log(`    ${result}`)
    }
    
    // Simulate common shell command outputs
    if (command.startsWith('ls ')) {
      const files = Object.keys(this.mergedFiles).slice(0, 5)
      console.log(`    ${files.join('  ')}${files.length < Object.keys(this.mergedFiles).length ? '  ...' : ''}`)
    } else if (command.startsWith('mkdir ')) {
      console.log(`    Directory created`)
    } else if (command.startsWith('cd ')) {
      console.log(`    Changed directory`)
    } else if (command.startsWith('touch ')) {
      console.log(`    File created/updated`)
    } else if (command.startsWith('cp ')) {
      console.log(`    Files copied`)
    }
  }

  /**
   * Get current filesystem state with verification
   */
  async getCurrentState(): Promise<{
    isBaseLoaded: boolean
    filesCount: { base: number, ai: number, total: number }
    queueLength: number
    recentCommands: string[]
  }> {
    return {
      isBaseLoaded: this.isBaseLoaded,
      filesCount: this.getFileCount(),
      queueLength: this.writeQueue.length,
      recentCommands: ['$ ls -la', '$ pwd', '$ echo "MemFS ready"']
    }
  }

  /**
   * Wait for all operations to complete
   */
  async waitForReady(): Promise<void> {
    if (this.loadPromise) {
      await this.loadPromise
    }
    
    if (this.writeQueue.length > 0) {
      console.log('⏳ Waiting for queued operations to complete...')
      await this._processWriteQueue()
    }
    
    console.log('✅ MemFS is fully ready')
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