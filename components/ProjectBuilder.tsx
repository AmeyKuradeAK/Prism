'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import JSZip from 'jszip'
import { fixProjectStructure, analyzeProjectStructure } from '@/lib/utils/project-structure-fixer'
import RealReactNativePreview from './RealReactNativePreview'
import { 
  Play, 
  FileText, 
  Folder, 
  FolderOpen, 
  Download, 
  Save, 
  Check,
  CheckCircle,
  AlertCircle,
  Loader2,
  Smartphone,
  Code,
  Eye,
  Terminal,
  Settings,
  Zap,
  Package,
  Cloud,
  Monitor,
  Moon,
  Sun,
  Copy,
  ExternalLink,
  RefreshCw,
  Hammer,
  Palette,
  ChevronDown,
  ChevronRight,
  X,
  Send,
  User,
  Bot,
  Plus,
  MessageSquare,
  Search,
  Filter,
  MoreVertical,
  ChevronUp,
  Trash
} from 'lucide-react'

interface FileProgress {
  path: string
  content: string
  isComplete: boolean
}

interface GenerationProgress {
  type: 'log' | 'file_start' | 'file_progress' | 'file_complete' | 'complete' | 'error' | 'files'
  message?: string
  file?: FileProgress
  files?: any[]
}

interface BuildStatus {
  id: string
  status: 'pending' | 'building' | 'success' | 'error'
  platform: 'android' | 'ios' | 'web'
  downloadUrl?: string
  error?: string
  progress?: number
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isGenerating?: boolean
}

interface ProjectBuilderProps {
  projectId?: string
}

