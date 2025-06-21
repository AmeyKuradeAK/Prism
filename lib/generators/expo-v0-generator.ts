import { Mistral } from '@mistralai/mistralai'

interface ComponentAnalysis {
  appType: string
  primaryScreens: string[]
  components: string[]
  dataModels: string[]
  navigationPattern: 'stack' | 'tabs' | 'drawer' | 'mixed'
  designSystem: 'modern' | 'minimal' | 'material' | 'ios'
  features: string[]
  nativeFeatures: string[]
}

interface GeneratedFile {
  path: string
  content: string
  isComplete: boolean
}

interface V0StyleResponse {
  files: { [key: string]: string }
  metadata: {
    totalFiles: number
    appType: string
    features: string[]
    nativeFeatures: string[]
    generatedAt: string
  }
}

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || ''
})

// React Native V0.dev Style: Advanced Prompt Analysis
async function analyzePromptV0Style(prompt: string): Promise<ComponentAnalysis> {
  const lowerPrompt = prompt.toLowerCase()
  
  // Semantic analysis for React Native apps
  const features = []
  const nativeFeatures = []
  const components = []
  const screens = []
  const dataModels = []
  
  // App type detection with React Native focus
  let appType = 'React Native App'
  
  // Todo/Task Apps
  if (lowerPrompt.includes('todo') || lowerPrompt.includes('task')) {
    appType = 'Todo & Productivity App'
    screens.push('TodoList', 'AddTask', 'TaskDetail', 'Categories')
    components.push('TodoItem', 'TaskForm', 'PriorityBadge', 'CategoryPicker')
    dataModels.push('Task', 'Category', 'User')
    features.push('Task Management', 'Priority Levels', 'Categories', 'Search')
    nativeFeatures.push('Push Notifications', 'Local Storage', 'Haptic Feedback')
  }
  
  // Timer/Pomodoro Apps
  if (lowerPrompt.includes('timer') || lowerPrompt.includes('pomodoro')) {
    if (appType.includes('Todo')) {
      appType = 'Todo & Pomodoro Productivity App'
    } else {
      appType = 'Timer & Focus App'
    }
    screens.push('Timer', 'Statistics', 'Settings')
    components.push('CircularTimer', 'TimerControls', 'SessionStats', 'SoundPicker')
    dataModels.push('PomodoroSession', 'Settings')
    features.push('Focus Timer', 'Break Reminders', 'Statistics', 'Custom Sounds')
    nativeFeatures.push('Background Timer', 'Push Notifications', 'Sound Playback', 'Vibration')
  }
  
  // Chat/Social Apps
  if (lowerPrompt.includes('chat') || lowerPrompt.includes('message') || lowerPrompt.includes('social')) {
    appType = 'Chat & Social App'
    screens.push('ChatList', 'ChatRoom', 'Profile', 'Contacts')
    components.push('MessageBubble', 'ChatInput', 'UserAvatar', 'VoiceMessage')
    dataModels.push('Message', 'User', 'Chat', 'Contact')
    features.push('Real-time Messaging', 'User Profiles', 'Media Sharing')
    nativeFeatures.push('Camera', 'Image Picker', 'Push Notifications', 'Real-time Updates')
  }
  
  // E-commerce Apps
  if (lowerPrompt.includes('shop') || lowerPrompt.includes('store') || lowerPrompt.includes('ecommerce')) {
    appType = 'E-commerce Mobile App'
    screens.push('ProductList', 'ProductDetail', 'Cart', 'Checkout', 'Profile')
    components.push('ProductCard', 'CartItem', 'SearchBar', 'PaymentForm')
    dataModels.push('Product', 'CartItem', 'Order', 'User')
    features.push('Product Catalog', 'Shopping Cart', 'Payment', 'Order History')
    nativeFeatures.push('Barcode Scanner', 'Location Services', 'Push Notifications', 'Biometric Auth')
  }
  
  // Fitness/Health Apps
  if (lowerPrompt.includes('fitness') || lowerPrompt.includes('health') || lowerPrompt.includes('workout')) {
    appType = 'Fitness & Health App'
    screens.push('Dashboard', 'Workout', 'Progress', 'Settings')
    components.push('WorkoutCard', 'ProgressChart', 'TimerDisplay', 'ExerciseList')
    dataModels.push('Workout', 'Exercise', 'Progress', 'User')
    features.push('Workout Tracking', 'Progress Analytics', 'Exercise Library')
    nativeFeatures.push('Health Kit', 'Step Counter', 'Heart Rate', 'GPS Tracking')
  }
  
  // Photo/Camera Apps
  if (lowerPrompt.includes('photo') || lowerPrompt.includes('camera') || lowerPrompt.includes('image')) {
    appType = 'Photo & Camera App'
    screens.push('Gallery', 'Camera', 'Editor', 'Albums')
    components.push('PhotoGrid', 'CameraView', 'FilterSelector', 'EditTools')
    dataModels.push('Photo', 'Album', 'Filter')
    features.push('Photo Editing', 'Filters', 'Albums', 'Sharing')
    nativeFeatures.push('Camera', 'Photo Library', 'Image Processing', 'File System')
  }
  
  // Weather Apps
  if (lowerPrompt.includes('weather')) {
    appType = 'Weather App'
    screens.push('CurrentWeather', 'Forecast', 'Locations', 'Settings')
    components.push('WeatherCard', 'ForecastItem', 'LocationSearch', 'WeatherIcon')
    dataModels.push('WeatherData', 'Location', 'Forecast')
    features.push('Current Weather', '7-Day Forecast', 'Multiple Locations')
    nativeFeatures.push('Location Services', 'Background Refresh', 'Push Notifications')
  }
  
  // Navigation pattern for React Native
  let navigationPattern: 'stack' | 'tabs' | 'drawer' | 'mixed' = 'stack'
  if (screens.length > 3) navigationPattern = 'tabs'
  if (screens.length > 5 || lowerPrompt.includes('drawer') || lowerPrompt.includes('sidebar')) {
    navigationPattern = 'mixed' // Stack + Tabs + Drawer
  }
  
  // Design system
  let designSystem: 'modern' | 'minimal' | 'material' | 'ios' = 'modern'
  if (lowerPrompt.includes('minimal') || lowerPrompt.includes('clean')) designSystem = 'minimal'
  if (lowerPrompt.includes('material') || lowerPrompt.includes('android')) designSystem = 'material'
  if (lowerPrompt.includes('ios') || lowerPrompt.includes('apple') || lowerPrompt.includes('cupertino')) designSystem = 'ios'
  
  // Add common React Native features
  if (features.length === 0) {
    features.push('Cross-Platform UI', 'Responsive Design', 'Touch Interactions')
  }
  
  if (nativeFeatures.length === 0) {
    nativeFeatures.push('AsyncStorage', 'Status Bar', 'Safe Area')
  }
  
  return {
    appType,
    primaryScreens: screens.length > 0 ? screens : ['Home', 'Profile'],
    components: components.length > 0 ? components : ['Header', 'Button', 'Card'],
    dataModels: dataModels.length > 0 ? dataModels : ['AppData'],
    navigationPattern,
    designSystem,
    features: features.length > 0 ? features : ['Core Functionality'],
    nativeFeatures
  }
}

