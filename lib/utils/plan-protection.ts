import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { SUBSCRIPTION_PLANS, getPlanById, mapClerkPlanToInternal } from './subscription-plans'
import User from '../database/models/User'
import connectToDatabase from '../database/mongodb'

export interface PlanLimits {
  projectsPerMonth: number
  promptsPerMonth: number
  customApiKeys: boolean
  prioritySupport: boolean
  exportCode: boolean
  teamCollaboration: boolean
  customBranding: boolean
  apiAccess: boolean
}

/**
 * Get current user's plan directly from Clerk billing
 */
export async function getCurrentPlan(): Promise<string> {
  try {
    const { userId, has } = await auth()
    
    if (!userId) {
      console.log('🔍 No user ID found, returning free plan')
      return 'free'
    }

    console.log('🔍 Checking plan for user:', userId)

    // Check Clerk billing subscription status using has() method
    if (has && typeof has === 'function') {
      console.log('🔍 Clerk billing available, checking plans...')
      
      // Check plans in order of highest to lowest
      if (has({ plan: 'enterprise' })) {
        console.log('✅ User has Enterprise plan')
        return 'enterprise'
      }
      
      if (has({ plan: 'team' })) {
        console.log('✅ User has Team plan')
        return 'team'
      }
      
      if (has({ plan: 'pro' })) {
        console.log('✅ User has Pro plan')
        return 'pro'
      }
      
      if (has({ plan: 'plus' })) {
        console.log('✅ User has Plus plan')
        return 'plus'
      }
      
      console.log('❌ No paid plans found, user is on free plan')
      return 'free'
    } else {
      console.log('❌ Clerk billing not available, falling back to database')
      // Fallback to database check
      try {
        await connectToDatabase()
        const user = await User.findOne({ clerkId: userId })
        return user?.plan || 'free'
      } catch (error) {
        console.error('❌ Database fallback failed:', error)
        return 'free'
      }
    }
  } catch (error) {
    console.error('❌ Error getting current plan:', error)
    return 'free'
  }
}

/**
 * Get plan limits for a specific plan
 */
export function getPlanLimits(planId: string): PlanLimits {
  const plan = getPlanById(planId)
  if (!plan) {
    console.warn(`⚠️ Plan ${planId} not found, using free limits`)
    return SUBSCRIPTION_PLANS[0].limits
  }
  return plan.limits
}

/**
 * Get current user's plan limits
 */
export async function getCurrentPlanLimits(): Promise<PlanLimits | null> {
  try {
    const currentPlan = await getCurrentPlan()
    const planLimits = getPlanLimits(currentPlan)
    
    console.log('📊 Current plan limits:', { plan: currentPlan, limits: planLimits })
    return planLimits
  } catch (error) {
    console.error('❌ Error getting plan limits:', error)
    return null
  }
}

/**
 * Check if user can access a specific feature
 */
export async function canAccessFeature(feature: keyof PlanLimits): Promise<boolean> {
  try {
    const { userId, has } = await auth()
    
    if (!userId) return false

    // Use Clerk's has() method for feature checks
    if (has && typeof has === 'function') {
      switch (feature) {
        case 'customApiKeys':
          return has({ plan: 'plus' }) || has({ plan: 'pro' }) || has({ plan: 'team' }) || has({ plan: 'enterprise' })
        case 'prioritySupport':
          return has({ plan: 'plus' }) || has({ plan: 'pro' }) || has({ plan: 'team' }) || has({ plan: 'enterprise' })
        case 'teamCollaboration':
          return has({ plan: 'team' }) || has({ plan: 'enterprise' })
        case 'customBranding':
          return has({ plan: 'pro' }) || has({ plan: 'team' }) || has({ plan: 'enterprise' })
        case 'apiAccess':
          return has({ plan: 'pro' }) || has({ plan: 'team' }) || has({ plan: 'enterprise' })
        case 'exportCode':
          return true // Available on all plans
        default:
          return false
      }
    }

    // Fallback to database check
    const planLimits = await getCurrentPlanLimits()
    if (!planLimits) return false
    
    const value = planLimits[feature]
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value > 0 || value === -1
    return false
  } catch (error) {
    console.error('❌ Error checking feature access:', error)
    return false
  }
}

/**
 * Check usage limits for current user
 */
