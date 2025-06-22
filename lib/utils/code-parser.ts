import { GeneratedFile } from '@/types'

export function parseCodeFromResponse(response: string): GeneratedFile[] {
  const files: GeneratedFile[] = []
  
  console.log(`🔍 Parsing AI response (${response.length} chars)...`)
  
  // Enhanced and more flexible patterns to match file markers
  const fileMarkerPatterns = [
    // Standard ===FILE: format - most flexible
    /===FILE:\s*([^\n\r]+?)===\s*\n([\s\S]*?)(?====FILE:|===END===|$)/gi,
    // Alternative format with END marker
    /===([^=\n\r]+)===\s*\n([\s\S]*?)(?====|$)/gi,
    // Code blocks with file paths
    /```(?:typescript|tsx|javascript|js|json|md|yaml|yml|css|scss|html)?\s*(?:\/\/|#)?\s*([^\n\r]+\.[\w]+)\s*\n([\s\S]*?)```/gi,
    // File path comments followed by code
    /(?:\/\/|#)\s*(?:FILE|Path|file|path):\s*([^\n\r]+)\s*\n([\s\S]*?)(?=(?:\/\/|#)\s*(?:FILE|Path|file|path):|$)/gi,
    // React/JS file patterns
    /\/\*\s*([^\n\r]+\.(?:tsx?|jsx?|json|md))\s*\*\/\s*\n([\s\S]*?)(?=\/\*.*?\.(?:tsx?|jsx?|json|md)|$)/gi,
    // Improved pattern for components
    /(?:^|\n)(?:\/\/|#)\s*([A-Za-z][A-Za-z0-9]*(?:Component|Screen|Page)\.tsx?)\s*\n([\s\S]*?)(?=\n(?:\/\/|#)\s*[A-Za-z]|$)/gmi
  ]
  
  // Try each pattern
  for (const pattern of fileMarkerPatterns) {
    let match
    while ((match = pattern.exec(response)) !== null) {
      let filename: string
      let content: string
      
      if (match.length === 4) {
        // Pattern with language specifier (like ```tsx app/home.tsx)
        filename = match[3] || match[2] || match[1]
        content = match[4] || match[3] || match[2]
      } else {
        // Standard pattern
        filename = match[1].trim()
        content = match[2].trim()
      }
      
      // Normalize and clean up filename
      filename = normalizeFilePath(filename)
      content = cleanupContent(content)
      
      if (filename && content && content.length > 10) {
        console.log(`📁 Found file via pattern: ${filename} (${content.length} chars)`)
        files.push({
          path: filename,
          content: content,
          type: determineFileType(filename)
        })
      }
    }
  }
  
  // ENHANCED: Look for React components even without explicit file markers
  if (files.length === 0) {
    console.log('🔍 No explicit file markers found, searching for React components...')
    
    // Look for React component definitions
    const componentPattern = /(?:export default )?(?:function|const)\s+([A-Z][A-Za-z0-9]*(?:Component|Screen|Page)?)\s*[({=]/g
    let componentMatch
    const foundComponents: string[] = []
    
    while ((componentMatch = componentPattern.exec(response)) !== null) {
      const componentName = componentMatch[1]
      if (!foundComponents.includes(componentName)) {
        foundComponents.push(componentName)
        console.log(`🧩 Found component: ${componentName}`)
      }
    }
    
    // If we found components, try to extract their code
    for (const componentName of foundComponents) {
      const componentExtractPattern = new RegExp(
        `((?:import[^;]*;\\s*)*(?:export default )?(?:function|const)\\s+${componentName}[\\s\\S]*?(?=(?:export default )?(?:function|const)\\s+[A-Z]|$))`,
        'g'
      )
      
      const extractMatch = componentExtractPattern.exec(response)
      if (extractMatch) {
        const content = cleanupContent(extractMatch[1])
        if (content.length > 50) {
          const filename = `components/${componentName}.tsx`
          console.log(`🧩 Extracted component: ${filename} (${content.length} chars)`)
          files.push({
            path: filename,
            content,
            type: 'tsx'
          })
        }
      }
    }
  }
  
  // If still no files found with markers, try to extract code blocks
  if (files.length === 0) {
    console.log('🔍 No components found, trying code blocks...')
    const codeBlockPattern = /```(?:typescript|tsx|javascript|js|json|md)?\n([\s\S]*?)\n```/g
    let blockMatch
    let fileIndex = 1
    
    while ((blockMatch = codeBlockPattern.exec(response)) !== null) {
      const content = blockMatch[1].trim()
      
      if (content.length === 0) continue
      
      // Try to guess filename from content
      let filename = guessFilename(content, fileIndex)
      
      console.log(`📄 Found code block: ${filename} (${content.length} chars)`)
      files.push({
        path: filename,
        content,
        type: determineFileType(filename)
      })
      
      fileIndex++
    }
  }
  
  // ENHANCED: Final fallback - look for obvious file content patterns
  if (files.length === 0) {
    console.log('🔍 Final fallback: searching for file content patterns...')
    
    // Look for package.json content
    const packageJsonMatch = response.match(/\{[\s\S]*?"scripts"[\s\S]*?"dependencies"[\s\S]*?\}/g)
    if (packageJsonMatch) {
      files.push({
        path: 'package.json',
        content: cleanupContent(packageJsonMatch[0]),
        type: 'json'
      })
      console.log('📦 Found package.json content')
    }
    
    // Look for app.json content  
    const appJsonMatch = response.match(/\{[\s\S]*?"expo"[\s\S]*?"name"[\s\S]*?\}/g)
    if (appJsonMatch) {
      files.push({
        path: 'app.json', 
        content: cleanupContent(appJsonMatch[0]),
        type: 'json'
      })
      console.log('📱 Found app.json content')
    }
    
    // Look for React component code without explicit markers
    const reactCodePattern = /(?:import[^;]*from[^;]*;[\s\n]*)*(?:export default )?function\s+[A-Z][A-Za-z0-9]*[\s\S]*?(?=(?:export default )?function\s+[A-Z]|$)/g
    let reactMatch
    let reactIndex = 1
    
    while ((reactMatch = reactCodePattern.exec(response)) !== null) {
      const content = cleanupContent(reactMatch[0])
      if (content.length > 100) {
        const filename = `components/GeneratedComponent${reactIndex}.tsx`
        files.push({
          path: filename,
          content,
          type: 'tsx'
        })
        console.log(`⚛️ Found React code: ${filename} (${content.length} chars)`)
        reactIndex++
      }
    }
  }
  
  // Remove duplicates based on path
  const uniqueFiles = files.filter((file, index, self) => 
    index === self.findIndex(f => f.path === file.path)
  )
  
  console.log(`✅ Parsing complete: found ${uniqueFiles.length} unique files`)
  console.log(`📋 File paths: ${uniqueFiles.map(f => f.path).join(', ')}`)
  
  return uniqueFiles
}

function determineFileType(filename: string): GeneratedFile['type'] {
  const extension = filename.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'tsx':
      return 'tsx'
    case 'ts':
      return 'ts'
    case 'jsx':
    case 'js':
      return 'js'
    case 'json':
      return 'json'
    case 'md':
    case 'markdown':
      return 'md'
    case 'yaml':
    case 'yml':
    case 'css':
    case 'scss':
    case 'sass':
    case 'html':
    case 'xml':
    case 'env':
    case 'gitignore':
    case 'eslintrc':
    case 'prettierrc':
      return 'txt'
    default:
      return 'txt'
  }
}

// Add function to normalize file paths and create nested structures
function normalizeFilePath(path: string): string {
  return path
    .replace(/^["']|["']$/g, '') // Remove quotes
    .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
    .replace(/\/+/g, '/') // Normalize multiple slashes
    .trim()
}

function guessFilename(content: string, index: number): string {
  // Check for React component
  if (content.includes('export default') && (content.includes('React') || content.includes('jsx') || content.includes('tsx'))) {
    if (content.includes('App') || content.includes('function App')) {
      return 'App.tsx'
    }
    return `Component${index}.tsx`
  }
  
  // Check for package.json
  if (content.includes('"scripts"') && content.includes('"dependencies"')) {
    return 'package.json'
  }
  
  // Check for app.json (Expo config)
  if (content.includes('"expo"') && content.includes('"name"')) {
    return 'app.json'
  }
  
  // Check for babel config
  if (content.includes('babel') && content.includes('module.exports')) {
    return 'babel.config.js'
  }
  
  // Check for TypeScript config
  if (content.includes('"compilerOptions"') && content.includes('"extends"')) {
    return 'tsconfig.json'
  }
  
  // Check for README
  if (content.includes('# ') && content.includes('## ')) {
    return 'README.md'
  }
  
  // Check for JavaScript/TypeScript utility
  if (content.includes('export ') || content.includes('import ')) {
    return `utils${index}.ts`
  }
  
  return `generated-file-${index}.txt`
}

function guessFilenameFromContent(content: string, index: number): string {
  const lowerContent = content.toLowerCase()
  
  if (lowerContent.includes('app.tsx') || (lowerContent.includes('export default') && lowerContent.includes('app'))) {
    return 'App.tsx'
  }
  if (lowerContent.includes('package.json') || lowerContent.includes('"scripts"')) {
    return 'package.json'
  }
  if (lowerContent.includes('app.json') || lowerContent.includes('"expo"')) {
    return 'app.json'
  }
  if (lowerContent.includes('readme') || lowerContent.includes('# ')) {
    return 'README.md'
  }
  if (lowerContent.includes('babel.config') || lowerContent.includes('babel-preset')) {
    return 'babel.config.js'
  }
  if (lowerContent.includes('tsconfig') || lowerContent.includes('compileroptions')) {
    return 'tsconfig.json'
  }
  
  return `file-${index}.txt`
}

function cleanupContent(content: string): string {
  // Remove potential file markers that might have been included
  return content
    .replace(/^===FILE:.*?===/gmi, '')
    .replace(/^===END===/gmi, '')
    .replace(/^===.*?===/gmi, '') // Remove any other === markers
    .replace(/^```[\w]*\s*(?:\/\/|#)?\s*[^\n]*\n?/gm, '') // Remove code block headers
    .replace(/\n```$/gm, '') // Remove closing code blocks
    .replace(/^\/\*.*?\*\/\s*\n?/gm, '') // Remove JS file comments
    .replace(/^\/\/\s*(?:FILE|Path):.*?\n/gmi, '') // Remove file path comments
    .replace(/^\s*$\n/gm, '') // Remove empty lines
    .trim()
}

export function extractCodeBlocks(text: string): { language: string; code: string }[] {
  const codeBlocks: { language: string; code: string }[] = []
  const pattern = /```(\w*)\n([\s\S]*?)\n```/g
  let match
  
  while ((match = pattern.exec(text)) !== null) {
    codeBlocks.push({
      language: match[1] || 'text',
      code: match[2].trim()
    })
  }
  
  return codeBlocks
}

export function validateGeneratedFiles(files: GeneratedFile[]): boolean {
  // Check if we have essential files for an Expo app
  const hasAppTsx = files.some(f => f.path.includes('App.tsx') || f.path.includes('App.js'))
  const hasPackageJson = files.some(f => f.path.includes('package.json'))
  
  return hasAppTsx && hasPackageJson && files.length > 0
}

export function sanitizeFilePath(path: string): string {
  // Remove any dangerous characters and ensure safe file paths
  return path
    .replace(/[<>:"|?*]/g, '')
    .replace(/\.\./g, '')
    .replace(/^\/+/, '')
    .replace(/\/+/g, '/')
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function mergePackageJsonDependencies(basePackageJson: string, aiPackageJson: string): string {
  try {
    const baseObj = JSON.parse(basePackageJson)
    const aiObj = JSON.parse(aiPackageJson)
    
    // Merge dependencies intelligently
    const merged = {
      ...baseObj,
      ...aiObj,
      dependencies: {
        ...baseObj.dependencies,
        ...aiObj.dependencies
      },
      devDependencies: {
        ...baseObj.devDependencies,
        ...aiObj.devDependencies
      },
      scripts: {
        ...baseObj.scripts,
        ...aiObj.scripts
      }
    }
    
    return JSON.stringify(merged, null, 2)
  } catch (error) {
    console.warn('Failed to merge package.json files:', error)
    // Return AI version if merge fails
    return aiPackageJson
  }
}

export function extractAndValidateFiles(files: GeneratedFile[]): GeneratedFile[] {
  const validatedFiles: GeneratedFile[] = []
  const packageJsonFiles: GeneratedFile[] = []
  
  for (const file of files) {
    // Handle package.json specially
    if (file.path === 'package.json') {
      packageJsonFiles.push(file)
      continue
    }
    
    // Validate file content
    if (file.content.length < 5) continue
    
    // Ensure proper file structure
    const normalizedPath = normalizeFilePath(file.path)
    if (!normalizedPath || normalizedPath.includes('..')) continue
    
    validatedFiles.push({
      ...file,
      path: normalizedPath
    })
  }
  
  // Handle package.json merging
  if (packageJsonFiles.length > 0) {
    validatedFiles.push(packageJsonFiles[packageJsonFiles.length - 1])
  }
  
  return validatedFiles
} 