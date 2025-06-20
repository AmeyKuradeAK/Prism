import { GeneratedFile } from '@/types'

export function parseCodeFromResponse(response: string): GeneratedFile[] {
  const files: GeneratedFile[] = []
  
  // Enhanced pattern to match file markers
  const fileMarkerPatterns = [
    /===FILE:\s*([^\n\r]+)===\n([\s\S]*?)(?===END===|===FILE:|$)/gi,
    /```([a-zA-Z]*)\s*:\s*([^\n\r]+)\n([\s\S]*?)```/gi,
    /\/\*\*\s*FILE:\s*([^\n\r]+)\s*\*\/\n([\s\S]*?)(?=\/\*\*\s*FILE:|$)/gi,
    /\/\/\s*FILE:\s*([^\n\r]+)\n([\s\S]*?)(?=\/\/\s*FILE:|$)/gi
  ]
  
  // Try each pattern
  for (const pattern of fileMarkerPatterns) {
    let match
    while ((match = pattern.exec(response)) !== null) {
      let filename: string
      let content: string
      
      if (match.length === 4) {
        // Pattern with language specifier
        filename = match[2].trim()
        content = match[3].trim()
      } else {
        // Standard pattern
        filename = match[1].trim()
        content = match[2].trim()
      }
      
      // Clean up filename
      filename = filename.replace(/^["']|["']$/g, '').trim()
      
      if (filename && content) {
        files.push({
          path: filename,
          content: content,
          type: determineFileType(filename)
        })
      }
    }
  }
  
  // If no files found with markers, try to extract code blocks
  if (files.length === 0) {
    const codeBlockPattern = /```(?:typescript|tsx|javascript|js|json|md)?\n([\s\S]*?)\n```/g
    let blockMatch
    let fileIndex = 1
    
    while ((blockMatch = codeBlockPattern.exec(response)) !== null) {
      const content = blockMatch[1].trim()
      
      if (content.length === 0) continue
      
      // Try to guess filename from content
      let filename = guessFilename(content, fileIndex)
      
      files.push({
        path: filename,
        content,
        type: determineFileType(filename)
      })
      
      fileIndex++
    }
  }
  
  // Final fallback - split by potential file indicators
  if (files.length === 0) {
    const sections = response.split(/(?:App\.tsx|package\.json|app\.json|README\.md|babel\.config\.js)/i)
    
    if (sections.length > 1) {
      for (let i = 1; i < sections.length; i++) {
        const content = sections[i].trim()
        if (content.length > 50) { // Only consider substantial content
          const filename = guessFilenameFromContent(content, i)
          files.push({
            path: filename,
            content: cleanupContent(content),
            type: determineFileType(filename)
          })
        }
      }
    }
  }
  
  // Remove duplicates based on path
  const uniqueFiles = files.filter((file, index, self) => 
    index === self.findIndex(f => f.path === file.path)
  )
  
  return uniqueFiles
}

function determineFileType(filename: string): GeneratedFile['type'] {
  const extension = filename.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'tsx':
      return 'tsx'
    case 'ts':
      return 'ts'
    case 'js':
      return 'js'
    case 'json':
      return 'json'
    case 'md':
      return 'md'
    default:
      return 'txt'
  }
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
    .replace(/^```[\w]*\n?/gm, '')
    .replace(/\n```$/gm, '')
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