import { Mistral } from '@mistralai/mistralai'
import { parseCodeFromResponse } from '../utils/code-parser'
import { execSync } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

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
  complexity: 'simple' | 'medium' | 'complex'
  estimatedScreens: number
}

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || ''
})

// Analyze prompt to understand requirements
function analyzePrompt(prompt: string): PromptAnalysis {
  const lowerPrompt = prompt.toLowerCase()
  
  const features = []
  if (lowerPrompt.includes('auth') || lowerPrompt.includes('login')) features.push('User Authentication')
  if (lowerPrompt.includes('camera') || lowerPrompt.includes('photo')) features.push('Camera Integration')
  if (lowerPrompt.includes('location') || lowerPrompt.includes('gps')) features.push('Location Services')
  if (lowerPrompt.includes('notification') || lowerPrompt.includes('push')) features.push('Push Notifications')
  if (lowerPrompt.includes('offline') || lowerPrompt.includes('storage')) features.push('Offline Storage')
  if (lowerPrompt.includes('payment') || lowerPrompt.includes('purchase')) features.push('Payment Processing')
  
  let appType = 'Custom Mobile App'
  if (lowerPrompt.includes('todo') || lowerPrompt.includes('task')) appType = 'Task Management App'
  if (lowerPrompt.includes('chat') || lowerPrompt.includes('message')) appType = 'Messaging App'
  if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('shop')) appType = 'E-Commerce App'
  if (lowerPrompt.includes('social') || lowerPrompt.includes('feed')) appType = 'Social Media App'
  
  return {
    appType,
    coreFeatures: features.length > 0 ? features : ['Core App Functionality', 'User Interface'],
    nativeFeatures: {
      camera: lowerPrompt.includes('camera') || lowerPrompt.includes('photo'),
      location: lowerPrompt.includes('location') || lowerPrompt.includes('gps'),
      notifications: lowerPrompt.includes('notification') || lowerPrompt.includes('push'),
      storage: lowerPrompt.includes('storage') || lowerPrompt.includes('database'),
      authentication: lowerPrompt.includes('auth') || lowerPrompt.includes('login'),
      payments: lowerPrompt.includes('payment') || lowerPrompt.includes('purchase'),
      maps: lowerPrompt.includes('map') || lowerPrompt.includes('navigation'),
      socialSharing: lowerPrompt.includes('share') || lowerPrompt.includes('social')
    },
    complexity: features.length <= 2 ? 'simple' : features.length <= 5 ? 'medium' : 'complex',
    estimatedScreens: Math.min(3 + features.length, 10)
  }
}

// Create real Expo project using npx create-expo-app@latest
async function createRealExpoProject(
  projectName: string,
  onProgress?: (progress: { type: string; message: string; file?: { path: string; content: string; isComplete: boolean } }) => void
): Promise<{ [key: string]: string }> {
  const tempDir = path.join(os.tmpdir(), 'expo-builds')
  const projectPath = path.join(tempDir, projectName)
  
  try {
    // Ensure temp directory exists
    await fs.mkdir(tempDir, { recursive: true })
    
    onProgress?.({ type: 'log', message: '🚀 Running npx create-expo-app@latest...' })
    
    // Create the Expo project with latest template
    const createCommand = `npx create-expo-app@latest ${projectName} --template blank-typescript --yes`
    
    onProgress?.({ type: 'log', message: `📦 Creating: ${createCommand}` })
    
    execSync(createCommand, { 
      cwd: tempDir,
      stdio: 'pipe',
      timeout: 300000 // 5 minutes timeout
    })
    
    onProgress?.({ type: 'log', message: '✅ Expo project created successfully!' })
    
    // Read all generated files
    const files: { [key: string]: string } = {}
    
    async function readDirectory(dirPath: string, relativePath = '') {
      try {
        const items = await fs.readdir(dirPath, { withFileTypes: true })
        
        for (const item of items) {
          const fullPath = path.join(dirPath, item.name)
          const relativeFilePath = relativePath ? `${relativePath}/${item.name}` : item.name
          
          // Skip unnecessary directories and files
          if (item.isDirectory()) {
            if (!['node_modules', '.git', '.expo', 'dist', '.next'].includes(item.name)) {
              await readDirectory(fullPath, relativeFilePath)
            }
          } else if (item.isFile() && !item.name.startsWith('.DS_Store')) {
            try {
              const content = await fs.readFile(fullPath, 'utf-8')
              files[relativeFilePath] = content
              
              onProgress?.({
                type: 'file_complete',
                message: `📄 Read ${relativeFilePath}`,
                file: { path: relativeFilePath, content, isComplete: true }
              })
            } catch (error) {
              console.warn(`Could not read file ${relativeFilePath}:`, error)
            }
          }
        }
      } catch (error) {
        console.warn(`Could not read directory ${dirPath}:`, error)
      }
    }
    
    await readDirectory(projectPath)
    
    // Clean up the temporary directory
    try {
      await fs.rm(projectPath, { recursive: true, force: true })
    } catch (error) {
      console.warn('Could not clean up temp directory:', error)
    }
    
    onProgress?.({ type: 'log', message: `📁 Successfully read ${Object.keys(files).length} files from generated project` })
    
    return files
    
  } catch (error) {
    onProgress?.({ type: 'log', message: `❌ Error creating Expo project: ${error}` })
    console.error('Error creating Expo project:', error)
    
    // Return minimal fallback template
    return {
      'package.json': JSON.stringify({
        "name": projectName,
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
          "react-native": "0.76.0"
        },
        "devDependencies": {
          "@babel/core": "^7.25.0",
          "@types/react": "~18.3.0",
          "typescript": "^5.3.0"
        }
      }, null, 2),
      
      'App.tsx': `import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Your App!</Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});`
    }
  }
}

