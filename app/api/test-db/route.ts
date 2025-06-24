import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import connectToDatabase from '@/lib/database/mongodb'
import User from '@/lib/database/models/User'
import Project from '@/lib/database/models/Project'

export async function GET() {
  try {
    const { userId, getToken } = await auth()
    
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

    // Test Clerk billing using the correct method
    let clerkBilling: any = {}
    try {
      // Method 1: Check session token
      const sessionToken = await getToken()
      const planFromToken = (sessionToken as any)?.publicMetadata?.subscription_plan
      
      // Method 2: Check user metadata directly
      const clerkClientInstance = await clerkClient()
      const user = await clerkClientInstance.users.getUser(userId)
      const planFromUser = (user.publicMetadata as any)?.subscription_plan
      const billingPeriodEnd = (user.publicMetadata as any)?.subscription_period_end
      
      clerkBilling = {
        available: true,
        planFromToken,
        planFromUser,
        billingPeriodEnd,
        detectedPlan: planFromUser || planFromToken || 'free',
        clerkUserId: user.id,
        hasMetadata: !!user.publicMetadata
      }
      
      console.log('🔍 Clerk billing status:', clerkBilling)
    } catch (error) {
      clerkBilling = {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Clerk billing API error'
      }
      console.error('❌ Clerk billing error:', error)
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

    // Enhanced recommendations based on Clerk billing system
    let recommendations: string[] = []
    
    if (!dbConnected) {
      recommendations = [
        'Check MongoDB connection string',
        'Verify database is running', 
        'Check network connectivity'
      ]
    } else if (!userTest.found) {
      recommendations = [
        'User needs to be created in database',
        'Check user authentication flow',
        'Consider calling POST /api/test-db to force create user'
      ]
    } else if (!clerkBilling.available) {
      recommendations = [
        'Clerk API connection issue',
        'Check CLERK_SECRET_KEY environment variable',
        'Verify Clerk configuration'
      ]
    } else if (clerkBilling.detectedPlan === 'free') {
      recommendations = [
        'User is on free plan',
        'Check Clerk billing dashboard for subscription status',
        'Verify Stripe integration is working',
        'Ensure user has successfully upgraded to Pro plan'
      ]
    } else {
      recommendations = [
        'All systems appear to be working',
        `User detected on plan: ${clerkBilling.detectedPlan}`,
        'Plan should sync automatically to database'
      ]
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
      recommendations
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