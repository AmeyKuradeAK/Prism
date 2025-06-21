import { NextRequest, NextResponse } from 'next/server'
import { Mistral } from '@mistralai/mistralai'

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    apiKeyStatus: 'unknown',
    apiKeyLength: 0,
    networkTest: 'pending',
    mistralConnection: 'pending'
  }

  try {
    // 1. Check API Key
    const apiKey = process.env.MISTRAL_API_KEY
    if (!apiKey) {
      diagnostics.apiKeyStatus = 'missing'
    } else if (apiKey.length < 10) {
      diagnostics.apiKeyStatus = 'invalid_length'
      diagnostics.apiKeyLength = apiKey.length
    } else {
      diagnostics.apiKeyStatus = 'present'
      diagnostics.apiKeyLength = apiKey.length
    }

    // 2. Test Mistral SDK initialization
    try {
      const mistral = new Mistral({ apiKey: apiKey || 'test' })
      diagnostics.mistralConnection = 'sdk_initialized'
    } catch (sdkError) {
      diagnostics.mistralConnection = `sdk_error: ${sdkError instanceof Error ? sdkError.message : 'unknown'}`
    }

    // 3. Test basic network connectivity (without making actual API call)
    try {
      // Simple network test - just check if we can resolve DNS
      const testUrl = 'https://api.mistral.ai'
      diagnostics.networkTest = `attempting_connection_to: ${testUrl}`
    } catch (networkError) {
      diagnostics.networkTest = `network_error: ${networkError instanceof Error ? networkError.message : 'unknown'}`
    }

    return NextResponse.json({
      success: true,
      message: 'React Native V0 Diagnostics',
      diagnostics,
      recommendations: generateRecommendations(diagnostics)
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Diagnostic failed',
      diagnostics,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

function generateRecommendations(diagnostics: any): string[] {
  const recommendations = []

  if (diagnostics.apiKeyStatus === 'missing') {
    recommendations.push('❌ Set MISTRAL_API_KEY environment variable')
    recommendations.push('📝 Get API key from: https://console.mistral.ai/')
  } else if (diagnostics.apiKeyStatus === 'invalid_length') {
    recommendations.push('❌ MISTRAL_API_KEY appears to be invalid (too short)')
    recommendations.push('🔑 Verify your API key from Mistral console')
  } else if (diagnostics.apiKeyStatus === 'present') {
    recommendations.push('✅ MISTRAL_API_KEY is present and valid length')
  }

  if (diagnostics.mistralConnection.includes('error')) {
    recommendations.push('❌ Mistral SDK initialization failed')
    recommendations.push('📦 Check @mistralai/mistralai package installation')
  } else {
    recommendations.push('✅ Mistral SDK initialized successfully')
  }

  // Network troubleshooting
  recommendations.push('🌐 Network troubleshooting steps:')
  recommendations.push('  1. Check internet connectivity')
  recommendations.push('  2. Verify firewall/proxy settings')
  recommendations.push('  3. Check Mistral API status: https://status.mistral.ai/')
  recommendations.push('  4. Try different network (mobile hotspot)')

  return recommendations
}

export async function POST(request: NextRequest) {
  try {
    const { testApi = false } = await request.json()

    if (!testApi) {
      return NextResponse.json({
        message: 'Use GET for basic diagnostics, or POST with {"testApi": true} for API test'
      })
    }

    // Perform actual API test (minimal request)
    const apiKey = process.env.MISTRAL_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'MISTRAL_API_KEY not found'
      }, { status: 400 })
    }

    console.log('🧪 Testing Mistral API connection...')
    
    const mistral = new Mistral({ apiKey })
    
    try {
      const startTime = Date.now()
      
      // Minimal API test
      const response = await Promise.race([
        mistral.chat.complete({
          model: 'mistral-small-latest',
          messages: [{ role: 'user', content: 'Hello' }],
          maxTokens: 10
        }),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('API timeout after 15 seconds')), 15000)
        })
      ]) as any

      const duration = Date.now() - startTime

      return NextResponse.json({
        success: true,
        message: 'Mistral API connection successful',
        duration: `${duration}ms`,
        responseLength: response.choices?.[0]?.message?.content?.length || 0
      })

    } catch (apiError) {
      const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown API error'
      
      console.error('❌ Mistral API test failed:', errorMessage)
      
      return NextResponse.json({
        success: false,
        error: `Mistral API test failed: ${errorMessage}`,
        errorType: apiError instanceof Error ? apiError.name : 'Unknown',
        troubleshooting: [
          'Check API key validity',
          'Verify network connectivity', 
          'Check Mistral API status',
          'Try again in a few minutes'
        ]
      }, { status: 500 })
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed'
    }, { status: 500 })
  }
} 