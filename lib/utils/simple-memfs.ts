// Simple memfs utility - bulletproof implementation
import { vol } from 'memfs'

/**
 * Simple memfs loader - just loads files with absolute paths
 * No complex validation, just works!
 */
export function loadFilesIntoMemfs(files: { [key: string]: string }): boolean {
  try {
    console.log(`📂 Loading ${Object.keys(files).length} files into memfs...`)
    console.log('📋 Input file paths:', Object.keys(files))
    
    // Clear existing files
    vol.reset()
    
    // Ensure all paths are absolute (start with /)
    const absoluteFiles: { [key: string]: string } = {}
    
    Object.entries(files).forEach(([path, content]) => {
      const absolutePath = path.startsWith('/') ? path : `/${path}`
      absoluteFiles[absolutePath] = content
      console.log(`  ✓ ${path} → ${absolutePath} (${content.length} chars)`)
    })
    
    console.log('📂 Final absolute paths:', Object.keys(absoluteFiles))
    
    // Load into memfs
    console.log('🔄 Calling vol.fromJSON...')
    vol.fromJSON(absoluteFiles, '/')
    
    // Verify loading worked
    const loadedFiles = vol.toJSON()
    const loadedCount = Object.keys(loadedFiles).length
    
    console.log(`✅ memfs loaded: ${loadedCount} files`)
    console.log('📂 Loaded file paths:', Object.keys(loadedFiles))
    
    // Basic validation - check if we have essential files
    const hasPackageJson = vol.existsSync('/package.json')
    const hasAppJson = vol.existsSync('/app.json')
    
    console.log(`📋 package.json: ${hasPackageJson ? '✅' : '❌'}`)
    console.log(`📋 app.json: ${hasAppJson ? '✅' : '❌'}`)
    
    if (loadedCount !== Object.keys(absoluteFiles).length) {
      console.warn(`⚠️ Expected ${Object.keys(absoluteFiles).length} files but memfs has ${loadedCount}`)
      console.warn('📄 Missing files:', Object.keys(absoluteFiles).filter(path => !loadedFiles[path]))
    }
    
    return loadedCount > 0
    
  } catch (error) {
    console.error('❌ Failed to load files into memfs:', error)
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return false
  }
}

/**
 * Get files from memfs
 */
export function getFilesFromMemfs(): { [key: string]: string } {
  try {
    return vol.toJSON() as { [key: string]: string }
  } catch (error) {
    console.error('❌ Failed to get files from memfs:', error)
    return {}
  }
}

/**
 * Check if memfs has any files
 */
export function hasFilesInMemfs(): boolean {
  try {
    const files = vol.toJSON()
    return Object.keys(files).length > 0
  } catch (error) {
    return false
  }
}

/**
 * Simple validation - just check if we have the bare minimum
 */
export function validateMemfsFiles(): { isValid: boolean, errors: string[] } {
  try {
    const errors: string[] = []
    
    // Check if memfs has any files
    if (!hasFilesInMemfs()) {
      errors.push('No files found in memfs')
      return { isValid: false, errors }
    }
    
    // Check for package.json
    if (!vol.existsSync('/package.json')) {
      errors.push('Missing /package.json')
    }
    
    // Check for app.json  
    if (!vol.existsSync('/app.json')) {
      errors.push('Missing /app.json')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
    
  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    }
  }
} 