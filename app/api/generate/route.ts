import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkGenerationLimit, incrementGenerationCount, createUsageLimitResponse } from '@/lib/utils/plan-protection'
import connectToDatabase from '@/lib/database/mongodb'
import Project from '@/lib/database/models/Project'
import User from '@/lib/database/models/User'

// Helper function to create optimized prompts
function createOptimizedPrompt(prompt: string): string {
  return `Create React Native Expo app: ${prompt.substring(0, 60)}

REQUIREMENTS:
- Expo SDK 53, TypeScript
- Working code only
- Format: ===FILE: path===\ncode\n===END===

Generate 3-5 essential files:
1. app/_layout.tsx (root)
2. app/(tabs)/_layout.tsx (tabs)  
3. app/(tabs)/index.tsx (home screen)
4. components/ThemedText.tsx
5. package.json (deps)

FAST response needed!`
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('🚀 API Generate: Starting AI generation with user preferences...')
    
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      console.log('❌ Authentication failed: No userId')
      return new Response(
        JSON.stringify({ error: 'Authentication required. Please sign in to generate apps.' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    console.log(`✅ Authentication successful: ${userId}`)

    // Check generation limits based on user's plan
    const { allowed, remaining, limit } = await checkGenerationLimit()
    
    if (!allowed) {
      console.log(`❌ Generation limit reached: ${remaining}/${limit}`)
      return createUsageLimitResponse(limit, 'AI generations')
    }
    
    console.log(`✅ Generation allowed: ${remaining === -1 ? 'unlimited' : remaining} remaining`)

    const { prompt, useBaseTemplate, testMode, quickMode } = await request.json()

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      console.log('❌ Invalid prompt provided')
      return new Response(
        JSON.stringify({ error: 'Valid prompt is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`🧠 AI generation for: "${prompt.substring(0, 100)}..."`)
    console.log(`🧪 Test mode: ${testMode ? 'enabled' : 'disabled'}`)
    console.log(`⚡ Quick mode: ${quickMode ? 'enabled' : 'disabled'}`)

    // Quick mode fallback
    if (testMode || quickMode) {
      console.log('⚡ Quick mode - using COMPLETE demo-1 base template only')
      const { generateDemo1BaseTemplate } = await import('@/lib/generators/templates/complete-demo1-template')
      const { analyzePrompt } = await import('@/lib/generators/v0-pipeline')
      
      const analysis = analyzePrompt(prompt)
      const appName = `${analysis.type.charAt(0).toUpperCase() + analysis.type.slice(1)}App`
      const files = generateDemo1BaseTemplate(appName)
      
      return new Response(
        JSON.stringify({
          success: true,
          files: files,
          message: `Quick mode: Generated ${Object.keys(files).length} files`,
          fileCount: Object.keys(files).length,
          pipeline: 'quick-mode',
          analysis: analysis
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Use new AI generation service that respects user preferences
    console.log('🚀 Starting AI generation with user preferences...')
    try {
      const { aiGenerationService } = await import('@/lib/utils/ai-generation-service')
      
      // Get provider status for logging
      const providerStatus = aiGenerationService.getProviderStatus()
      console.log(`🤖 Using: ${providerStatus.provider} (${providerStatus.isUserOwned ? 'user-owned' : 'server-managed'})`)
      
      // Generate with selected provider
      const aiResponse = await aiGenerationService.generate({
        prompt: createOptimizedPrompt(prompt),
        maxTokens: 2000,
        temperature: 0.2,
        userId
      })
      
      // Parse AI response to extract files
      const { parseCodeFromResponse } = await import('@/lib/utils/code-parser')
      const generatedFiles = parseCodeFromResponse(aiResponse.content)
      
      // Convert to files object
      const files: { [key: string]: string } = {}
      generatedFiles.forEach(file => {
        if (file.path && file.content) {
          files[file.path] = file.content
        }
      })
      
      // If parsing failed, create enhanced demo-1 base template
      if (Object.keys(files).length === 0) {
        console.log('⚠️ AI parsing failed, using COMPLETE demo-1 base template...')
        const { generateDemo1BaseTemplate } = await import('@/lib/generators/templates/complete-demo1-template')
        const { analyzePrompt } = await import('@/lib/generators/v0-pipeline')
        
        const analysis = analyzePrompt(prompt)
        const appName = `${analysis.type.charAt(0).toUpperCase() + analysis.type.slice(1)}App`
        return new Response(
          JSON.stringify({
            success: true,
            files: generateDemo1BaseTemplate(appName),
            message: `AI parsing failed, using base template (${Object.keys(generateDemo1BaseTemplate(appName)).length} files)`,
            fileCount: Object.keys(generateDemo1BaseTemplate(appName)).length,
            pipeline: 'base-template-fallback',
            provider: aiResponse.provider,
            cost: aiResponse.cost
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }
      
      // Track usage for paid users
      await incrementGenerationCount()
      
      // Auto-save project to database
      let projectId = null
      try {
        const savedProject = await saveProjectToDatabase(userId, prompt, files, aiResponse.provider, aiResponse.model)
        projectId = savedProject.id
        console.log(`💾 Project auto-saved: ${savedProject.name} (ID: ${projectId})`)
      } catch (saveError) {
        console.warn('⚠️ Failed to auto-save project:', saveError)
        // Continue without failing the generation
      }
      
      console.log(`✅ AI generation success: ${Object.keys(files).length} files`)
      return new Response(
        JSON.stringify({
          success: true,
          files: files,
          message: `Generated ${Object.keys(files).length} files with ${aiResponse.provider}`,
          fileCount: Object.keys(files).length,
          pipeline: 'ai-generation-service',
          provider: aiResponse.provider,
          model: aiResponse.model,
          cost: aiResponse.cost,
          tokensUsed: aiResponse.tokensUsed,
          remaining: remaining === -1 ? -1 : remaining - 1,
          projectId: projectId // Include project ID in response
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
      
    } catch (aiError) {
      console.error('❌ AI generation failed:', aiError)
      
      // Fallback to base template
      console.log('🔄 Falling back to base template...')
      const { generateDemo1BaseTemplate } = await import('@/lib/generators/templates/complete-demo1-template')
      const { analyzePrompt } = await import('@/lib/generators/v0-pipeline')
      
      const analysis = analyzePrompt(prompt)
      const appName = `${analysis.type.charAt(0).toUpperCase() + analysis.type.slice(1)}App`
      const files = generateDemo1BaseTemplate(appName)
      
      return new Response(
        JSON.stringify({
          success: true,
          files: files,
          message: `AI generation failed, using base template (${Object.keys(files).length} files)`,
          fileCount: Object.keys(files).length,
          pipeline: 'error-fallback',
          error: aiError instanceof Error ? aiError.message : 'Unknown error'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const timeSpent = Date.now() - startTime
    
    console.error('❌ FREE AI Generation failed:', {
      error: errorMessage,
      timeSpent: `${timeSpent}ms`
    })
    
    return new Response(
      JSON.stringify({ 
        error: 'FREE AI generation failed',
        details: errorMessage,
        timeSpent: `${timeSpent}ms`,
        suggestion: 'Mistral API might be slow. Try Quick Mode for instant results.',
        provider: 'Mistral (Free)',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// SUPER OPTIMIZED MISTRAL (FREE BUT FAST!)
async function generateWithOptimizedMistral(prompt: string): Promise<{ [key: string]: string }> {
  console.log('🤖 Starting OPTIMIZED FREE Mistral generation...')
  
  const { Mistral } = await import('@mistralai/mistralai')
  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! })
  
  // ULTRA-SHORT PROMPT FOR SPEED ⚡
  const optimizedPrompt = `Create React Native Expo app: ${prompt.substring(0, 60)}

REQUIREMENTS:
- Expo SDK 53, TypeScript
- Working code only
- Format: ===FILE: path===\ncode\n===END===

Generate 3-5 essential files:
1. app/_layout.tsx (root)
2. app/(tabs)/_layout.tsx (tabs)  
3. app/(tabs)/index.tsx (home screen)
4. components/ThemedText.tsx
5. package.json (deps)

FAST response needed!`

  console.log(`📋 Optimized prompt: ${optimizedPrompt.length} chars (reduced for speed)`)
  
  const startTime = Date.now()
  
  // EXTENDED 90-SECOND TIMEOUT FOR CLIENT-SIDE CALLS
  const response = await Promise.race([
    mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: optimizedPrompt }],
      temperature: 0.1, // Lower for consistency
      maxTokens: 2000   // Reduced for speed
    }),
    new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Mistral timeout after 90 seconds')), 90000)
    })
  ]) as any

  const duration = Date.now() - startTime
  console.log(`📥 FREE Mistral responded in ${duration}ms`)
  
  const content = response.choices[0]?.message?.content || ''
  if (!content) throw new Error('Empty Mistral response')
  
  console.log(`📝 Mistral response length: ${content.length} chars`)
  
  // Parse response into files
  const { parseCodeFromResponse } = await import('@/lib/utils/code-parser')
  const generatedFiles = parseCodeFromResponse(content)
  
  // Convert to files object
  const files: { [key: string]: string } = {}
  generatedFiles.forEach(file => {
    if (file.path && file.content) {
      files[file.path] = file.content
    }
  })
  
  // If parsing failed, create enhanced demo-1 base template
  if (Object.keys(files).length === 0) {
    console.log('⚠️ Mistral parsing failed, using COMPLETE demo-1 base template...')
    const { generateDemo1BaseTemplate } = await import('@/lib/generators/templates/complete-demo1-template')
    const { analyzePrompt } = await import('@/lib/generators/v0-pipeline')
    
    const analysis = analyzePrompt(prompt)
    const appName = `${analysis.type.charAt(0).toUpperCase() + analysis.type.slice(1)}App`
    return generateDemo1BaseTemplate(appName)
  }
  
  console.log(`✅ FREE Mistral generated ${Object.keys(files).length} files`)
  return files
}

// Helper function to save generated project to database
async function saveProjectToDatabase(userId: string, prompt: string, files: { [key: string]: string }, provider?: string, model?: string) {
  await connectToDatabase()

  // Transform files object to array format expected by the model
  const filesArray = Object.entries(files).map(([path, content]) => {
    const extension = path.split('.').pop()?.toLowerCase() || 'txt'
    
    let fileType = 'txt'
    if (['tsx', 'ts', 'js', 'jsx', 'json', 'md'].includes(extension)) {
      fileType = extension
    }

    return {
      path,
      content: content as string,
      type: fileType
    }
  })

  // Generate project name from prompt
  const words = prompt.split(' ').slice(0, 4).join(' ')
  const projectName = words.length > 0 ? words : 'Generated App'
  
  // Extract dependencies from package.json if it exists
  const packageJsonFile = filesArray.find(file => file.path.includes('package.json'))
  let dependencies: string[] = []
  
  if (packageJsonFile) {
    try {
      const packageJson = JSON.parse(packageJsonFile.content)
      const deps = Object.keys(packageJson.dependencies || {})
      const devDeps = Object.keys(packageJson.devDependencies || {})
      dependencies = [...deps, ...devDeps]
    } catch {
      // Ignore JSON parse errors
    }
  }

  // Create new project
  const project = new Project({
    name: projectName,
    description: `Generated from: ${prompt}`,
    prompt,
    userId,
    files: filesArray,
    status: 'completed',
    metadata: {
      version: '1.0.0',
      expoVersion: '50.0.0',
      dependencies,
      size: filesArray.length
    },
    analytics: {
      views: 0,
      downloads: 0,
      likes: 0,
      shares: 0
    },
    tags: ['react-native', 'expo', 'ai-generated']
  })

  const savedProject = await project.save()

  // Update user's project count
  await User.findOneAndUpdate(
    { clerkId: userId },
    { 
      $inc: { 
        'usage.projectsThisMonth': 1,
        'analytics.totalProjects': 1
      },
      $set: {
        'analytics.lastActiveAt': new Date()
      }
    }
  )

  return {
    id: savedProject._id.toString(),
    name: savedProject.name,
    fileCount: filesArray.length
  }
}

// Old functions removed - now using complete v0-pipeline.ts with proper:
// - Prompt parsing & classification
// - Plan formation (components, layout, functionality) 
// - Code generation (LLM + Templates + Rules)
// - AST validation & auto-fix
// - Build validation & error recovery 