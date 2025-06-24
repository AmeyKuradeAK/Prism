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

import { generateStandardReactNativeTemplate } from '@/lib/generators/templates/standard-react-native-template'

// 🚦 Rate Limiting for Mistral API (1 RPS, 500k tokens/minute)
class MistralRateLimiter {
  private lastRequestTime = 0
  private tokenUsageMinute = 0
  private minuteStartTime = 0
  private readonly MAX_TOKENS_PER_MINUTE = 450000 // Leave buffer for 500k limit
  private readonly MIN_REQUEST_INTERVAL = 1100 // 1.1 seconds to ensure 1 RPS

  async waitForRateLimit(estimatedTokens: number): Promise<void> {
    const now = Date.now()
    
    // Reset token counter every minute
    if (now - this.minuteStartTime > 60000) {
      this.tokenUsageMinute = 0
      this.minuteStartTime = now
      console.log('🔄 Mistral rate limiter: Reset token counter for new minute')
    }
    
    // Check token limit
    if (this.tokenUsageMinute + estimatedTokens > this.MAX_TOKENS_PER_MINUTE) {
      const waitTime = 60000 - (now - this.minuteStartTime)
      console.log(`🕐 Mistral rate limiter: Token limit reached, waiting ${Math.ceil(waitTime/1000)}s`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
      this.tokenUsageMinute = 0
      this.minuteStartTime = Date.now()
    }
    
    // Check RPS limit
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest
      console.log(`🚦 Mistral rate limiter: Waiting ${waitTime}ms for RPS limit`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    this.lastRequestTime = Date.now()
    this.tokenUsageMinute += estimatedTokens
    console.log(`📊 Mistral rate limiter: ${this.tokenUsageMinute}/${this.MAX_TOKENS_PER_MINUTE} tokens used this minute`)
  }
}

const mistralLimiter = new MistralRateLimiter()

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
  console.log('🚀 Starting AI File Generation + Virtual Merge Pipeline...')
  console.log(`🌐 Pipeline Environment: ${typeof process !== 'undefined' ? process.env?.NODE_ENV || 'unknown' : 'no-process'}`)
  
  try {
    // STEP 1: Prompt Analysis
    console.log('📊 Step 1: Analyzing prompt...')
    const analysis = analyzePrompt(prompt)
    console.log(`✅ Detected: ${analysis.type} app (${analysis.complexity}) with ${analysis.features.length} features`)
    
    // STEP 2: Plan Formation
    console.log('🎯 Step 2: Creating generation plan...')
    const plan = createGenerationPlan(analysis, prompt)
    console.log(`✅ Plan: ${plan.steps.length} steps, ${plan.steps.reduce((sum, step) => sum + step.files.length, 0)} files`)
    
    // STEP 3: Base Template (Foundation - always created)
    console.log('📱 Step 3: Creating base template foundation...')
    const baseFiles = generateStandardReactNativeTemplate(plan.appName)
    console.log(`✅ Base foundation: ${Object.keys(baseFiles).length} files`)
    
    if (Object.keys(baseFiles).length === 0) {
      throw new Error('Base template generation failed - no foundation files created')
    }
    
    // STEP 4: AI File Generation (Primary Feature - not fallback!)
    console.log('🧠 Step 4: AI generating new files to merge...')
    
    if (!process.env.MISTRAL_API_KEY || process.env.MISTRAL_API_KEY.length < 10) {
      throw new Error('Mistral API key required for AI file generation')
    }
    
    console.log('🔑 Mistral API available - generating AI files...')
    const aiGeneratedFiles = await generateAIFiles(plan)
    console.log(`✅ AI generated: ${Object.keys(aiGeneratedFiles).length} new files`)
    
    // STEP 5: Virtual Merge (Like Git Merge - merge AI files INTO base)
    console.log('🔀 Step 5: Merging AI files into base template (virtual merge)...')
    const mergedFiles = performVirtualMerge(baseFiles, aiGeneratedFiles, analysis)
    console.log(`✅ Virtual merge complete: ${Object.keys(mergedFiles).length} total files`)
    
    // STEP 6: Validation & Build-Ready
    console.log('🛠️ Step 6: Validating merged files...')
    const validatedFiles = validateAndFix(mergedFiles, analysis)
    const buildReadyFiles = ensureBuildReady(validatedFiles, analysis)
    
    console.log(`🎉 Pipeline complete: ${Object.keys(buildReadyFiles).length} files ready`)
    return buildReadyFiles
    
  } catch (error) {
    console.error('❌ Pipeline failed:', error)
    throw new Error(`Failed to generate with base template: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

// 🧠 Token-Optimized Prompt Engineering (Mistral 1 RPS limit)
function generateV0StylePrompts(analysis: AppAnalysis, originalPrompt: string) {
  const systemPrompt = `Expert React Native dev. Generate for Expo SDK 53.

Base exists: Expo Router, TypeScript, ThemedText/ThemedView

App: ${analysis.type}, ${analysis.complexity}
Need: ${analysis.components.slice(0, 3).join(', ')}

Format:
===FILE: path/file.tsx===
[code]
===END===`

  const userPrompt = `"${originalPrompt.substring(0, 80)}..."

Generate: ${analysis.components.slice(0, 2).join(', ')}
Screens: ${analysis.screens.slice(0, 2).join(', ')}

Production-ready, clean UI.`

  return {
    system: systemPrompt,
    user: userPrompt
  }
}

// 🧠 LLM Generation with Rate Limiting & Retry Logic
// 🤖 AI File Generation (Pure AI generation - no merge here)
async function generateAIFiles(plan: GenerationPlan): Promise<{ [key: string]: string }> {
  const maxRetries = 3
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔌 Importing Mistral AI (attempt ${attempt}/${maxRetries})...`)
      const { Mistral } = await import('@mistralai/mistralai')
      
      console.log('🤖 Creating Mistral client...')
      const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! })

