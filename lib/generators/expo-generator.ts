import { Mistral } from '@mistralai/mistralai'
import { generateHomeScreen } from './templates/app-template'
import { generatePackageJson } from './templates/package-template'
import { generateExpoConfig } from './templates/expo-config'
import { generateExpoBaseTemplate } from './templates/expo-base-template'
import { parseCodeFromResponse } from '../utils/code-parser'
import { execSync } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
import { generateMinimalExpoTemplate } from './templates/expo-minimal-template'

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
    return createManualTemplate(appName)
  }
}

// Modern Expo template based on demo-1 structure
function createManualTemplate(appName: string = 'Generated Expo App'): { [key: string]: string } {
  return generateExpoBaseTemplate(appName)
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

I have a base Expo TypeScript project using Expo Router (modern file-based routing). The structure follows the latest Expo conventions with:
- app/ directory for routing (with _layout.tsx and (tabs)/ structure)
- components/ directory with reusable UI components
- hooks/ and constants/ directories
- Full TypeScript support and modern React Native patterns

Please enhance it by:

1. Creating/modifying screens in the app/ directory (following Expo Router conventions)
2. Adding any necessary components in components/
3. Using the existing tab navigation structure or adding stack navigation as needed
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

// Enhanced approach: Use solid base template + AI creativity for additional files
async function generateWithEnhancedAICreativity(
  prompt: string,
  appName: string,
  onProgress?: (progress: { type: string; message: string; file?: { path: string; content: string; isComplete: boolean } }) => void
): Promise<{ [key: string]: string }> {
  onProgress?.({ type: 'log', message: '🎨 Starting enhanced AI generation with solid base...' })
  
  // Start with the solid expo-base-template that has proper RN structure
  const baseFiles = generateExpoBaseTemplate(appName)
  
  try {
    const fullGenerationPrompt = `You are building upon a solid modern Expo React Native app foundation with React Native 0.79.4, Expo SDK 53, and Expo Router. The base app already includes:

✅ EXISTING BASE STRUCTURE:
- Complete app/ routing structure with Expo Router
- Essential components (ThemedText, ThemedView, ParallaxScrollView, etc.)
- Hooks (useColorScheme, useThemeColor)
- Constants (Colors with light/dark theme)
- UI components with platform-specific variants
- Modern package.json with all dependencies
- TypeScript and ESLint configuration

🎯 YOUR TASK: Create ADDITIONAL files for this request: "${prompt}"

**What you can ADD:**
- New screens in app/ directory (e.g., app/profile.tsx, app/settings.tsx, app/(auth)/login.tsx)
- Custom components in components/ (e.g., components/UserCard.tsx, components/ChatBubble.tsx)
- New hooks in hooks/ (e.g., hooks/useAuth.ts, hooks/useApi.ts)
- Utility functions in utils/ (e.g., utils/api.ts, utils/storage.ts)
- Types in types/ (e.g., types/user.ts, types/api.ts)
- Additional libraries to package.json if needed

**IMPORTANT RULES:**
1. Use this exact format for EVERY NEW file:
===FILE: path/to/file.ext===
[file content here]
===END===

2. Build upon the existing structure - don't recreate base files
3. Use existing themed components (ThemedText, ThemedView) when possible
4. Follow Expo Router file-based routing conventions
5. Import existing components: import { ThemedText } from '@/components/ThemedText'
6. Use proper TypeScript types
7. Add only the dependencies you really need to package.json

**Examples of files you might create:**
===FILE: app/profile.tsx===
import { ThemedText } from '@/components/ThemedText'
[content]
===END===

===FILE: components/CustomButton.tsx===
[content]
===END===

===FILE: hooks/useUserData.ts===
[content]
===END===

Now create the ADDITIONAL files needed for: "${prompt}"`

          const response = await mistral.chat.complete({
        model: 'mistral-large-latest',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert Expo React Native developer. You are extending an existing modern Expo app that already has a solid foundation with React Native 0.79.4, Expo SDK 53, and Expo Router. Create ONLY the additional files needed to implement the user\'s request. Use existing components and patterns when possible. Always use the ===FILE: path=== format for every NEW file you create.' 
          },
          { role: 'user', content: fullGenerationPrompt }
        ],
        temperature: 0.3,
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
    
    onProgress?.({ type: 'log', message: '🔍 Parsing AI-generated files...' })
    
    // Parse the generated files with improved parser
    const parsedFiles = parseCodeFromResponse(generatedContent)
    
    onProgress?.({ type: 'log', message: `📁 AI created ${parsedFiles.length} additional files` })
    
    // Start with the solid base template
    const allFiles = { ...baseFiles }
    
    // Import the utility functions
    const { mergePackageJsonDependencies, extractAndValidateFiles } = await import('@/lib/utils/code-parser')
    
    // Validate and process AI-generated files
    const validatedFiles = extractAndValidateFiles(parsedFiles)
    
    for (const file of validatedFiles) {
      if (file.path === 'package.json' && allFiles['package.json']) {
        // Merge package.json dependencies intelligently
        allFiles[file.path] = mergePackageJsonDependencies(allFiles['package.json'], file.content)
        onProgress?.({
          type: 'file_complete',
          message: `🔗 Merged dependencies in ${file.path}`,
          file: { path: file.path, content: allFiles[file.path], isComplete: true }
        })
      } else {
        // Add or override other files
        allFiles[file.path] = file.content
        onProgress?.({
          type: 'file_complete',
          message: `✨ Added ${file.path}`,
          file: { path: file.path, content: file.content, isComplete: true }
        })
      }
    }
    
    // Add any missing essential files if AI didn't create them
    if (!allFiles['app/_layout.tsx']) {
      onProgress?.({ type: 'log', message: '🔧 Adding missing essential files...' })
      const essentialFiles = generateExpoBaseTemplate(appName)
      
      for (const [path, content] of Object.entries(essentialFiles)) {
        if (!allFiles[path] && (
          path.startsWith('app/') || 
          path.startsWith('components/') || 
          path.startsWith('hooks/') || 
          path.startsWith('constants/')
        )) {
          allFiles[path] = content
          onProgress?.({
            type: 'file_complete',
            message: `🔧 Added essential ${path}`,
            file: { path, content, isComplete: true }
          })
        }
      }
    }
    
    onProgress?.({ type: 'log', message: `✅ Generated complete app with ${Object.keys(allFiles).length} files!` })
    
    return allFiles
    
  } catch (error) {
    onProgress?.({ type: 'log', message: `❌ AI generation failed: ${error}` })
    console.error('Full AI generation failed:', error)
    
    // Fallback to full base template
    return generateExpoBaseTemplate(appName)
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
    const appName = prompt.match(/(?:create|build|make).*?(?:app|application).*?(?:called|named)\s+["']?([^"'\s.,:;!?]+)/i)?.[1] 
      || `expo-app-${Date.now()}`
    
    onProgress?.({ type: 'log', message: `📋 Detected: ${analysis.appType} with ${analysis.coreFeatures.length} core features` })
    onProgress?.({ type: 'log', message: `🎯 Complexity: ${analysis.complexity} (${analysis.estimatedScreens} screens estimated)` })
    
    // ENHANCED APPROACH: Use solid base + AI creativity for complex apps
    if (analysis.complexity === 'complex' || analysis.estimatedScreens > 8) {
      onProgress?.({ type: 'log', message: '🎨 Using enhanced AI creativity mode for complex app...' })
      return await generateWithEnhancedAICreativity(prompt, appName, onProgress)
    }
    
    // Traditional approach for simpler apps
    try {
      // Step 2: Try to create real Expo project first
      onProgress?.({ type: 'log', message: '🚀 Creating Expo project with create-expo-app@latest...' })
      const baseFiles = await createRealExpoProject(appName, onProgress)
      
      // Step 3: Enhance with AI
      onProgress?.({ type: 'log', message: '🤖 Customizing project based on your requirements...' })
      const enhancedFiles = await enhanceExpoProjectWithAI(baseFiles, prompt, analysis, onProgress)
      
      onProgress?.({ type: 'log', message: `✅ Successfully generated ${Object.keys(enhancedFiles).length} files!` })
      onProgress?.({ type: 'log', message: '🎉 Your Expo SDK 53 app is ready!' })
      
      return enhancedFiles
      
    } catch (realExpoError) {
      // Fallback to enhanced AI creativity if real expo creation fails
      onProgress?.({ type: 'log', message: '🎨 Falling back to enhanced AI creativity mode...' })
      return await generateWithEnhancedAICreativity(prompt, appName, onProgress)
    }
    
  } catch (error) {
    console.error('Generation failed:', error)
    onProgress?.({ type: 'log', message: `❌ Generation failed: ${error}` })
    
    // Final fallback to base template
    const fallbackAppName = prompt.includes('app') ? prompt.split(' ')[0] : 'Generated Expo App'
    return createManualTemplate(fallbackAppName)
  }
}

 