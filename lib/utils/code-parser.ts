import { GeneratedFile } from '@/types'

export function parseCodeFromResponse(response: string): GeneratedFile[] {
  const files: GeneratedFile[] = []
  
  // Split by file markers
  const filePattern = /===FILE:\s*(.+?)===\n([\s\S]*?)===END===/g
  let match
  
  while ((match = filePattern.exec(response)) !== null) {
    const filePath = match[1].trim()
    const fileContent = match[2].trim()
    
    // Determine file type from extension
    const extension = filePath.split('.').pop()?.toLowerCase()
    let fileType: GeneratedFile['type'] = 'txt'
    
    switch (extension) {
      case 'tsx':
        fileType = 'tsx'
        break
      case 'ts':
        fileType = 'ts'
        break
      case 'js':
        fileType = 'js'
        break
      case 'json':
        fileType = 'json'
        break
      case 'md':
        fileType = 'md'
        break
      default:
        fileType = 'txt'
    }
    
    files.push({
      path: filePath,
      content: fileContent,
      type: fileType
    })
  }
  
  // If no files found with markers, try to extract code blocks
  if (files.length === 0) {
    const codeBlockPattern = /```(?:typescript|tsx|javascript|js|json)?\n([\s\S]*?)\n```/g
    let blockMatch
    let fileIndex = 1
    
    while ((blockMatch = codeBlockPattern.exec(response)) !== null) {
      const content = blockMatch[1].trim()
      
      // Try to guess filename from content
      let filename = `generated-${fileIndex}`
      let fileType: GeneratedFile['type'] = 'tsx'
      
      if (content.includes('export default') && content.includes('React')) {
        filename = `Component${fileIndex}.tsx`
        fileType = 'tsx'
      } else if (content.includes('"scripts"') || content.includes('"dependencies"')) {
        filename = 'package.json'
        fileType = 'json'
      } else if (content.includes('module.exports') || content.includes('export {')) {
        filename = `utils${fileIndex}.ts`
        fileType = 'ts'
      }
      
      files.push({
        path: filename,
        content,
        type: fileType
      })
      
      fileIndex++
    }
  }
  
  return files
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