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
  detectedModules: NativeModule[]
}

interface NativeModule {
  name: string
  package: string
  version: string
  imports: string[]
  permissions?: string[]
  setup?: string[]
  description: string
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
    detectedModules: NativeModule[]
    generatedAt: string
    dependencies: { [key: string]: string }
    permissions: string[]
  }
}

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || ''
})

// 🎯 React Native V0: Native Module Detection & Auto-Injection
const NATIVE_MODULE_MAPPINGS: { [key: string]: NativeModule } = {
  camera: {
    name: 'Camera',
    package: 'expo-camera',
    version: '~15.0.0',
    imports: ['Camera', 'CameraType', 'FlashMode'],
    permissions: ['CAMERA'],
    setup: ['requestCameraPermissions()'],
    description: '📷 Camera capture and preview'
  },
  notifications: {
    name: 'Push Notifications',
    package: 'expo-notifications',
    version: '~0.28.0',
    imports: ['Notifications', 'registerForPushNotificationsAsync'],
    permissions: ['NOTIFICATIONS'],
    setup: ['setupNotificationHandler()', 'registerForPushNotifications()'],
    description: '🔔 Push notifications and local notifications'
  },
  location: {
    name: 'Location Services',
    package: 'expo-location',
    version: '~17.0.0',
    imports: ['Location', 'LocationAccuracy'],
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    setup: ['requestLocationPermissions()'],
    description: '📍 GPS location and geolocation services'
  },
  imagepicker: {
    name: 'Image Picker',
    package: 'expo-image-picker',
    version: '~15.0.0',
    imports: ['ImagePicker', 'MediaTypeOptions'],
    permissions: ['CAMERA_ROLL'],
    setup: ['requestMediaLibraryPermissions()'],
    description: '🖼️ Photo and video selection from device'
  },
  audio: {
    name: 'Audio/Video',
    package: 'expo-av',
    version: '~14.0.0',
    imports: ['Audio', 'Video', 'AVPlaybackStatus'],
    permissions: ['RECORD_AUDIO'],
    setup: ['Audio.setAudioModeAsync()'],
    description: '🎵 Audio recording and video playback'
  },
  filesystem: {
    name: 'File System',
    package: 'expo-file-system',
    version: '~17.0.0',
    imports: ['FileSystem'],
    permissions: ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE'],
    setup: [],
    description: '📁 File and directory operations'
  },
  sensors: {
    name: 'Device Sensors',
    package: 'expo-sensors',
    version: '~13.0.0',
    imports: ['Accelerometer', 'Gyroscope', 'Magnetometer'],
    permissions: [],
    setup: [],
    description: '📱 Accelerometer, gyroscope, magnetometer'
  },
  haptics: {
    name: 'Haptic Feedback',
    package: 'expo-haptics',
    version: '~13.0.0',
    imports: ['Haptics'],
    permissions: ['VIBRATE'],
    setup: [],
    description: '📳 Vibration and haptic feedback'
  },
  biometrics: {
    name: 'Biometric Auth',
    package: 'expo-local-authentication',
    version: '~14.0.0',
    imports: ['LocalAuthentication'],
    permissions: ['USE_BIOMETRIC', 'USE_FINGERPRINT'],
    setup: ['checkBiometricSupport()'],
    description: '🔐 Fingerprint and face authentication'
  },
  barcode: {
    name: 'Barcode Scanner',
    package: 'expo-barcode-scanner',
    version: '~13.0.0',
    imports: ['BarCodeScanner'],
    permissions: ['CAMERA'],
    setup: ['requestCameraPermissions()'],
    description: '📱 QR code and barcode scanning'
  },
  contacts: {
    name: 'Device Contacts',
    package: 'expo-contacts',
    version: '~13.0.0',
    imports: ['Contacts'],
    permissions: ['READ_CONTACTS'],
    setup: ['requestContactsPermissions()'],
    description: '👥 Access device contacts'
  },
  calendar: {
    name: 'Calendar Events',
    package: 'expo-calendar',
    version: '~13.0.0',
    imports: ['Calendar'],
    permissions: ['READ_CALENDAR', 'WRITE_CALENDAR'],
    setup: ['requestCalendarPermissions()'],
    description: '📅 Calendar integration and events'
  }
}

