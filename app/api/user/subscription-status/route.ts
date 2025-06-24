import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentPlan, getCurrentPlanLimits } from '@/lib/utils/plan-protection'
import { getUserUsageStats } from '@/lib/utils/usage-tracker'
import connectToDatabase from '@/lib/database/mongodb'
import User from '@/lib/database/models/User'

export async function GET() {
  try {
    const { userId, has } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Getting subscription status for user:', userId)

    // First, let's directly check what Clerk says about the plan
    let clerkPlan: 'spark' | 'pro' | 'premium' | 'team' | 'enterprise' = 'spark'
    if (has && typeof has === 'function') {
      console.log('🔍 Checking Clerk billing...')
      
      // Check for Pro plan first (this is what the user upgraded to)
      if (has({ plan: 'pro' })) {
        clerkPlan = 'premium' // Pro in Clerk = premium in our system
        console.log('✅ User has Pro plan in Clerk (mapping to premium)')
      } else if (has({ plan: 'plus' })) {
        clerkPlan = 'pro' // Plus in Clerk = pro in our system
        console.log('✅ User has Plus plan in Clerk (mapping to pro)')
      } else if (has({ plan: 'premium' })) {
        clerkPlan = 'premium'
        console.log('✅ User has premium plan directly')
      } else if (has({ plan: 'team' })) {
        clerkPlan = 'team'
        console.log('✅ User has team plan')
      } else if (has({ plan: 'enterprise' })) {
        clerkPlan = 'enterprise'
        console.log('✅ User has enterprise plan')
      } else {
        console.log('❌ No paid plans found in Clerk, using spark')
      }
    } else {
      console.log('❌ Clerk billing API not available')
    }

    console.log('🔍 Final determined plan:', clerkPlan)

    // Get plan limits for the determined plan
    const planLimits = clerkPlan === 'premium' ? {
      projectsPerMonth: -1, // unlimited
      promptsPerMonth: 500,
      customApiKeys: true,
      prioritySupport: true,
      exportCode: true,
      teamCollaboration: false,
      customBranding: true,
      apiAccess: true
    } : clerkPlan === 'pro' ? {
      projectsPerMonth: -1, // unlimited  
      promptsPerMonth: 200,
      customApiKeys: true,
      prioritySupport: true,
      exportCode: true,
      teamCollaboration: false,
      customBranding: false,
      apiAccess: false
    } : {
      projectsPerMonth: 3,
      promptsPerMonth: 15,
      customApiKeys: false,
      prioritySupport: false,
      exportCode: true,
      teamCollaboration: false,
      customBranding: false,
      apiAccess: false
    }

    console.log('📊 Plan limits:', planLimits)

    // Try to get/update user in database
    let user = null
    try {
      await connectToDatabase()
      user = await User.findOne({ clerkId: userId }).lean()
      
      if (!user) {
        console.log('📊 Creating new user with plan:', clerkPlan)
        const newUser = await User.create({
          clerkId: userId,
          plan: clerkPlan,
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
        user = newUser.toObject()
      } else if (user.plan !== clerkPlan) {
        console.log(`📊 Updating user plan from ${user.plan} to ${clerkPlan}`)
        await User.findOneAndUpdate(
          { clerkId: userId },
          { plan: clerkPlan },
          { new: true }
        )
        user.plan = clerkPlan
      }
    } catch (dbError) {
      console.error('❌ Database error:', dbError)
      // Continue with in-memory defaults
    }

    // Use current usage from database, but provide safe defaults
    const promptsUsed = user?.usage?.promptsThisMonth || 0
    const projectsUsed = user?.usage?.projectsThisMonth || 0
    
    // Calculate limits properly
    const promptLimit = planLimits.promptsPerMonth
    const projectLimit = planLimits.projectsPerMonth
    
    // Calculate usage percentages
    let promptUsagePercent = 0
    if (promptLimit > 0) {
      promptUsagePercent = Math.min(100, Math.round((promptsUsed / promptLimit) * 100))
    }
    
    let projectUsagePercent = 0  
    if (projectLimit > 0) {
      projectUsagePercent = Math.min(100, Math.round((projectsUsed / projectLimit) * 100))
    }

    // Calculate remaining
    const promptsRemaining = promptLimit === -1 ? -1 : Math.max(0, promptLimit - promptsUsed)
    const projectsRemaining = projectLimit === -1 ? -1 : Math.max(0, projectLimit - projectsUsed)
    
    // Check if AI generation should be available
    const canUseAI = (promptLimit === -1) || (promptsUsed < promptLimit)
    
    console.log('📊 Final stats:', {
      plan: clerkPlan,
      promptsUsed,
      promptLimit,
      promptsRemaining,
      canUseAI
    })

    const response = {
      plan: clerkPlan,
      limits: planLimits,
      usage: {
        promptsThisMonth: promptsUsed,
        projectsThisMonth: projectsUsed,
        promptsRemaining,
        promptLimit,
        projectLimit,
        promptUsagePercent,
        projectUsagePercent,
        // Keep backward compatibility
        generationsThisMonth: promptsUsed,
        generationsRemaining: promptsRemaining,
        generationLimit: promptLimit,
        generationUsagePercent: promptUsagePercent,
        projectsUsed,
        projectsRemaining
      },
      features: {
        customApiKeys: planLimits.customApiKeys,
        prioritySupport: planLimits.prioritySupport,
        teamCollaboration: planLimits.teamCollaboration,
        customBranding: planLimits.customBranding,
        apiAccess: planLimits.apiAccess
      },
      subscription: user?.subscription || null,
      canUseAI,
      lastResetAt: user?.usage?.lastResetAt || new Date(),
      resetDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Error fetching subscription status:', error)
    
    // Return safe defaults for free plan
    return NextResponse.json({
      plan: 'spark',
      limits: {
        promptsPerMonth: 15,
        projectsPerMonth: 3,
        customApiKeys: false,
        prioritySupport: false,
        exportCode: true,
        teamCollaboration: false,
        customBranding: false,
        apiAccess: false
      },
      usage: {
        promptsThisMonth: 0,
        projectsThisMonth: 0,
        promptsRemaining: 15,
        promptLimit: 15,
        projectLimit: 3,
        promptUsagePercent: 0,
        projectUsagePercent: 0,
        generationsThisMonth: 0,
        generationsRemaining: 15,
        generationLimit: 15,
        generationUsagePercent: 0,
        projectsUsed: 0,
        projectsRemaining: 3
      },
      features: {
        customApiKeys: false,
        prioritySupport: false,
        teamCollaboration: false,
        customBranding: false,
        apiAccess: false
      },
      subscription: null,
      canUseAI: true,
      lastResetAt: new Date(),
      resetDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
    })
  }
} 