export async function checkUsageLimits(userId: string) {
  try {
    console.log('🔍 Checking usage limits for user:', userId)
    
    await connectToDatabase()
    
    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      console.log('❌ User not found for usage limits check')
      throw new Error('User not found')
    }

    const planLimits = await getCurrentPlanLimits()
    if (!planLimits) {
      console.log('❌ Unable to determine plan limits')
      return { allowed: false, reason: 'Unable to determine plan limits' }
    }

    console.log('📊 Current plan limits:', planLimits)
    console.log('📊 User usage:', user.usage)

    // Check monthly prompts limit
    const promptsUsed = user.usage?.promptsThisMonth || 0
    if (planLimits.promptsPerMonth > 0 && promptsUsed >= planLimits.promptsPerMonth) {
      console.log(`❌ Prompt limit reached: ${promptsUsed}/${planLimits.promptsPerMonth}`)
      return { 
        allowed: false, 
        reason: 'Monthly prompt limit reached',
        limit: planLimits.promptsPerMonth,
        used: promptsUsed
      }
    }

    // Check monthly projects limit
    const projectsUsed = user.usage?.projectsThisMonth || 0
    if (planLimits.projectsPerMonth > 0 && projectsUsed >= planLimits.projectsPerMonth) {
      console.log(`❌ Project limit reached: ${projectsUsed}/${planLimits.projectsPerMonth}`)
      return { 
        allowed: false, 
        reason: 'Monthly project limit reached',
        limit: planLimits.projectsPerMonth,
        used: projectsUsed
      }
    }

    console.log('✅ Usage limits check passed')
    return { allowed: true }
    
  } catch (error) {
    console.error('❌ Error checking usage limits:', error)
    return { allowed: false, reason: 'Error checking usage limits' }
  }
}

/**
 * Update user usage after successful operation
 */
export async function updateUsage(userId: string, type: 'prompt' | 'project') {
  try {
    await connectToDatabase()
    
    const updateField = type === 'prompt' ? 'usage.promptsThisMonth' : 'usage.projectsThisMonth'
    const totalField = type === 'prompt' ? 'analytics.totalPrompts' : 'analytics.totalProjects'
    
    await User.findOneAndUpdate(
      { clerkId: userId },
      { 
        $inc: { 
          [updateField]: 1,
          [totalField]: 1
        },
        $set: {
          'analytics.lastActiveAt': new Date()
        }
      }
    )
    
    console.log(`✅ Updated ${type} usage for user ${userId}`)
    
  } catch (error) {
    console.error(`Error updating ${type} usage:`, error)
  }
}

/**
 * Create a usage limit response
 */
export function createUsageLimitResponse(limit: number, feature: string) {
  return NextResponse.json({
    error: 'Usage limit reached',
    message: `You've reached your monthly limit of ${limit} ${feature}. Upgrade to a higher plan for more capacity.`,
    limit,
    upgradeUrl: '/pricing'
  }, { status: 429 })
}

/**
 * Middleware to protect routes based on plan
 */
export async function requirePlan(requiredPlan: string) {
  try {
    const currentPlan = await getCurrentPlan()
    const planOrder = ['free', 'plus', 'pro', 'team', 'enterprise']
    
    const currentIndex = planOrder.indexOf(currentPlan)
    const requiredIndex = planOrder.indexOf(requiredPlan)
    
    if (currentIndex < requiredIndex) {
      return NextResponse.json({
        error: 'Plan upgrade required',
        message: `This feature requires the ${requiredPlan} plan or higher.`,
        currentPlan,
        requiredPlan,
        upgradeUrl: '/pricing'
      }, { status: 403 })
    }
    
    return null // Allow access
  } catch (error) {
    console.error('❌ Error in plan requirement check:', error)
    return NextResponse.json({
      error: 'Authentication error',
      message: 'Unable to verify your subscription status.'
    }, { status: 500 })
  }
}

/**
 * Check if user has access to a specific plan or higher
 */
export async function hasMinimumPlan(requiredPlan: string): Promise<boolean> {
  try {
    const { has } = await auth()
    
    if (!has || typeof has !== 'function') {
      console.log('❌ Clerk billing not available')
      return requiredPlan === 'free' // Only free plan available
    }

    // Map our internal plan to Clerk plan ID
    let clerkPlanId: string
    switch (requiredPlan) {
      case 'plus':
        clerkPlanId = 'plus'
        break
      case 'pro':
        clerkPlanId = 'pro'
        break
      case 'team':
        clerkPlanId = 'team'
        break
      case 'enterprise':
        clerkPlanId = 'enterprise'
        break
      default:
        return true // Free plan is always accessible
    }

    // Check if user has the required plan or higher
    if (clerkPlanId === 'plus') {
      return has({ plan: 'plus' }) || has({ plan: 'pro' }) || has({ plan: 'team' }) || has({ plan: 'enterprise' })
    }
    if (clerkPlanId === 'pro') {
      return has({ plan: 'pro' }) || has({ plan: 'team' }) || has({ plan: 'enterprise' })
    }
    if (clerkPlanId === 'team') {
      return has({ plan: 'team' }) || has({ plan: 'enterprise' })
    }
    if (clerkPlanId === 'enterprise') {
      return has({ plan: 'enterprise' })
    }

    return false
  } catch (error) {
    console.error('❌ Error checking minimum plan:', error)
    return false
  }
}

/**
 * Middleware function to protect features
 */
export async function requireFeature(feature: keyof PlanLimits): Promise<NextResponse | null> {
  const hasAccess = await canAccessFeature(feature)
  
  if (!hasAccess) {
    return NextResponse.json({
      error: 'Feature not available',
      message: `This feature is not available in your current plan`,
      feature,
      upgradeUrl: '/pricing'
    }, { status: 402 })
  }
  
  return null
} 