import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectToDatabase from '@/lib/database/mongodb'
import User from '@/lib/database/models/User'
import Project from '@/lib/database/models/Project'

export async function GET() {
  try {
    const { userId, has } = await auth()
    
    console.log('🔧 Test DB Route - User ID:', userId)
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        message: 'Please sign in to test database connection'
      }, { status: 401 })
    }

    // Test database connection
    let dbConnected = false
    let dbError: any = null
    try {
      await connectToDatabase()
      dbConnected = true
      console.log('✅ Database connection successful')
    } catch (error) {
      dbConnected = false
      dbError = error
      console.error('❌ Database connection failed:', error)
    }

    // Test Clerk billing
    let clerkBilling: any = {}
    if (has && typeof has === 'function') {
      clerkBilling = {
        available: true,
        hasPro: has({ plan: 'pro' }),
        hasPlus: has({ plan: 'plus' }),
        hasPremium: has({ plan: 'premium' }),
        hasTeam: has({ plan: 'team' }),
        hasEnterprise: has({ plan: 'enterprise' })
      }
      console.log('🔍 Clerk billing status:', clerkBilling)
    } else {
      clerkBilling = {
        available: false,
        message: 'Clerk billing API not available'
      }
    }

    // Test user retrieval
    let userTest: {
      found: boolean
      plan: string | null
      usage: any | null
      error: string | null
    } = {
      found: false,
      plan: null,
      usage: null,
      error: null
    }

    if (dbConnected) {
      try {
        const user = await User.findOne({ clerkId: userId }).lean()
        if (user) {
          userTest = {
            found: true,
            plan: user.plan,
            usage: user.usage,
            error: null
          }
          console.log('✅ User found in database:', user.plan)
        } else {
          userTest = {
            found: false,
            plan: null,
            usage: null,
            error: 'User not found in database'
          }
          console.log('❌ User not found in database')
        }
              } catch (error) {
          userTest = {
            found: false,
            plan: null,
            usage: null,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        console.error('❌ Error finding user:', error)
      }
    }

    // Test project count
    let projectTest: {
      count: number
      error: string | null
    } = {
      count: 0,
      error: null
    }

    if (dbConnected) {
      try {
        const projectCount = await Project.countDocuments({ userId })
        projectTest = {
          count: projectCount,
          error: null
        }
        console.log(`📁 Found ${projectCount} projects for user`)
              } catch (error) {
          projectTest = {
            count: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        console.error('❌ Error counting projects:', error)
      }
    }

    // Environment info
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      mongodbUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
      clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Not set',
      clerkSecretKey: process.env.CLERK_SECRET_KEY ? 'Set' : 'Not set'
    }

    return NextResponse.json({
      success: true,
      userId,
      timestamp: new Date().toISOString(),
      tests: {
        database: {
          connected: dbConnected,
          error: dbError?.message || null
        },
        clerkBilling,
        user: userTest,
        projects: projectTest,
        environment: envInfo
      },
      recommendations: !dbConnected ? [
        'Check MongoDB connection string',
        'Verify database is running',
        'Check network connectivity'
      ] : !userTest.found ? [
        'User needs to be created in database',
        'Check user authentication flow'
      ] : clerkBilling.available && !clerkBilling.hasPro && !clerkBilling.hasPlus ? [
        'Verify Clerk billing setup',
        'Check plan subscription status',
        'Ensure webhooks are configured'
      ] : [
        'All systems appear to be working'
      ]
    })

  } catch (error) {
    console.error('❌ Test DB route error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Force user creation for testing
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { forcePlan } = await request.json()

    await connectToDatabase()

    // Delete existing user if exists
    await User.deleteOne({ clerkId: userId })

    // Create new user with specified plan
    const newUser = await User.create({
      clerkId: userId,
      plan: forcePlan || 'premium', // Default to premium (Pro plan)
      usage: {
        promptsThisMonth: 0,
        projectsThisMonth: 0,
        storageUsed: 0,
        lastResetAt: new Date(),
        dailyUsage: []
      },
      analytics: {
        totalPrompts: 0,
        totalProjects: 0,
        lastActiveAt: new Date(),
        accountAge: 0
      }
    })

    console.log(`✅ Force created user with plan: ${newUser.plan}`)

    return NextResponse.json({
      success: true,
      message: `User force created with plan: ${newUser.plan}`,
      user: {
        id: newUser._id,
        plan: newUser.plan,
        usage: newUser.usage
      }
    })

  } catch (error) {
    console.error('❌ Error force creating user:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 