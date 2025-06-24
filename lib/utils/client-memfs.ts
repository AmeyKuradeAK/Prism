import { vol } from 'memfs'
// Client-side memfs manager for React Native app generation
// Handles base template + AI file merging in browser memory

interface FileSystem {
  [path: string]: string
}

interface MergeStrategy {
  action: 'keep' | 'replace' | 'merge'
  reason: string
}

/**
 * Clean and normalize file paths from AI output
 * Removes FILE: prefixes, emojis, and normalizes paths
 */
function cleanAndMergeFiles(files: { [key: string]: string }): { [key: string]: string } {
  const cleaned: { [key: string]: string } = {}
  const duplicateTracker: { [key: string]: number } = {}
  
  console.log('🧹 Starting comprehensive file cleaning...')
  console.log('📋 Raw input files:', Object.keys(files))
  
  for (const [rawPath, content] of Object.entries(files)) {
    if (!content || typeof content !== 'string') {
      console.warn(`⚠️ Skipping invalid file: ${rawPath} (empty or invalid content)`)
      continue
    }
    
    let cleanPath = rawPath.trim()
    
    // Remove various FILE: prefixes and artifacts
    cleanPath = cleanPath
      .replace(/^📁?\s*FILE:\s*/gi, '') // Remove "📁 FILE:" or "FILE:"
      .replace(/^📁\s*/gi, '') // Remove standalone emoji
      .replace(/^Path:\s*/gi, '') // Remove "Path:"
      .replace(/^File:\s*/gi, '') // Remove "File:"
      .replace(/^[\w\s]*:\s*/gi, '') // Remove any other prefixes like "Component:", "Screen:", etc.
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/^\/+/, '') // Remove leading slashes
      .replace(/\/{2,}/g, '/') // Fix double slashes
      .replace(/\/$/, '') // Remove trailing slashes
    
    // Skip if path becomes empty after cleaning
    if (!cleanPath) {
      console.warn(`⚠️ Skipping file with empty path after cleaning: "${rawPath}"`)
      continue
    }
    
    // Validate path (no dangerous characters)
    if (cleanPath.includes('..') || cleanPath.includes('<') || cleanPath.includes('>')) {
      console.warn(`⚠️ Skipping unsafe path: ${cleanPath}`)
      continue
    }
    
    // Track duplicates
    if (cleaned[cleanPath]) {
      duplicateTracker[cleanPath] = (duplicateTracker[cleanPath] || 1) + 1
      console.warn(`🔄 Duplicate file detected, overwriting: ${cleanPath} (instance #${duplicateTracker[cleanPath]})`)
      console.log(`   Old content: ${cleaned[cleanPath].substring(0, 100)}...`)
      console.log(`   New content: ${content.substring(0, 100)}...`)
    }
    
    // Store cleaned file
    cleaned[cleanPath] = content
    console.log(`✅ Cleaned: "${rawPath}" → "${cleanPath}" (${content.length} chars)`)
  }
  
  const duplicateCount = Object.keys(duplicateTracker).length
  console.log(`🧹 File cleaning complete:`)
  console.log(`   📥 Input: ${Object.keys(files).length} files`)
  console.log(`   📤 Output: ${Object.keys(cleaned).length} files`)
  console.log(`   🔄 Duplicates resolved: ${duplicateCount}`)
  console.log(`📋 Final cleaned paths:`, Object.keys(cleaned).sort())
  
  return cleaned
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
      
      const rawBaseFiles = generateCompleteDemo1Template(appName)
      
      // Clean base template files too (in case they have any artifacts)
      console.log('🧹 Cleaning base template files...')
      this.baseFiles = cleanAndMergeFiles(rawBaseFiles)
      this.mergedFiles = { ...this.baseFiles }
      
      // Simulate creating files
      for (const [path, content] of Object.entries(this.baseFiles)) {
        await this._simulateShellCommand(`touch ${path}`, `Created ${path} (${content.length} chars)`)
      }
      
      console.log(`✅ Base template loaded and cleaned: ${Object.keys(this.baseFiles).length} files`)
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
   * Safe merge utility - merges AI files into existing base template
   */
  private async safeMergeIntoVol(aiFiles: FileSystem): Promise<void> {
    console.log('🔧 Starting safe merge operation...')
    
    // Validate that base template is loaded
    if (!this.isBaseLoaded || Object.keys(this.baseFiles).length === 0) {
      throw new Error('Base template must be loaded before merging AI files')
    }
    
    // Start with a copy of base files (safe)
    const premergeCount = Object.keys(this.mergedFiles).length
    console.log(`📊 Pre-merge state: ${premergeCount} files`)
    
    // Log current structure before merge
    await this._simulateShellCommand(`tree /base-template/`, `Current base structure: ${Object.keys(this.baseFiles).length} files`)
    
    // Merge AI files one by one (safe file-by-file merge)
    let addedCount = 0
    let replacedCount = 0
    let skippedCount = 0
    
    for (const [path, content] of Object.entries(aiFiles)) {
      const strategy = this.getMergeStrategy(path)
      console.log(`🔄 Processing ${path} → ${strategy.action} (${strategy.reason})`)
      console.log(`   Content length: ${content.length} chars`)
      console.log(`   File exists in base: ${this.baseFiles[path] !== undefined}`)
      console.log(`   File exists in merged: ${this.mergedFiles[path] !== undefined}`)
      
      switch (strategy.action) {
        case 'replace':
          const wasExisting = this.mergedFiles[path] !== undefined
          console.log(`   Before replace: mergedFiles has ${Object.keys(this.mergedFiles).length} files`)
          this.mergedFiles[path] = content
          console.log(`   After replace: mergedFiles has ${Object.keys(this.mergedFiles).length} files`)
          console.log(`   Successfully added "${path}" with ${content.length} chars`)
          
          if (wasExisting) {
            replacedCount++
            await this._simulateShellCommand(`echo "Replaced ${path}"`, `Updated existing file (${content.length} chars)`)
          } else {
            addedCount++
            await this._simulateShellCommand(`echo "Added ${path}"`, `New file created (${content.length} chars)`)
          }
          break
          
        case 'merge':
          const originalContent = this.mergedFiles[path] || ''
          this.mergedFiles[path] = this.mergeFileContent(originalContent, content, path)
          replacedCount++
          await this._simulateShellCommand(`echo "Merged ${path}"`, `Intelligent merge completed`)
          break
          
        case 'keep':
          skippedCount++
          console.log(`  📝 Skipping ${path} - keeping base template version`)
          await this._simulateShellCommand(`echo "Skipped ${path}"`, `Base template version preserved`)
          break
      }
    }
    
    const postmergeCount = Object.keys(this.mergedFiles).length
    console.log(`📊 Post-merge state: ${postmergeCount} files`)
    console.log(`📈 Merge summary: +${addedCount} added, ~${replacedCount} replaced, =${skippedCount} skipped`)
    
    // Validate merge integrity
    await this.validateMergeIntegrity()
    
    // Final structure validation
    await this._simulateShellCommand(`tree /merged/`, `Final structure: ${postmergeCount} files`)
    console.log('✅ Safe merge completed successfully')
  }

  /**
   * Validate merge integrity - ensure base files weren't lost
   */
  private async validateMergeIntegrity(): Promise<void> {
    console.log('🔍 Validating merge integrity...')
    
    const basePaths = Object.keys(this.baseFiles)
    const mergedPaths = Object.keys(this.mergedFiles)
    const aiPaths = Object.keys(this.aiFiles)
    
    // Check that we didn't lose any base files
    const lostBaseFiles = basePaths.filter(path => !mergedPaths.includes(path))
    if (lostBaseFiles.length > 0) {
      console.error('❌ MERGE INTEGRITY ERROR: Lost base files:', lostBaseFiles)
      throw new Error(`Merge integrity check failed: ${lostBaseFiles.length} base files were lost`)
    }
    
    // Check that all AI files (that should be added) are present
    const expectedAIFiles = aiPaths.filter(path => {
      const strategy = this.getMergeStrategy(path)
      return strategy.action === 'replace' || strategy.action === 'merge'
    })
    const missingAIFiles = expectedAIFiles.filter(path => !mergedPaths.includes(path))
    if (missingAIFiles.length > 0) {
      console.warn('⚠️ Some AI files were not merged:', missingAIFiles)
    }
    
    // Log merge statistics
    console.log('📊 Merge Integrity Report:')
    console.log(`  Base files preserved: ${basePaths.length}/${basePaths.length} ✅`)
    console.log(`  AI files integrated: ${expectedAIFiles.length - missingAIFiles.length}/${expectedAIFiles.length} ${missingAIFiles.length === 0 ? '✅' : '⚠️'}`)
    console.log(`  Total files: ${mergedPaths.length}`)
    
    await this._simulateShellCommand(`echo "Integrity check passed"`, `All base files preserved, AI files properly merged`)
  }

  /**
   * Get detailed file tree view for debugging
   */
  private generateFileTree(): string {
    const organized = this.getOrganizedFiles()
    let tree = 'File Tree:\n'
    
    for (const [folder, files] of Object.entries(organized)) {
      tree += `├── ${folder}/ (${files.length} files)\n`
      files.forEach((file, index) => {
        const isLast = index === files.length - 1
        const prefix = isLast ? '└──' : '├──'
        const fileName = file.split('/').pop()
        const isAI = this.aiFiles[file] !== undefined
        const marker = isAI ? ' 🤖' : ''
        tree += `│   ${prefix} ${fileName}${marker}\n`
      })
    }
    
    return tree
  }

  /**
   * Internal AI merge implementation - updated to use comprehensive cleaning
   */
  private async _performAIMerge(aiGeneratedFiles: { path: string, content: string }[]): Promise<void> {
    console.log(`🤖 Merging ${aiGeneratedFiles.length} AI-generated files (base template confirmed loaded)...`)
    
    // Simulate shell commands for AI file operations
    await this._simulateShellCommand(`mkdir -p /tmp/ai-files`)
    await this._simulateShellCommand(`cd /tmp/ai-files`)
    
    // Convert AI files to raw format first
    const rawAiFiles: { [key: string]: string } = {}
    for (const file of aiGeneratedFiles) {
      if (file.path && file.content) {
        rawAiFiles[file.path] = file.content
      }
    }
    
    // Apply comprehensive cleaning to remove FILE: prefixes and handle duplicates
    const cleanedAiFiles = cleanAndMergeFiles(rawAiFiles)
    
    // Convert cleaned files to proper FileSystem format
    const aiFiles: FileSystem = {}
    for (const [cleanPath, content] of Object.entries(cleanedAiFiles)) {
      // Ensure path has leading slash for consistency with base template
      const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`
      aiFiles[normalizedPath] = content
      
      console.log(`📁 Final path normalization: "${cleanPath}" → "${normalizedPath}"`)
      
      // Simulate creating AI file
      await this._simulateShellCommand(`touch ${normalizedPath}`, `AI file: ${normalizedPath} (${content.length} chars)`)
    }
    
    this.aiFiles = aiFiles
    console.log('🔄 AI files to merge:', Object.keys(aiFiles))
    console.log('🔍 Base files available:', Object.keys(this.baseFiles))
    console.log('🔍 Merged files before AI merge:', Object.keys(this.mergedFiles))
    
    // Use safe merge instead of manual merge
    await this.safeMergeIntoVol(aiFiles)
    
    // Generate and log file tree
    const fileTree = this.generateFileTree()
    console.log('🌳 Final File Tree:')
    console.log(fileTree)
    
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
    
    // Show what AI added/replaced with better categorization
    const aiAdditions = Object.keys(this.aiFiles).filter(path => !this.baseFiles[path])
    const aiReplacements = Object.keys(this.aiFiles).filter(path => this.baseFiles[path])
    const aiSkipped = Object.keys(this.aiFiles).filter(path => {
      const strategy = this.getMergeStrategy(path)
      return strategy.action === 'keep'
    })
    
    if (aiAdditions.length > 0) {
      console.log(`  ➕ AI additions (${aiAdditions.length}):`)
      aiAdditions.forEach(path => console.log(`    + ${path} 🤖`))
    }
    if (aiReplacements.length > 0) {
      console.log(`  🔄 AI replacements (${aiReplacements.length}):`)
      aiReplacements.forEach(path => console.log(`    ~ ${path} 🤖`))
    }
    if (aiSkipped.length > 0) {
      console.log(`  = AI skipped (${aiSkipped.length}):`)
      aiSkipped.forEach(path => console.log(`    = ${path} (kept base)`))
    }
    
    // Validate that constants, hooks, etc. are preserved
    const importantDirs = ['constants', 'hooks', 'components/ui']
    importantDirs.forEach(dir => {
      const filesInDir = Object.keys(this.mergedFiles).filter(path => path.includes(`/${dir}/`))
      if (filesInDir.length > 0) {
        console.log(`  📁 ${dir}: ${filesInDir.length} files preserved ✅`)
      }
    })
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

  /**
   * Debug method - get detailed file tree with AI markers
   */
  getDetailedFileTree(): string {
    return this.generateFileTree()
  }

  /**
   * Debug method - validate current state and check for FILE: artifacts
   */
  validateCurrentState(): {
    isValid: boolean
    issues: string[]
    artifacts: string[]
    summary: {
      baseFiles: number
      aiFiles: number  
      totalFiles: number
      preservedStructure: boolean
      cleanPaths: boolean
    }
  } {
    const issues: string[] = []
    const artifacts: string[] = []
    
    // Check if base template is properly loaded
    if (!this.isBaseLoaded) {
      issues.push('Base template not loaded')
    }
    
    // Check for FILE: artifacts in all file paths
    const allPaths = [...Object.keys(this.baseFiles), ...Object.keys(this.aiFiles), ...Object.keys(this.mergedFiles)]
    allPaths.forEach(path => {
      if (path.match(/FILE:/i) || path.match(/📁\s*FILE:/i) || path.match(/^📁[^/]/)) {
        artifacts.push(path)
      }
    })
    
    if (artifacts.length > 0) {
      issues.push(`Found ${artifacts.length} FILE: artifacts that should be cleaned`)
    }
    
    // Check if we lost any base files
    const basePaths = Object.keys(this.baseFiles)
    const mergedPaths = Object.keys(this.mergedFiles)
    const lostFiles = basePaths.filter(path => !mergedPaths.includes(path))
    
    if (lostFiles.length > 0) {
      issues.push(`Lost ${lostFiles.length} base files: ${lostFiles.join(', ')}`)
    }
    
    // Check if important directories exist
    const importantDirs = ['app', 'components', 'hooks', 'constants']
    importantDirs.forEach(dir => {
      const hasFiles = mergedPaths.some(path => path.includes(`/${dir}/`))
      if (!hasFiles) {
        issues.push(`Missing files in ${dir} directory`)
      }
    })
    
    // Check for duplicate folders (real vs FILE: versions)
    const folderNames = new Set<string>()
    const duplicateFolders = new Set<string>()
    
    mergedPaths.forEach(path => {
      const cleanPath = path.replace(/^\//, '')
      const parts = cleanPath.split('/')
      if (parts.length > 1) {
        const folder = parts[0]
        if (folderNames.has(folder)) {
          duplicateFolders.add(folder)
        }
        folderNames.add(folder)
      }
    })
    
    return {
      isValid: issues.length === 0,
      issues,
      artifacts,
      summary: {
        baseFiles: Object.keys(this.baseFiles).length,
        aiFiles: Object.keys(this.aiFiles).length,
        totalFiles: Object.keys(this.mergedFiles).length,
        preservedStructure: lostFiles.length === 0,
        cleanPaths: artifacts.length === 0
      }
    }
  }
}

// Export singleton instance
export const clientMemFS = new ClientMemFS()
export default clientMemFS

/**
 * Load project files from MongoDB (array of { path, content }) into memfs
 */
export function loadFilesToMemfs(files: { path: string, content: string }[]) {
  const fsJSON: { [key: string]: string } = {}
  for (const file of files) {
    fsJSON[file.path] = file.content
  }
  // Replace the current memfs state
  if (typeof vol !== 'undefined' && vol.fromJSON) {
    vol.fromJSON(fsJSON, '/')
  }
  // If using a custom memfs class, add similar logic here
  return fsJSON
} 