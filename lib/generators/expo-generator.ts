import { Mistral } from '@mistralai/mistralai'
import { generateHomeScreen } from './templates/app-template'
import { generatePackageJson } from './templates/package-template'
import { generateExpoConfig } from './templates/expo-config'
import { parseCodeFromResponse } from '../utils/code-parser'
import { execSync } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'

interface PromptAnalysis {
  appType: string
  coreFeatures: string[]
  nativeFeatures: {
    camera: boolean
    location: boolean
    notifications: boolean
    storage: boolean
    authentication: boolean
    payments: boolean
    maps: boolean
    socialSharing: boolean
  }
  uiComponents: string[]
  navigationStructure: string
  dataManagement: string
  complexity: 'simple' | 'medium' | 'complex'
  estimatedScreens: number
}

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || ''
})

async function analyzePrompt(prompt: string): Promise<PromptAnalysis> {
  // Advanced prompt analysis using AI
  const analysisPrompt = `Analyze this mobile app request and return a JSON object with the following structure:

{
  "appType": "string describing the type of app (e.g., social media, e-commerce, productivity, etc.)",
  "coreFeatures": ["array of main features"],
  "nativeFeatures": {
    "camera": boolean,
    "location": boolean,
    "notifications": boolean,
    "storage": boolean,
    "authentication": boolean,
    "payments": boolean,
    "maps": boolean,
    "socialSharing": boolean
  },
  "uiComponents": ["list of UI components needed"],
  "navigationStructure": "description of navigation needed",
  "dataManagement": "description of data storage needs",
  "complexity": "simple|medium|complex",
  "estimatedScreens": number
}

User request: "${prompt}"

Return only the JSON object, no other text.`

    try {
      const response = await mistral.chat.complete({
        model: 'mistral-large-latest',
        messages: [
        { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.1,
      maxTokens: 1000
    })

    const content = response.choices[0]?.message?.content
    if (content) {
      try {
        const contentString = typeof content === 'string' 
          ? content 
          : Array.isArray(content) 
            ? content.map(chunk => chunk.type === 'text' ? chunk.text : '').join('')
            : String(content)
        return JSON.parse(contentString)
      } catch {
        return getFallbackAnalysis(prompt)
      }
    }
  } catch (error) {
    console.error('AI analysis failed:', error)
  }
  
  return getFallbackAnalysis(prompt)
}

function getFallbackAnalysis(prompt: string): PromptAnalysis {
  const lowerPrompt = prompt.toLowerCase()
  
  return {
    appType: detectAppType(prompt),
    coreFeatures: extractFeatures(prompt),
    nativeFeatures: {
      camera: lowerPrompt.includes('camera') || lowerPrompt.includes('photo') || lowerPrompt.includes('image'),
      location: lowerPrompt.includes('location') || lowerPrompt.includes('gps') || lowerPrompt.includes('map'),
      notifications: lowerPrompt.includes('notification') || lowerPrompt.includes('push') || lowerPrompt.includes('alert'),
      storage: lowerPrompt.includes('storage') || lowerPrompt.includes('database') || lowerPrompt.includes('offline'),
      authentication: lowerPrompt.includes('auth') || lowerPrompt.includes('login') || lowerPrompt.includes('user'),
      payments: lowerPrompt.includes('payment') || lowerPrompt.includes('purchase') || lowerPrompt.includes('billing'),
      maps: lowerPrompt.includes('map') || lowerPrompt.includes('location') || lowerPrompt.includes('navigation'),
      socialSharing: lowerPrompt.includes('share') || lowerPrompt.includes('social') || lowerPrompt.includes('post')
    },
    uiComponents: extractUIComponents(prompt),
    navigationStructure: detectNavigation(prompt),
    dataManagement: detectDataNeeds(prompt),
    complexity: detectComplexity(prompt),
    estimatedScreens: estimateScreens(prompt)
  }
}

function detectAppType(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()
  
  if (lowerPrompt.includes('todo') || lowerPrompt.includes('task')) return 'Task Management App'
  if (lowerPrompt.includes('chat') || lowerPrompt.includes('message')) return 'Messaging App'
  if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('shop')) return 'E-Commerce App'
  if (lowerPrompt.includes('social') || lowerPrompt.includes('feed')) return 'Social Media App'
  if (lowerPrompt.includes('fitness') || lowerPrompt.includes('health')) return 'Health & Fitness App'
  if (lowerPrompt.includes('news') || lowerPrompt.includes('article')) return 'News & Media App'
  
  return 'Custom Mobile App'
}

function extractFeatures(prompt: string): string[] {
  const features = []
  const lowerPrompt = prompt.toLowerCase()
  
  if (lowerPrompt.includes('auth') || lowerPrompt.includes('login')) features.push('User Authentication')
  if (lowerPrompt.includes('camera') || lowerPrompt.includes('photo')) features.push('Camera Integration')
  if (lowerPrompt.includes('location') || lowerPrompt.includes('gps')) features.push('Location Services')
  if (lowerPrompt.includes('notification') || lowerPrompt.includes('push')) features.push('Push Notifications')
  if (lowerPrompt.includes('offline') || lowerPrompt.includes('storage')) features.push('Offline Storage')
  if (lowerPrompt.includes('payment') || lowerPrompt.includes('purchase')) features.push('Payment Processing')
  
  return features.length > 0 ? features : ['Core App Functionality', 'User Interface', 'Data Management']
}

function extractUIComponents(prompt: string): string[] {
  const components = ['Navigation', 'Buttons', 'Forms', 'Lists']
  const lowerPrompt = prompt.toLowerCase()
  
  if (lowerPrompt.includes('tab')) components.push('Tab Navigation')
  if (lowerPrompt.includes('drawer')) components.push('Drawer Navigation')
  if (lowerPrompt.includes('card')) components.push('Cards')
  if (lowerPrompt.includes('modal')) components.push('Modals')
  
  return components
}

function detectNavigation(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()
  
  if (lowerPrompt.includes('tab')) return 'Tab Navigation'
  if (lowerPrompt.includes('drawer')) return 'Drawer Navigation'
  if (lowerPrompt.includes('stack')) return 'Stack Navigation'
  
  return 'Tab Navigation with Stack Navigation'
}

function detectDataNeeds(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()
  
  if (lowerPrompt.includes('database') || lowerPrompt.includes('storage')) return 'Local Database with Cloud Sync'
  if (lowerPrompt.includes('offline')) return 'Offline-First Storage'
  if (lowerPrompt.includes('api')) return 'API Integration with Caching'
  
  return 'Local Storage with Optional Cloud Integration'
}

function detectComplexity(prompt: string): 'simple' | 'medium' | 'complex' {
  const features = extractFeatures(prompt)
  const screens = estimateScreens(prompt)
  
  if (features.length <= 2 && screens <= 5) return 'simple'
  if (features.length <= 5 && screens <= 10) return 'medium'
  return 'complex'
}

function estimateScreens(prompt: string): number {
  const lowerPrompt = prompt.toLowerCase()
  let screens = 3 // Base: Home, Detail, Profile
  
  if (lowerPrompt.includes('login') || lowerPrompt.includes('auth')) screens += 2
  if (lowerPrompt.includes('search')) screens += 1
  if (lowerPrompt.includes('settings')) screens += 1
  if (lowerPrompt.includes('list') || lowerPrompt.includes('browse')) screens += 1
  if (lowerPrompt.includes('form') || lowerPrompt.includes('create')) screens += 1
  if (lowerPrompt.includes('chat') || lowerPrompt.includes('message')) screens += 2
  if (lowerPrompt.includes('camera') || lowerPrompt.includes('photo')) screens += 1
  
  return Math.min(screens, 12) // Cap at 12 screens for reasonable complexity
}

// Create real Expo project using npx create-expo-app@latest
async function createRealExpoProject(
  appName: string,
  onProgress?: (progress: { type: string; message: string; file?: { path: string; content: string; isComplete: boolean } }) => void
): Promise<{ [key: string]: string }> {
  const tempDir = path.join(process.cwd(), 'temp-builds')
  const projectPath = path.join(tempDir, appName)
  
  try {
    // Ensure temp directory exists
    await fs.mkdir(tempDir, { recursive: true })
    
    onProgress?.({ type: 'log', message: '🚀 Running npx create-expo-app@latest...' })
    
    // Create the Expo project
    const createCommand = `npx create-expo-app@latest ${appName} --template blank-typescript`
    onProgress?.({ type: 'log', message: `📦 Executing: ${createCommand}` })
    
    execSync(createCommand, { 
      cwd: tempDir,
      stdio: 'pipe'
    })
    
    onProgress?.({ type: 'log', message: '✅ Expo project created successfully!' })
    
    // Read all generated files
    const files: { [key: string]: string } = {}
    
    async function readDirectory(dirPath: string, relativePath = '') {
      const items = await fs.readdir(dirPath, { withFileTypes: true })
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item.name)
        const relativeFilePath = relativePath ? `${relativePath}/${item.name}` : item.name
        
        // Skip node_modules and other unnecessary directories
        if (item.isDirectory() && !['node_modules', '.git', '.expo', 'dist'].includes(item.name)) {
          await readDirectory(fullPath, relativeFilePath)
        } else if (item.isFile()) {
          try {
            const content = await fs.readFile(fullPath, 'utf-8')
            files[relativeFilePath] = content
            
            onProgress?.({
              type: 'file_complete',
              message: `✅ Read ${relativeFilePath}`,
              file: { path: relativeFilePath, content, isComplete: true }
            })
          } catch (error) {
            console.warn(`Could not read file ${relativeFilePath}:`, error)
          }
        }
      }
    }
    
    await readDirectory(projectPath)
    
    // Clean up the temporary directory
    await fs.rm(projectPath, { recursive: true, force: true })
    
    onProgress?.({ type: 'log', message: `📁 Read ${Object.keys(files).length} files from generated project` })
    
    return files
    
    } catch (error) {
    onProgress?.({ type: 'log', message: `❌ Error creating Expo project: ${error}` })
    console.error('Error creating Expo project:', error)
    
    // Fallback to manual template generation
    return createManualTemplate()
  }
}

