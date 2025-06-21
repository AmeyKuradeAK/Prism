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

// 🎯 React Native V0: Simplified System Prompt (Shorter to Prevent Hanging)
function createReactNativeSystemPrompt(analysis: ComponentAnalysis): string {
  return `You are an expert React Native developer building a ${analysis.appType} app.

RETURN ONLY VALID JSON:
{
  "files": {
    "filename.tsx": "complete working code here"
  }
}

PROFESSIONAL REACT NATIVE STRUCTURE - Generate files in these folders:
- screens/ (all screen components: HomeScreen.tsx, TasksScreen.tsx, etc.)
- components/ (reusable UI components: Button.tsx, TaskItem.tsx, etc.)
- navigation/ (navigation setup: AppNavigator.tsx)
- utils/ (helper functions: api.ts, storage.ts, etc.)
- App.tsx (main entry point)
- app.json (Expo configuration)
- package.json (dependencies)
- babel.config.js (babel configuration)

REQUIREMENTS:
- Use Expo SDK 53, React Native 0.76, TypeScript
- Use NativeWind for styling (className props)
- Use Expo Router for navigation
- Generate REAL, WORKING functionality - NO placeholders
- Include proper state management with useState/useEffect
- Add actual user interactions (buttons, forms, lists)
- Use proper TypeScript interfaces
- Follow professional folder structure above
- Generate complete, functional components in correct folders

App Features: ${analysis.features.join(', ')}
Screens: ${analysis.primaryScreens.join(', ')}
Native Modules: ${analysis.detectedModules.map(m => m.package).join(', ')}

CRITICAL: Generate production-ready code that actually works, not placeholder text.
NO "TODO" comments. NO "Screen" placeholders. REAL functionality only.
Place files in the correct professional folders as specified above.`
}

// 🎯 NEW: Client-Side Generation Plan (No AI calls on server)
export interface GenerationChunk {
  name: string
  prompt: string
  maxTokens: number
  priority: number
  essential: boolean
  retryStrategies: string[]
}

export interface GenerationPlan {
  analysis: ComponentAnalysis
  smartPackageJson: any
  chunks: GenerationChunk[]
  systemPrompt: string
  metadata: {
    totalChunks: number
    estimatedTime: string
    rateLimitGap: number
    essentialChunks: number
  }
}