      // Estimate token usage (rough approximation: 1 token ≈ 4 characters)
      const systemTokens = Math.ceil(plan.prompts.system.length / 4)
      const userTokens = Math.ceil(plan.prompts.user.length / 4)
      const maxTokens = 2500 // Reduced to save tokens
      const estimatedTotalTokens = systemTokens + userTokens + maxTokens
      
      console.log(`📊 Token estimation: ${systemTokens} + ${userTokens} + ${maxTokens} = ${estimatedTotalTokens} total`)
      
      // Apply rate limiting
      console.log('🚦 Applying Mistral rate limiting...')
      await mistralLimiter.waitForRateLimit(estimatedTotalTokens)

      console.log('📤 Sending request to Mistral API...')
      const startTime = Date.now()
      
      const response = await Promise.race([
        mistral.chat.complete({
          model: 'mistral-small-latest',
          messages: [
            { role: 'system', content: plan.prompts.system },
            { role: 'user', content: plan.prompts.user }
          ],
          temperature: 0.2,
          maxTokens: maxTokens
        }),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Mistral API timeout after 45 seconds')), 45000)
        })
      ]) as any

      const duration = Date.now() - startTime
      console.log(`📥 Received response from Mistral API in ${duration}ms`)
      
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

      console.log(`🔍 Parsing AI response (${contentString.length} chars)...`)
      
      // Parse AI response to extract files
      const { parseCodeFromResponse } = await import('@/lib/utils/code-parser')
      const generatedFiles = parseCodeFromResponse(contentString)
      
      console.log(`📁 AI generated ${generatedFiles.length} files`)
      
      // Convert to file object format
      const aiFiles: { [key: string]: string } = {}
      for (const file of generatedFiles) {
        if (file.path && file.content) {
          aiFiles[file.path.trim()] = file.content
        }
      }
      
      console.log(`✅ AI file generation complete: ${Object.keys(aiFiles).length} files`)
      return aiFiles
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      console.error(`❌ AI generation attempt ${attempt}/${maxRetries} failed:`, lastError.message)
      
      // Check if error is retryable
      const isRateLimitError = lastError.message.includes('429') || lastError.message.includes('rate limit')
      const isRetryableError = isRateLimitError || 
        lastError.message.includes('timeout') || 
        lastError.message.includes('500') || 
        lastError.message.includes('502') || 
        lastError.message.includes('503') ||
        lastError.message.includes('network')
      
      // Don't retry auth errors
      if (lastError.message.includes('401') || lastError.message.includes('unauthorized')) {
        console.error('🔑 Authentication failed - check API key')
        throw lastError
      }
      
      // If this is the last attempt or non-retryable error, throw
      if (attempt === maxRetries || !isRetryableError) {
        throw lastError
      }
      
      // Exponential backoff for retries
      const backoffTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
      console.log(`⏳ Retrying in ${backoffTime}ms...`)
      await new Promise(resolve => setTimeout(resolve, backoffTime))
    }
  }
  
  throw lastError || new Error('All AI generation attempts failed')
}

