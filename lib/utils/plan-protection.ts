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
      console.log('🔍 No user ID found, returning spark plan')
      return 'spark'
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
        console.log('✅ User has Pro plan (premium in our system)')
        return 'premium'
      }
      
      if (has({ plan: 'plus' })) {
        console.log('✅ User has Plus plan (pro in our system)')
        return 'pro'
      }
      
      console.log('❌ No paid plans found, user is on free plan')
      return 'spark'
    } else {
      console.log('❌ Clerk billing not available')
      return 'spark'
    }
  } catch (error) {
    console.error('❌ Error getting current plan:', error)
    return 'spark'
  }
}

/**
 * Get plan limits for a specific plan
 */
export function getPlanLimits(planId: string): PlanLimits {
  const plan = getPlanById(planId)
  if (!plan) {
    console.warn(`⚠️ Plan ${planId} not found, using spark limits`)
    return SUBSCRIPTION_PLANS[0].limits
  }
  return plan.limits
}

/**
 * Check if user has access to a specific plan or higher
 */
export async function hasMinimumPlan(requiredPlan: string): Promise<boolean> {
  try {
    const { has } = await auth()
    
    if (!has || typeof has !== 'function') {
      console.log('❌ Clerk billing not available')
      return requiredPlan === 'spark' // Only free plan available
    }

    // Map our internal plan to Clerk plan ID
    let clerkPlanId: string
    switch (requiredPlan) {
      case 'pro':
        clerkPlanId = 'plus'
        break
      case 'premium':
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
 * Check if user has access to a specific feature
 */
export async function hasFeatureAccess(feature: keyof PlanLimits): Promise<boolean> {
  try {
    const currentPlan = await getCurrentPlan()
    const limits = getPlanLimits(currentPlan)
    
    if (typeof limits[feature] === 'boolean') {
      return limits[feature] as boolean
    }
    
    // For numeric limits, check if it's unlimited (-1) or greater than 0
    if (typeof limits[feature] === 'number') {
      const value = limits[feature] as number
      return value === -1 || value > 0
    }
    
    return false
  } catch (error) {
    console.error('❌ Error checking feature access:', error)
    return false
  }
}

/**
 * Middleware function to protect routes based on plan requirements
 */
export async function requirePlan(requiredPlan: string): Promise<NextResponse | null> {
  const hasAccess = await hasMinimumPlan(requiredPlan)
  
  if (!hasAccess) {
    return NextResponse.json({
      error: 'Upgrade required',
      message: `This feature requires ${requiredPlan} plan or higher`,
      requiredPlan,
      upgradeUrl: '/pricing'
    }, { status: 402 })
  }
  
  return null
}

/**
 * Middleware function to protect features
 */
export async function requireFeature(feature: keyof PlanLimits): Promise<NextResponse | null> {
  const hasAccess = await hasFeatureAccess(feature)
  
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

/**
 * Get usage limits for current user's plan
 */
export async function getCurrentPlanLimits(): Promise<PlanLimits> {
  const currentPlan = await getCurrentPlan()
  return getPlanLimits(currentPlan)
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