// 🚀 Server-Side: Generate Plan Only (No AI calls)
export async function generateReactNativePlan(
  prompt: string,
  userId: string,
  onProgress?: (progress: { type: string; message: string }) => void
): Promise<GenerationPlan> {
  
  onProgress?.({ type: 'log', message: '🧠 Analyzing prompt and creating generation plan...' })
  
  // Step 1: Enhanced Analysis with Native Module Detection
  const analysis = await analyzePromptV0Style(prompt)
  onProgress?.({ type: 'log', message: `🧠 Analysis: ${analysis.appType}` })
  onProgress?.({ type: 'log', message: `📱 Screens: ${analysis.primaryScreens.join(', ')}` })
  onProgress?.({ type: 'log', message: `🔧 Features: ${analysis.features.join(', ')}` })
  onProgress?.({ type: 'log', message: `📲 Native Modules: ${analysis.detectedModules.map(m => m.name).join(', ')}` })
  
  // Step 2: Smart Package.json Generation
  const smartPackageJson = generateSmartPackageJson(analysis)
  onProgress?.({ type: 'log', message: `📦 Auto-assembled ${Object.keys(smartPackageJson.dependencies).length} dependencies` })
  
  // Step 3: Create Dynamic Chunks Based on App Complexity
  const chunks = []
  
  // 1. Essential Config Files (Always Required)
  chunks.push({
    name: "Essential Config",
    prompt: `Generate essential React Native config files: App.tsx (main entry), app.json (Expo config), babel.config.js, package.json. For ${analysis.appType} with navigation to: ${analysis.primaryScreens.join(', ')}. Must work with 'npx expo start'.`,
    maxTokens: 1500,
    priority: 1,
    essential: true,
    retryStrategies: [
      'Reduce complexity and focus on basic working config',
      'Generate minimal working files without advanced features',
      'Create simple Expo app structure with basic navigation'
    ]
  })
  
  // 2. Main Home Screen (Always Required)
  chunks.push({
    name: "Home Screen",
    prompt: `Generate screens/HomeScreen.tsx for ${analysis.appType}. Include navigation buttons to: ${analysis.primaryScreens.join(', ')}. Real functionality, state management, NativeWind styling. NO placeholders.`,
    maxTokens: 1500,
    priority: 2,
    essential: true,
    retryStrategies: [
      'Create simpler home screen with basic navigation',
      'Generate minimal home screen with essential features only',
      'Focus on working navigation without complex state'
    ]
  })
  
  // 3. Generate chunks for each primary screen
  analysis.primaryScreens.forEach((screen, index) => {
    if (index < 6) { // Limit to 6 main screens to avoid too many chunks
      chunks.push({
        name: `${screen} Screen`,
        prompt: `Generate screens/${screen}Screen.tsx for ${analysis.appType}. Include real functionality related to ${screen.toLowerCase()}, proper state management, forms, data handling, and NativeWind styling. Make it fully functional.`,
        maxTokens: 1500,
        priority: 3 + index,
        essential: index < 2, // First 2 screens are essential
        retryStrategies: [
          `Create simpler ${screen} screen with basic functionality`,
          `Generate minimal ${screen} screen with core features only`,
          `Focus on working ${screen} interface without complex logic`
        ]
      })
    }
  })
  
  // 4. Essential Components
  chunks.push({
    name: "Core Components",
    prompt: `Generate essential reusable components in components/ folder for ${analysis.appType}. Based on features: ${analysis.features.slice(0, 3).join(', ')}. Create components that are actually used by the screens. TypeScript and NativeWind.`,
    maxTokens: 1500,
    priority: 10,
    essential: true,
    retryStrategies: [
      'Generate basic UI components (Button, Card, Input)',
      'Create minimal reusable components without complex logic',
      'Focus on simple, working components'
    ]
  })
  
  // 5. Navigation Setup
  chunks.push({
    name: "Navigation",
    prompt: `Generate navigation/AppNavigator.tsx for ${analysis.appType}. Set up navigation between all screens: ${analysis.primaryScreens.join(', ')}. Use appropriate navigation pattern (${analysis.navigationPattern}). Working navigation with proper routing.`,
    maxTokens: 1200,
    priority: 11,
    essential: true,
    retryStrategies: [
      'Create simple stack navigation between screens',
      'Generate basic navigation without complex patterns',
      'Focus on working navigation setup'
    ]
  })
  
  // 6. Utility Functions (if needed)
  if (analysis.features.some(f => f.includes('API') || f.includes('Storage') || f.includes('Data'))) {
    chunks.push({
      name: "Utilities",
      prompt: `Generate utils/ folder with helper functions for ${analysis.appType}. Include API calls, data storage, validation functions related to: ${analysis.features.slice(0, 3).join(', ')}. Working utility functions.`,
      maxTokens: 1200,
      priority: 12,
      essential: false,
      retryStrategies: [
        'Generate basic utility functions for common operations',
        'Create simple helper functions without complex logic',
        'Focus on essential utility functions only'
      ]
    })
  }
  
  const systemPrompt = createReactNativeSystemPrompt(analysis)
  
  onProgress?.({ type: 'log', message: `✅ Generated plan with ${chunks.length} chunks` })
  onProgress?.({ type: 'log', message: `🎯 Ready for client-side AI execution (no Netlify timeouts!)` })
  
  return {
    analysis,
    smartPackageJson,
    chunks,
    systemPrompt,
    metadata: {
      totalChunks: chunks.length,
      estimatedTime: `${chunks.length * 4}s (3-4s per chunk + rate limiting)`,
      rateLimitGap: 5000,
      essentialChunks: chunks.filter(c => c.essential).length
    }
  }
}

