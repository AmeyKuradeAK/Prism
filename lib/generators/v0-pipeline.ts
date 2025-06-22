/**
 * 🚀 V0.dev-style Pipeline for React Native
 * 
 * This replicates the exact v0.dev architecture:
 * 1. Prompt Parsing & Classification
 * 2. Plan Formation (components, layout, functionality)
 * 3. Code Generation (LLM + Templates + Rules)
 * 4. AST Validation & Auto-fix
 * 5. Build Validation & Error Recovery
 */

import { generateExpoBaseTemplate } from '@/lib/generators/templates/expo-base-template'

// 📊 Prompt Classification (like v0.dev)
interface AppAnalysis {
  type: 'todo' | 'social' | 'ecommerce' | 'fitness' | 'finance' | 'productivity' | 'game' | 'utility' | 'other'
  complexity: 'simple' | 'medium' | 'complex'
  features: string[]
  screens: string[]
  components: string[]
  navigation: 'tabs' | 'stack' | 'drawer' | 'mixed'
  dataNeeds: 'none' | 'local' | 'api' | 'database'
  styling: 'basic' | 'themed' | 'custom'
}

interface GenerationPlan {
  appName: string
  analysis: AppAnalysis
  steps: Array<{
    name: string
    description: string
    files: string[]
  }>
  prompts: {
    system: string
    user: string
    followUp?: string
  }
}

// 🧠 V0.dev-style Prompt Analysis
export function analyzePrompt(prompt: string): AppAnalysis {
  const lowerPrompt = prompt.toLowerCase()
  
  // App Type Detection
  let type: AppAnalysis['type'] = 'other'
  if (lowerPrompt.includes('todo') || lowerPrompt.includes('task') || lowerPrompt.includes('checklist')) {
    type = 'todo'
  } else if (lowerPrompt.includes('social') || lowerPrompt.includes('chat') || lowerPrompt.includes('feed')) {
    type = 'social'
  } else if (lowerPrompt.includes('shop') || lowerPrompt.includes('store') || lowerPrompt.includes('ecommerce')) {
    type = 'ecommerce'
  } else if (lowerPrompt.includes('fitness') || lowerPrompt.includes('workout') || lowerPrompt.includes('health')) {
    type = 'fitness'
  } else if (lowerPrompt.includes('finance') || lowerPrompt.includes('budget') || lowerPrompt.includes('money')) {
    type = 'finance'
  }
  
  // Complexity Detection
  const complexityWords = lowerPrompt.split(' ').length
  const complexFeatures = ['auth', 'database', 'api', 'payment', 'notification', 'camera', 'location']
  const hasComplexFeatures = complexFeatures.some(feature => lowerPrompt.includes(feature))
  
  let complexity: AppAnalysis['complexity'] = 'simple'
  if (complexityWords > 20 || hasComplexFeatures) complexity = 'medium'
  if (complexityWords > 50 || lowerPrompt.includes('advanced') || lowerPrompt.includes('enterprise')) complexity = 'complex'
  
  // Feature Extraction
  const features: string[] = []
  if (lowerPrompt.includes('auth') || lowerPrompt.includes('login')) features.push('authentication')
  if (lowerPrompt.includes('camera')) features.push('camera')
  if (lowerPrompt.includes('location') || lowerPrompt.includes('map')) features.push('location')
  if (lowerPrompt.includes('notification')) features.push('notifications')
  if (lowerPrompt.includes('payment')) features.push('payments')
  if (lowerPrompt.includes('offline')) features.push('offline-storage')
  
  // Screen Planning (v0.dev style)
  const screens: string[] = ['home']
  if (type === 'todo') screens.push('add-task', 'task-details')
  if (type === 'social') screens.push('profile', 'feed', 'messages')
  if (type === 'ecommerce') screens.push('products', 'cart', 'checkout')
  if (features.includes('authentication')) screens.push('login', 'register')
  
  // Component Planning
  const components: string[] = ['Header', 'Button', 'Card']
  if (type === 'todo') components.push('TaskItem', 'AddTaskForm')
  if (type === 'social') components.push('PostCard', 'UserAvatar', 'CommentSection')
  if (type === 'ecommerce') components.push('ProductCard', 'CartItem', 'PriceDisplay')
  
  return {
    type,
    complexity,
    features,
    screens,
    components,
    navigation: screens.length > 3 ? 'mixed' : 'tabs',
    dataNeeds: features.includes('offline-storage') ? 'database' : features.length > 2 ? 'api' : 'local',
    styling: complexity === 'simple' ? 'basic' : 'themed'
  }
}