// Fallback manual template
function createManualTemplate(): { [key: string]: string } {
  return {
    'package.json': JSON.stringify({
      "name": "generated-expo-app",
      "version": "1.0.0",
      "main": "expo/AppEntry.js",
      "scripts": {
        "start": "expo start",
        "android": "expo start --android",
        "ios": "expo start --ios",
        "web": "expo start --web"
      },
      "dependencies": {
        "expo": "~53.0.0",
        "expo-status-bar": "~2.0.0",
        "react": "18.3.1",
        "react-native": "0.76.0",
        "@react-navigation/native": "^7.0.0",
        "@react-navigation/stack": "^7.0.0",
        "react-native-screens": "~4.0.0",
        "react-native-safe-area-context": "4.12.0"
      },
      "devDependencies": {
        "@babel/core": "^7.25.0",
        "@types/react": "~18.3.0",
        "typescript": "^5.3.0"
      }
    }, null, 2),
    
    'app.json': JSON.stringify({
      "expo": {
        "name": "Generated Expo App",
        "slug": "generated-expo-app",
        "version": "1.0.0",
        "orientation": "portrait",
        "icon": "./assets/icon.png",
        "userInterfaceStyle": "light",
        "newArchEnabled": true,
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
          "bundler": "metro",
          "output": "static",
          "favicon": "./assets/favicon.png"
        },
        "plugins": [
          "expo-router"
        ],
        "experiments": {
          "typedRoutes": true
        }
      }
    }, null, 2),
    
    'App.tsx': `import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Your Generated App!</Text>
      <Text style={styles.subtitle}>Built with Expo SDK 53</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});`,

    'tsconfig.json': JSON.stringify({
      "extends": "expo/tsconfig.base",
      "compilerOptions": {
        "strict": true
      }
    }, null, 2),
    
    'babel.config.js': `module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};`,

    'metro.config.js': `const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;`,

    '.gitignore': `# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# TypeScript v1 declaration files
typings/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Expo
.expo/
web-build/
dist/

# @generated expo-cli sync
expo-env.d.ts

# @end expo-cli`
  }
}