// 🧠 Enhanced React Native Prompt Analysis with Native Module Detection
async function analyzePromptV0Style(prompt: string): Promise<ComponentAnalysis> {
  const lowerPrompt = prompt.toLowerCase()
  
  // Semantic analysis for React Native apps
  const features = []
  const nativeFeatures = []
  const components = []
  const screens = []
  const dataModels = []
  const detectedModules: NativeModule[] = []
  
  // 🎯 Native Module Detection (Your Key Feature!)
  Object.entries(NATIVE_MODULE_MAPPINGS).forEach(([keyword, module]) => {
    if (lowerPrompt.includes(keyword) || 
        lowerPrompt.includes(module.name.toLowerCase()) ||
        lowerPrompt.includes(module.package)) {
      detectedModules.push(module)
      nativeFeatures.push(module.description)
    }
  })
  
  // Additional keyword-based detection
  const keywordMappings = {
    'photo': ['camera', 'imagepicker'],
    'picture': ['camera', 'imagepicker'],
    'video': ['camera', 'audio'],
    'record': ['audio'],
    'sound': ['audio'],
    'vibrate': ['haptics'],
    'shake': ['sensors'],
    'fingerprint': ['biometrics'],
    'touch id': ['biometrics'],
    'face id': ['biometrics'],
    'qr': ['barcode'],
    'scan': ['barcode'],
    'gps': ['location'],
    'map': ['location'],
    'coordinate': ['location'],
    'push': ['notifications'],
    'alert': ['notifications'],
    'message': ['notifications'],
    'file': ['filesystem'],
    'save': ['filesystem'],
    'download': ['filesystem']
  }
  
  Object.entries(keywordMappings).forEach(([keyword, modules]) => {
    if (lowerPrompt.includes(keyword)) {
      modules.forEach(moduleKey => {
        const module = NATIVE_MODULE_MAPPINGS[moduleKey]
        if (module && !detectedModules.some(m => m.package === module.package)) {
          detectedModules.push(module)
          nativeFeatures.push(module.description)
        }
      })
    }
  })
  
  // App type detection with React Native focus
  let appType = 'React Native App'
  
  // Todo/Task Apps
  if (lowerPrompt.includes('todo') || lowerPrompt.includes('task')) {
    appType = 'Todo & Productivity App'
    screens.push('TodoList', 'AddTask', 'TaskDetail', 'Categories')
    components.push('TodoItem', 'TaskForm', 'PriorityBadge', 'CategoryPicker')
    dataModels.push('Task', 'Category', 'User')
    features.push('Task Management', 'Priority Levels', 'Categories', 'Search')
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
  }
  
  // Chat/Social Apps
  if (lowerPrompt.includes('chat') || lowerPrompt.includes('message') || lowerPrompt.includes('social')) {
    appType = 'Chat & Social App'
    screens.push('ChatList', 'ChatRoom', 'Profile', 'Contacts')
    components.push('MessageBubble', 'ChatInput', 'UserAvatar', 'VoiceMessage')
    dataModels.push('Message', 'User', 'Chat', 'Contact')
    features.push('Real-time Messaging', 'User Profiles', 'Media Sharing')
  }
  
  // E-commerce Apps
  if (lowerPrompt.includes('shop') || lowerPrompt.includes('store') || lowerPrompt.includes('ecommerce')) {
    appType = 'E-commerce Mobile App'
    screens.push('ProductList', 'ProductDetail', 'Cart', 'Checkout', 'Profile')
    components.push('ProductCard', 'CartItem', 'SearchBar', 'PaymentForm')
    dataModels.push('Product', 'CartItem', 'Order', 'User')
    features.push('Product Catalog', 'Shopping Cart', 'Payment', 'Order History')
  }
  
  // Fitness/Health Apps
  if (lowerPrompt.includes('fitness') || lowerPrompt.includes('health') || lowerPrompt.includes('workout')) {
    appType = 'Fitness & Health App'
    screens.push('Dashboard', 'Workout', 'Progress', 'Settings')
    components.push('WorkoutCard', 'ProgressChart', 'TimerDisplay', 'ExerciseList')
    dataModels.push('Workout', 'Exercise', 'Progress', 'User')
    features.push('Workout Tracking', 'Progress Analytics', 'Exercise Library')
  }
  
  // Photo/Camera Apps
  if (lowerPrompt.includes('photo') || lowerPrompt.includes('camera') || lowerPrompt.includes('image')) {
    appType = 'Photo & Camera App'
    screens.push('Gallery', 'Camera', 'Editor', 'Albums')
    components.push('PhotoGrid', 'CameraView', 'FilterSelector', 'EditTools')
    dataModels.push('Photo', 'Album', 'Filter')
    features.push('Photo Editing', 'Filters', 'Albums', 'Sharing')
  }
  
  // Weather Apps
  if (lowerPrompt.includes('weather')) {
    appType = 'Weather App'
    screens.push('CurrentWeather', 'Forecast', 'Locations', 'Settings')
    components.push('WeatherCard', 'ForecastItem', 'LocationSearch', 'WeatherIcon')
    dataModels.push('WeatherData', 'Location', 'Forecast')
    features.push('Current Weather', '7-Day Forecast', 'Multiple Locations')
  }
  
  // Login/Auth Apps
  if (lowerPrompt.includes('login') || lowerPrompt.includes('auth') || lowerPrompt.includes('signin')) {
    appType = 'Authentication App'
    screens.push('Login', 'Register', 'Profile', 'Settings')
    components.push('LoginForm', 'SignupForm', 'ProfileCard', 'PasswordInput')
    dataModels.push('User', 'Session')
    features.push('User Authentication', 'Profile Management', 'Session Handling')
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
    nativeFeatures,
    detectedModules
  }
}

