import { Mistral } from '@mistralai/mistralai'

interface ComponentAnalysis {
  appType: string
  primaryScreens: string[]
  components: string[]
  dataModels: string[]
  navigationPattern: 'stack' | 'tabs' | 'drawer' | 'mixed'
  designSystem: 'modern' | 'minimal' | 'material' | 'ios'
  features: string[]
}

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || ''
})

// V0.dev Style: Direct Prompt → UI Code Generation
async function analyzePromptV0Style(prompt: string): Promise<ComponentAnalysis> {
  const lowerPrompt = prompt.toLowerCase()
  
  // Semantic analysis like V0.dev
  const features = []
  const components = []
  const screens = []
  const dataModels = []
  
  // App type detection
  let appType = 'Mobile App'
  if (lowerPrompt.includes('todo') || lowerPrompt.includes('task')) {
    appType = 'Todo App'
    screens.push('TodoList', 'AddTask', 'TaskDetail')
    components.push('TodoItem', 'TaskForm', 'PriorityBadge')
    dataModels.push('Task', 'Category')
    features.push('Task Management', 'Priority Levels', 'Completion Status')
  }
  
  if (lowerPrompt.includes('timer') || lowerPrompt.includes('pomodoro')) {
    if (appType === 'Todo App') {
      appType = 'Todo & Pomodoro App'
      screens.push('Timer', 'Settings')
      components.push('CircularTimer', 'TimerControls', 'SessionStats')
      dataModels.push('PomodoroSession')
      features.push('Pomodoro Timer', 'Work/Break Cycles', 'Statistics')
    } else {
      appType = 'Timer App'
      screens.push('Timer', 'History', 'Settings')
      components.push('CircularTimer', 'TimerControls', 'SessionList')
      dataModels.push('TimerSession')
    }
  }
  
  if (lowerPrompt.includes('chat') || lowerPrompt.includes('message')) {
    appType = 'Chat App'
    screens.push('ChatList', 'ChatRoom', 'Profile')
    components.push('MessageBubble', 'ChatInput', 'UserAvatar')
    dataModels.push('Message', 'User', 'Chat')
    features.push('Real-time Messaging', 'User Profiles', 'Chat History')
  }
  
  if (lowerPrompt.includes('shop') || lowerPrompt.includes('store') || lowerPrompt.includes('ecommerce')) {
    appType = 'E-commerce App'
    screens.push('ProductList', 'ProductDetail', 'Cart', 'Checkout')
    components.push('ProductCard', 'CartItem', 'SearchBar', 'FilterModal')
    dataModels.push('Product', 'CartItem', 'Order')
    features.push('Product Catalog', 'Shopping Cart', 'Search & Filter')
  }
  
  // Navigation pattern detection
  let navigationPattern: 'stack' | 'tabs' | 'drawer' | 'mixed' = 'stack'
  if (screens.length > 3) navigationPattern = 'tabs'
  if (screens.length > 5) navigationPattern = 'mixed'
  
  // Design system based on prompt keywords
  let designSystem: 'modern' | 'minimal' | 'material' | 'ios' = 'modern'
  if (lowerPrompt.includes('minimal') || lowerPrompt.includes('clean')) designSystem = 'minimal'
  if (lowerPrompt.includes('material')) designSystem = 'material'
  if (lowerPrompt.includes('ios') || lowerPrompt.includes('apple')) designSystem = 'ios'
  
  return {
    appType,
    primaryScreens: screens.length > 0 ? screens : ['Home'],
    components: components.length > 0 ? components : ['Header', 'Button', 'Card'],
    dataModels: dataModels.length > 0 ? dataModels : ['AppData'],
    navigationPattern,
    designSystem,
    features: features.length > 0 ? features : ['Core Functionality']
  }
}