// Enhanced AI-powered customization
async function enhanceExpoProjectWithAI(
  baseFiles: { [key: string]: string },
  prompt: string,
  analysis: PromptAnalysis,
  onProgress?: (progress: { type: string; message: string; file?: { path: string; content: string; isComplete: boolean } }) => void
): Promise<{ [key: string]: string }> {
  onProgress?.({ type: 'log', message: '🤖 Enhancing project with AI-generated features...' })
  
  try {
    const enhancementPrompt = `Based on this user request: "${prompt}"

I have a base Expo TypeScript project. Please enhance it by:

1. Modifying App.tsx to include the requested features
2. Adding any necessary screens/components
3. Configuring navigation if needed
4. Adding required dependencies to package.json
5. Updating app.json with necessary permissions/plugins

Analysis of requirements:
- App Type: ${analysis.appType}
- Features: ${analysis.coreFeatures.join(', ')}
- Native Features: ${Object.entries(analysis.nativeFeatures).filter(([_, enabled]) => enabled).map(([feature, _]) => feature).join(', ')}
- Estimated Screens: ${analysis.estimatedScreens}

Generate ONLY the files that need to be modified/created. Use this format:
===FILE: filepath===
[file content]
===END===

Focus on creating a working, production-ready app with proper TypeScript types, error handling, and modern React Native patterns.`

    const response = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: 'You are an expert React Native Expo developer. Generate clean, production-ready code with proper TypeScript types and modern patterns.' },
        { role: 'user', content: enhancementPrompt }
      ],
      temperature: 0.2,
      maxTokens: 8000
    })

    const responseContent = response.choices[0]?.message?.content || ''
    const generatedContent = typeof responseContent === 'string' 
      ? responseContent 
      : Array.isArray(responseContent) 
        ? responseContent.map(chunk => 
            chunk.type === 'text' ? chunk.text : ''
          ).join('')
        : String(responseContent)
    
    // Parse the generated files
    const parsedFiles = parseCodeFromResponse(generatedContent)
    
    // Merge with base files
    const enhancedFiles = { ...baseFiles }
    
    for (const file of parsedFiles) {
      enhancedFiles[file.path] = file.content
      
      onProgress?.({
        type: 'file_complete',
        message: `✨ Enhanced ${file.path} with AI`,
        file: { path: file.path, content: file.content, isComplete: true }
      })
    }
    
    onProgress?.({ type: 'log', message: `🎯 Successfully enhanced ${parsedFiles.length} files with AI` })
    
    return enhancedFiles
    
  } catch (error) {
    onProgress?.({ type: 'log', message: `⚠️ AI enhancement failed, using base project: ${error}` })
    console.error('AI enhancement failed:', error)
    return baseFiles
  }
}