// 📦 Smart Package.json Assembly (Your Key Feature!)
function generateSmartPackageJson(analysis: ComponentAnalysis): any {
  const baseDependencies: { [key: string]: string } = {
    'expo': '~52.0.0',
    'expo-router': '~4.0.0',
    'react': '18.3.1',
    'react-native': '0.76.3',
    'react-native-safe-area-context': '^4.10.0',
    'react-native-screens': '~4.0.0',
    'expo-linking': '~7.0.0',
    'expo-constants': '~17.0.0',
    'expo-status-bar': '~2.0.0',
    '@react-native-async-storage/async-storage': '1.23.1',
    'nativewind': '^2.0.11',
    'react-native-reanimated': '~3.10.0',
    'react-native-gesture-handler': '~2.16.0'
  }

  const devDependencies: { [key: string]: string } = {
    '@babel/core': '^7.20.0',
    '@types/react': '~18.2.45',
    '@types/react-native': '~0.73.0',
    'typescript': '^5.1.3',
    'tailwindcss': '^3.3.0'
  }

  // Add detected native modules
  analysis.detectedModules.forEach(module => {
    baseDependencies[module.package] = module.version
  })

  // Add navigation dependencies based on pattern
  if (analysis.navigationPattern === 'tabs' || analysis.navigationPattern === 'mixed') {
    baseDependencies['@react-navigation/bottom-tabs'] = '^6.5.0'
  }
  if (analysis.navigationPattern === 'drawer' || analysis.navigationPattern === 'mixed') {
    baseDependencies['@react-navigation/drawer'] = '^6.6.0'
  }

  return {
    name: analysis.appType.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    version: '1.0.0',
    main: 'expo-router/entry',
    scripts: {
      start: 'expo start',
      android: 'expo start --android',
      ios: 'expo start --ios',
      web: 'expo start --web',
      build: 'eas build',
      submit: 'eas submit',
      preview: 'expo start --web'
    },
    dependencies: baseDependencies,
    devDependencies,
    private: true
  }
}

