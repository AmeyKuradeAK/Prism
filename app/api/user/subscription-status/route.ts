import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import connectToDatabase from '@/lib/database/mongodb'
import User from '@/lib/database/models/User'

export async function GET() {
  try {
    const { userId, getToken } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Getting subscription status for user:', userId)

    // Get subscription plan from Clerk's billing system
    let clerkPlan: 'spark' | 'pro' | 'premium' | 'team' | 'enterprise' = 'spark'
    let subscriptionInfo = null

    try {
      // Method 1: Check session token metadata
      const sessionToken = await getToken()
      const planFromToken = (sessionToken as any)?.publicMetadata?.subscription_plan
      
      console.log('🔍 Plan from session token:', planFromToken)

      // Method 2: Check user metadata directly
      const clerkClientInstance = await clerkClient()
      const user = await clerkClientInstance.users.getUser(userId)
      const planFromUser = (user.publicMetadata as any)?.subscription_plan
      const billingPeriodEnd = (user.publicMetadata as any)?.subscription_period_end
      
      console.log('🔍 Plan from user metadata:', planFromUser)
      console.log('🔍 Billing period end:', billingPeriodEnd)

      // Use the plan from user metadata (more reliable)
      const detectedPlan = planFromUser || planFromToken || 'free'
      
      // Map Clerk billing plans to our internal system
      switch (detectedPlan) {
        case 'free-plan':
        case 'free':
          clerkPlan = 'spark'
          break
        case 'plus-plan':
        case 'plus':
          clerkPlan = 'pro' // Plus = 200 prompts
          break
        case 'pro-plan':
        case 'pro':
          clerkPlan = 'premium' // Pro = 500-1000 prompts
          break
        case 'team-plan':
        case 'team':
          clerkPlan = 'team'
          break
        case 'enterprise-plan':
        case 'enterprise':
        case 'custom-plan':
          clerkPlan = 'enterprise'
          break
        default:
          clerkPlan = 'spark'
      }

      subscriptionInfo = {
        plan: detectedPlan,
        periodEnd: billingPeriodEnd,
        source: 'clerk_billing'
      }

      console.log('✅ Detected plan:', detectedPlan, '-> mapped to:', clerkPlan)

    } catch (clerkError) {
      console.error('❌ Error fetching Clerk billing info:', clerkError)
      clerkPlan = 'spark' // Default to free on error
    }

    // Get plan limits based on the detected plan
    const planLimits = clerkPlan === 'premium' ? {
      projectsPerMonth: -1, // unlimited
      promptsPerMonth: 1000, // Pro plan gets 1000 prompts
      customApiKeys: true,
      prioritySupport: true,
      exportCode: true,
      teamCollaboration: false,
      customBranding: true,
      apiAccess: true
    } : clerkPlan === 'pro' ? {
      projectsPerMonth: -1, // unlimited  
      promptsPerMonth: 200, // Plus plan gets 200 prompts
      customApiKeys: true,
      prioritySupport: true,
      exportCode: true,
      teamCollaboration: false,
      customBranding: false,
      apiAccess: false
    } : clerkPlan === 'team' ? {
      projectsPerMonth: -1,
      promptsPerMonth: 2000,
      customApiKeys: true,
      prioritySupport: true,
      exportCode: true,
      teamCollaboration: true,
      customBranding: true,
      apiAccess: true
    } : clerkPlan === 'enterprise' ? {
      projectsPerMonth: -1,
      promptsPerMonth: -1, // unlimited
      customApiKeys: true,
      prioritySupport: true,
      exportCode: true,
      teamCollaboration: true,
      customBranding: true,
      apiAccess: true
    } : {
      projectsPerMonth: 3,
      promptsPerMonth: 15, // Free plan gets 15 prompts as per your guide
      customApiKeys: false,
      prioritySupport: false,
      exportCode: true,
      teamCollaboration: false,
      customBranding: false,
      apiAccess: false
    }

    console.log('📊 Plan limits for', clerkPlan, ':', planLimits)

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

      // Check if we need to reset monthly usage based on billing period
      const now = new Date()
      const lastReset = user.usage?.lastResetAt || new Date()
      
      // Reset if it's a new month OR if billing period has ended
      let shouldReset = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()
      
      if (subscriptionInfo?.periodEnd) {
        const periodEndDate = new Date(subscriptionInfo.periodEnd)
        shouldReset = shouldReset || now > periodEndDate
      }

      if (shouldReset) {
        console.log('📊 Resetting monthly usage for new billing period')
        await User.findOneAndUpdate(
          { clerkId: userId },
          {
            'usage.promptsThisMonth': 0,
            'usage.projectsThisMonth': 0,
            'usage.lastResetAt': now
          }
        )
        user.usage.promptsThisMonth = 0
        user.usage.projectsThisMonth = 0
        user.usage.lastResetAt = now
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
      subscription: subscriptionInfo,
      canUseAI,
      lastResetAt: user?.usage?.lastResetAt || new Date(),
      resetDate: subscriptionInfo?.periodEnd ? new Date(subscriptionInfo.periodEnd) : new Date(new Date().setMonth(new Date().getMonth() + 1))
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Error fetching subscription status:', error)
    
    // Return safe defaults for free plan
    return NextResponse.json({
      plan: 'spark',
      limits: {
        promptsPerMonth: 30,
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
        promptsRemaining: 30,
        promptLimit: 30,
        projectLimit: 3,
        promptUsagePercent: 0,
        projectUsagePercent: 0,
        generationsThisMonth: 0,
        generationsRemaining: 30,
        generationLimit: 30,
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