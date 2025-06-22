import { vol } from 'memfs'

export interface VirtualFileSystem {
  loadFiles: (files: { [key: string]: string }) => void
  getFiles: () => { [key: string]: string }
  writeFile: (path: string, content: string) => void
  readFile: (path: string) => string | null
  exists: (path: string) => boolean
  clear: () => void
}

/**
 * Create a virtual filesystem using memfs for React Native preview
 * This ensures all files are loaded with proper absolute paths for Expo preview
 */
export function createVirtualFS(): VirtualFileSystem {
  
  return {
    // Load files into memfs using vol.fromJSON with absolute paths
    loadFiles: (files: { [key: string]: string }) => {
      try {
        // Clear existing files first
        vol.reset()
        
        // Convert relative paths to absolute paths if needed
        const absoluteFiles: { [key: string]: string } = {}
        
        Object.entries(files).forEach(([path, content]) => {
          // Ensure path starts with / for absolute path
          const absolutePath = path.startsWith('/') ? path : `/${path}`
          absoluteFiles[absolutePath] = content
        })
        
        console.log('📂 Loading files into memfs:', Object.keys(absoluteFiles))
        
        // Load into memfs virtual filesystem
        vol.fromJSON(absoluteFiles, '/') // Mount at root
        
        console.log('✅ memfs loaded:', Object.keys(vol.toJSON()).length, 'files')
        
        // Verify critical files are present
        const requiredFiles = ['/package.json', '/app.json']
        const missingFiles = requiredFiles.filter(file => !vol.existsSync(file))
        
        if (missingFiles.length > 0) {
          console.warn('⚠️ Missing required files in memfs:', missingFiles)
        }
        
      } catch (error) {
        console.error('❌ Failed to load files into memfs:', error)
        throw new Error(`memfs loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    },

    // Get all files from memfs
    getFiles: () => {
      try {
        return vol.toJSON() as { [key: string]: string }
      } catch (error) {
        console.error('❌ Failed to get files from memfs:', error)
        return {}
      }
    },

    // Write a single file to memfs
    writeFile: (path: string, content: string) => {
      try {
        const absolutePath = path.startsWith('/') ? path : `/${path}`
        vol.writeFileSync(absolutePath, content)
        console.log('📝 Written to memfs:', absolutePath)
      } catch (error) {
        console.error('❌ Failed to write file to memfs:', error)
        throw error
      }
    },

    // Read a single file from memfs
    readFile: (path: string) => {
      try {
        const absolutePath = path.startsWith('/') ? path : `/${path}`
        if (vol.existsSync(absolutePath)) {
          return vol.readFileSync(absolutePath, 'utf8') as string
        }
        return null
      } catch (error) {
        console.error('❌ Failed to read file from memfs:', error)
        return null
      }
    },

    // Check if file exists in memfs
    exists: (path: string) => {
      try {
        const absolutePath = path.startsWith('/') ? path : `/${path}`
        return vol.existsSync(absolutePath)
      } catch (error) {
        return false
      }
    },

    // Clear all files from memfs
    clear: () => {
      try {
        vol.reset()
        console.log('🧹 memfs cleared')
      } catch (error) {
        console.error('❌ Failed to clear memfs:', error)
      }
    }
  }
}

/**
 * Validate that the files in memfs form a complete React Native project
 */
export function validateReactNativeProject(vfs: VirtualFileSystem): {
  isValid: boolean
  errors: string[]
  warnings: string[]
  entryPoint: string | null
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check for required files
  const requiredFiles = [
    '/package.json',
    '/app.json'
  ]
  
  requiredFiles.forEach(file => {
    if (!vfs.exists(file)) {
      errors.push(`Missing required file: ${file}`)
    }
  })
  
  // Find entry point
  let entryPoint: string | null = null
  const possibleEntryPoints = [
    '/app/App.js',
    '/app/App.tsx', 
    '/App.js',
    '/App.tsx',
    '/app/(tabs)/index.tsx',
    '/app/index.tsx'
  ]
  
  for (const entry of possibleEntryPoints) {
    if (vfs.exists(entry)) {
      entryPoint = entry
      break
    }
  }
  
  if (!entryPoint) {
    errors.push('No valid entry point found. Expected one of: ' + possibleEntryPoints.join(', '))
  }
  
  // Validate package.json
  if (vfs.exists('/package.json')) {
    try {
      const packageContent = vfs.readFile('/package.json')
      if (packageContent) {
        const packageJson = JSON.parse(packageContent)
        
        if (!packageJson.main) {
          warnings.push('package.json missing "main" field')
        }
        
        if (!packageJson.dependencies?.expo) {
          warnings.push('package.json missing "expo" dependency')
        }
      }
    } catch (error) {
      errors.push('Invalid package.json format')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    entryPoint
  }
}

/**
 * Convert regular files object to memfs-compatible format with absolute paths
 */
export function normalizeFilesForMemfs(files: { [key: string]: string }): { [key: string]: string } {
  const normalized: { [key: string]: string } = {}
  
  Object.entries(files).forEach(([path, content]) => {
    // Ensure absolute path
    const absolutePath = path.startsWith('/') ? path : `/${path}`
    normalized[absolutePath] = content
  })
  
  return normalized
} 