// Enhance the project with AI-generated customizations
async function enhanceWithAI(
  baseFiles: { [key: string]: string },
  prompt: string,
  analysis: PromptAnalysis,
  onProgress?: (progress: { type: string; message: string; file?: { path: string; content: string; isComplete: boolean } }) => void
): Promise<{ [key: string]: string }> {
  if (!process.env.MISTRAL_API_KEY) {
    onProgress?.({ type: 'log', message: '⚠️ No Mistral API key, using base template' })
    return baseFiles
  }
  
  onProgress?.({ type: 'log', message: '🤖 Enhancing project with AI-generated features...' })
  
  try {
    const enhancementPrompt = `Based on this user request: "${prompt}"

I have a fresh Expo TypeScript project created with create-expo-app@latest. 

Requirements detected:
- App Type: ${analysis.appType}
- Core Features: ${analysis.coreFeatures.join(', ')}
- Native Features Needed: ${Object.entries(analysis.nativeFeatures).filter(([_, enabled]) => enabled).map(([feature, _]) => feature).join(', ')}
- Estimated Complexity: ${analysis.complexity}

Please enhance the project by modifying/creating these files as needed:
1. App.tsx - Main app component with requested features
2. package.json - Add any necessary dependencies 
3. app.json - Add required permissions and plugins
4. Additional screens/components if needed

Use this exact format for each file:
===FILE: filename===
[complete file content]
===END===

Create a working, modern React Native app with:
- Proper TypeScript types
- Modern React Native patterns
- Clean, production-ready code
- Error handling
- Responsive design`

    const response = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: 'You are an expert React Native Expo developer. Generate clean, production-ready code with proper TypeScript types.' },
        { role: 'user', content: enhancementPrompt }
      ],
      temperature: 0.3,
      maxTokens: 6000
    })

    const responseContent = response.choices[0]?.message?.content || ''
    const generatedContent = typeof responseContent === 'string' 
      ? responseContent 
      : Array.isArray(responseContent) 
        ? responseContent.map(chunk => chunk.type === 'text' ? chunk.text : '').join('')
        : String(responseContent)
    
    // Parse generated files
    const parsedFiles = parseCodeFromResponse(generatedContent)
    
    // Merge with base files
    const enhancedFiles = { ...baseFiles }
    
    for (const file of parsedFiles) {
      enhancedFiles[file.path] = file.content
      
      onProgress?.({
        type: 'file_complete',
        message: `✨ Enhanced ${file.path}`,
        file: { path: file.path, content: file.content, isComplete: true }
      })
    }
    
    onProgress?.({ type: 'log', message: `🎯 Successfully enhanced ${parsedFiles.length} files with AI` })
    
    return enhancedFiles
    
  } catch (error) {
    onProgress?.({ type: 'log', message: `⚠️ AI enhancement failed, using base project: ${error}` })
    return baseFiles
  }
}

// Main export function
export async function generateRealExpoApp(
  prompt: string, 
  userId: string,
  onProgress?: (progress: { type: string; message: string; file?: { path: string; content: string; isComplete: boolean } }) => void
): Promise<{ [key: string]: string }> {
  try {
    console.log('Starting real Expo app generation for prompt:', prompt)
    
    // Step 1: Analyze requirements
    onProgress?.({ type: 'log', message: '🔍 Analyzing your app requirements...' })
    const analysis = analyzePrompt(prompt)
    
    const projectName = `expo-app-${Date.now()}`
    
    onProgress?.({ type: 'log', message: `📋 Creating ${analysis.appType} with ${analysis.coreFeatures.length} features` })
    
    // Step 2: Create real Expo project
    onProgress?.({ type: 'log', message: '🚀 Using npx create-expo-app@latest for latest structure...' })
    const baseFiles = await createRealExpoProject(projectName, onProgress)
    
    // Step 3: Enhance with AI customizations
    if (Object.keys(baseFiles).length > 0) {
      onProgress?.({ type: 'log', message: '🤖 Customizing with AI based on your requirements...' })
      const finalFiles = await enhanceWithAI(baseFiles, prompt, analysis, onProgress)
      
      onProgress?.({ type: 'log', message: '✅ Real Expo SDK 53 project ready!' })
      onProgress?.({ type: 'log', message: `📦 Generated ${Object.keys(finalFiles).length} files with latest Expo structure` })
      
      return finalFiles
    } else {
      throw new Error('Failed to create Expo project')
    }
    
  } catch (error) {
    console.error('Real Expo generation failed:', error)
    onProgress?.({ type: 'log', message: `❌ Generation failed: ${error}` })
    
    // Return basic template as fallback
    return {
      'package.json': JSON.stringify({
        "name": "fallback-expo-app",
        "version": "1.0.0",
        "scripts": {
          "start": "expo start",
          "android": "expo start --android", 
          "ios": "expo start --ios"
        },
        "dependencies": {
          "expo": "~53.0.0",
          "react": "18.3.1",
          "react-native": "0.76.0"
        }
      }, null, 2),
      
      'App.tsx': `import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Your Expo App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: 'bold' }
});`
    }
  }
} 