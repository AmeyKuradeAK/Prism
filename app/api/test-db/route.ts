import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectToDatabase, { checkDatabaseHealth } from '@/lib/database/mongodb'
import User from '@/lib/database/models/User'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Test database health
    const isHealthy = await checkDatabaseHealth()
    
    if (!isHealthy) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    // Try to connect and perform basic operations
    await connectToDatabase()
    
    // Test user lookup
    const user = await User.findOne({ clerkId: userId }).lean()
    
    // Test basic query
    const userCount = await User.countDocuments()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        userExists: !!user,
        totalUsers: userCount,
        currentUserId: userId
      },
      user: user ? {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: user.plan,
        credits: user.credits,
        createdAt: user.createdAt
      } : null
    })
    
  } catch (error) {
    console.error('Database health check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        mongoUri: process.env.MONGODB_URI ? 'Set' : 'Missing',
        nodeEnv: process.env.NODE_ENV,
        clerkUserId: (await auth()).userId || 'No auth'
      }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    await connectToDatabase()

    switch (action) {
      case 'create_test_user':
        // Create a test user entry
        const testUser = new User({
          clerkId: `test_${Date.now()}`,
          email: `test_${Date.now()}@example.com`,
          firstName: 'Test',
          lastName: 'User',
          plan: 'free',
          credits: 999999,
          preferences: {
            expoVersion: '53.0.0',
            codeStyle: 'typescript',
            theme: 'light'
          },
          usage: {
            generationsThisMonth: 0,
            buildsThisMonth: 0,
            storageUsed: 0
          },
          analytics: {
            totalGenerations: 0,
            totalBuilds: 0,
            totalProjects: 0,
            lastActiveAt: new Date()
          }
        })
        
        await testUser.save()
        
        return NextResponse.json({
          status: 'success',
          message: 'Test user created successfully',
          testUser: {
            id: testUser._id,
            clerkId: testUser.clerkId,
            email: testUser.email
          }
        })

      case 'sync_current_user':
        // Sync current Clerk user to MongoDB
        let user = await User.findOne({ clerkId: userId })
        
        if (!user) {
          user = new User({
            clerkId: userId,
            email: 'manual@sync.com', // This would normally come from Clerk
            plan: 'free',
            credits: 999999,
            preferences: {
              expoVersion: '53.0.0',
              codeStyle: 'typescript',
              theme: 'light'
            },
            usage: {
              generationsThisMonth: 0,
              buildsThisMonth: 0,
              storageUsed: 0
            },
            analytics: {
              totalGenerations: 0,
              totalBuilds: 0,
              totalProjects: 0,
              lastActiveAt: new Date()
            }
          })
          
          await user.save()
          
          return NextResponse.json({
            status: 'success',
            message: 'Current user synced to MongoDB',
            user: {
              id: user._id,
              clerkId: user.clerkId,
              email: user.email,
              createdAt: user.createdAt
            }
          })
        } else {
          return NextResponse.json({
            status: 'success',
            message: 'User already exists in MongoDB',
            user: {
              id: user._id,
              clerkId: user.clerkId,
              email: user.email,
              createdAt: user.createdAt
            }
          })
        }

      case 'cleanup_test_users':
        // Remove test users
        const result = await User.deleteMany({ 
          clerkId: { $regex: /^test_/ } 
        })
        
        return NextResponse.json({
          status: 'success',
          message: `Cleaned up ${result.deletedCount} test users`
        })

      default:
        return NextResponse.json({
          error: 'Invalid action',
          availableActions: ['create_test_user', 'sync_current_user', 'cleanup_test_users']
        }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Database test operation failed:', error)
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 