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
  "name": "expo-app",
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
    "react": "19.1.0",
    "react-native": "0.76.8",
    "@react-navigation/native": "^7.0.0",
    "@react-navigation/stack": "^7.0.0",
    "react-native-screens": "~4.1.0",
    "react-native-safe-area-context": "4.14.0",
    "@react-native-async-storage/async-storage": "1.25.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "@types/react": "~19.0.0",
    "@types/react-native": "~0.76.0",
    "typescript": "^5.3.0"
  },
  "private": true
}
===END===

===FILE: app.json===
{
  "expo": {
    "name": "${analysis.appType.toLowerCase()}",
    "slug": "expo-app",
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
        "backgroundColor": "#FFFFFF"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
===END===

Continue this pattern for ALL remaining files. Create:
- App.tsx with navigation
- All screens: ${analysis.primaryScreens.join(', ')}
- All components: ${analysis.components.join(', ')}
- Types file with interfaces
- Any additional files needed

IMPORTANT: Make it a fully functional ${analysis.appType} with working ${analysis.features.join(', ')}.`

  onProgress?.({ type: 'log', message: '🤖 Generating complete app with Mistral Medium...' })
  onProgress?.({ type: 'log', message: `🔑 API Key present: ${process.env.MISTRAL_API_KEY ? 'Yes' : 'No'}` })
  
  try {
    // Use Mistral Medium for best results
    const models = ['mistral-medium-latest', 'mistral-small-latest', 'magistral-small-latest']
    let modelToUse = models[Math.min(attempt - 1, models.length - 1)]
    
    onProgress?.({ type: 'log', message: `🎯 Using model: ${modelToUse}` })
    
    const response = await mistral.chat.complete({
      model: modelToUse,
      messages: [
        {
          role: 'system',
          content: `You are V0.dev for React Native. Generate COMPLETE, PRODUCTION-READY mobile apps. CRITICAL RULES:
1. ALWAYS use the EXACT format: ===FILE: filename=== content ===END===
2. Generate ALL files needed for a working app
3. Include proper imports, exports, and TypeScript types
4. Use modern React Native patterns and navigation
5. Create fully functional components with real logic
6. NO placeholders or TODO comments - only working code
7. MUST include: package.json, app.json, App.tsx, and all screens/components`
        },
        { role: 'user', content: v0StylePrompt }
      ],
      temperature: 0.1, // Lower for more consistent output
      maxTokens: 20000  // Higher for complete apps
    })

    const responseContent = response.choices[0]?.message?.content || ''
    const content = typeof responseContent === 'string' 
      ? responseContent 
      : Array.isArray(responseContent) 
        ? responseContent.map(chunk => chunk.type === 'text' ? chunk.text : '').join('')
        : String(responseContent)
    onProgress?.({ type: 'log', message: `📝 Generated ${content.length} characters of code` })
    
    // Parse V0-style output
    const files = parseV0StyleResponse(content, onProgress)
    
    if (Object.keys(files).length === 0) {
      throw new Error('AI response parsing failed - no files generated')
    }
    
    onProgress?.({ type: 'log', message: `✅ Generated ${Object.keys(files).length} complete files` })
    return files
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    onProgress?.({ type: 'log', message: `❌ Attempt ${attempt} failed: ${errorMessage}` })
    
    if (attempt < maxAttempts) {
      const delay = baseDelay * Math.pow(2, attempt - 1) // Exponential backoff
      onProgress?.({ type: 'log', message: `⏳ Retrying in ${delay/1000}s...` })
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return generateCompleteApp(prompt, analysis, onProgress, attempt + 1)
    }
    
    throw new Error(`AI Generation failed after ${maxAttempts} attempts: ${errorMessage}`)
  }
}

// V0.dev Style: Clean file parsing
function parseV0StyleResponse(
  response: string, 
  onProgress?: (progress: { type: string; message: string; file?: { path: string; content: string; isComplete: boolean } }) => void
): { [key: string]: string } {
  const files: { [key: string]: string } = {}
  
  // V0.dev uses clear file markers - more robust pattern
  const filePattern = /===FILE:\s*([^\r\n]+)===\r?\n([\s\S]*?)(?====END===|===FILE:|$)/g
  let match
  
  while ((match = filePattern.exec(response)) !== null) {
    const filePath = match[1].trim()
    const content = match[2].trim()
    
    if (filePath && content) {
      files[filePath] = content
      onProgress?.({
        type: 'file_complete',
        message: `📄 Created ${filePath}`,
        file: { path: filePath, content, isComplete: true }
      })
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