// 🎯 React Native V0: Enhanced System Prompt with Native Module Injection
function createReactNativeSystemPrompt(analysis: ComponentAnalysis): string {
  const moduleInstructions = analysis.detectedModules.map(module => 
    `- ${module.name} (${module.package}): ${module.description}
     Imports: import { ${module.imports.join(', ')} } from '${module.package}'
     ${module.permissions?.length ? `Permissions: ${module.permissions.join(', ')}` : ''}
     ${module.setup?.length ? `Setup: ${module.setup.join(', ')}` : ''}`
  ).join('\n')

  return `You are an expert React Native mobile app developer specializing in Expo and modern mobile development patterns.

🎯 CRITICAL INSTRUCTION: You MUST return ONLY a valid JSON object with this EXACT structure:

{
  "files": {
    "app.json": "expo configuration here",
    "app/_layout.tsx": "root layout with navigation setup",
    "app/index.tsx": "main home screen",
    "components/ComponentName.tsx": "reusable components",
    "types/index.ts": "typescript interfaces",
    "constants/Colors.ts": "theme colors",
    "utils/permissions.ts": "permission handling utilities"
  }
}

📱 APP REQUIREMENTS:
- App Type: ${analysis.appType}
- Screens: ${analysis.primaryScreens.join(', ')}
- Navigation: ${analysis.navigationPattern}
- Design: ${analysis.designSystem}
- Features: ${analysis.features.join(', ')}

🔥 DETECTED NATIVE MODULES (MUST IMPLEMENT):
${moduleInstructions}

📦 USE THESE EXACT DEPENDENCIES:
${Object.entries(generateSmartPackageJson(analysis).dependencies).map(([pkg, version]) => 
  `- ${pkg}: ${version}`).join('\n')}

🛠️ NATIVE MODULE IMPLEMENTATION RULES:
1. For Camera: Create proper Camera component with permissions
2. For Notifications: Set up notification handlers and registration
3. For Location: Implement location tracking with permission requests
4. For Image Picker: Add photo selection with proper permissions
5. For Audio/Video: Set up media playback with controls
6. For File System: Implement file operations and storage
7. For Sensors: Add sensor data collection and monitoring
8. For Haptics: Implement feedback for user interactions
9. For Biometrics: Add secure authentication flows
10. For Barcode: Create scanner interface with camera integration

🎨 UI/UX REQUIREMENTS:
- Use NativeWind (Tailwind CSS for React Native) for ALL styling
- Implement proper SafeAreaView for iOS/Android compatibility
- Add StatusBar configuration for each screen
- Use proper React Native components (View, Text, ScrollView, FlatList, etc.)
- Implement loading states, error states, and empty states
- Add proper keyboard handling and form validation
- Include accessibility labels and hints
- Use proper touch feedback and animations

🔧 TECHNICAL REQUIREMENTS:
- Use Expo Router for navigation with proper file-based routing
- Implement TypeScript with strict typing for all components
- Use AsyncStorage for data persistence
- Add proper error boundaries and try/catch blocks
- Implement proper state management with React hooks
- Add proper prop types and interfaces
- Use modern React Native patterns (functional components, hooks)
- Include proper gesture handling with react-native-gesture-handler

⚠️ CRITICAL RULES:
1. Return ONLY valid JSON - no explanations, no prose, no markdown
2. Every file must be complete and functional
3. All native modules must be properly implemented with permissions
4. Include proper error handling and loading states
5. Use proper mobile UI patterns and components
6. Make it production-ready code that runs immediately
7. Include proper TypeScript types for everything
8. Add proper permission handling for all native features

Generate a complete, production-ready React Native mobile app that works immediately after 'npx expo start' with all requested native features properly implemented!`
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
- Required Modules: ${analysis.detectedModules.map(m => m.name).join(', ')}

Create a complete, production-ready React Native mobile app with all requested features and native modules using Expo Router, TypeScript, and NativeWind styling.`

  try {
    onProgress?.({ type: 'log', message: `🤖 Calling Mistral AI for React Native generation` })
    onProgress?.({ type: 'log', message: `📱 Generating ${analysis.appType} with ${analysis.detectedModules.length} native modules` })
    
    const response = await Promise.race([
      mistral.chat.complete({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: createReactNativeSystemPrompt(analysis)
          },
          { 
            role: 'user', 
            content: reactNativePrompt
          }
        ],
        temperature: 0.1,
        maxTokens: 15000 // Even larger for native modules
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout after 60 seconds')), 60000)
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
  onProgress?.({ type: 'log', message: `📲 Native Modules: ${metadata.detectedModules.map((m: any) => m.name).join(', ')}` })
  onProgress?.({ type: 'log', message: `🔐 Permissions: ${metadata.permissions.join(', ')}` })
}

// Main React Native V0 Generator with Enhanced Features
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
    onProgress?.({ type: 'log', message: '🚀 React Native V0 AI Generation Starting!' })
    onProgress?.({ type: 'log', message: `📱 User Request: "${prompt.substring(0, 100)}..."` })
    onProgress?.({ type: 'log', message: '🎯 Native Module Auto-Detection & Injection!' })
    
    // Step 1: Enhanced Analysis with Native Module Detection
    const analysis = await analyzePromptV0Style(prompt)
    onProgress?.({ type: 'log', message: `🧠 Analysis: ${analysis.appType}` })
    onProgress?.({ type: 'log', message: `📱 Screens: ${analysis.primaryScreens.join(', ')}` })
    onProgress?.({ type: 'log', message: `🔧 Features: ${analysis.features.join(', ')}` })
    onProgress?.({ type: 'log', message: `📲 Native Modules: ${analysis.detectedModules.map(m => m.name).join(', ')}` })
    
    // Step 2: Smart Package.json Generation
    const smartPackageJson = generateSmartPackageJson(analysis)
    onProgress?.({ type: 'log', message: `📦 Auto-assembled ${Object.keys(smartPackageJson.dependencies).length} dependencies` })
    
    // Step 3: Enhanced AI Generation with Native Module Injection
    const enhancedPrompt = `${prompt}

🔥 REQUIRED NATIVE MODULES: ${analysis.detectedModules.map(m => m.name).join(', ')}
📦 USE EXACT DEPENDENCIES: ${Object.keys(smartPackageJson.dependencies).join(', ')}`

    const rawResponse = await callMistralWithRateLimit(enhancedPrompt, analysis, onProgress)
    
    // Step 4: Enhanced JSON Parsing
    onProgress?.({ type: 'log', message: '⚡ Parsing React Native JSON with native modules...' })
    const files = parseReactNativeV0Response(rawResponse)
    
    // Step 5: Inject Smart Package.json
    files['package.json'] = JSON.stringify(smartPackageJson, null, 2)
    
    if (Object.keys(files).length === 0) {
      throw new Error('No React Native files generated from AI response')
    }
    
    // Step 6: Enhanced V0 Response with Native Module Metadata
    const v0Response: V0StyleResponse = {
      files,
      metadata: {
        totalFiles: Object.keys(files).length,
        appType: analysis.appType,
        features: analysis.features,
        nativeFeatures: analysis.nativeFeatures,
        detectedModules: analysis.detectedModules,
        generatedAt: new Date().toISOString(),
        dependencies: smartPackageJson.dependencies,
        permissions: analysis.detectedModules.flatMap(m => m.permissions || [])
      }
    }
    
    // Step 7: Enhanced File Updates with Native Module Info
    emitReactNativeFileUpdates(files, v0Response.metadata, onProgress)
    
    onProgress?.({ type: 'log', message: `✨ Generated ${v0Response.metadata.totalFiles} React Native files with native modules!` })
    onProgress?.({ type: 'log', message: `📱 Native Modules: ${analysis.detectedModules.map(m => m.name).join(', ')}` })
    onProgress?.({ type: 'log', message: '🚀 Ready for Expo preview, Snack, or EAS Build!' })
    
    return v0Response
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    onProgress?.({ type: 'log', message: `❌ React Native V0 generation failed: ${errorMessage}` })
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

// Export types and helper classes
export type { NativeModule, V0StyleResponse, ComponentAnalysis }
export { NATIVE_MODULE_MAPPINGS }