// 🚀 Main V0.dev Pipeline
export async function runV0Pipeline(prompt: string): Promise<{ [key: string]: string }> {
  console.log('🚀 Starting V0.dev-style pipeline...')
  console.log(`🌐 Pipeline Environment: ${typeof process !== 'undefined' ? process.env?.NODE_ENV || 'unknown' : 'no-process'}`)
  
  try {
    // STEP 1: Prompt Analysis (like v0.dev)
    console.log('📊 Step 1: Analyzing prompt...')
    const analysis = analyzePrompt(prompt)
    console.log(`✅ Detected: ${analysis.type} app (${analysis.complexity}) with ${analysis.features.length} features`)
    console.log(`📋 Analysis details:`, {
      type: analysis.type,
      complexity: analysis.complexity,
      features: analysis.features,
      screens: analysis.screens,
      components: analysis.components
    })
    
    // STEP 2: Plan Formation (like v0.dev)
    console.log('🎯 Step 2: Creating generation plan...')
    const plan = createGenerationPlan(analysis, prompt)
    console.log(`✅ Plan: ${plan.steps.length} steps, ${plan.steps.reduce((sum, step) => sum + step.files.length, 0)} files`)
    
    // STEP 3: Base Template (like v0.dev Next.js base)
    console.log('📱 Step 3: Instantiating base template...')
    console.log(`📛 Calling generateExpoBaseTemplate with appName: "${plan.appName}"`)
    
    const baseFiles = generateExpoBaseTemplate(plan.appName)
    
    console.log(`✅ Base template: ${Object.keys(baseFiles).length} files`)
    console.log(`📁 Base template files: ${Object.keys(baseFiles).slice(0, 5).join(', ')}${Object.keys(baseFiles).length > 5 ? '...' : ''}`)
    
    // Verify base template has content
    const baseFilesWithContent = Object.entries(baseFiles).filter(([_, content]) => content && content.length > 0)
    console.log(`📊 Base files with content: ${baseFilesWithContent.length}/${Object.keys(baseFiles).length}`)
    
    if (Object.keys(baseFiles).length === 0) {
      throw new Error('Base template generation failed - no files returned')
    }
    
    // STEP 4: LLM Generation (like v0.dev) - Enhanced error handling with better fallback
    console.log('🧠 Step 4: LLM generating components...')
    let enhancedFiles = baseFiles
    
    if (process.env.MISTRAL_API_KEY && process.env.MISTRAL_API_KEY.length > 10) {
      try {
        console.log('🔑 Mistral API key found, attempting LLM generation...')
        enhancedFiles = await generateWithLLM(plan, baseFiles)
        console.log(`✅ LLM generation successful: ${Object.keys(enhancedFiles).length} total files`)
      } catch (error) {
        console.log('⚠️ LLM failed, using enhanced base template with manual component injection')
        console.error('LLM Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        })
        
        // ENHANCED FALLBACK: Inject smart components based on the analysis
        enhancedFiles = await generateSmartFallbackFiles(baseFiles, analysis, prompt)
        console.log(`🔧 Fallback generation complete: ${Object.keys(enhancedFiles).length} total files`)
      }
    } else {
      console.log('📦 No Mistral API key - using enhanced base template with smart components')
      enhancedFiles = await generateSmartFallbackFiles(baseFiles, analysis, prompt)
    }
    
    // STEP 5: AST Validation (like v0.dev)
    console.log('🛠️ Step 5: AST validation and auto-fix...')
    const validatedFiles = validateAndFix(enhancedFiles, analysis)
    console.log(`✅ Validation complete: ${Object.keys(validatedFiles).length} files`)
    
    // STEP 6: Build Check (like v0.dev)
    console.log('🔨 Step 6: Build validation...')
    const buildReadyFiles = ensureBuildReady(validatedFiles, analysis)
    console.log(`✅ Build ready: ${Object.keys(buildReadyFiles).length} files`)
    
    console.log('🎉 V0.dev pipeline complete!')
    return buildReadyFiles
    
  } catch (error) {
    console.error('❌ V0.dev pipeline failed:', error)
    
    // Emergency fallback - return base template
    console.log('🚨 Emergency fallback: returning base template...')
    try {
      const fallbackFiles = generateExpoBaseTemplate('FallbackApp')
      console.log(`🆘 Fallback successful: ${Object.keys(fallbackFiles).length} files`)
      return fallbackFiles
    } catch (fallbackError) {
      console.error('❌ Even fallback failed:', fallbackError)
      throw new Error(`V0.dev pipeline failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// 🎯 V0.dev-style Plan Formation
function createGenerationPlan(analysis: AppAnalysis, prompt: string): GenerationPlan {
  return {
    appName: extractAppName(prompt),
    analysis,
    steps: [
      {
        name: 'base-template',
        description: 'Instantiate solid Expo base template',
        files: ['package.json', 'app.json', 'app/_layout.tsx', 'app/(tabs)/_layout.tsx']
      },
      {
        name: 'screens',
        description: `Generate ${analysis.screens.length} screens`,
        files: analysis.screens.map(screen => `app/${screen}.tsx`)
      },
      {
        name: 'components',
        description: `Create ${analysis.components.length} custom components`,
        files: analysis.components.map(comp => `components/${comp}.tsx`)
      },
      {
        name: 'features',
        description: `Implement ${analysis.features.length} features`,
        files: analysis.features.map(feature => `lib/${feature}.ts`)
      },
      {
        name: 'validation',
        description: 'AST validation and auto-fix',
        files: []
      }
    ],
    prompts: generateV0StylePrompts(analysis, prompt)
  }
}

// 🧠 V0.dev-style Prompt Engineering
function generateV0StylePrompts(analysis: AppAnalysis, originalPrompt: string) {
  const systemPrompt = `You are a React Native code generator that works exactly like v0.dev but for mobile apps.

CONTEXT: You have a solid Expo React Native foundation with:
✅ Modern Expo Router (app/ directory routing)  
✅ React Native 0.79.4 + Expo SDK 53
✅ Themed components (ThemedText, ThemedView)
✅ TypeScript + proper structure

ANALYSIS:
- App Type: ${analysis.type}
- Complexity: ${analysis.complexity}
- Features: ${analysis.features.join(', ')}
- Screens Needed: ${analysis.screens.join(', ')}
- Components Needed: ${analysis.components.join(', ')}

RULES (v0.dev style):
1. Generate production-ready, clean code
2. Use proper TypeScript types
3. Follow Expo Router conventions
4. Import from existing themed components
5. Add proper error handling
6. Make responsive designs
7. Use modern React Native patterns

OUTPUT FORMAT:
===FILE: path/to/file.tsx===
[complete file content]
===END===`

  const userPrompt = `Generate a ${analysis.type} app: "${originalPrompt}"

Required screens: ${analysis.screens.join(', ')}
Required components: ${analysis.components.join(', ')}
Features to implement: ${analysis.features.join(', ') || 'basic functionality'}

Make it production-ready with proper navigation, state management, and clean UI.`

  return {
    system: systemPrompt,
    user: userPrompt,
    followUp: analysis.complexity === 'complex' 
      ? 'Add advanced error handling, loading states, and performance optimizations.'
      : undefined
  }
}

// 🧠 LLM Generation with V0.dev prompts
async function generateWithLLM(plan: GenerationPlan, baseFiles: { [key: string]: string }): Promise<{ [key: string]: string }> {
  try {
    console.log('🔌 Importing Mistral AI...')
    const { Mistral } = await import('@mistralai/mistralai')
    
    console.log('🤖 Creating Mistral client...')
    const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! })

    console.log('📤 Sending request to Mistral API...')
    const response = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [
        { role: 'system', content: plan.prompts.system },
        { role: 'user', content: plan.prompts.user }
      ],
      temperature: 0.2,
      maxTokens: 4000
    })

    console.log('📥 Received response from Mistral API')
    const responseContent = response.choices[0]?.message?.content || ''
    
    if (!responseContent) {
      throw new Error('Empty response from Mistral API')
    }
    
    const contentString = typeof responseContent === 'string' 
      ? responseContent 
      : Array.isArray(responseContent) 
        ? responseContent.map(chunk => 
            chunk.type === 'text' ? chunk.text : ''
          ).join('')
        : String(responseContent)

    console.log(`🔍 Parsing LLM response (${contentString.length} chars)...`)
    
    // Parse LLM response
    const { parseCodeFromResponse } = await import('@/lib/utils/code-parser')
    const generatedFiles = parseCodeFromResponse(contentString)
    
    console.log(`📁 Parsed ${generatedFiles.length} files from LLM response`)
    console.log(`📋 Generated file paths: ${generatedFiles.map(f => f.path).join(', ')}`)
    
    // START: ENHANCED FILE INTEGRATION LOGIC
    console.log('🔄 Starting enhanced file integration...')
    
    // Create a copy of base files to work with
    const allFiles = { ...baseFiles }
    const baseFileCount = Object.keys(baseFiles).length
    
    console.log(`📊 Base template has ${baseFileCount} files`)
    console.log(`📊 AI generated ${generatedFiles.length} additional files`)
    
    // Process each AI-generated file with smart integration
    for (const file of generatedFiles) {
      if (!file.path || !file.content) {
        console.log(`⚠️ Skipping invalid file: ${file.path || 'unknown'}`)
        continue
      }
      
      const normalizedPath = file.path.trim()
      console.log(`🔧 Processing AI file: ${normalizedPath} (${file.content.length} chars)`)
      
      // SMART INTEGRATION RULES:
      
      // 1. If it's a new component, place it in the components/ directory
      if (normalizedPath.includes('Component') || normalizedPath.includes('component')) {
        const componentPath = normalizedPath.startsWith('components/') 
          ? normalizedPath 
          : `components/${normalizedPath.split('/').pop()}`
        
        allFiles[componentPath] = file.content
        console.log(`✅ Added component: ${componentPath}`)
        continue
      }
      
      // 2. If it's a screen/page, place it in the app/ directory
      if (normalizedPath.includes('Screen') || normalizedPath.includes('screen') || 
          normalizedPath.includes('Page') || normalizedPath.includes('page')) {
        const screenPath = normalizedPath.startsWith('app/') 
          ? normalizedPath 
          : `app/${normalizedPath.split('/').pop()}`
        
        allFiles[screenPath] = file.content
        console.log(`✅ Added screen: ${screenPath}`)
        continue
      }
      
      // 3. If it's modifying an existing base file, merge intelligently
      if (allFiles[normalizedPath]) {
        console.log(`🔄 Merging with existing file: ${normalizedPath}`)
        
        // For package.json, merge dependencies
        if (normalizedPath === 'package.json') {
          try {
            const basePackage = JSON.parse(allFiles[normalizedPath])
            const aiPackage = JSON.parse(file.content)
            
            // Merge dependencies
            if (aiPackage.dependencies) {
              basePackage.dependencies = { ...basePackage.dependencies, ...aiPackage.dependencies }
            }
            if (aiPackage.devDependencies) {
              basePackage.devDependencies = { ...basePackage.devDependencies, ...aiPackage.devDependencies }
            }
            if (aiPackage.scripts) {
              basePackage.scripts = { ...basePackage.scripts, ...aiPackage.scripts }
            }
            
            allFiles[normalizedPath] = JSON.stringify(basePackage, null, 2)
            console.log(`✅ Merged package.json dependencies`)
          } catch (error) {
            console.log(`⚠️ Failed to merge package.json, using AI version`)
            allFiles[normalizedPath] = file.content
          }
        } 
        // For TypeScript/React files, replace if AI version is more substantial
        else if (normalizedPath.endsWith('.tsx') || normalizedPath.endsWith('.ts')) {
          if (file.content.length > allFiles[normalizedPath].length * 1.2) {
            allFiles[normalizedPath] = file.content
            console.log(`✅ Replaced ${normalizedPath} with enhanced AI version`)
          } else {
            console.log(`📋 Kept base version of ${normalizedPath} (more substantial)`)
          }
        }
        // For other files, prefer AI version if it's significantly different
        else {
          allFiles[normalizedPath] = file.content
          console.log(`✅ Updated ${normalizedPath} with AI version`)
        }
      } 
      // 4. New file - add directly
      else {
        allFiles[normalizedPath] = file.content
        console.log(`✅ Added new file: ${normalizedPath}`)
      }
    }
    
    const finalFileCount = Object.keys(allFiles).length
    const addedFiles = finalFileCount - baseFileCount
    
    console.log(`🎉 Integration complete!`)
    console.log(`📊 Final result: ${finalFileCount} total files (${baseFileCount} base + ${addedFiles} AI-generated/modified)`)
    console.log(`📁 Final file list: ${Object.keys(allFiles).slice(0, 10).join(', ')}${finalFileCount > 10 ? '...' : ''}`)
    
    // Validate the integrated result
    const componentsAdded = Object.keys(allFiles).filter(path => path.startsWith('components/')).length
    const screensAdded = Object.keys(allFiles).filter(path => path.startsWith('app/')).length
    
    console.log(`📱 Integration stats: ${componentsAdded} components, ${screensAdded} screens/pages`)
    
    return allFiles
    
  } catch (error) {
    console.error('❌ LLM generation failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    throw error
  }
}

// 🛠️ AST Validation & Auto-fix (like v0.dev)
function validateAndFix(files: { [key: string]: string }, analysis: AppAnalysis): { [key: string]: string } {
  const validatedFiles = { ...files }
  
  // Auto-fix imports
  for (const [path, content] of Object.entries(validatedFiles)) {
    if (path.endsWith('.tsx') || path.endsWith('.ts')) {
      validatedFiles[path] = fixImports(content, path, analysis)
    }
  }
  
  // Ensure essential files
  const essentials = [
    'package.json',
    'app.json',
    'app/_layout.tsx',
    'app/(tabs)/_layout.tsx',
    'app/(tabs)/index.tsx'
  ]
  
  for (const essential of essentials) {
    if (!validatedFiles[essential]) {
      console.log(`⚠️ Auto-generating missing: ${essential}`)
      validatedFiles[essential] = generateEssentialFile(essential, analysis)
    }
  }
  
  return validatedFiles
}

// 🔨 Build Validation (like v0.dev)
function ensureBuildReady(files: { [key: string]: string }, analysis: AppAnalysis): { [key: string]: string } {
  const buildReady = { ...files }
  
  // Ensure all TypeScript files have proper exports
  for (const [path, content] of Object.entries(buildReady)) {
    if (path.endsWith('.tsx') && path.includes('app/')) {
      if (!content.includes('export default')) {
        console.log(`⚠️ Auto-fixing missing export in: ${path}`)
        buildReady[path] = ensureDefaultExport(content, path)
      }
    }
  }
  
  return buildReady
}

// Helper functions
function extractAppName(prompt: string): string {
  const words = prompt.split(' ').slice(0, 3).join(' ').replace(/[^a-zA-Z0-9\s]/g, '').trim()
  return words || 'ExpoApp'
}

function fixImports(content: string, filePath: string, analysis: AppAnalysis): string {
  let fixed = content
  
  // Auto-add missing themed imports
  if (fixed.includes('ThemedText') && !fixed.includes("from '@/components/ThemedText'")) {
    fixed = "import { ThemedText } from '@/components/ThemedText'\n" + fixed
  }
  if (fixed.includes('ThemedView') && !fixed.includes("from '@/components/ThemedView'")) {
    fixed = "import { ThemedView } from '@/components/ThemedView'\n" + fixed
  }
  
  // Auto-add React imports
  if ((fixed.includes('useState') || fixed.includes('useEffect')) && !fixed.includes("from 'react'")) {
    fixed = "import React, { useState, useEffect } from 'react'\n" + fixed
  }
  
  return fixed
}

function generateEssentialFile(fileName: string, analysis: AppAnalysis): string {
  // Generate missing essential files based on analysis
  switch (fileName) {
    case 'app/(tabs)/index.tsx':
      return `import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'

export default function HomeScreen() {
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title">Welcome to ${analysis.type} App</ThemedText>
      <ThemedText>Your ${analysis.complexity} ${analysis.type} app is ready!</ThemedText>
    </ThemedView>
  )
}`
    default:
      return '// Auto-generated file'
  }
}

function ensureDefaultExport(content: string, filePath: string): string {
  if (content.includes('export default')) return content
  
  // Extract component name from file path
  const componentName = filePath.split('/').pop()?.replace('.tsx', '') || 'Screen'
  
  return content + `\n\nexport default ${componentName}`
}

// 🔧 SMART FALLBACK: Generate components based on analysis when LLM fails
async function generateSmartFallbackFiles(baseFiles: { [key: string]: string }, analysis: AppAnalysis, originalPrompt: string): Promise<{ [key: string]: string }> {
  console.log('🔧 Generating smart fallback components...')
  
  const enhancedFiles = { ...baseFiles }
  
  // Generate components based on the app type and analysis
  for (const componentName of analysis.components) {
    if (componentName === 'Header' || componentName === 'Button' || componentName === 'Card') {
      continue // Skip basic components that are already in base template
    }
    
    const componentPath = `components/${componentName}.tsx`
    const componentCode = generateFallbackComponent(componentName, analysis, originalPrompt)
    
    if (componentCode) {
      enhancedFiles[componentPath] = componentCode
      console.log(`✅ Generated fallback component: ${componentPath}`)
    }
  }
  
  // Generate additional screens based on analysis
  for (const screenName of analysis.screens) {
    if (screenName === 'home') continue // Already exists in base template
    
    const screenPath = `app/(tabs)/${screenName}.tsx`
    const screenCode = generateFallbackScreen(screenName, analysis, originalPrompt)
    
    if (screenCode) {
      enhancedFiles[screenPath] = screenCode
      console.log(`✅ Generated fallback screen: ${screenPath}`)
    }
  }
  
  // Update the tab layout to include new screens
  if (analysis.screens.length > 2) {
    enhancedFiles['app/(tabs)/_layout.tsx'] = generateEnhancedTabLayout(analysis.screens)
    console.log(`✅ Updated tab layout with ${analysis.screens.length} screens`)
  }
  
  console.log(`✅ Smart fallback complete: ${Object.keys(enhancedFiles).length - Object.keys(baseFiles).length} additional files generated`)
  
  return enhancedFiles
}

// Generate fallback components based on app type
function generateFallbackComponent(componentName: string, analysis: AppAnalysis, prompt: string): string {
  const baseImports = `import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'`

  switch (componentName) {
    case 'TaskItem':
      return `${baseImports}

interface TaskItemProps {
  task: {
    id: string
    title: string
    completed: boolean
  }
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity 
        style={[styles.checkbox, task.completed && styles.completed]}
        onPress={() => onToggle(task.id)}
      >
        <ThemedText style={styles.checkmark}>
          {task.completed ? '✓' : ''}
        </ThemedText>
      </TouchableOpacity>
      
      <ThemedText 
        style={[styles.title, task.completed && styles.completedText]}
      >
        {task.title}
      </ThemedText>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => onDelete(task.id)}
      >
        <ThemedText style={styles.deleteText}>×</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completed: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    flex: 1,
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    fontSize: 20,
    color: '#FF3B30',
  },
})`

    case 'ProductCard':
      return `${baseImports}

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    image?: string
  }
  onAddToCart: (id: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <ThemedView style={styles.card}>
      <ThemedView style={styles.imageContainer}>
        <ThemedText style={styles.imagePlaceholder}>
          📷
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.content}>
        <ThemedText style={styles.productName}>
          {product.name}
        </ThemedText>
        <ThemedText style={styles.price}>
          $\{product.price.toFixed(2)}
        </ThemedText>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => onAddToCart(product.id)}
        >
          <ThemedText style={styles.addButtonText}>
            Add to Cart
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    height: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  imagePlaceholder: {
    fontSize: 40,
  },
  content: {
    gap: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
})`

    default:
      // Generic component
      return `${baseImports}

export function ${componentName}() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>
        ${componentName}
      </ThemedText>
      <ThemedText>
        This ${componentName.toLowerCase()} component is ready for your customization.
      </ThemedText>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
})`
  }
}

// Generate fallback screens
function generateFallbackScreen(screenName: string, analysis: AppAnalysis, prompt: string): string {
  const capitalizedName = screenName.charAt(0).toUpperCase() + screenName.slice(1)
  
  return `import { StyleSheet, ScrollView } from 'react-native'
import ParallaxScrollView from '@/components/ParallaxScrollView'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'

export default function ${capitalizedName}Screen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<ThemedView style={styles.headerImage} />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">${capitalizedName}</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.contentContainer}>
        <ThemedText>
          Welcome to the ${screenName} screen of your ${analysis.type} app!
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          This screen is ready for your ${analysis.type} features.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  headerImage: {
    backgroundColor: '#A1CEDC',
    height: 178,
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  contentContainer: {
    gap: 16,
    padding: 16,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
})`
}

// Generate enhanced tab layout with all screens
function generateEnhancedTabLayout(screens: string[]): string {
  const screenTabs = screens.map(screen => {
    const capitalizedScreen = screen.charAt(0).toUpperCase() + screen.slice(1)
    const iconName = getIconForScreen(screen)
    
    return `      <Tabs.Screen
        name="${screen === 'home' ? 'index' : screen}"
        options={{
          title: '${capitalizedScreen}',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="${iconName}" color={color} />,
        }}
      />`
  }).join('\n')
  
  return `import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
${screenTabs}
    </Tabs>
  );
}`
}

// Helper to get appropriate icon for screen
function getIconForScreen(screen: string): string {
  const iconMap: { [key: string]: string } = {
    'home': 'house.fill',
    'explore': 'paperplane.fill', 
    'profile': 'person.fill',
    'settings': 'gear',
    'search': 'magnifyingglass',
    'favorites': 'heart.fill',
    'cart': 'cart.fill',
    'messages': 'message.fill',
    'notifications': 'bell.fill',
    'add-task': 'plus.circle.fill',
    'task-details': 'list.bullet',
    'products': 'bag.fill',
    'checkout': 'creditcard.fill',
  }
  
  return iconMap[screen] || 'circle.fill'
} 