// V0.dev Style: Zero-shot UI Generation with Retry Logic
async function generateCompleteApp(
  prompt: string,
  analysis: ComponentAnalysis,
  onProgress?: (progress: { type: string; message: string; file?: { path: string; content: string; isComplete: boolean } }) => void,
  attempt: number = 1
): Promise<{ [key: string]: string }> {
  
  const maxAttempts = 3
  const baseDelay = 2000 // 2 seconds
  
  onProgress?.({ type: 'log', message: `🎨 AI Generation Attempt ${attempt}/${maxAttempts}` })
  onProgress?.({ type: 'log', message: `📱 Generating ${analysis.appType}` })
  onProgress?.({ type: 'log', message: `🧩 Creating ${analysis.components.length} components` })
  onProgress?.({ type: 'log', message: `📄 Building ${analysis.primaryScreens.length} screens` })
  
  const v0StylePrompt = `Create a complete React Native Expo app: "${prompt}"

REQUIREMENTS:
- App Type: ${analysis.appType}
- Screens: ${analysis.primaryScreens.join(', ')}
- Components: ${analysis.components.join(', ')}
- Navigation: ${analysis.navigationPattern}
- Features: ${analysis.features.join(', ')}

Generate COMPLETE working files. Use this EXACT format:

===FILE: package.json===
{
  "name": "${analysis.appType.toLowerCase().replace(/[^a-z0-9]/g, '-')}",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "npx expo start",
    "android": "npx expo start --android",
    "ios": "npx expo start --ios",
    "web": "npx expo start --web",
    "build": "npx expo build",
    "prebuild": "npx expo prebuild"
  },
  "dependencies": {
    // AI: Choose latest compatible versions for these core dependencies and add any additional ones needed:
    // - expo (latest stable)
    // - expo-router (latest)
    // - react (compatible with expo)
    // - react-native (compatible with expo)
    // - expo-status-bar, expo-linking, expo-constants, expo-splash-screen
    // - react-native-screens, react-native-safe-area-context
    // - react-native-gesture-handler, react-native-reanimated
    // - @react-native-async-storage/async-storage (for data persistence)
    // - @expo/vector-icons (for icons)
    // - nativewind (for Tailwind CSS styling)
    // - Add any other dependencies needed for the specific app functionality
  },
  "devDependencies": {
    // AI: Choose latest compatible versions for:
    // - @babel/core, @types/react, @types/react-native, typescript
    // - tailwindcss (for NativeWind)
    // - Add any other dev dependencies needed
  },
  "private": true
}
===END===

===FILE: app.json===
{
  "expo": {
    "name": "${analysis.appType}",
    "slug": "${analysis.appType.toLowerCase().replace(/[^a-z0-9]/g, '-')}",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.${analysis.appType.toLowerCase().replace(/[^a-z0-9]/g, '')}"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.${analysis.appType.toLowerCase().replace(/[^a-z0-9]/g, '')}"
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "scheme": "${analysis.appType.toLowerCase().replace(/[^a-z0-9]/g, '-')}",
    "experiments": {
      "typedRoutes": true
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/splash.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ]
  }
}
===END===

===FILE: tailwind.config.js===
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
===END===

===FILE: metro.config.js===
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
===END===

===FILE: babel.config.js===
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      'react-native-reanimated/plugin',
    ],
  };
};
===END===

===FILE: tsconfig.json===
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["components/*"],
      "@/hooks/*": ["hooks/*"],
      "@/types/*": ["types/*"],
      "@/constants/*": ["constants/*"],
      "@/utils/*": ["utils/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
===END===

===FILE: global.css===
@tailwind base;
@tailwind components;
@tailwind utilities;
===END===

Continue this pattern for ALL remaining files. Create a COMPLETE, WORKING ${analysis.appType} with:

MUST INCLUDE ALL THESE FILES:
1. app/_layout.tsx (Expo Router root layout with proper setup)
2. app/index.tsx (Main screen using Expo Router)
3. All required screens in app/ directory (${analysis.primaryScreens.join(', ')})
4. components/ folder with reusable components (${analysis.components.join(', ')})
5. types/index.ts (TypeScript interfaces for all data structures)
6. constants/Colors.ts (Theme colors and design tokens)
7. hooks/ folder with custom hooks for business logic
8. utils/ folder with helper functions

CRITICAL REQUIREMENTS:
- Use current Expo CLI commands ("npx expo start", not deprecated "expo start")
- Choose the LATEST STABLE versions for all dependencies yourself
- Add ANY additional dependencies needed for the app functionality
- Use Expo Router (file-based routing) with proper _layout.tsx
- Use TypeScript with strict typing and proper interfaces
- Use NativeWind for styling (Tailwind CSS for React Native)
- Use modern React Native patterns (hooks, functional components only)
- Include proper error boundaries and loading states
- Use modern async/await patterns and proper error handling
- Include proper state management (useState, useEffect, useContext)
- Add accessibility support (accessibilityLabel, accessibilityHint)
- Use expo-constants, expo-system-ui, and other modern Expo APIs appropriately
- Make it a FULLY FUNCTIONAL ${analysis.appType} with ALL ${analysis.features.join(', ')}
- Include working business logic, not just UI mockups
- Add proper data persistence using AsyncStorage
- Include proper gesture handling if needed
- Add proper TypeScript types for all props, state, and function parameters
- Include proper loading states, error states, and empty states

NEVER generate:
- Deprecated Expo CLI commands (like "expo start")
- Hardcoded dependency versions (let AI choose latest stable)
- Old React Navigation patterns (use Expo Router)
- Class components (functional components only)
- Placeholder code or TODOs
- Incomplete functions or missing implementations
- Missing TypeScript types

ALWAYS generate COMPLETE, FUNCTIONAL code that works immediately after running 'npx expo start'!`

  onProgress?.({ type: 'log', message: '🤖 Generating complete app with Mistral Medium...' })
  onProgress?.({ type: 'log', message: `🔑 API Key present: ${process.env.MISTRAL_API_KEY ? 'Yes' : 'No'}` })
  
  try {
    // Use Mistral Medium for best results
    const models = ['mistral-medium-latest', 'mistral-small-latest', 'magistral-small-latest']
    let modelToUse = models[Math.min(attempt - 1, models.length - 1)]
    
    onProgress?.({ type: 'log', message: `🎯 Using model: ${modelToUse}` })
    onProgress?.({ type: 'log', message: `🔗 Making API request to Mistral...` })
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('API request timed out after 60 seconds')), 60000)
    )
    
    const apiCallPromise = mistral.chat.complete({
      model: modelToUse,
      messages: [
        {
          role: 'system',
          content: `You are an expert React Native developer who creates PRODUCTION-READY Expo apps. Generate COMPLETE, WORKING mobile applications that follow 2024 best practices.

CRITICAL REQUIREMENTS:
1. ALWAYS use the EXACT format: ===FILE: filename=== content ===END===
2. Generate ALL files needed for a WORKING app that can run immediately
3. Use LATEST STABLE versions for all dependencies (choose them yourself, don't use hardcoded versions)
4. Use NEW Expo CLI commands ("npx expo start", NOT deprecated "expo start")
5. Use Expo Router (file-based routing) - NOT React Navigation directly
6. Use TypeScript with proper interfaces and types for everything
7. Use NativeWind (Tailwind CSS for React Native) for styling
8. Use modern React hooks and functional components only
9. Include proper error boundaries and loading states
10. Add accessibility support (accessibilityLabel, accessibilityHint)
11. Use async/await patterns, not callbacks
12. Include proper state management (useState, useEffect, useContext)
13. Add proper gesture handling with react-native-gesture-handler
14. Use expo-constants, expo-system-ui, and other modern Expo APIs
15. Generate working business logic, not just UI placeholders
16. Include proper TypeScript types for all props and state
17. Add proper error handling and validation
18. Use modern Metro bundler configuration
19. Include proper Babel and TypeScript configurations
20. Add ANY additional dependencies needed for the app functionality

VERSION SELECTION:
- YOU choose the latest stable versions for all dependencies
- Add any extra dependencies needed for the specific app features
- Don't use hardcoded versions - select appropriate ones yourself

FOLDER STRUCTURE REQUIREMENTS:
- app/ directory with Expo Router files (_layout.tsx, index.tsx, etc.)
- components/ directory with reusable TypeScript components
- types/ directory with TypeScript interfaces
- constants/ directory with app constants
- hooks/ directory with custom React hooks
- utils/ directory with helper functions

NEVER generate:
- Deprecated Expo CLI commands (like "expo start")
- Hardcoded dependency versions (choose latest stable yourself)
- Old React Navigation patterns (use Expo Router)
- Class components (functional components only)
- Placeholder code or TODOs
- Incomplete functions or missing implementations
- Missing TypeScript types
- Old Metro or Babel configs

ALWAYS generate COMPLETE, FUNCTIONAL code that works immediately after running 'npx expo start'!`
        },
        { role: 'user', content: v0StylePrompt }
      ],
      temperature: 0.1, // Lower for more consistent output
      maxTokens: 20000  // Higher for complete apps
    })

    const response = await Promise.race([apiCallPromise, timeoutPromise]) as any

    const responseContent = response.choices[0]?.message?.content || ''
    const content = typeof responseContent === 'string' 
      ? responseContent 
      : Array.isArray(responseContent) 
        ? responseContent.map(chunk => chunk.type === 'text' ? chunk.text : '').join('')
        : String(responseContent)
    onProgress?.({ type: 'log', message: `📝 Generated ${content.length} characters of code` })
    
    // Add validation for response
    if (!content || content.length < 100) {
      throw new Error(`API response too short or empty. Length: ${content.length}`)
    }
    
    onProgress?.({ type: 'log', message: `🔍 Parsing AI response...` })
    
    // Parse V0-style output
    const files = await parseV0StyleResponse(content, onProgress)
    
    if (Object.keys(files).length === 0) {
      onProgress?.({ type: 'log', message: `❌ No files parsed from response. Content preview: ${content.substring(0, 200)}...` })
      throw new Error('AI response parsing failed - no files generated')
    }
    
    onProgress?.({ type: 'log', message: `✅ Generated ${Object.keys(files).length} complete files` })
    return files
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    onProgress?.({ type: 'log', message: `❌ Attempt ${attempt} failed: ${errorMessage}` })
    
    // Log specific error types for debugging
    if (errorMessage.includes('timeout')) {
      onProgress?.({ type: 'log', message: `🔍 Timeout suggests network or API issues` })
    } else if (errorMessage.includes('API') || errorMessage.includes('401') || errorMessage.includes('403')) {
      onProgress?.({ type: 'log', message: `🔍 This might be an API key issue. Check your MISTRAL_API_KEY.` })
    } else if (errorMessage.includes('rate limit')) {
      onProgress?.({ type: 'log', message: `🔍 Rate limit hit. Please wait and try again.` })
    }
    
    if (attempt < maxAttempts) {
      const delay = baseDelay * Math.pow(2, attempt - 1) // Exponential backoff
      onProgress?.({ type: 'log', message: `⏳ Retrying in ${delay/1000}s...` })
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return generateCompleteApp(prompt, analysis, onProgress, attempt + 1)
    }
    
    throw new Error(`AI Generation failed after ${maxAttempts} attempts: ${errorMessage}`)
  }
}