export async function generateExpoApp(
  prompt: string, 
  userId: string,
  onProgress?: (progress: { type: string; message: string; file?: { path: string; content: string; isComplete: boolean } }) => void
): Promise<{ [key: string]: string }> {
  try {
    console.log('Starting app generation for prompt:', prompt)
    
    // Step 1: Analyze the prompt
    onProgress?.({ type: 'log', message: '🔍 Analyzing your requirements with AI...' })
    const analysis = await analyzePrompt(prompt)
    
    // Generate a clean app name
    const appName = `expo-app-${Date.now()}`
    
    onProgress?.({ type: 'log', message: `📋 Detected: ${analysis.appType} with ${analysis.coreFeatures.length} core features` })
    onProgress?.({ type: 'log', message: `🎯 Complexity: ${analysis.complexity} (${analysis.estimatedScreens} screens estimated)` })
    
    // Step 2: Create real Expo project
    onProgress?.({ type: 'log', message: '🚀 Creating Expo project with create-expo-app@latest...' })
    const baseFiles = await createRealExpoProject(appName, onProgress)
    
    // Step 3: Enhance with AI
    onProgress?.({ type: 'log', message: '🤖 Customizing project based on your requirements...' })
    const enhancedFiles = await enhanceExpoProjectWithAI(baseFiles, prompt, analysis, onProgress)
    
    onProgress?.({ type: 'log', message: `✅ Successfully generated ${Object.keys(enhancedFiles).length} files!` })
    onProgress?.({ type: 'log', message: '🎉 Your Expo SDK 53 app is ready!' })
    
    return enhancedFiles
    
  } catch (error) {
    console.error('Generation failed:', error)
    onProgress?.({ type: 'log', message: `❌ Generation failed: ${error}` })
    
    // Return fallback template
    return createManualTemplate()
  }
}

 