// React Native V0.dev Style: Structured System Prompt
function createReactNativeSystemPrompt(): string {
  return `You are an expert React Native mobile app developer specializing in Expo and modern mobile development patterns.

🎯 CRITICAL INSTRUCTION: You MUST return ONLY a valid JSON object with this EXACT structure:

{
  "files": {
    "package.json": "file content here",
    "app.json": "file content here", 
    "app/_layout.tsx": "file content here",
    "app/index.tsx": "file content here"
  }
}

📱 REACT NATIVE REQUIREMENTS:
- Use LATEST Expo SDK (52+) with Expo Router for navigation
- Use TypeScript with strict typing
- Use NativeWind (Tailwind CSS for React Native) for styling
- Include proper native mobile patterns (SafeAreaView, StatusBar, etc.)
- Add proper navigation structure (Stack, Tabs, Drawer as needed)
- Include React Native specific components (ScrollView, FlatList, etc.)
- Add proper gesture handling with react-native-gesture-handler
- Use AsyncStorage for data persistence
- Include proper error boundaries and loading states
- Add accessibility support (accessibilityLabel, accessibilityRole)

🔧 REQUIRED FILE STRUCTURE:
1. package.json - Latest Expo dependencies with proper scripts
2. app.json - Expo configuration with proper app settings
3. app/_layout.tsx - Root layout with navigation setup
4. app/index.tsx - Main home screen
5. app/(tabs)/_layout.tsx - Tab navigation (if needed)
6. app/(tabs)/[screen].tsx - Individual tab screens
7. components/[Component].tsx - Reusable components
8. types/index.ts - TypeScript interfaces
9. constants/Colors.ts - Theme colors
10. hooks/[hook].ts - Custom React hooks
11. utils/[utility].ts - Helper functions

📦 DEPENDENCIES TO INCLUDE:
- expo: ~52.0.0
- expo-router: ~4.0.0  
- react-native: 0.76.3
- typescript: ^5.3.0
- nativewind: ^2.0.11
- @react-native-async-storage/async-storage
- react-native-safe-area-context
- react-native-screens
- react-native-gesture-handler
- expo-status-bar
- Add any other dependencies needed for the specific app

🎨 UI/UX PATTERNS:
- Use mobile-first responsive design
- Implement proper touch interactions and gestures
- Add loading states, error states, and empty states
- Use proper mobile navigation patterns
- Include proper spacing and typography for mobile
- Add haptic feedback where appropriate
- Implement proper keyboard handling

🔥 NATIVE FEATURES TO CONSIDER:
- Camera and Image Picker (expo-camera, expo-image-picker)
- Location Services (expo-location)
- Push Notifications (expo-notifications)
- Device sensors (expo-sensors)
- File System (expo-file-system)
- Audio playback (expo-av)
- Biometric authentication (expo-local-authentication)
- Health data (expo-health)

⚠️ CRITICAL RULES:
1. Return ONLY valid JSON - no explanations, no prose, no markdown
2. Every file must be complete and functional
3. Use modern React Native patterns (hooks, functional components)
4. Include proper TypeScript types for everything
5. Make it production-ready code that runs immediately
6. Use proper mobile UI components and patterns
7. Include proper error handling and validation

Generate a complete, production-ready React Native mobile app that works immediately after 'npx expo start'!`
}