// 🎯 Client-Side: Execute Generation Plan (Browser-side AI calls)
export async function executeGenerationPlan(
  plan: GenerationPlan,
  apiKey: string,
  onProgress?: (progress: { type: string; message: string; file?: GeneratedFile }) => void
): Promise<V0StyleResponse> {
  
  if (!apiKey || apiKey.length < 10) {
    throw new Error('Valid Mistral API key required for client-side generation')
  }
  
  onProgress?.({ type: 'log', message: '🚀 Starting client-side AI generation (no timeouts!)' })
  onProgress?.({ type: 'log', message: `📦 Executing ${plan.chunks.length} chunks with ${plan.metadata.rateLimitGap/1000}s gaps` })
  
  const allFiles: { [key: string]: string } = {}
  
  // Add pre-generated package.json
  allFiles['package.json'] = JSON.stringify(plan.smartPackageJson, null, 2)
  onProgress?.({ type: 'log', message: '✅ Added smart package.json with auto-detected dependencies' })
  
  for (let i = 0; i < plan.chunks.length; i++) {
    const chunk = plan.chunks[i]
    
    onProgress?.({ type: 'log', message: `📦 Chunk ${i + 1}/${plan.chunks.length}: ${chunk.name}` })
    onProgress?.({ type: 'log', message: `🎯 Client-side AI call (no Netlify timeout!)...` })
    
    try {
      // Client-side direct Mistral API call
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': 'ReactNative-V0-Client/1.0'
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [
            {
              role: 'system',
              content: plan.systemPrompt
            },
            {
              role: 'user',
              content: chunk.prompt
            }
          ],
          temperature: 0.1,
          max_tokens: chunk.maxTokens
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Mistral API error: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      const content = data.choices?.[0]?.message?.content
      
      if (!content || typeof content !== 'string' || content.length < 10) {
        throw new Error(`Invalid AI response: ${content?.length || 0} characters`)
      }
      
      // Parse the chunk response
      const chunkFiles = parseReactNativeV0Response(content)
      
      // Merge files
      Object.entries(chunkFiles).forEach(([path, fileContent]) => {
        if (fileContent && fileContent.length > 10) {
          allFiles[path] = fileContent
          onProgress?.({ 
            type: 'file_complete',
            message: `✅ Generated ${path} (${fileContent.length} chars)`,
            file: {
              path,
              content: fileContent,
              isComplete: true
            }
          })
        }
      })
      
      onProgress?.({ type: 'log', message: `✅ Chunk ${i + 1} complete: ${Object.keys(chunkFiles).length} files` })
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      onProgress?.({ type: 'log', message: `❌ Chunk ${i + 1} failed: ${errorMessage}` })
      onProgress?.({ type: 'log', message: `🔄 Continuing with remaining chunks...` })
    }
    
    // Rate limiting: Respect Mistral's 1 RPS limit
    if (i < plan.chunks.length - 1) {
      const waitTime = plan.metadata.rateLimitGap + Math.random() * 500
      onProgress?.({ type: 'log', message: `⏳ Rate limiting: waiting ${Math.round(waitTime/100)/10}s...` })
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  onProgress?.({ type: 'log', message: `🎉 Client-side generation complete! ${Object.keys(allFiles).length} files total` })
  
  // Create V0 response
  const v0Response: V0StyleResponse = {
    files: allFiles,
    metadata: {
      totalFiles: Object.keys(allFiles).length,
      appType: plan.analysis.appType,
      features: plan.analysis.features,
      nativeFeatures: plan.analysis.nativeFeatures,
      detectedModules: plan.analysis.detectedModules,
      generatedAt: new Date().toISOString(),
      dependencies: plan.smartPackageJson.dependencies,
      permissions: plan.analysis.detectedModules.flatMap(m => m.permissions || [])
    }
  }
  
  return v0Response
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

    let rawResponse: string
    
    // PURE AI GENERATION - CHUNKED REQUESTS!
    onProgress?.({ type: 'log', message: '🤖 PURE AI GENERATION - Multi-request chunked approach!' })
    onProgress?.({ type: 'log', message: '🔄 Breaking generation into focused chunks with 2-3s gaps (Mistral 1 RPS limit)...' })
    
    // Temporary fallback - this will be replaced with client-side generation
    throw new Error('Server-side AI generation disabled due to Netlify timeouts. Use client-side generation instead.')
    
    // Step 4: Enhanced JSON Parsing
    onProgress?.({ type: 'log', message: '⚡ Parsing React Native JSON with native modules...' })
    const files = parseReactNativeV0Response(rawResponse)
    
    // Step 5: Inject Smart Package.json
    files['package.json'] = JSON.stringify(smartPackageJson, null, 2)
    
    if (Object.keys(files).length === 0) {
      throw new Error('❌ AI generation failed and JSON parsing returned no files. Pure AI generation mode - no fallbacks!')
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