// Simulate progressive writing like v0.dev and ChatGPT
async function simulateProgressiveWriting(
  filePath: string,
  content: string,
  onProgress?: (progress: { type: string; message: string; file?: { path: string; content: string; isComplete: boolean } }) => void
) {
  if (!onProgress) return
  
  const chunkSize = Math.max(50, Math.floor(content.length / 20)) // Adaptive chunk size
  const delay = Math.max(50, Math.min(200, 2000 / Math.ceil(content.length / chunkSize))) // Adaptive delay
  
  let currentContent = ''
  
  for (let i = 0; i < content.length; i += chunkSize) {
    const chunk = content.slice(i, i + chunkSize)
    currentContent += chunk
    
    // Send progressive content update
    onProgress({
      type: 'file_progress',
      message: `Writing ${filePath}... (${Math.round((currentContent.length / content.length) * 100)}%)`,
      file: { path: filePath, content: currentContent, isComplete: false }
    })
    
    // Add delay to simulate typing
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}

// V0.dev Style: Clean file parsing
async function parseV0StyleResponse(
  response: string, 
  onProgress?: (progress: { type: string; message: string; file?: { path: string; content: string; isComplete: boolean } }) => void
): Promise<{ [key: string]: string }> {
  const files: { [key: string]: string } = {}
  
  onProgress?.({ type: 'log', message: `🔍 Raw response length: ${response.length} characters` })
  
  // Log first 500 characters to debug format
  onProgress?.({ type: 'log', message: `📝 Response preview: ${response.substring(0, 500)}...` })
  
  // V0.dev uses clear file markers - more robust pattern
  const filePattern = /===FILE:\s*([^\r\n]+)===\r?\n([\s\S]*?)(?====END===|===FILE:|$)/g
  let match
  let matchCount = 0
  
  onProgress?.({ type: 'log', message: `🔍 Looking for file patterns...` })
  
  while ((match = filePattern.exec(response)) !== null) {
    matchCount++
    const filePath = match[1].trim()
    let content = match[2].trim()
    
    // Remove ===END=== if it exists at the end
    content = content.replace(/===END===\s*$/, '').trim()
    
    onProgress?.({ type: 'log', message: `📄 Found file ${matchCount}: ${filePath} (${content.length} chars)` })
    
    if (filePath && content) {
      // Send file start event
      onProgress?.({
        type: 'file_start',
        message: `📄 Creating ${filePath}`,
        file: { path: filePath, content: '', isComplete: false }
      })
      
      // Simulate progressive writing like v0.dev
      await simulateProgressiveWriting(filePath, content, onProgress)
      
      // Add to files object
      files[filePath] = content
      
      // Send file complete event
      onProgress?.({
        type: 'file_complete',
        message: `✅ Created ${filePath}`,
        file: { path: filePath, content, isComplete: true }
      })
    } else {
      onProgress?.({ type: 'log', message: `⚠️ Skipping empty file: ${filePath}` })
    }
  }
  
  onProgress?.({ type: 'log', message: `📊 Total files parsed: ${Object.keys(files).length}` })
  
  // If no files found, try alternative parsing
  if (Object.keys(files).length === 0) {
    onProgress?.({ type: 'log', message: `🔍 No files found with ===FILE=== pattern, trying alternative parsing...` })
    
    // Try simpler pattern without ===END===
    const simpleFilePattern = /===FILE:\s*([^\r\n]+)===\r?\n([\s\S]+?)(?=\n===FILE:|$)/g
    let simpleMatch
    
    while ((simpleMatch = simpleFilePattern.exec(response)) !== null) {
      const filePath = simpleMatch[1].trim()
      const content = simpleMatch[2].trim()
      
      if (filePath && content) {
        files[filePath] = content
        onProgress?.({
          type: 'file_complete',
          message: `📄 Created ${filePath} (alternative parsing)`,
          file: { path: filePath, content, isComplete: true }
        })
      }
    }
  }
  
  return files
}

// Main V0.dev Style Generator
export async function generateV0StyleApp(
  prompt: string,
  userId: string,
  onProgress?: (progress: { type: string; message: string; file?: { path: string; content: string; isComplete: boolean } }) => void
): Promise<{ [key: string]: string }> {
  
  // Check API key first - PURE AI GENERATION ONLY
  if (!process.env.MISTRAL_API_KEY || process.env.MISTRAL_API_KEY.length < 10) {
    throw new Error('MISTRAL_API_KEY is required for pure AI generation. No templates - only AI-powered apps!')
  }
  
  try {
    onProgress?.({ type: 'log', message: '🚀 V0.dev-style Pure AI Generation starting...' })
    onProgress?.({ type: 'log', message: `📋 User Request: "${prompt}"` })
    onProgress?.({ type: 'log', message: '🤖 No templates - 100% AI-generated code!' })
    
    // Step 1: Semantic Analysis (like V0.dev)
    const analysis = await analyzePromptV0Style(prompt)
    onProgress?.({ type: 'log', message: `🧠 AI Analysis: ${analysis.appType}` })
    onProgress?.({ type: 'log', message: `🎯 Detected Features: ${analysis.features.join(', ')}` })
    onProgress?.({ type: 'log', message: `📱 Will create ${analysis.primaryScreens.length} screens: ${analysis.primaryScreens.join(', ')}` })
    
    // Step 2: Pure AI Generation (no templates at all)
    const files = await generateCompleteApp(prompt, analysis, onProgress)
    
    onProgress?.({ type: 'log', message: '🎉 Pure AI generation successful!' })
    onProgress?.({ type: 'log', message: `📦 Generated ${Object.keys(files).length} production-ready files` })
    onProgress?.({ type: 'log', message: '✨ Your custom React Native app is ready!' })
    
    return files
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    onProgress?.({ type: 'log', message: `❌ Generation failed: ${errorMessage}` })
    throw error
  }
}