export default function ProjectBuilder({ projectId }: ProjectBuilderProps) {
  // Chat and conversation state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'assistant',
      content: 'Welcome! I\'ll help you build your React Native app. Describe what you want to create, and I\'ll generate a complete project for you.',
      timestamp: new Date()
    }
  ])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Project state
  const [files, setFiles] = useState<{ [key: string]: string }>({})
  const [activeFile, setActiveFile] = useState<string>('')
  const [progressFiles, setProgressFiles] = useState<{ [key: string]: FileProgress }>({})
  const [project, setProject] = useState<any>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  
  // Project context persistence
  const [projectContext, setProjectContext] = useState<{
    projectType?: string
    features: string[]
    mainPrompt?: string
    technologies: string[]
  }>({
    features: [],
    technologies: ['React Native', 'Expo', 'TypeScript']
  })
  
  // UI state
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['app', 'components', 'assets']))
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(['android']))
  const [buildStatuses, setBuildStatuses] = useState<BuildStatus[]>([])
  const [isBuilding, setIsBuilding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [builds, setBuilds] = useState<BuildStatus[]>([])
  const [currentBuild, setCurrentBuild] = useState<BuildStatus | null>(null)
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'build'>('code')
  
  // Refs
  const chatRef = useRef<HTMLDivElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-save functionality
  const triggerAutoSave = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }
    
    setAutoSaveStatus('saving')
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveProject()
        setAutoSaveStatus('saved')
      } catch (error) {
        setAutoSaveStatus('error')
      }
    }, 1000)
  }

  // Save project to database
  const saveProject = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: projectId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: projectId,
          name: extractProjectName(chatMessages.find(m => m.type === 'user')?.content || '') || 'Untitled Project',
          prompt: chatMessages.find(m => m.type === 'user')?.content || '',
          files,
          lastModified: new Date().toISOString()
        })
      })
      
      if (!response.ok) throw new Error('Failed to save project')
      
      const savedProject = await response.json()
      setProject(savedProject)
      
      if (!projectId) {
        window.history.replaceState({}, '', `/builder?project=${savedProject.id}`)
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
      throw error
    }
  }

  // Auto-save when files change
  useEffect(() => {
    if (Object.keys(files).length > 0) {
      triggerAutoSave()
    }
  }, [files])

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatRef.current) {
      // Add a small delay to ensure DOM has updated
      setTimeout(() => {
        if (chatRef.current) {
          chatRef.current.scrollTop = chatRef.current.scrollHeight
        }
      }, 100)
    }
  }, [chatMessages])

  // Debug: Log when chat messages change
  useEffect(() => {
    console.log('📨 Chat messages updated:', chatMessages.length, 'messages')
    if (chatMessages.length > 0) {
      const lastMessage = chatMessages[chatMessages.length - 1]
      console.log('📨 Last message:', lastMessage.type, lastMessage.content.substring(0, 100))
    }
  }, [chatMessages])

  // Load base template
  const handleLoadTemplate = async () => {
    console.log('📂 Loading template with client memfs...')
    setIsGenerating(true)
    
    // Add loading message
    const loadingMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content: '📂 Loading base React Native template with client memfs...',
      timestamp: new Date(),
      isGenerating: true
    }
    setChatMessages(prev => [...prev, loadingMessage])

    try {
      // Use client memfs to load template
      const clientMemFS = (await import('@/lib/utils/client-memfs')).default
      await clientMemFS.loadBaseTemplate('BaseTemplate')
      const templateFiles = clientMemFS.getAllFiles()
      
      console.log(`✅ Template loaded: ${Object.keys(templateFiles).length} files`)
      console.log('📋 All template files:', Object.keys(templateFiles).sort())
      
      // Set files
      setFiles(templateFiles)
      
      // Auto-select first file
      const firstFile = Object.keys(templateFiles)[0]
      if (firstFile) {
        setActiveFile(firstFile)
      }
      
      // Update chat with success message
      setChatMessages(prev => 
        prev.map(msg => 
          msg.isGenerating ? {
            ...msg,
            content: `✅ Base template loaded successfully! ${Object.keys(templateFiles).length} files created with client memfs.`,
            isGenerating: false
          } : msg
        )
      )
      
    } catch (error) {
      console.error('Failed to load template:', error)
      setChatMessages(prev => 
        prev.map(msg => 
          msg.isGenerating ? {
            ...msg,
            content: `❌ Failed to load template: ${error instanceof Error ? error.message : 'Unknown error'}`,
            isGenerating: false
          } : msg
        )
      )
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle chat message submission
  const handleSendMessage = async (e: React.FormEvent, quickMode: boolean = false) => {
    e.preventDefault()
    if (!currentMessage.trim() || isGenerating) return

    // Analyze and update project context before processing
    analyzeAndUpdateContext(currentMessage.trim())

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsGenerating(true)

    // Add loading message with context info
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: quickMode ? '⚡ Quick generating (base template only)...' : 
        `🤖 Generating your ${projectContext.projectType || 'React Native'} app...
        
${projectContext.projectType ? `📱 **Project Type**: ${projectContext.projectType}` : ''}
${projectContext.features.length > 0 ? `🎯 **Features**: ${projectContext.features.join(', ')}` : ''}`,
      timestamp: new Date(),
      isGenerating: true
    }
    setChatMessages(prev => [...prev, loadingMessage])

    try {
      await generateApp(userMessage.content, false, quickMode)
    } catch (error) {
      // Update loading message with error
      setChatMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? { ...msg, content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`, isGenerating: false }
          : msg
      ))
    } finally {
      setIsGenerating(false)
    }
  }

  const generateApp = async (prompt: string, testMode: boolean = false, quickMode: boolean = false) => {
    try {
      console.log('🚀 Starting sequenced client-side memfs AI generation...')
      console.log('📝 Prompt:', prompt)
      console.log('🧪 Test mode:', testMode, 'Quick mode:', quickMode)
      
      // Step 1: Ensure base template is fully loaded with proper sequencing
      console.log('📦 Step 1: Loading base template with sequencing...')
      const clientMemFS = (await import('@/lib/utils/client-memfs')).default
      
      // Wait for base template to be completely loaded
      await clientMemFS.loadBaseTemplate('MyApp')
      
      // Verify base template is ready
      const initialState = await clientMemFS.getCurrentState()
      console.log('🔍 Base template state:', initialState)
      
      if (!initialState.isBaseLoaded) {
        throw new Error('Base template failed to load properly')
      }
      
      const baseFiles = clientMemFS.getAllFiles()
      console.log(`✅ Base template confirmed loaded: ${Object.keys(baseFiles).length} files`)
      
      // Set base files immediately so user sees progress
      setFiles(baseFiles)
      setActiveFile(Object.keys(baseFiles)[0])
      
      // Update chat with base template status
      setChatMessages(prev => prev.map(msg => 
        msg.isGenerating 
          ? { 
              ...msg, 
              content: `📦 Base template loaded with ${Object.keys(baseFiles).length} files!
              
🔍 **Status**: Base filesystem ready, ${initialState.queueLength} operations queued
🐚 **Shell**: Virtual filesystem initialized with ${Object.keys(baseFiles).length} files`
            }
          : msg
      ))
      
      // Quick mode: Just return base template
      if (quickMode) {
        console.log('⚡ Quick mode: Using base template only')
        setChatMessages(prev => prev.map(msg => 
          msg.isGenerating 
            ? { 
                ...msg, 
                content: `⚡ Quick mode: Base template loaded with ${Object.keys(baseFiles).length} files!`,
                isGenerating: false 
              }
            : msg
        ))
        return
      }
      
      // Step 2: Generate AI enhancements - better error handling
      console.log('🤖 Step 2: Getting secure encrypted API key...')
      
      // Check if environment variables are present
      const hasEncryptionKey = !!process.env.NEXT_PUBLIC_ENCRYPTION_KEY
      console.log('🔍 Environment check:')
      console.log('  - NEXT_PUBLIC_ENCRYPTION_KEY:', hasEncryptionKey ? '✅ Present' : '❌ Missing')
      
      if (!hasEncryptionKey) {
        console.error('❌ Missing encryption key! Showing base template only.')
        setChatMessages(prev => prev.map(msg => 
          msg.isGenerating 
            ? { 
                ...msg, 
                content: `📦 Base template loaded with ${Object.keys(baseFiles).length} files!

⚠️ **AI Generation Disabled**: Missing encryption key in environment variables.

The base template is loaded and functional. To enable AI enhancements, add the encryption keys to your \`.env.local\` file and restart the server.`,
                isGenerating: false 
              }
            : msg
        ))
        return
      }
      
      // Try to get API key
      let apiKey: string
      try {
        const { getCachedDecryptedApiKey } = await import('@/lib/utils/crypto-client')
        console.log('🔍 Debug - About to call getCachedDecryptedApiKey...')
        apiKey = await getCachedDecryptedApiKey()
        console.log('🔐 API key decrypted successfully, length:', apiKey.length)
      } catch (keyError) {
        console.error('❌ Failed to get API key:', keyError)
        setChatMessages(prev => prev.map(msg => 
          msg.isGenerating 
            ? { 
                ...msg, 
                content: `📦 Base template loaded with ${Object.keys(baseFiles).length} files!

⚠️ **AI Generation Error**: ${keyError instanceof Error ? keyError.message : 'Unknown error'}

The base template is loaded and functional. Check your API key configuration in the environment variables.`,
                isGenerating: false 
              }
            : msg
        ))
        return
      }
      
      // Step 3: Call AI API with better error handling
      console.log('🤖 Step 3: Calling Mistral AI...')
      setChatMessages(prev => prev.map(msg => 
        msg.isGenerating 
          ? { 
              ...msg, 
              content: `🤖 Calling AI to enhance your app...

📦 Base template confirmed loaded (${Object.keys(baseFiles).length} files)
🔄 Now generating AI enhancements with proper sequencing...`
            }
          : msg
      ))
      
      const aiResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            {
              role: 'system',
              content: `You are a React Native/Expo expert specializing in the LATEST Expo SDK 53 and Expo Router v5. Generate ONLY React Native code files to enhance the existing base template based on the user's request.

🎯 **CRITICAL PROJECT STRUCTURE KNOWLEDGE**:

**Entry Points & Core Files:**
- \`App.tsx\` (ROOT LEVEL) - Main app entry point with expo-router/entry
- \`app/_layout.tsx\` - Root navigation layout (Stack Navigator)
- \`app/(tabs)/_layout.tsx\` - Tab navigation layout
- \`app/(tabs)/index.tsx\` - Home screen (default route)
- \`app/(tabs)/explore.tsx\` - Secondary tab screen

**Complete Project Structure:**
\`\`\`
/App.tsx                    # 🚨 MAIN ENTRY POINT
/package.json              # Expo SDK 53 dependencies + enhanced scripts
/app.json                  # Expo configuration
/metro.config.js           # 🔧 Metro bundler config (New Architecture enabled)
/babel.config.js           # 🔧 Babel config (Hermes + Reanimated)
/tsconfig.json             # 🔧 TypeScript config (strict + path aliases)
/eslint.config.js          # 🔧 ESLint config (enhanced rules)
/.prettierrc               # 🔧 Code formatting config
/.gitignore                # 🔧 Git ignore (comprehensive)
/expo-env.d.ts             # 🔧 TypeScript environment declarations
/.env.example              # 🔧 Environment variables template
/app/
├── _layout.tsx            # Root Stack Navigator
├── +not-found.tsx         # 404 screen
└── (tabs)/               # Tab Navigation Group
    ├── _layout.tsx       # Tab Navigator
    ├── index.tsx         # Home tab
    └── explore.tsx       # Explore tab
/components/              # Reusable components
├── ui/                  # UI primitives (IconSymbol, TabBarBackground)
├── ThemedText.tsx       # Themed text component
├── ThemedView.tsx       # Themed view component
├── ParallaxScrollView.tsx
├── HelloWave.tsx
├── Collapsible.tsx
├── ExternalLink.tsx
└── HapticTab.tsx
/hooks/                  # Custom React hooks
├── useColorScheme.ts    
├── useColorScheme.web.ts
└── useThemeColor.ts
/constants/              # App constants
└── Colors.ts            # Theme colors
/assets/                 # Static assets
├── images/              # App icons, splash screens
├── fonts/               # Custom fonts (SpaceMono-Regular.ttf)
└── index.ts             # Asset exports
/scripts/                # Build scripts
└── reset-project.js     # Project reset utility
\`\`\`

**🔧 CRITICAL CONFIGURATION FILES KNOWLEDGE:**

**Metro Configuration (/metro.config.js):**
- New Architecture enabled with \`unstable_enablePackageExports\`
- Enhanced asset and source extensions
- Performance optimizations for minification
- Symlink support for monorepos

**Babel Configuration (/babel.config.js):**
- Hermes stable transform profile
- React Native Reanimated plugin (must be last)
- Production optimizations (console removal)

**TypeScript Configuration (/tsconfig.json):**
- Strict mode enabled
- Path aliases: \`@/*\`, \`@/components/*\`, \`@/hooks/*\`, etc.
- Expo types included
- Proper JSX configuration

**Package.json Scripts:**
- \`npm run type-check\` - TypeScript validation
- \`npm run format\` - Prettier formatting
- \`npm run clean\` - Fix dependencies
- \`npm run prebuild\` - Clean prebuild

**Environment Variables (.env.example):**
- \`EXPO_PUBLIC_API_URL\` - API endpoint
- \`EXPO_PUBLIC_APP_NAME\` - App name
- \`EXPO_USE_FAST_RESOLVER\` - Development optimization

**Latest Expo SDK 53 Features to Use:**
- \`expo-router\` v5.1.0 - File-based routing with typed routes
- \`expo-image\` v2.3.0 - Optimized image component
- \`expo-symbols\` v0.4.5 - SF Symbols for iOS
- \`react-native\` 0.79.4 - Latest RN version
- \`react\` 19.0.0 - Latest React with concurrent features
- \`react-native-reanimated\` v3.17.4 - Latest animations

**CRITICAL: Your response MUST contain actual code files with this EXACT format:**

===FILE: components/TodoList.tsx===
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TodoList() {
  const router = useRouter();
  const [todos, setTodos] = useState([
    { id: 1, text: 'Sample todo', completed: false }
  ]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Todo List</ThemedText>
      <FlatList
        data={todos}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.todoItem}
            onPress={() => router.push(\`/todos/\${item.id}\`)}
          >
            <ThemedText>{item.text}</ThemedText>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  todoItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }
});
===END===

**EXPO ROUTER v5 PATTERNS (LATEST):**
1. Use \`useRouter()\` for navigation: \`router.push('/path')\`, \`router.back()\`
2. Use \`useLocalSearchParams()\` for route parameters
3. Use \`<Stack.Screen options={{}} />\` for screen configuration
4. Create nested routes with proper folder structure: \`app/(tabs)/\`, \`app/[id]/\`
5. Use TypeScript with proper type definitions
6. Include \`@/\` path aliases for imports

**LATEST EXPO SDK 53 COMPONENTS:**
1. \`expo-image\` instead of React Native Image: \`import { Image } from 'expo-image'\`
2. \`expo-linear-gradient\` for gradients
3. \`expo-symbols\` for SF Symbols on iOS
4. \`expo-haptics\` for haptic feedback
5. \`expo-blur\` for blur effects
6. Use \`ThemedText\` and \`ThemedView\` from base template for theming

**NAVIGATION PATTERNS:**
- Tabs: \`app/(tabs)/\` folder structure
- Stacks: \`app/folder/\` for nested navigation  
- Dynamic routes: \`[param].tsx\` files
- Layout files: \`_layout.tsx\` for shared layouts
- Modal routes: Use \`presentation: 'modal'\` in Stack.Screen

**COMPONENT PATTERNS:**
- Use functional components with TypeScript
- Implement proper prop types with interfaces
- Use \`StyleSheet.create\` for styling
- Follow React Native best practices
- Include proper error boundaries where needed
- Use \`ThemedText\` and \`ThemedView\` for consistent theming

**API & DATA PATTERNS:**
- Use \`@tanstack/react-query\` for API calls (if needed)
- Implement proper loading and error states
- Use Expo SecureStore for sensitive data
- Include proper TypeScript types for API responses

**PERFORMANCE & ANIMATIONS:**
- Use \`React.memo\` for expensive components
- Implement proper \`FlatList\` for large datasets
- Use \`expo-image\` with proper caching
- Include proper keyboard handling
- Use \`react-native-reanimated\` v3 for animations

${projectContext.projectType ? `
**PROJECT CONTEXT:**
- Project Type: ${projectContext.projectType}
- Existing Features: ${projectContext.features.join(', ')}
- Technologies: ${projectContext.technologies.join(', ')}
- Main Concept: ${projectContext.mainPrompt || 'Not specified'}

**MAINTAIN CONSISTENCY:** Keep building on the existing ${projectContext.projectType} concept. Don't switch to different app types unless explicitly requested. Use the latest Expo Router v5 patterns for this ${projectContext.projectType} app.
` : ''}`
            },
            {
              role: 'user',
              content: `${prompt}

Please generate React Native files that add this functionality to the base template. ${projectContext.projectType ? `Remember this is a ${projectContext.projectType} app with features: ${projectContext.features.join(', ')}.` : ''} Focus on creating components and screens that implement the requested features. Use the ===FILE: path=== format for each file.`
            }
          ],
          temperature: 0.3,
          max_tokens: 6000
        })
      })
      
      if (!aiResponse.ok) {
        const errorText = await aiResponse.text()
        console.log('⚠️ AI generation failed:', errorText)
        setChatMessages(prev => prev.map(msg => 
          msg.isGenerating 
            ? { 
                ...msg, 
                content: `📦 Base template loaded with ${Object.keys(baseFiles).length} files!

⚠️ **AI Generation Failed**: ${aiResponse.status} ${aiResponse.statusText}

The base template is loaded and functional. AI enhancement failed, but you can still use the base template.`,
                isGenerating: false 
              }
            : msg
        ))
        return
      }
      
      const aiData = await aiResponse.json()
      const fullResponse = aiData.choices?.[0]?.message?.content || ''
      console.log('🤖 AI Response received:', fullResponse.substring(0, 300))
      
      // Step 4: Parse AI-generated files
      setChatMessages(prev => prev.map(msg => 
        msg.isGenerating 
          ? { 
              ...msg, 
              content: `🔄 Processing AI response and queueing merge...

🐚 $ echo "Parsing AI response..."
🐚 $ wc -c response.txt  # ${fullResponse.length} characters

🔍 **AI Response Preview**:
\`\`\`
${fullResponse.substring(0, 500)}${fullResponse.length > 500 ? '...' : ''}
\`\`\``
            }
          : msg
      ))
      
      const { parseCodeFromResponse } = await import('@/lib/utils/code-parser')
      
      // DEBUG: Log the full AI response for debugging
      console.log('🔍 FULL AI RESPONSE:')
      console.log(fullResponse)
      console.log('🔍 Response length:', fullResponse.length)
      
      const aiGeneratedFiles = parseCodeFromResponse(fullResponse)
      
      console.log(`🔄 Step 4: Parsed ${aiGeneratedFiles.length} AI-generated files`)
      console.log('🔍 DEBUG - Parsed files:', aiGeneratedFiles.map(f => ({ path: f.path, contentLength: f.content.length })))
      
      if (aiGeneratedFiles.length === 0) {
        console.warn('⚠️ WARNING: No AI files were parsed from the response!')
        console.log('🔍 Response content preview:', fullResponse.substring(0, 1000))
        
        // Show warning in chat but continue with base template
        setChatMessages(prev => prev.map(msg => 
          msg.isGenerating 
            ? { 
                ...msg, 
                content: `📦 Base template loaded with ${Object.keys(baseFiles).length} files!

⚠️ **AI Generation Warning**: The AI provided a response, but no code files could be extracted from it.

🔍 **AI Response Was**:
\`\`\`
${fullResponse.substring(0, 800)}${fullResponse.length > 800 ? '\n...(truncated)' : ''}
\`\`\`

**Possible Issues**:
- The AI response format was unexpected (no ===FILE: markers)
- The prompt needs to be more specific about generating files
- The AI provided explanations instead of code

You can still use the base template, or try a more specific prompt like: "Generate a TodoList component for React Native with proper ===FILE: markers".`,
                isGenerating: false 
              }
            : msg
        ))
        return
      }
      
      // Step 5: Merge AI files with proper sequencing
      console.log('🔄 Step 5: Sequenced merging with client memfs...')
      setChatMessages(prev => prev.map(msg => 
        msg.isGenerating 
          ? { 
              ...msg, 
              content: `🔄 Merging AI files with proper sequencing...

🐚 $ echo "Base template ready: ${Object.keys(baseFiles).length} files"
🐚 $ echo "AI files parsed: ${aiGeneratedFiles.length} files"
🐚 $ echo "Starting intelligent merge..."`
            }
          : msg
      ))
      
      // Wait for any pending operations and merge AI files
      await clientMemFS.waitForReady()
      await clientMemFS.mergeAIFiles(aiGeneratedFiles)
      
      // Get final state
      const finalState = await clientMemFS.getCurrentState()
      const mergedFiles = clientMemFS.getAllFiles()
      const counts = clientMemFS.getFileCount()
      
      // Get detailed file tree and validation
      const fileTree = clientMemFS.getDetailedFileTree()
      const stateValidation = clientMemFS.validateCurrentState()
      
      console.log(`✅ Step 5: Sequenced merge complete`)
      console.log(`📊 Final result: ${counts.base} base + ${counts.ai} AI = ${counts.total} total files`)
      console.log('🔍 Final state:', finalState)
      console.log('🌳 Detailed file tree:', fileTree)
      console.log('✅ State validation:', stateValidation)
      
      // Set all merged files in state
      setFiles(mergedFiles)
      
      // Update progress files for UI
      Object.entries(mergedFiles).forEach(([path, fileContent]) => {
        if (typeof fileContent === 'string' && fileContent.length > 0) {
          setProgressFiles(prev => ({
            ...prev,
            [path]: {
              path,
              content: fileContent,
              isComplete: true
            }
          }))
        }
      })
      
      // Update success message with detailed file tree and validation
      setChatMessages(prev => prev.map(msg => 
        msg.isGenerating 
          ? { 
              ...msg, 
              content: `✅ **AI Generation Complete!**

📊 **Final Result**: ${counts.base} base files + ${counts.ai} AI enhancements = **${counts.total} total files**

🌳 **File Structure** (🤖 = AI generated):
\`\`\`
${fileTree}
\`\`\`

🔍 **Validation Results**:
- State Valid: ${stateValidation.isValid ? '✅' : '❌'}
- Base Files Preserved: ${stateValidation.summary.preservedStructure ? '✅' : '❌'}
- Structure Integrity: ${stateValidation.issues.length === 0 ? '✅ All good' : '⚠️ ' + stateValidation.issues.join(', ')}

🐚 **Shell Operations**:
\`\`\`
$ ls -la /virtual-fs/
  total ${counts.total} files
$ echo "Base template: ${counts.base} files"
$ echo "AI generated: ${counts.ai} files"  
$ echo "Merge strategy: safe file-by-file merge"
$ echo "Status: Ready for development"
\`\`\`

🎉 Your enhanced React Native app is ready! The AI has safely merged custom functionality into your base template. You can now:
- 📁 Browse the file explorer to see all files (🤖 markers show AI additions)
- 👀 Click on any file to view the code
- 📱 Use the build system to create APK/IPA files
- 💾 Save your project for future editing`,
              isGenerating: false 
            }
          : msg
      ))

      // Trigger auto-save
      triggerAutoSave()

    } catch (error) {
      console.error('❌ Sequenced generation error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      
      // Better error handling with shell simulation
      setChatMessages(prev => prev.map(msg => 
        msg.isGenerating 
          ? { 
              ...msg, 
              content: `❌ **Generation Error**

🐚 **Error Log**:
\`\`\`
$ echo "Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}"
$ echo "Stack trace available in browser console"
$ echo "Base template status: ${Object.keys(files).length > 0 ? 'loaded' : 'missing'}"
\`\`\`

The base template is still loaded and functional. You can:
- Try generating again with a different prompt
- Use the base template as-is
- Check the browser console for more details`,
              isGenerating: false 
            }
          : msg
      ))
    }
  }

  // File tree utilities
  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.ts')) return <Code className="w-4 h-4 text-blue-400" />
    if (fileName.endsWith('.json')) return <FileText className="w-4 h-4 text-yellow-400" />
    if (fileName.endsWith('.js')) return <Code className="w-4 h-4 text-yellow-500" />
    if (fileName.endsWith('.md')) return <FileText className="w-4 h-4 text-gray-400" />
    return <FileText className="w-4 h-4 text-gray-500" />
  }

  const getFileTree = () => {
    console.log('🗂️ Getting organized files - using improved organization...')
    
    // Fallback to manual organization
    console.log('📋 Raw file paths:', Object.keys(files).sort())
    
    const organized: { [key: string]: string[] } = {}
    const processedPaths = new Set<string>()
    
    Object.keys(files).forEach(path => {
      // Skip if already processed (avoid duplicates)
      if (processedPaths.has(path)) return
      processedPaths.add(path)
      
      // Clean the path properly - remove FILE: prefixes and normalize
      let cleanPath = path
        .replace(/^FILE:\s*/i, '') // Remove FILE: prefix
        .replace(/^📁\s*FILE:\s*/i, '') // Remove folder emoji + FILE: prefix
        .replace(/^📁\s*/i, '') // Remove folder emoji
        .replace(/^\w+:\s*/i, '') // Remove any other prefixes
        
      cleanPath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath
      const parts = cleanPath.split('/')
      
      // Skip if path is empty or invalid after cleaning
      if (!cleanPath || parts.length === 0) return
      
      let folderName = ''
      
      if (parts.length === 1) {
        // Root files - no folder, just use 'root'
        folderName = 'root'
      } else if (parts[0] === 'app') {
        if (parts.length === 2) {
          folderName = '📱 app'
        } else if (parts[1] === '(tabs)') {
          folderName = '📱 app/(tabs)'
        } else {
          folderName = '📱 app'
        }
      } else if (parts[0] === 'components') {
        if (parts.length === 2) {
          folderName = '🧩 components'
        } else if (parts[1] === 'ui') {
          folderName = '🧩 components/ui'
        } else {
          folderName = '🧩 components'
        }
      } else if (parts[0] === 'hooks') {
        folderName = '🪝 hooks'
      } else if (parts[0] === 'constants') {
        folderName = '⚙️ constants'
      } else if (parts[0] === 'lib') {
        folderName = '📚 lib'
      } else if (parts[0] === 'utils') {
        folderName = '🔧 utils'
      } else if (parts[0] === 'types') {
        folderName = '📝 types'
      } else if (parts[0] === 'assets') {
        folderName = '🖼️ assets'
      } else if (parts[0] === 'scripts') {
        folderName = '⚡ scripts'
      } else {
        // Other folders get a generic folder icon - but clean the name
        const cleanFolderName = parts[0]
          .replace(/^FILE:\s*/i, '')
          .replace(/^📁\s*/i, '')
          .replace(/^\w+:\s*/i, '')
        folderName = `📁 ${cleanFolderName}`
      }
      
      if (!organized[folderName]) {
        organized[folderName] = []
      }
      
      // Only add if not already in the array (prevent duplicates)
      if (!organized[folderName].includes(path)) {
        organized[folderName].push(path)
      }
    })
    
    // Sort files within each folder
    Object.keys(organized).forEach(folder => {
      organized[folder].sort()
    })
    
    console.log('✅ Improved organization complete')
    console.log(`📊 Total folders: ${Object.keys(organized).length}`)
    console.log('📁 Organized structure:', Object.keys(organized).map(folder => `${folder} (${organized[folder].length})`))
    
    return organized
  }

  const filteredFiles = () => {
    if (!searchQuery) return getFileTree()
    
    const filtered: { [key: string]: string[] } = {}
    Object.entries(getFileTree()).forEach(([folder, fileList]) => {
      const matchingFiles = fileList.filter(file => 
        file.toLowerCase().includes(searchQuery.toLowerCase())
      )
      if (matchingFiles.length > 0) {
        filtered[folder] = matchingFiles
      }
    })
    return filtered
  }

  const extractProjectName = (prompt: string) => {
    const words = prompt.split(' ').slice(0, 4).join(' ')
    return words.length > 30 ? words.substring(0, 30) + '...' : words
  }

  const downloadProject = async () => {
    if (Object.keys(files).length === 0) {
      console.warn('📥 Download cancelled: No files to download')
      return
    }

    try {
      console.log('📦 Starting download process...')
      console.log(`📋 Files to include: ${Object.keys(files).length}`)
      console.log('📄 File list:', Object.keys(files))
      
      const zip = new JSZip()
      
      // Clean and add files to zip
      let addedCount = 0
      Object.entries(files).forEach(([path, content]) => {
        if (!content || typeof content !== 'string') {
          console.warn(`⚠️ Skipping invalid file: ${path}`)
          return
        }
        
        // Clean the path for zip (no leading slash)
        const cleanPath = path.startsWith('/') ? path.slice(1) : path
        
        if (cleanPath) {
          zip.file(cleanPath, content)
          addedCount++
          console.log(`✅ Added to zip: ${cleanPath} (${content.length} chars)`)
        } else {
          console.warn(`⚠️ Skipping file with empty path: ${path}`)
        }
      })
      
      console.log(`📊 Added ${addedCount} files to zip`)
      
      if (addedCount === 0) {
        console.error('❌ No valid files to download')
        alert('No valid files found to download. Please generate an app first.')
        return
      }
      
      const projectName = extractProjectName(chatMessages.find(m => m.type === 'user')?.content || '') || 'react-native-app'
      const fileName = `${projectName.replace(/[^a-zA-Z0-9-]/g, '-')}-${Date.now()}.zip`
      
      console.log('🔄 Generating zip file...')
      const content = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      })
      
      console.log(`✅ Zip generated: ${fileName} (${(content.size / 1024).toFixed(2)} KB)`)
      
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      console.log('📥 Download initiated successfully')
      
      // Show success message in chat
      const downloadMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: `📥 **Download Complete!**

📦 **File**: \`${fileName}\`
📊 **Files Included**: ${addedCount} files
💾 **Size**: ${(content.size / 1024).toFixed(2)} KB

✅ Your React Native project has been downloaded successfully. Extract the ZIP file and run:

\`\`\`bash
npm install
npx expo start
\`\`\`

📱 **What's included**:
- Complete Expo Router setup
- TypeScript configuration  
- All generated components and screens
- Asset files and dependencies`,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, downloadMessage])
      
      // Auto-show chat if it's hidden
      if (isChatCollapsed) {
        setIsChatCollapsed(false)
      }
      
    } catch (error) {
      console.error('❌ Download failed:', error)
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folder)) {
        newSet.delete(folder)
      } else {
        newSet.add(folder)
      }
      return newSet
    })
  }

  // Debug function to test generation directly
  const testGeneration = async () => {
    console.log('🧪 Testing generation directly (test mode)...')
    
    // Add test message to chat
    const testMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: '🧪 Running production test - Base template only (no external APIs)',
      timestamp: new Date()
    }
    setChatMessages(prev => [...prev, testMessage])
    
    try {
      await generateApp('Create a simple todo app', true) // Test mode enabled
    } catch (error) {
      console.error('🧪 Test generation failed:', error)
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    }
  }

  // Real EAS Build functionality
  const startBuild = async (platform: 'android' | 'ios' | 'web') => {
    if (Object.keys(files).length === 0) {
      alert('No files to build. Please generate an app first.')
      return
    }

    setIsBuilding(true)
    
    // Add build start message to chat
    const buildMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: `🔨 Starting real EAS Build...

📱 **Platform**: ${platform.charAt(0).toUpperCase() + platform.slice(1)}
📦 **Files**: ${Object.keys(files).length} files
⏱️ **Status**: Connecting to Expo Application Services...

🔧 This will create a real ${platform === 'android' ? 'APK' : platform === 'ios' ? 'IPA' : 'web build'} file you can install on devices!`,
      timestamp: new Date()
    }
    setChatMessages(prev => [...prev, buildMessage])

    try {
      // Call the real EAS Build API
      const projectName = extractProjectName(chatMessages.find(m => m.type === 'user')?.content || '') || 'react-native-app'
      
      const response = await fetch('/api/eas/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files,
          platform,
          projectName: projectName.replace(/[^a-zA-Z0-9-]/g, '-')
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Build failed with status ${response.status}`)
      }

      const buildData = await response.json()
      console.log('🚀 EAS Build started:', buildData)

      // Create build status with real build ID
      const newBuild: BuildStatus = {
        id: buildData.buildId,
        status: 'building',
        platform,
        progress: 0,
        downloadUrl: buildData.buildUrl
      }
      
      setBuilds(prev => [newBuild, ...prev])
      setCurrentBuild(newBuild)

      // Update chat with build started info
      const buildStartedMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: `✅ **EAS Build Started!**

🆔 **Build ID**: \`${buildData.buildId}\`
📱 **Platform**: ${platform.charAt(0).toUpperCase() + platform.slice(1)}
⏱️ **Estimated Time**: ${buildData.estimatedDuration}
📍 **Queue Position**: ${buildData.queuePosition}

🔗 **Monitor Build**: [View on Expo Dashboard](${buildData.buildUrl})

⏳ The build is now running on Expo's cloud infrastructure. You'll be notified when it completes with download links for the real APK/IPA file!`,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, buildStartedMessage])

      // Start polling for build status
      pollBuildStatus(buildData.buildId, platform)

    } catch (error) {
      console.error('EAS Build failed:', error)
      
      // Error handling
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'system',
        content: `❌ **EAS Build Failed**

📱 **Platform**: ${platform.charAt(0).toUpperCase() + platform.slice(1)}
⚠️ **Error**: ${error instanceof Error ? error.message : 'Unknown build error'}

**Common Issues:**
- Missing \`EXPO_TOKEN\` in environment variables
- Invalid Expo configuration  
- Network connectivity issues
- Expo account limitations

**Solutions:**
1. Check your \`.env\` file for \`EXPO_TOKEN\`
2. Verify Expo account is active
3. Try again or check Expo status

[📖 Setup Guide](setup-token.md) | [🔧 Troubleshooting](docs/EAS_BUILD_SETUP.md)`,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsBuilding(false)
    }
  }

  // Poll build status for real-time updates
  const pollBuildStatus = async (buildId: string, platform: string) => {
    const maxAttempts = 60 // 30 minutes max (30 second intervals)
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/eas/build/${buildId}`)
        if (!response.ok) return

        const buildStatus = await response.json()
        console.log('📊 Build status update:', buildStatus)

        // Update build in state
        setBuilds(prev => prev.map(build => 
          build.id === buildId 
            ? { 
                ...build, 
                status: buildStatus.status === 'finished' ? 'success' : 
                       buildStatus.status === 'errored' ? 'error' : 'building',
                progress: buildStatus.status === 'finished' ? 100 : 
                         buildStatus.status === 'in-progress' ? 50 : 10,
                downloadUrl: buildStatus.artifacts?.[0]?.url
              }
            : build
        ))

        setCurrentBuild(prev => prev ? {
          ...prev,
          status: buildStatus.status === 'finished' ? 'success' : 
                 buildStatus.status === 'errored' ? 'error' : 'building',
          progress: buildStatus.status === 'finished' ? 100 : 
                   buildStatus.status === 'in-progress' ? 50 : 10,
          downloadUrl: buildStatus.artifacts?.[0]?.url
        } : null)

        // Handle completion
        if (buildStatus.status === 'finished') {
          const successMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'system',
            content: `🎉 **EAS Build Complete!**

📱 **Platform**: ${platform.charAt(0).toUpperCase() + platform.slice(1)}
🆔 **Build ID**: \`${buildId}\`
📦 **Status**: Build successful
⬇️ **Download**: Real ${platform === 'android' ? 'APK' : 'IPA'} file ready!

${buildStatus.artifacts?.map((artifact: any) => 
  `🔗 **Download ${platform.toUpperCase()}**: [${artifact.url.split('/').pop()}](${artifact.url})`
).join('\n') || ''}

🚀 **Next Steps**:
- Download the ${platform === 'android' ? 'APK' : 'IPA'} file
- Install on your ${platform === 'android' ? 'Android' : 'iOS'} device
- Test your app in production!

✨ Your AI-generated React Native app is now a real mobile application!`,
            timestamp: new Date()
          }
          setChatMessages(prev => [...prev, successMessage])
          return // Stop polling
        }

        if (buildStatus.status === 'errored') {
          const errorMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'system',
            content: `❌ **EAS Build Failed**

🆔 **Build ID**: \`${buildId}\`
📱 **Platform**: ${platform}
⚠️ **Status**: Build errored on Expo servers

**Possible Causes:**
- Invalid app configuration
- Missing dependencies  
- Build timeout
- Platform-specific issues

**Next Steps:**
1. Check the [Expo Dashboard](${buildStatus.buildUrl || 'https://expo.dev'}) for detailed logs
2. Verify your app configuration
3. Try building again

[📖 Troubleshooting Guide](docs/EAS_BUILD_SETUP.md)`,
            timestamp: new Date()
          }
          setChatMessages(prev => [...prev, errorMessage])
          return // Stop polling
        }

        // Continue polling if still building
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 30000) // Poll every 30 seconds
        }

      } catch (error) {
        console.error('Build status polling error:', error)
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 30000) // Retry on error
        }
      }
    }

    // Start polling after 10 seconds
    setTimeout(poll, 10000)
  }

  // Analyze and update project context from user prompts
  const analyzeAndUpdateContext = (userPrompt: string) => {
    const prompt = userPrompt.toLowerCase()
    
    // Detect project type from keywords
    let detectedType = projectContext.projectType
    if (!detectedType) {
      if (prompt.includes('ecommerce') || prompt.includes('e-commerce') || prompt.includes('shop') || prompt.includes('store') || prompt.includes('product') || prompt.includes('cart')) {
        detectedType = 'eCommerce'
      } else if (prompt.includes('todo') || prompt.includes('task') || prompt.includes('productivity')) {
        detectedType = 'Todo/Productivity'
      } else if (prompt.includes('social') || prompt.includes('chat') || prompt.includes('message') || prompt.includes('friend')) {
        detectedType = 'Social/Messaging'
      } else if (prompt.includes('weather') || prompt.includes('forecast')) {
        detectedType = 'Weather'
      } else if (prompt.includes('game') || prompt.includes('puzzle') || prompt.includes('score')) {
        detectedType = 'Game'
      } else if (prompt.includes('fitness') || prompt.includes('health') || prompt.includes('workout')) {
        detectedType = 'Health/Fitness'
      } else if (prompt.includes('news') || prompt.includes('article') || prompt.includes('blog')) {
        detectedType = 'News/Content'
      }
    }
    
    // Extract features from prompt
    const newFeatures: string[] = []
    const featureKeywords = {
      'cart': 'Shopping Cart',
      'wishlist': 'Wishlist',
      'checkout': 'Checkout',
      'payment': 'Payment',
      'product': 'Product Catalog',
      'search': 'Search',
      'filter': 'Filtering',
      'category': 'Categories',
      'review': 'Reviews',
      'rating': 'Ratings',
      'profile': 'User Profile',
      'authentication': 'Authentication',
      'login': 'User Login',
      'signup': 'User Registration',
      'notification': 'Notifications',
      'push': 'Push Notifications',
      'map': 'Maps',
      'location': 'Location Services',
      'camera': 'Camera',
      'photo': 'Photo Gallery',
      'chat': 'Chat/Messaging',
      'social': 'Social Features',
      'share': 'Social Sharing'
    }
    
    Object.entries(featureKeywords).forEach(([keyword, feature]) => {
      if (prompt.includes(keyword) && !projectContext.features.includes(feature)) {
        newFeatures.push(feature)
      }
    })
    
    // Update context if changes detected
    if (detectedType !== projectContext.projectType || newFeatures.length > 0) {
      setProjectContext(prev => ({
        ...prev,
        projectType: detectedType || prev.projectType,
        features: [...prev.features, ...newFeatures],
        mainPrompt: prev.mainPrompt || userPrompt,
        technologies: [...new Set([...prev.technologies, ...newFeatures.includes('Maps') ? ['React Native Maps'] : [], ...newFeatures.includes('Camera') ? ['Expo Camera'] : []])]
      }))
      
      console.log('📝 Updated project context:', {
        type: detectedType,
        features: [...projectContext.features, ...newFeatures],
        newFeatures
      })
    }
  }

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">React Native Builder</h1>
                <p className="text-sm text-gray-400">
                  {projectContext.projectType ? 
                    `${projectContext.projectType} App${projectContext.features.length > 0 ? ` • ${projectContext.features.length} features` : ''}` : 
                    'AI-powered app generator'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Save Button */}
            <button
              onClick={saveProject}
              disabled={isGenerating}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                autoSaveStatus === 'saving' 
                  ? 'bg-yellow-600 text-white' 
                  : autoSaveStatus === 'saved' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {autoSaveStatus === 'saving' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : autoSaveStatus === 'saved' ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>
                {autoSaveStatus === 'saving' ? 'Saving...' : 
                 autoSaveStatus === 'saved' ? 'Saved' : 'Save'}
              </span>
            </button>

            {/* Download Button */}
            <button
              onClick={downloadProject}
              disabled={Object.keys(files).length === 0}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>

            {/* Load Template Button */}
            <button
              onClick={handleLoadTemplate}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Package className="w-4 h-4" />
              <span>Load Template</span>
            </button>

            {/* Chat Toggle Button */}
            <button
              onClick={() => setIsChatCollapsed(!isChatCollapsed)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isChatCollapsed ? 'Show Chat' : 'Hide Chat'}</span>
              {isChatCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Debug File Tree Button */}
            <button
              onClick={async () => {
                console.log('🔍 Debug: Showing current file tree state...')
                
                try {
                  const clientMemFS = (await import('@/lib/utils/client-memfs')).default
                  const fileTree = clientMemFS.getDetailedFileTree()
                  const stateValidation = clientMemFS.validateCurrentState()
                  const currentState = await clientMemFS.getCurrentState()
                  
                  const debugMessage: ChatMessage = {
                    id: Date.now().toString(),
                    type: 'system',
                    content: `🔍 **Debug: Current File Tree State**

🌳 **File Structure** (🤖 = AI generated):
\`\`\`
${fileTree}
\`\`\`

📊 **System State**:
- Base Loaded: ${currentState.isBaseLoaded ? '✅' : '❌'}
- Queue Length: ${currentState.queueLength}
- Total Files: ${currentState.filesCount.total}

🔍 **Validation**:
- State Valid: ${stateValidation.isValid ? '✅' : '❌'}
- Base Files: ${stateValidation.summary.baseFiles}
- AI Files: ${stateValidation.summary.aiFiles}
- Structure Preserved: ${stateValidation.summary.preservedStructure ? '✅' : '❌'}
- Clean Paths: ${stateValidation.summary.cleanPaths ? '✅' : '❌'}

${stateValidation.artifacts && stateValidation.artifacts.length > 0 ? `🚨 **FILE: Artifacts Detected**:\n${stateValidation.artifacts.map(artifact => `- ${artifact}`).join('\n')}\n\n` : ''}${stateValidation.issues.length > 0 ? `⚠️ **Issues Found**:\n${stateValidation.issues.map(issue => `- ${issue}`).join('\n')}` : '✅ **No Issues Found**'}

🐚 **Shell Status**: All systems operational`,
                    timestamp: new Date()
                  }
                  setChatMessages(prev => [...prev, debugMessage])
                  
                  // Auto-show chat if it's hidden
                  if (isChatCollapsed) {
                    setIsChatCollapsed(false)
                  }
                  
                } catch (error) {
                  console.error('Debug failed:', error)
                  const errorMessage: ChatMessage = {
                    id: Date.now().toString(),
                    type: 'system',
                    content: `❌ **Debug Failed**: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    timestamp: new Date()
                  }
                  setChatMessages(prev => [...prev, errorMessage])
                }
              }}
              disabled={Object.keys(files).length === 0}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>Debug Tree</span>
            </button>

            {/* Test Generation Button */}
            <button
              onClick={async () => {
                console.log('🧪 Quick AI test generation...')
                setCurrentMessage('Create a simple TodoList component with add and delete functionality')
                
                // Trigger generation with specific test prompt
                const testEvent = new Event('submit') as any
                handleSendMessage(testEvent, false)
              }}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Test AI</span>
            </button>

            {/* Clean Files Button */}
            <button
              onClick={async () => {
                console.log('🧹 Manually cleaning all files...')
                
                try {
                  const clientMemFS = (await import('@/lib/utils/client-memfs')).default
                  
                  // Get current files and clean them
                  const currentFiles = clientMemFS.getAllFiles()
                  console.log('📋 Files before cleaning:', Object.keys(currentFiles))
                  
                  // This would require exposing the cleanAndMergeFiles function
                  // For now, show what we would clean in chat
                  const artifactPaths = Object.keys(currentFiles).filter(path => 
                    path.match(/FILE:/i) || path.match(/📁\s*FILE:/i) || path.match(/^📁[^/]/)
                  )
                  
                  const cleanMessage: ChatMessage = {
                    id: Date.now().toString(),
                    type: 'system',
                    content: `🧹 **File Cleaning Analysis**

📋 **Current Files**: ${Object.keys(currentFiles).length} total
🚨 **FILE: Artifacts Found**: ${artifactPaths.length}

${artifactPaths.length > 0 ? `**Artifacts to Clean**:
${artifactPaths.map(path => `- \`${path}\``).join('\n')}

These paths contain FILE: prefixes or emoji artifacts that should be cleaned.` : '✅ **No artifacts found** - all paths are clean!'}

💡 **Tip**: The cleaning happens automatically during AI generation, but this shows any remaining artifacts in your current file tree.`,
                    timestamp: new Date()
                  }
                  setChatMessages(prev => [...prev, cleanMessage])
                  
                  // Auto-show chat if it's hidden
                  if (isChatCollapsed) {
                    setIsChatCollapsed(false)
                  }
                  
                } catch (error) {
                  console.error('Clean failed:', error)
                  const errorMessage: ChatMessage = {
                    id: Date.now().toString(),
                    type: 'system',
                    content: `❌ **Clean Failed**: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    timestamp: new Date()
                  }
                  setChatMessages(prev => [...prev, errorMessage])
                }
              }}
              disabled={Object.keys(files).length === 0}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clean Files</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - VS Code style file explorer */}
        <div className="w-80 border-r border-gray-800 bg-gray-900 flex flex-col">
          {/* Explorer Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-200 flex items-center space-x-2">
                <Folder className="w-4 h-4 text-blue-400" />
                <span>EXPLORER</span>
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {Object.keys(files).length} files
                </span>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* File Tree - Scrollable */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
            <div className="p-2">
              <AnimatePresence>
                {Object.entries(filteredFiles()).map(([folder, fileList]) => (
                  <div key={folder} className="mb-1">
                    {/* Show folder header for non-root folders */}
                    {folder !== 'root' && (
                      <button
                        onClick={() => toggleFolder(folder)}
                        className="flex items-center space-x-2 w-full p-2 text-sm font-medium text-gray-300 hover:bg-gray-800 rounded transition-colors"
                      >
                        {expandedFolders.has(folder) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <FolderOpen className="w-4 h-4 text-blue-400" />
                        <span>{folder} ({fileList.length})</span>
                      </button>
                    )}
                    
                    {/* Root files - always show, no folder header */}
                    {folder === 'root' && (
                      <div className="mb-2">
                        <div className="px-2 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
                          Root Files ({fileList.length})
                        </div>
                      </div>
                    )}
                    
                    {/* Show files when it's root OR when folder is expanded */}
                    {(folder === 'root' || expandedFolders.has(folder)) && fileList.map(filePath => {
                      const isActive = activeFile === filePath
                      const isComplete = files[filePath] !== undefined
                      
                      return (
                        <motion.div
                          key={filePath}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-center space-x-2 p-2 ${folder !== 'root' ? 'ml-6' : ''} rounded cursor-pointer transition-colors ${
                            isActive ? 'bg-blue-900/50 border-l-2 border-blue-400' : 
                            isComplete ? 'hover:bg-gray-800' : 'opacity-50'
                          }`}
                          onClick={() => isComplete && setActiveFile(filePath)}
                        >
                          {getFileIcon(filePath)}
                          <span className="text-sm truncate flex-1 text-gray-300">
                            {filePath.split('/').pop()}
                          </span>
                          {isComplete && (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                ))}
              </AnimatePresence>
              
              {Object.keys(files).length === 0 && (
                <div className="text-center mt-8 text-gray-500">
                  <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No files yet</p>
                  <p className="text-xs text-gray-600 mt-2">Start a conversation to generate your app</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex-shrink-0 border-b border-gray-800 bg-gray-900">
            <div className="flex items-center space-x-1 px-4 py-2">
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'code' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                <Code className="w-4 h-4" />
                <span>Code</span>
              </button>
              
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'preview' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Preview</span>
              </button>
              
              <button
                onClick={() => setActiveTab('build')}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'build' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                <Hammer className="w-4 h-4" />
                <span>Build</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className={`bg-gray-900 overflow-hidden flex flex-col ${isChatCollapsed ? 'flex-1' : 'flex-1 max-h-[calc(100vh-400px)]'}`}>
            
            {/* Code Tab */}
            {activeTab === 'code' && (
              <>
                {activeFile ? (
                  <>
                    <div className="flex-shrink-0 p-4 border-b border-gray-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-200">
                          {activeFile}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(files[activeFile] || '')}
                          className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                        {/* Quick Chat Toggle in File Header */}
                        <button
                          onClick={() => setIsChatCollapsed(!isChatCollapsed)}
                          className="flex items-center space-x-1 px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>{isChatCollapsed ? 'Show' : 'Hide'}</span>
                        </button>
                      </div>
                    </div>
                    {/* Scrollable Code Content */}
                    <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                      <div className="p-4">
                        <pre className="bg-black p-4 rounded-lg text-sm border border-gray-800 min-h-full">
                          <code className="text-gray-300 whitespace-pre-wrap">
                            {progressFiles[activeFile]?.content || files[activeFile] || ''}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Code className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                      <p className="text-lg font-medium mb-2">Select a file to view</p>
                      <p className="text-sm text-gray-600 mb-4">Choose from the file explorer to see the code</p>
                      {/* Quick access to chat when no file selected */}
                      {isChatCollapsed && (
                        <button
                          onClick={() => setIsChatCollapsed(false)}
                          className="flex items-center space-x-2 px-4 py-2 mx-auto text-sm bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Show AI Chat</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Preview Tab - Real App Preview */}
            {activeTab === 'preview' && (
              <div className="flex-1 bg-gray-900 p-6 overflow-auto">
                <div className="max-w-6xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-200 mb-2">Live React Native Preview</h2>
                    <p className="text-gray-400">Real-time preview compiled with React Native Web</p>
                  </div>

                  {Object.keys(files).length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Mobile Preview Frame with Real RN Web Compilation */}
                      <div className="flex flex-col items-center">
                        <div className="w-80 h-[640px] bg-black rounded-[3rem] p-4 border-8 border-gray-800 shadow-2xl">
                          <div className="w-full h-full bg-gray-100 rounded-[2.5rem] overflow-hidden relative">
                            {/* Status Bar */}
                            <div className="h-8 bg-gray-900 flex items-center justify-between px-4 text-white text-xs">
                              <span>9:41</span>
                              <div className="flex items-center space-x-1">
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs">100%</span>
                                <div className="w-6 h-3 border border-white rounded-sm">
                                  <div className="w-full h-full bg-green-400 rounded-sm"></div>
                                </div>
                              </div>
                            </div>
                            
                            {/* App Content - Real React Native Web */}
                            <div className="flex-1 bg-white text-black overflow-hidden">
                              <RealReactNativePreview files={files} />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 text-center">
                          <h3 className="text-lg font-medium text-gray-200 mb-2">📱 Live Preview</h3>
                          <p className="text-sm text-gray-400">Compiled with React Native Web</p>
                          <div className="mt-2 flex items-center justify-center space-x-4 text-xs text-gray-500">
                            <span>🔄 Real-time compilation</span>
                            <span>⚛️ React Native Web</span>
                            <span>🎯 Interactive preview</span>
                          </div>
                        </div>
                      </div>

                      {/* Code Analysis & Build Status */}
                      <div className="space-y-6">
                        {/* File Structure Analysis */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center space-x-2">
                            <Code className="w-5 h-5 text-blue-400" />
                            <span>Code Analysis</span>
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-300 mb-2">App Structure</h4>
                              <div className="space-y-1">
                                {(() => {
                                  const appFiles = Object.keys(files).filter(f => f.includes('app/'))
                                  const componentFiles = Object.keys(files).filter(f => f.includes('components/'))
                                  const hasRouter = Object.values(files).some(f => f.includes('expo-router') || f.includes('useRouter'))
                                  const hasTabs = Object.keys(files).some(f => f.includes('(tabs)'))
                                  
                                  return (
                                    <>
                                      <div className="flex items-center space-x-2 text-xs">
                                        <span className={appFiles.length > 0 ? 'text-green-400' : 'text-red-400'}>
                                          {appFiles.length > 0 ? '✅' : '❌'}
                                        </span>
                                        <span className="text-gray-400">App Directory ({appFiles.length} files)</span>
                                      </div>
                                      <div className="flex items-center space-x-2 text-xs">
                                        <span className={componentFiles.length > 0 ? 'text-green-400' : 'text-red-400'}>
                                          {componentFiles.length > 0 ? '✅' : '❌'}
                                        </span>
                                        <span className="text-gray-400">Components ({componentFiles.length} files)</span>
                                      </div>
                                      <div className="flex items-center space-x-2 text-xs">
                                        <span className={hasRouter ? 'text-green-400' : 'text-yellow-400'}>
                                          {hasRouter ? '✅' : '⚠️'}
                                        </span>
                                        <span className="text-gray-400">Expo Router {hasRouter ? 'Detected' : 'Not Found'}</span>
                                      </div>
                                      <div className="flex items-center space-x-2 text-xs">
                                        <span className={hasTabs ? 'text-green-400' : 'text-gray-500'}>
                                          {hasTabs ? '✅' : '➖'}
                                        </span>
                                        <span className="text-gray-400">Tab Navigation {hasTabs ? 'Active' : 'Not Used'}</span>
                                      </div>
                                    </>
                                  )
                                })()}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-300 mb-2">Dependencies Detected</h4>
                              <div className="flex flex-wrap gap-1">
                                {(() => {
                                  const allCode = Object.values(files).join(' ')
                                  const deps = []
                                  
                                  if (allCode.includes('expo-router')) deps.push('expo-router')
                                  if (allCode.includes('react-navigation')) deps.push('react-navigation')
                                  if (allCode.includes('@tanstack/react-query')) deps.push('react-query')
                                  if (allCode.includes('expo-linear-gradient')) deps.push('expo-linear-gradient')
                                  if (allCode.includes('expo-image')) deps.push('expo-image')
                                  if (allCode.includes('AsyncStorage')) deps.push('async-storage')
                                  if (allCode.includes('expo-notifications')) deps.push('expo-notifications')
                                  
                                  return deps.length > 0 ? deps.map(dep => (
                                    <span key={dep} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                                      {dep}
                                    </span>
                                  )) : <span className="text-gray-500 text-xs">No external deps detected</span>
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* App Type Detection */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center space-x-2">
                            <Palette className="w-5 h-5 text-purple-400" />
                            <span>App Analysis</span>
                          </h3>
                          <div className="space-y-3">
                            {(() => {
                              const allCode = Object.values(files).join(' ').toLowerCase()
                              const fileName = Object.keys(files).join(' ').toLowerCase()
                              
                              let appType = 'Unknown'
                              let appFeatures = []
                              
                              if (allCode.includes('todo') || allCode.includes('task')) {
                                appType = 'Todo/Productivity App'
                                appFeatures = ['Task Management', 'List Views', 'CRUD Operations']
                              } else if (allCode.includes('ecommerce') || allCode.includes('product') || allCode.includes('cart')) {
                                appType = 'eCommerce App' 
                                appFeatures = ['Product Catalog', 'Shopping Cart', 'User Authentication']
                              } else if (allCode.includes('weather') || allCode.includes('forecast')) {
                                appType = 'Weather App'
                                appFeatures = ['Weather API', 'Location Services', 'Forecasts']
                              } else if (allCode.includes('social') || allCode.includes('chat') || allCode.includes('message')) {
                                appType = 'Social/Messaging App'
                                appFeatures = ['Real-time Chat', 'User Profiles', 'Social Features']
                              } else if (allCode.includes('news') || allCode.includes('article')) {
                                appType = 'News/Content App'
                                appFeatures = ['Article Lists', 'Content Feed', 'Reading Experience']
                              } else {
                                appType = 'Custom React Native App'
                                appFeatures = ['Custom Components', 'TypeScript', 'Modern Architecture']
                              }
                              
                              return (
                                <>
                                  <div>
                                    <span className="text-sm text-gray-400">Detected Type:</span>
                                    <div className="text-lg font-medium text-blue-400 mt-1">{appType}</div>
                                  </div>
                                  <div>
                                    <span className="text-sm text-gray-400">Key Features:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {appFeatures.map(feature => (
                                        <span key={feature} className="px-2 py-1 bg-purple-600 text-white text-xs rounded">
                                          {feature}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-sm text-gray-400">Build Ready:</span>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className={files['package.json'] ? 'text-green-400' : 'text-red-400'}>
                                        {files['package.json'] ? '✅' : '❌'}
                                      </span>
                                      <span className="text-sm">Ready for Expo build</span>
                                    </div>
                                  </div>
                                </>
                              )
                            })()}
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center space-x-2">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            <span>Quick Actions</span>
                          </h3>
                          <div className="space-y-3">
                            <button
                              onClick={() => setActiveTab('build')}
                              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              <Hammer className="w-4 h-4" />
                              <span>Build for Production</span>
                            </button>
                            <button
                              onClick={downloadProject}
                              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download Source Code</span>
                            </button>
                            <button
                              onClick={() => setIsChatCollapsed(false)}
                              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>Continue Development</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-96">
                      <div className="text-center text-gray-500">
                        <Smartphone className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No App to Preview</h3>
                        <p className="text-sm mb-4">Generate a React Native app first to see the live preview</p>
                        <button
                          onClick={() => setIsChatCollapsed(false)}
                          className="flex items-center space-x-2 px-4 py-2 mx-auto text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Start Building</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Build Tab */}
            {activeTab === 'build' && (
              <div className="flex-1 p-6 overflow-auto">
                <div className="max-w-4xl mx-auto">
                  {/* Build Header */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-200 mb-2">Build & Deploy</h2>
                    <p className="text-gray-400">Generate production builds for different platforms</p>
                  </div>

                  {/* Platform Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[
                      { id: 'android', name: 'Android', icon: '🤖', desc: 'Generate APK for Android devices' },
                      { id: 'ios', name: 'iOS', icon: '📱', desc: 'Generate IPA for iOS devices' },
                      { id: 'web', name: 'Web', icon: '🌐', desc: 'Generate web build for browsers' }
                    ].map((platform) => (
                      <div key={platform.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="text-center mb-4">
                          <div className="text-4xl mb-2">{platform.icon}</div>
                          <h3 className="text-lg font-medium text-gray-200">{platform.name}</h3>
                          <p className="text-sm text-gray-400">{platform.desc}</p>
                        </div>
                        
                        <button
                          onClick={() => startBuild(platform.id as 'android' | 'ios' | 'web')}
                          disabled={isBuilding || Object.keys(files).length === 0}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                          {isBuilding && currentBuild?.platform === platform.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Building...</span>
                            </>
                          ) : (
                            <>
                              <Hammer className="w-4 h-4" />
                              <span>Build {platform.name}</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Build Status */}
                  {currentBuild && (
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
                      <h3 className="text-lg font-medium text-gray-200 mb-4">Current Build</h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Platform: {currentBuild.platform}</span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          currentBuild.status === 'success' ? 'bg-green-600' :
                          currentBuild.status === 'error' ? 'bg-red-600' :
                          currentBuild.status === 'building' ? 'bg-blue-600' :
                          'bg-gray-600'
                        }`}>
                          {currentBuild.status}
                        </span>
                      </div>
                      
                      {currentBuild.progress !== undefined && (
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${currentBuild.progress}%` }}
                          ></div>
                        </div>
                      )}
                      
                      {currentBuild.error && (
                        <div className="text-red-400 text-sm mt-2">
                          Error: {currentBuild.error}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Build History */}
                  {builds.length > 0 && (
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h3 className="text-lg font-medium text-gray-200 mb-4">Build History</h3>
                      <div className="space-y-3">
                        {builds.slice(0, 5).map((build) => (
                          <div key={build.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="text-gray-300">{build.platform}</span>
                              <span className={`px-2 py-1 text-xs rounded ${
                                build.status === 'success' ? 'bg-green-600' :
                                build.status === 'error' ? 'bg-red-600' :
                                build.status === 'building' ? 'bg-blue-600' :
                                'bg-gray-600'
                              }`}>
                                {build.status}
                              </span>
                            </div>
                            {build.status === 'success' && build.downloadUrl && (
                              <a 
                                href={build.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-sm underline"
                              >
                                Download {build.platform === 'android' ? 'APK' : build.platform === 'ios' ? 'IPA' : 'ZIP'}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Chat Interface - Make it more accessible */}
          <div className={`border-t border-gray-800 bg-black flex flex-col transition-all duration-300 ${
            isChatCollapsed 
              ? 'h-0 overflow-hidden' 
              : 'h-80 min-h-[320px] max-h-96'
          }`}>
            {/* Chat Header with better controls */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-gray-800 flex items-center justify-between bg-gray-900">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-200">AI Assistant</span>
                <span className="text-xs text-gray-400">({chatMessages.length} messages)</span>
              </div>
              <div className="flex items-center space-x-2">
                {isGenerating && (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span className="text-xs text-blue-400">Generating...</span>
                  </div>
                )}
                {/* Minimize/Maximize Chat */}
                <button
                  onClick={() => setIsChatCollapsed(!isChatCollapsed)}
                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  {isChatCollapsed ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      <span>Show</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      <span>Hide</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Chat Messages - Properly scrollable */}
            <div 
              ref={chatRef}
              className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800 p-4 space-y-4"
            >
              {chatMessages.length > 0 ? chatMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start space-x-3 ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-blue-600' 
                      : message.type === 'assistant' 
                        ? 'bg-purple-600' 
                        : 'bg-gray-600'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : message.type === 'assistant' ? (
                      <Bot className="w-4 h-4 text-white" />
                    ) : (
                      <Settings className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <div className={`max-w-[80%] ${
                    message.type === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    <div className={`inline-block p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.type === 'assistant'
                          ? 'bg-gray-800 text-gray-200'
                          : 'bg-gray-700 text-gray-300'
                    }`}>
                      {message.isGenerating ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{message.content}</span>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              )) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs text-gray-600 mt-1">Start a conversation to generate your app</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input - Always visible when chat is open */}
            <div className="flex-shrink-0 p-4 border-t border-gray-800 bg-gray-900">
              <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Describe your app or ask for changes..."
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-200 placeholder-gray-400"
                    rows={2}
                    disabled={isGenerating}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!currentMessage.trim() || isGenerating}
                  className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 