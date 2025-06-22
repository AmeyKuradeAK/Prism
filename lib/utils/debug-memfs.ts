// Debug utility for memfs troubleshooting
import { vol } from 'memfs'

export function debugMemfsState(label: string = 'Debug') {
  console.group(`🔍 ${label} - memfs Debug Info`)
  
  try {
    // Check if memfs is available
    console.log('📦 memfs available:', typeof vol !== 'undefined')
    
    // Get all files in memfs
    const files = vol.toJSON()
    const fileCount = Object.keys(files).length
    
    console.log(`📄 Total files in memfs: ${fileCount}`)
    
    if (fileCount > 0) {
      console.log('📁 Files in memfs:')
      Object.keys(files).forEach(path => {
        const content = files[path] as string
        console.log(`  ${path} (${content.length} chars)`)
      })
      
      // Check for essential React Native files
      const essentialFiles = [
        '/package.json',
        '/app.json',
        '/app/_layout.tsx',
        '/app/(tabs)/_layout.tsx',
        '/app/(tabs)/index.tsx'
      ]
      
      console.log('🔍 Essential file check:')
      essentialFiles.forEach(file => {
        const exists = vol.existsSync(file)
        console.log(`  ${file}: ${exists ? '✅' : '❌'}`)
      })
      
      // Try to read package.json
      if (vol.existsSync('/package.json')) {
        try {
          const packageContent = vol.readFileSync('/package.json', 'utf8') as string
          const packageJson = JSON.parse(packageContent)
          console.log('📋 package.json main field:', packageJson.main)
          console.log('📋 package.json name:', packageJson.name)
        } catch (error) {
          console.error('❌ Error reading package.json:', error)
        }
      }
      
    } else {
      console.warn('⚠️ No files found in memfs!')
    }
    
  } catch (error) {
    console.error('❌ memfs debug error:', error)
  }
  
  console.groupEnd()
}

export function debugFileStructure(files: { [key: string]: string }, label: string = 'Files Debug') {
  console.group(`🔍 ${label} - File Structure Debug`)
  
  const fileCount = Object.keys(files).length
  console.log(`📄 Total files: ${fileCount}`)
  
  if (fileCount > 0) {
    // Check path formats
    const hasAbsolutePaths = Object.keys(files).every(path => path.startsWith('/'))
    const hasRelativePaths = Object.keys(files).some(path => !path.startsWith('/'))
    
    console.log(`📁 All paths absolute: ${hasAbsolutePaths ? '✅' : '❌'}`)
    console.log(`📁 Has relative paths: ${hasRelativePaths ? '⚠️' : '✅'}`)
    
    // Organize files by proper React Native structure
    console.log('📂 Proper React Native folder structure:')
    const organized: { [key: string]: string[] } = {}
    
    Object.keys(files).forEach(filepath => {
      const cleanPath = filepath.startsWith('/') ? filepath.slice(1) : filepath
      const parts = cleanPath.split('/')
      
      if (parts.length === 1) {
        if (!organized['📱 Root Files']) organized['📱 Root Files'] = []
        organized['📱 Root Files'].push(filepath)
      } else {
        const dir = parts[0]
        const subdirs = parts.slice(1, -1)
        
        let folderName: string
        if (dir === 'app') {
          if (subdirs.includes('(tabs)')) {
            folderName = '📱 app/(tabs)/'
          } else {
            folderName = '📱 app/'
          }
        } else if (dir === 'components') {
          if (subdirs.includes('ui')) {
            folderName = '🧩 components/ui/'
          } else {
            folderName = '🧩 components/'
          }
        } else if (dir === 'hooks') {
          folderName = '🪝 hooks/'
        } else if (dir === 'constants') {
          folderName = '⚙️ constants/'
        } else {
          folderName = `📁 ${dir}/`
        }
        
        if (!organized[folderName]) organized[folderName] = []
        organized[folderName].push(filepath)
      }
    })
    
    // Display organized structure
    Object.entries(organized).forEach(([folder, files]) => {
      console.log(`  ${folder}`)
      files.forEach(file => {
        const fileName = file.split('/').pop()
        console.log(`    ${fileName}`)
      })
    })
    
    // Check for essential files
    const essentialFiles = [
      'package.json', '/package.json',
      'app.json', '/app.json',
      'app/_layout.tsx', '/app/_layout.tsx',
      'app/(tabs)/index.tsx', '/app/(tabs)/index.tsx'
    ]
    
    console.log('🔍 Essential file check:')
    essentialFiles.forEach(file => {
      const exists = files[file] !== undefined
      if (exists) {
        console.log(`  ${file}: ✅ (${files[file].length} chars)`)
      }
    })
    
    // Try to parse package.json
    const packageJsonContent = files['package.json'] || files['/package.json']
    if (packageJsonContent) {
      try {
        const packageJson = JSON.parse(packageJsonContent)
        console.log('📋 package.json parsed successfully')
        console.log('📋 package.json main field:', packageJson.main)
        console.log('📋 package.json name:', packageJson.name)
      } catch (error) {
        console.error('❌ Error parsing package.json:', error)
      }
    } else {
      console.warn('⚠️ No package.json found!')
    }
    
  } else {
    console.warn('⚠️ No files provided!')
  }
  
  console.groupEnd()
}

export function debugComparison(files1: { [key: string]: string }, files2: { [key: string]: string }, label1: string = 'Set 1', label2: string = 'Set 2') {
  console.group(`🔍 File Comparison: ${label1} vs ${label2}`)
  
  const keys1 = Object.keys(files1)
  const keys2 = Object.keys(files2)
  
  console.log(`📄 ${label1}: ${keys1.length} files`)
  console.log(`📄 ${label2}: ${keys2.length} files`)
  
  // Find missing files
  const missingIn2 = keys1.filter(key => !keys2.includes(key))
  const missingIn1 = keys2.filter(key => !keys1.includes(key))
  
  if (missingIn2.length > 0) {
    console.log(`❌ Missing in ${label2}:`, missingIn2)
  }
  
  if (missingIn1.length > 0) {
    console.log(`❌ Missing in ${label1}:`, missingIn1)
  }
  
  // Find common files
  const common = keys1.filter(key => keys2.includes(key))
  console.log(`✅ Common files: ${common.length}`)
  
  console.groupEnd()
} 