// React Native V0.dev Style: Rate-Limited API Call
async function callMistralWithRateLimit(
  prompt: string,
  analysis: ComponentAnalysis,
  onProgress?: (progress: { type: string; message: string; file?: GeneratedFile }) => void,
  attempt: number = 1
): Promise<string> {
  
  const maxAttempts = 3
  
  // Rate limit handling: 1 RPS = minimum 1 second between requests
  if (attempt > 1) {
    const waitTime = Math.max(2000, attempt * 1000) // 2s, 3s, 4s
    onProgress?.({ type: 'log', message: `⏳ Respecting rate limit: waiting ${waitTime/1000}s before attempt ${attempt}` })
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }
  
  onProgress?.({ type: 'log', message: `🚀 React Native AI Generation - Attempt ${attempt}/${maxAttempts}` })
  
  // React Native V0.dev Style User Prompt
  const reactNativePrompt = `Create a complete React Native Expo mobile app: "${prompt}"

📱 APP REQUIREMENTS:
- App Type: ${analysis.appType}
- Screens: ${analysis.primaryScreens.join(', ')}
- Navigation: ${analysis.navigationPattern}  
- Design: ${analysis.designSystem}
- Features: ${analysis.features.join(', ')}
- Native Features: ${analysis.nativeFeatures.join(', ')}

🎯 MOBILE-FIRST CONSIDERATIONS:
- Optimize for touch interactions and mobile gestures
- Use proper mobile navigation patterns (tabs, stack, drawer)
- Include proper safe area handling for iOS/Android
- Add loading states and error handling for mobile UX
- Use AsyncStorage for offline data persistence
- Include proper keyboard handling and form validation
- Add haptic feedback and native mobile animations
- Implement proper image handling and camera integration if needed

Create a complete, production-ready React Native mobile app with all requested features using Expo Router, TypeScript, and NativeWind styling.`

  try {
    onProgress?.({ type: 'log', message: `🤖 Calling Mistral AI for React Native generation` })
    onProgress?.({ type: 'log', message: `📱 Generating ${analysis.appType} with ${analysis.nativeFeatures.length} native features` })
    
    const response = await Promise.race([
      mistral.chat.complete({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: createReactNativeSystemPrompt()
          },
          { 
            role: 'user', 
            content: reactNativePrompt
          }
        ],
        temperature: 0.1,
        maxTokens: 12000 // Larger for React Native apps
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout after 45 seconds')), 45000)
      )
    ]) as any

    const content = response.choices?.[0]?.message?.content || ''
    
    if (!content || content.length < 100) {
      throw new Error(`Invalid API response: ${content.length} characters`)
    }
    
    onProgress?.({ type: 'log', message: `✅ React Native AI response received: ${content.length} characters` })
    return content
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    onProgress?.({ type: 'log', message: `❌ React Native AI generation failed (attempt ${attempt}): ${errorMessage}` })
    
    if (attempt < maxAttempts) {
      return callMistralWithRateLimit(prompt, analysis, onProgress, attempt + 1)
    }
    
    throw new Error(`React Native AI generation failed after ${maxAttempts} attempts: ${errorMessage}`)
  }
}

