import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const netlifyDiagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NETLIFY: process.env.NETLIFY,
      CONTEXT: process.env.CONTEXT,
      BRANCH: process.env.BRANCH,
      COMMIT_REF: process.env.COMMIT_REF,
      DEPLOY_ID: process.env.DEPLOY_ID,
      SITE_ID: process.env.SITE_ID,
      URL: process.env.URL,
      DEPLOY_URL: process.env.DEPLOY_URL
    },
    apiKey: {
      present: !!process.env.MISTRAL_API_KEY,
      length: process.env.MISTRAL_API_KEY?.length || 0,
      format: process.env.MISTRAL_API_KEY ? 
        (process.env.MISTRAL_API_KEY.startsWith('mistral_') ? 'correct_prefix' : 'unknown_prefix') : 
        'missing'
    },
    runtime: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    },
    netlifyFeatures: {
      functions: !!process.env.NETLIFY_FUNCTIONS_PORT,
      edge: !!process.env.NETLIFY_EDGE_FUNCTIONS_PORT,
      dev: !!process.env.NETLIFY_DEV
    }
  }

  const recommendations = []

  // Check Netlify environment
  if (!process.env.NETLIFY) {
    recommendations.push('⚠️ Not running in Netlify environment')
  } else {
    recommendations.push('✅ Running in Netlify environment')
    recommendations.push(`📍 Context: ${process.env.CONTEXT || 'unknown'}`)
    recommendations.push(`🌿 Branch: ${process.env.BRANCH || 'unknown'}`)
  }

  // Check API key
  if (!process.env.MISTRAL_API_KEY) {
    recommendations.push('❌ MISTRAL_API_KEY not set in Netlify environment variables')
    recommendations.push('🔧 Add it in: Site settings → Environment variables')
    recommendations.push('🔄 Redeploy after adding environment variables')
  } else if (process.env.MISTRAL_API_KEY.length < 20) {
    recommendations.push('⚠️ MISTRAL_API_KEY seems too short')
    recommendations.push('🔑 Verify the API key in Netlify dashboard')
  } else {
    recommendations.push('✅ MISTRAL_API_KEY is present and valid length')
  }

  // Memory and performance
  const memMB = Math.round(netlifyDiagnostics.runtime.memoryUsage.heapUsed / 1024 / 1024)
  if (memMB > 512) {
    recommendations.push(`⚠️ High memory usage: ${memMB}MB`)
    recommendations.push('💡 Consider optimizing for Netlify function limits')
  }

  // Netlify-specific recommendations
  recommendations.push('')
  recommendations.push('🌐 Netlify Production Troubleshooting:')
  recommendations.push('1. Check Netlify function logs in dashboard')
  recommendations.push('2. Verify environment variables are deployed')
  recommendations.push('3. Check Netlify function timeout limits')
  recommendations.push('4. Monitor Netlify function usage/billing')
  recommendations.push('5. Test with Netlify Dev locally first')

  return NextResponse.json({
    success: true,
    message: 'Netlify Environment Diagnostics',
    diagnostics: netlifyDiagnostics,
    recommendations,
    nextSteps: [
      'Visit Netlify dashboard → Functions → View logs',
      'Check Site settings → Environment variables',
      'Monitor Site overview → Function usage',
      'Test API endpoint: /api/diagnose'
    ]
  })
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'test-timeout') {
      // Test Netlify function timeout
      const startTime = Date.now()
      
      try {
        await new Promise(resolve => setTimeout(resolve, 5000)) // 5 second test
        
        return NextResponse.json({
          success: true,
          message: 'Timeout test completed',
          duration: `${Date.now() - startTime}ms`,
          netlifyContext: process.env.CONTEXT
        })
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Timeout test failed',
          duration: `${Date.now() - startTime}ms`
        }, { status: 500 })
      }
    }

    if (action === 'test-memory') {
      // Test memory usage
      const before = process.memoryUsage()
      
      // Allocate some memory
      const testArray = new Array(100000).fill('test data for memory usage')
      
      const after = process.memoryUsage()
      
      return NextResponse.json({
        success: true,
        message: 'Memory test completed',
        memoryBefore: `${Math.round(before.heapUsed / 1024 / 1024)}MB`,
        memoryAfter: `${Math.round(after.heapUsed / 1024 / 1024)}MB`,
        difference: `${Math.round((after.heapUsed - before.heapUsed) / 1024 / 1024)}MB`,
        testArrayLength: testArray.length
      })
    }

    return NextResponse.json({
      message: 'Available actions: test-timeout, test-memory'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed'
    }, { status: 500 })
  }
} 