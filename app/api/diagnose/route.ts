import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting production diagnostics...')
    
    const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
      results: {}
    }

    // Test 1: Authentication
    try {
      const { userId } = await auth()
      diagnostics.results.auth = {
        status: userId ? 'success' : 'no_user',
        userId: userId ? 'present' : 'missing'
      }
    } catch (error) {
      diagnostics.results.auth = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown auth error'
      }
    }

    // Test 2: Base Template Import
    try {
      const { generateExpoBaseTemplate } = await import('@/lib/generators/templates/expo-base-template')
      const testFiles = generateExpoBaseTemplate('DiagnosticTest')
      diagnostics.results.baseTemplate = {
        status: 'success',
        fileCount: Object.keys(testFiles).length,
        sampleFiles: Object.keys(testFiles).slice(0, 3)
      }
  } catch (error) {
      diagnostics.results.baseTemplate = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown import error',
        stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined
      }
    }

    // Test 3: V0 Pipeline Import
    try {
      const { runV0Pipeline } = await import('@/lib/generators/v0-pipeline')
      diagnostics.results.v0Pipeline = {
        status: 'success',
        imported: true
      }
    } catch (error) {
      diagnostics.results.v0Pipeline = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown pipeline import error'
      }
    }

    // Test 4: Environment Variables
    diagnostics.results.environment = {
      nodeEnv: process.env.NODE_ENV,
      hasMistralKey: !!process.env.MISTRAL_API_KEY,
      mistralKeyLength: process.env.MISTRAL_API_KEY?.length || 0,
      hasClerkKeys: !!(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY),
      hasMongoUri: !!process.env.MONGODB_URI
    }

    // Test 5: Simple Pipeline Test (without external APIs)
    try {
      // Import the analysis function directly
      const { analyzePrompt } = await import('@/lib/generators/v0-pipeline')
      const testAnalysis = analyzePrompt('Create a simple todo app')
      diagnostics.results.promptAnalysis = {
        status: 'success',
        analysis: testAnalysis
      }
    } catch (error) {
      diagnostics.results.promptAnalysis = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown analysis error'
      }
    }

    console.log('🔍 Diagnostics complete:', diagnostics)

    return new Response(
      JSON.stringify(diagnostics, null, 2),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Diagnostics failed:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Diagnostics failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 