// React Native V0.dev Style: Enhanced JSON Parser
function parseReactNativeV0Response(response: string): { [key: string]: string } {
  const files: { [key: string]: string } = {}
  
  try {
    // First, try to extract JSON from the response
    let jsonStart = response.indexOf('{')
    let jsonEnd = response.lastIndexOf('}') + 1
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON structure found in response')
    }
    
    const jsonString = response.slice(jsonStart, jsonEnd)
    const parsed = JSON.parse(jsonString)
    
    if (parsed.files && typeof parsed.files === 'object') {
      // V0.dev style: files object
      Object.entries(parsed.files).forEach(([path, content]) => {
        if (typeof content === 'string' && content.length > 10) {
          files[path] = content
        }
      })
    } else {
      throw new Error('Invalid JSON structure - missing files object')
    }
  } catch (jsonError) {
    // Fallback: Try file pattern parsing
    const filePattern = /===FILE:\s*([^\r\n]+)===\r?\n([\s\S]*?)(?====END===|===FILE:|$)/g
    let match
    
    while ((match = filePattern.exec(response)) !== null) {
      const filePath = match[1].trim()
      const content = match[2].trim()
      
      if (filePath && content && content.length > 10) {
        files[filePath] = content
      }
    }
    
    // If still no files, try code block parsing
    if (Object.keys(files).length === 0) {
      const codeBlockPattern = /```(?:\w+)?\s*(?:\/\/\s*)?([^\n]+)\n([\s\S]*?)```/g
      let codeMatch
      
      while ((codeMatch = codeBlockPattern.exec(response)) !== null) {
        const fileName = codeMatch[1]?.trim()
        const content = codeMatch[2]?.trim()
        
        if (fileName && content) {
          files[fileName] = content
        }
      }
    }
  }
  
  return files
}

// React Native V0.dev Style: Instant File Updates
function emitReactNativeFileUpdates(
  files: { [key: string]: string },
  metadata: any,
  onProgress?: (progress: { type: string; message: string; file?: GeneratedFile }) => void
) {
  const fileNames = Object.keys(files)
  
  // Emit all files instantly (V0.dev style)
  fileNames.forEach((filePath, index) => {
    onProgress?.({
      type: 'file_complete',
      message: `📱 Generated ${filePath}`,
      file: {
        path: filePath,
        content: files[filePath],
        isComplete: true
      }
    })
  })
  
  onProgress?.({ type: 'log', message: `🎉 Generated ${fileNames.length} React Native files instantly!` })
  onProgress?.({ type: 'log', message: `📱 App Type: ${metadata.appType}` })
  onProgress?.({ type: 'log', message: `🔧 Features: ${metadata.features.join(', ')}` })
  onProgress?.({ type: 'log', message: `📲 Native Features: ${metadata.nativeFeatures.join(', ')}` })
}

