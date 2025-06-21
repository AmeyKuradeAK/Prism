// 🎯 React Native Project Structure Fixer
// Automatically organizes AI-generated files into professional folder structure

interface FileAnalysis {
  type: 'screen' | 'component' | 'navigation' | 'config' | 'util' | 'asset' | 'root'
  originalPath: string
  suggestedPath: string
  dependencies: string[]
  exports: string[]
}

// 🔍 File Type Detection Patterns
const FILE_PATTERNS = {
  screen: [
    /useNavigation|navigation\.navigate|Stack\.Screen/,
    /Screen\s*=|export.*Screen/,
    /SafeAreaView.*ScrollView|FlatList.*data/,
    /(Home|Login|Profile|Settings|Detail)Screen/i
  ],
  component: [
    /export.*function.*\(.*props/,
    /interface.*Props/,
    /React\.FC|React\.Component/,
    /TouchableOpacity|Pressable|Button/
  ],
  navigation: [
    /NavigationContainer|createStackNavigator|createBottomTabNavigator/,
    /Stack\.Navigator|Tab\.Navigator|Drawer\.Navigator/,
    /navigationRef|NavigationAction/
  ],
  config: [
    /expo.*config|babel\.config|metro\.config/,
    /app\.json|package\.json|tsconfig/
  ],
  util: [
    /export.*function.*helper|export.*const.*util/,
    /api|fetch|storage|validation/i
  ]
}

// 🎯 Main Project Structure Fixer
export function fixProjectStructure(
  rawFiles: Record<string, string>
): Record<string, string> {
  
  console.log('🔧 Starting project structure fix...')
  
  // Step 1: Analyze all files
  const analyses = analyzeFiles(rawFiles)
  
  // Step 2: Create proper file structure
  const structuredFiles = createStructuredFiles(analyses, rawFiles)
  
  // Step 3: Fix all import paths
  const fixedFiles = fixImportPaths(structuredFiles)
  
  // Step 4: Ensure critical files exist
  const completeFiles = ensureCriticalFiles(fixedFiles)
  
  console.log(`✅ Project structure fixed: ${Object.keys(completeFiles).length} files`)
  return completeFiles
}

// 🔍 Analyze each file to determine its type and suggested location
function analyzeFiles(files: Record<string, string>): FileAnalysis[] {
  const analyses: FileAnalysis[] = []
  
  Object.entries(files).forEach(([path, content]) => {
    const analysis = analyzeFile(path, content)
    analyses.push(analysis)
  })
  
  return analyses
}

function analyzeFile(originalPath: string, content: string): FileAnalysis {
  const filename = originalPath.split('/').pop() || originalPath
  const filenameLower = filename.toLowerCase()
  
  // Config files (highest priority)
  if (filenameLower.includes('app.json') || filenameLower.includes('package.json') || 
      filenameLower.includes('babel.config') || filenameLower.includes('app.config')) {
    return {
      type: 'config',
      originalPath,
      suggestedPath: filename,
      dependencies: extractImports(content),
      exports: extractExports(content)
    }
  }
  
  // Root files
  if (filenameLower === 'app.js' || filenameLower === 'app.tsx' || 
      filenameLower === 'index.js' || filenameLower === 'index.tsx' ||
      filenameLower === '_layout.tsx') {
    return {
      type: 'root',
      originalPath,
      suggestedPath: filename,
      dependencies: extractImports(content),
      exports: extractExports(content)
    }
  }
  
  // Navigation files
  if (FILE_PATTERNS.navigation.some(pattern => pattern.test(content))) {
    return {
      type: 'navigation',
      originalPath,
      suggestedPath: `navigation/${filename}`,
      dependencies: extractImports(content),
      exports: extractExports(content)
    }
  }
  
  // Screen files
  if (FILE_PATTERNS.screen.some(pattern => pattern.test(content)) || 
      filenameLower.includes('screen') || 
      originalPath.includes('/app/') && !originalPath.includes('_layout')) {
    const screenName = extractScreenName(filename)
    return {
      type: 'screen',
      originalPath,
      suggestedPath: `screens/${screenName}`,
      dependencies: extractImports(content),
      exports: extractExports(content)
    }
  }
  
  // Utility files
  if (FILE_PATTERNS.util.some(pattern => pattern.test(content)) ||
      filenameLower.includes('util') || filenameLower.includes('helper')) {
    return {
      type: 'util',
      originalPath,
      suggestedPath: `utils/${filename}`,
      dependencies: extractImports(content),
      exports: extractExports(content)
    }
  }
  
  // Component files (default for React components)
  return {
    type: 'component',
    originalPath,
    suggestedPath: `components/${filename}`,
    dependencies: extractImports(content),
    exports: extractExports(content)
  }
}

// 📁 Create structured files with proper paths
function createStructuredFiles(
  analyses: FileAnalysis[], 
  originalFiles: Record<string, string>
): Record<string, string> {
  
  const structured: Record<string, string> = {}
  
  analyses.forEach(analysis => {
    const content = originalFiles[analysis.originalPath]
    structured[analysis.suggestedPath] = content
  })
  
  return structured
}

// 🔗 Fix import paths based on new file structure
function fixImportPaths(files: Record<string, string>): Record<string, string> {
  const fixed: Record<string, string> = {}
  
  // Create a mapping of old paths to new paths
  const pathMapping = createPathMapping(files)
  
  Object.entries(files).forEach(([newPath, content]) => {
    let fixedContent = content
    
    // Fix import statements
    const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g
    fixedContent = fixedContent.replace(importRegex, (match, importPath) => {
      const fixedImportPath = resolveImportPath(newPath, importPath, pathMapping)
      return match.replace(importPath, fixedImportPath)
    })
    
    // Fix require statements
    const requireRegex = /require\(['"`]([^'"`]+)['"`]\)/g
    fixedContent = fixedContent.replace(requireRegex, (match, requirePath) => {
      const fixedRequirePath = resolveImportPath(newPath, requirePath, pathMapping)
      return match.replace(requirePath, fixedRequirePath)
    })
    
    fixed[newPath] = fixedContent
  })
  
  return fixed
}

// 🗺️ Create mapping between old and new file paths
function createPathMapping(files: Record<string, string>): Record<string, string> {
  const mapping: Record<string, string> = {}
  
  Object.keys(files).forEach(newPath => {
    const filename = newPath.split('/').pop()!
    const filenameWithoutExt = filename.replace(/\.(tsx?|jsx?)$/, '')
    
    // Map various possible import formats
    mapping[filename] = newPath
    mapping[filenameWithoutExt] = newPath
    mapping[`./${filename}`] = newPath
    mapping[`./${filenameWithoutExt}`] = newPath
  })
  
  return mapping
}

// 🔧 Resolve import path based on file locations
function resolveImportPath(
  currentFilePath: string, 
  importPath: string, 
  pathMapping: Record<string, string>
): string {
  
  // Skip external packages
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    return importPath
  }
  
  // Check if we have a direct mapping
  if (pathMapping[importPath]) {
    return calculateRelativePath(currentFilePath, pathMapping[importPath])
  }
  
  // Try variations
  const variations = [
    importPath,
    importPath + '.tsx',
    importPath + '.ts',
    importPath + '.jsx',
    importPath + '.js',
    importPath.replace('./', ''),
    importPath.replace('./', '') + '.tsx'
  ]
  
  for (const variation of variations) {
    if (pathMapping[variation]) {
      return calculateRelativePath(currentFilePath, pathMapping[variation])
    }
  }
  
  return importPath // Return original if no mapping found
}

// 📐 Calculate relative path between two files
function calculateRelativePath(from: string, to: string): string {
  const fromParts = from.split('/').slice(0, -1) // Remove filename
  const toParts = to.split('/')
  
  // Calculate how many directories to go up
  let upLevels = fromParts.length
  if (fromParts.length === 0) upLevels = 0
  
  const upPath = '../'.repeat(upLevels)
  const targetPath = toParts.join('/')
  
  return upPath + targetPath
}

// ✅ Ensure critical files exist with proper content
function ensureCriticalFiles(files: Record<string, string>): Record<string, string> {
  const complete = { ...files }
  
  // Ensure App.tsx exists (Expo Router style)
  if (!complete['App.tsx'] && !complete['App.js']) {
    complete['App.tsx'] = generateAppFile(files)
  }
  
  // Ensure package.json exists
  if (!complete['package.json']) {
    complete['package.json'] = generatePackageJson()
  }
  
  // Ensure babel.config.js exists
  if (!complete['babel.config.js']) {
    complete['babel.config.js'] = generateBabelConfig()
  }
  
  // Ensure app.json exists (Expo config)
  if (!complete['app.json']) {
    complete['app.json'] = generateAppJson()
  }
  
  return complete
}

// 🏗️ Generate critical files
function generateAppFile(existingFiles: Record<string, string>): string {
  return `import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="screens/TasksScreen" options={{ title: 'Tasks' }} />
        <Stack.Screen name="screens/TimerScreen" options={{ title: 'Timer' }} />
      </Stack>
    </>
  );
}`
}

function generatePackageJson(): string {
  return JSON.stringify({
    "name": "react-native-app",
    "version": "1.0.0",
    "main": "expo-router/entry",
    "scripts": {
      "start": "expo start",
      "android": "expo start --android",
      "ios": "expo start --ios",
      "web": "expo start --web"
    },
    "dependencies": {
      "expo": "~50.0.0",
      "react": "18.2.0",
      "react-native": "0.73.0",
      "expo-status-bar": "~1.11.1",
      "expo-router": "~3.4.0",
      "react-native-safe-area-context": "4.8.2",
      "react-native-screens": "~3.29.0",
      "react-native-gesture-handler": "~2.14.0",
      "@expo/vector-icons": "^14.0.0",
      "nativewind": "^2.0.11"
    },
    "devDependencies": {
      "@babel/core": "^7.20.0",
      "@types/react": "~18.2.45",
      "typescript": "^5.1.3",
      "tailwindcss": "3.3.2"
    }
  }, null, 2)
}

function generateBabelConfig(): string {
  return `module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ["nativewind/babel"],
  };
};`
}

function generateAppJson(): string {
  return JSON.stringify({
    "expo": {
      "name": "React Native App",
      "slug": "react-native-app",
      "version": "1.0.0",
      "orientation": "portrait",
      "icon": "./assets/icon.png",
      "userInterfaceStyle": "light",
      "splash": {
        "image": "./assets/splash.png",
        "resizeMode": "contain",
        "backgroundColor": "#ffffff"
      },
      "assetBundlePatterns": ["**/*"],
      "ios": {
        "supportsTablet": true
      },
      "android": {
        "adaptiveIcon": {
          "foregroundImage": "./assets/adaptive-icon.png",
          "backgroundColor": "#ffffff"
        }
      },
      "web": {
        "favicon": "./assets/favicon.png"
      },
      "plugins": ["expo-router"],
      "scheme": "react-native-app"
    }
  }, null, 2)
}

// 🔍 Utility functions for content analysis
function extractImports(content: string): string[] {
  const imports: string[] = []
  const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g
  let match
  
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1])
  }
  
  return imports
}

function extractExports(content: string): string[] {
  const exports: string[] = []
  const exportRegex = /export\s+(?:default\s+)?(?:function|const|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
  let match
  
  while ((match = exportRegex.exec(content)) !== null) {
    exports.push(match[1])
  }
  
  return exports
}

function extractScreenName(filename: string): string {
  // Convert various filename formats to proper screen names
  let screenName = filename.replace(/\.(tsx?|jsx?)$/, '')
  
  // Handle Expo Router format (app/tasks.tsx -> TasksScreen.tsx)
  if (!screenName.toLowerCase().includes('screen')) {
    screenName += 'Screen'
  }
  
  // Ensure proper capitalization
  return screenName.charAt(0).toUpperCase() + screenName.slice(1) + '.tsx'
}

// 📊 Export utility for debugging
export function analyzeProjectStructure(files: Record<string, string>) {
  const analysis = {
    totalFiles: Object.keys(files).length,
    fileTypes: {} as Record<string, number>,
    structure: {} as Record<string, string[]>
  }
  
  Object.keys(files).forEach(path => {
    const parts = path.split('/')
    const folder = parts.length > 1 ? parts[0] : 'root'
    
    if (!analysis.structure[folder]) {
      analysis.structure[folder] = []
    }
    analysis.structure[folder].push(path)
    
    const type = path.includes('screen') ? 'screen' : 
                 path.includes('component') ? 'component' :
                 path.includes('navigation') ? 'navigation' : 'other'
    
    analysis.fileTypes[type] = (analysis.fileTypes[type] || 0) + 1
  })
  
  return analysis
}