// 🔀 Virtual Merge (Like Git Merge - merge AI files into base template)
function performVirtualMerge(
  baseFiles: { [key: string]: string }, 
  aiFiles: { [key: string]: string },
  analysis: AppAnalysis
): { [key: string]: string } {
  console.log(`🔀 Starting virtual merge: ${Object.keys(baseFiles).length} base + ${Object.keys(aiFiles).length} AI files`)
  
  // Start with base template as foundation
  const mergedFiles = { ...baseFiles }
  let addedCount = 0
  let replacedCount = 0
  let mergedCount = 0
  
  // Process each AI-generated file
  for (const [aiPath, aiContent] of Object.entries(aiFiles)) {
    if (!aiContent?.trim()) continue
    
    const normalizedPath = aiPath.trim()
    
    // Smart file placement and merging
    if (normalizedPath.includes('Component') || normalizedPath.includes('component')) {
      // Place components in components/ directory
      const componentPath = normalizedPath.startsWith('components/') 
        ? normalizedPath 
        : `components/${normalizedPath.split('/').pop()}`
      
      if (mergedFiles[componentPath]) {
        console.log(`🔄 Replacing component: ${componentPath}`)
        replacedCount++
      } else {
        console.log(`➕ Adding new component: ${componentPath}`)
        addedCount++
      }
      mergedFiles[componentPath] = aiContent
      
    } else if (normalizedPath.includes('Screen') || normalizedPath.includes('screen') || normalizedPath.startsWith('app/')) {
      // Place screens in app/ directory
      const screenPath = normalizedPath.startsWith('app/') 
        ? normalizedPath 
        : `app/${normalizedPath.split('/').pop()}`
      
      if (mergedFiles[screenPath]) {
        console.log(`🔄 Replacing screen: ${screenPath}`)
        replacedCount++
      } else {
        console.log(`➕ Adding new screen: ${screenPath}`)
        addedCount++
      }
      mergedFiles[screenPath] = aiContent
      
    } else if (normalizedPath === 'package.json') {
      // Special handling for package.json - merge dependencies
      try {
        const basePackage = JSON.parse(mergedFiles[normalizedPath] || '{}')
        const aiPackage = JSON.parse(aiContent)
        
        // Merge dependencies
        if (aiPackage.dependencies) {
          basePackage.dependencies = { ...basePackage.dependencies, ...aiPackage.dependencies }
        }
        if (aiPackage.devDependencies) {
          basePackage.devDependencies = { ...basePackage.devDependencies, ...aiPackage.devDependencies }
        }
        
        mergedFiles[normalizedPath] = JSON.stringify(basePackage, null, 2)
        console.log(`🔀 Merged package.json dependencies`)
        mergedCount++
      } catch {
        // If JSON parsing fails, replace entirely
        mergedFiles[normalizedPath] = aiContent
        console.log(`🔄 Replaced package.json (merge failed)`)
        replacedCount++
      }
      
    } else {
      // Generic file handling
      if (mergedFiles[normalizedPath]) {
        console.log(`🔄 Replacing file: ${normalizedPath}`)
        replacedCount++
      } else {
        console.log(`➕ Adding new file: ${normalizedPath}`)
        addedCount++
      }
      mergedFiles[normalizedPath] = aiContent
    }
  }
  
  console.log(`✅ Virtual merge complete: +${addedCount} added, ${replacedCount} replaced, ${mergedCount} merged`)
  console.log(`📊 Total files after merge: ${Object.keys(mergedFiles).length}`)
  
  return mergedFiles
}

// Legacy function - replaced by generateAIFiles + performVirtualMerge
// This function is kept for reference but not used in the new pipeline

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