// Main React Native V0.dev Style Generator
export async function generateV0StyleApp(
  prompt: string,
  userId: string,
  onProgress?: (progress: { type: string; message: string; file?: GeneratedFile }) => void
): Promise<V0StyleResponse> {
  
  // Validate API key
  if (!process.env.MISTRAL_API_KEY || process.env.MISTRAL_API_KEY.length < 10) {
    throw new Error('MISTRAL_API_KEY is required for React Native AI generation')
  }
  
  try {
    onProgress?.({ type: 'log', message: '🚀 React Native V0.dev-style AI Generation Starting!' })
    onProgress?.({ type: 'log', message: `📱 User Request: "${prompt.substring(0, 100)}..."` })
    onProgress?.({ type: 'log', message: '🎯 Pure AI - No Templates, Mobile-First React Native!' })
    
    // Step 1: Advanced React Native Analysis
    const analysis = await analyzePromptV0Style(prompt)
    onProgress?.({ type: 'log', message: `🧠 Analysis: ${analysis.appType}` })
    onProgress?.({ type: 'log', message: `📱 Screens: ${analysis.primaryScreens.join(', ')}` })
    onProgress?.({ type: 'log', message: `🔧 Features: ${analysis.features.join(', ')}` })
    onProgress?.({ type: 'log', message: `📲 Native: ${analysis.nativeFeatures.join(', ')}` })
    
    // Step 2: Rate-Limited React Native AI Call
    const rawResponse = await callMistralWithRateLimit(prompt, analysis, onProgress)
    
    // Step 3: Enhanced JSON Parsing
    onProgress?.({ type: 'log', message: '⚡ Parsing React Native JSON response...' })
    const files = parseReactNativeV0Response(rawResponse)
    
    if (Object.keys(files).length === 0) {
      throw new Error('No React Native files generated from AI response')
    }
    
    // Step 4: V0.dev Style Response Structure
    const v0Response: V0StyleResponse = {
      files,
      metadata: {
        totalFiles: Object.keys(files).length,
        appType: analysis.appType,
        features: analysis.features,
        nativeFeatures: analysis.nativeFeatures,
        generatedAt: new Date().toISOString()
      }
    }
    
    // Step 5: Instant File Updates (V0.dev style)
    emitReactNativeFileUpdates(files, v0Response.metadata, onProgress)
    
    onProgress?.({ type: 'log', message: `✨ Success! Generated ${v0Response.metadata.totalFiles} React Native files` })
    onProgress?.({ type: 'log', message: '📱 Ready for mobile development and testing!' })
    onProgress?.({ type: 'log', message: '🚀 Run "npx expo start" to test on device!' })
    
    return v0Response
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    onProgress?.({ type: 'log', message: `❌ React Native generation failed: ${errorMessage}` })
    throw error
  }
}

// V0.dev Style: In-Memory File System for React Native
export class ReactNativeV0FileSystem {
  private files: Map<string, string> = new Map()
  private metadata: any = {}
  
  // Add React Native files to in-memory storage
  addFiles(files: { [key: string]: string }, metadata: any = {}) {
    Object.entries(files).forEach(([path, content]) => {
      this.files.set(path, content)
    })
    this.metadata = { ...this.metadata, ...metadata }
  }
  
  // Get all files as JSON (for API response)
  getFilesAsJSON(): { files: { [key: string]: string }, metadata: any } {
    const files: { [key: string]: string } = {}
    this.files.forEach((content, path) => {
      files[path] = content
    })
    return { files, metadata: this.metadata }
  }
  
  // Get React Native project structure
  getProjectStructure(): { [key: string]: string[] } {
    const structure: { [key: string]: string[] } = {}
    
    this.files.forEach((content, path) => {
      const parts = path.split('/')
      if (parts.length === 1) {
        if (!structure['root']) structure['root'] = []
        structure['root'].push(path)
      } else {
        const dir = parts[0]
        if (!structure[dir]) structure[dir] = []
        structure[dir].push(path)
      }
    })
    
    return structure
  }
  
  // Check if it's a valid React Native project
  isValidReactNativeProject(): boolean {
    const hasPackageJson = this.files.has('package.json')
    const hasAppJson = this.files.has('app.json')
    const hasLayout = this.files.has('app/_layout.tsx')
    const hasIndex = this.files.has('app/index.tsx')
    
    return hasPackageJson && hasAppJson && hasLayout && hasIndex
  }
  
  // Get specific file
  getFile(path: string): string | null {
    return this.files.get(path) || null
  }
  
  // List all file paths
  listFiles(): string[] {
    return Array.from(this.files.keys())
  }
  
  // Clear all files
  clear() {
    this.files.clear()
    this.metadata = {}
  }
}

// Export legacy function for backward compatibility
export async function generateCompleteApp(
  prompt: string,
  analysis: ComponentAnalysis,
  onProgress?: (progress: { type: string; message: string; file?: { path: string; content: string; isComplete: boolean } }) => void
): Promise<{ [key: string]: string }> {
  
  // Convert to new React Native V0.dev style function
  const adaptedProgress = (progress: { type: string; message: string; file?: GeneratedFile }) => {
    onProgress?.(progress as any)
  }
  
  const response = await generateV0StyleApp(prompt, 'legacy', adaptedProgress)
  return response.files
}