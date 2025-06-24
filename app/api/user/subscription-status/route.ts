import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentPlan, getCurrentPlanLimits } from '@/lib/utils/plan-protection'
import { getPlanById } from '@/lib/utils/subscription-plans'
import connectToDatabase from '@/lib/database/mongodb'
import User from '@/lib/database/models/User'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Getting subscription status for user:', userId)

    // Get current plan from Clerk's billing system
    const currentPlan = await getCurrentPlan()
    const planLimits = await getCurrentPlanLimits()
    const planInfo = getPlanById(currentPlan)

    console.log('✅ Current plan from Clerk:', currentPlan)

    // Get or create user in database for usage tracking
    let user: any = null
    try {
      await connectToDatabase()
      user = await User.findOne({ clerkId: userId }).lean()
      
      if (!user) {
        console.log('📊 Creating new user with plan:', currentPlan)
        const newUser = await User.create({
          clerkId: userId,
          plan: currentPlan as 'free' | 'plus' | 'pro' | 'team' | 'enterprise',
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
      } else if (user.plan !== currentPlan) {
        console.log(`📊 Updating user plan from ${user.plan} to ${currentPlan}`)
        await User.findOneAndUpdate(
          { clerkId: userId },
          { plan: currentPlan as 'free' | 'plus' | 'pro' | 'team' | 'enterprise' },
          { new: true }
        )
        user.plan = currentPlan as 'free' | 'plus' | 'pro' | 'team' | 'enterprise'
      }

      // Check if we need to reset monthly usage (new month)
      const now = new Date()
      const lastReset = user.usage?.lastResetAt || new Date()
      
      const shouldReset = now.getMonth() !== lastReset.getMonth() || 
                         now.getFullYear() !== lastReset.getFullYear()

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
      // Continue with defaults if DB fails
    }

    // Calculate usage statistics
    const promptsUsed = user?.usage?.promptsThisMonth || 0
    const projectsUsed = user?.usage?.projectsThisMonth || 0
    
    const promptLimit = planLimits?.promptsPerMonth || 30
    const projectLimit = planLimits?.projectsPerMonth || 3
    
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
    
    // Calculate next reset date (start of next month)
    const now = new Date()
    const nextResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    console.log('📊 Final stats:', {
      plan: currentPlan,
      promptsUsed,
      promptLimit,
      promptsRemaining,
      canUseAI
    })

    // Return comprehensive subscription status
    return NextResponse.json({
      plan: currentPlan,
      planInfo: planInfo ? {
        id: planInfo.id,
        name: planInfo.name,
        tagline: planInfo.tagline,
        price: planInfo.price,
        features: planInfo.features
      } : null,
      limits: planLimits || {
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
        promptsThisMonth: promptsUsed,
        projectsThisMonth: projectsUsed,
        promptsRemaining,
        promptLimit,
        projectLimit,
        promptUsagePercent,
        projectUsagePercent,
        // Legacy aliases for backward compatibility
        generationsThisMonth: promptsUsed,
        generationsRemaining: promptsRemaining,
        generationLimit: promptLimit,
        generationUsagePercent: promptUsagePercent,
        projectsUsed,
        projectsRemaining
      },
      features: {
        customApiKeys: planLimits?.customApiKeys || false,
        prioritySupport: planLimits?.prioritySupport || false,
        teamCollaboration: planLimits?.teamCollaboration || false,
        customBranding: planLimits?.customBranding || false,
        apiAccess: planLimits?.apiAccess || false,
        exportCode: planLimits?.exportCode || true
      },
      subscription: {
        status: 'active', // Clerk manages the actual status
        source: 'clerk_billing',
        billingCycle: 'monthly', // Default, Clerk manages this
        isFree: currentPlan === 'free'
      },
      canUseAI,
      lastResetAt: user?.usage?.lastResetAt || new Date(),
      resetDate: nextResetDate
    })

  } catch (error) {
    console.error('❌ Error fetching subscription status:', error)
    
    // Return safe defaults for free plan
    return NextResponse.json({
      plan: 'free',
      planInfo: {
        id: 'free',
        name: 'Free',
        tagline: 'Perfect for getting started',
        price: { monthly: 0, yearly: 0 },
        features: ['30 prompts per month', '3 projects per month', 'Basic templates']
      },
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
        apiAccess: false,
        exportCode: true
      },
      subscription: {
        status: 'active',
        source: 'clerk_billing',
        billingCycle: 'monthly',
        isFree: true
      },
      canUseAI: true,
      lastResetAt: new Date(),
      resetDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
    })
  }
} 