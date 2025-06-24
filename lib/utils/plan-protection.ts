import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { SUBSCRIPTION_PLANS, getPlanById } from './subscription-plans'
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
 * Get current user's plan from Clerk billing
 */
export async function getCurrentPlan(): Promise<string> {
  try {
    const { userId, has } = await auth()
    
    if (!userId) {
      console.log('🔍 No user ID found, returning spark plan')
      return 'spark' // Default free plan
    }

    console.log('🔍 Checking plan for user:', userId)

    // Check Clerk billing subscription status
    if (has && typeof has === 'function') {
      console.log('🔍 Clerk billing available, checking plans...')
      
      // Check for Pro plan (which is "premium" in our system)
      if (has({ plan: 'pro' })) {
        console.log('✅ User has Pro plan (premium)')
        return 'premium' // Pro plan in Clerk = premium in our system
      }
      
      // Check for Plus plan (which is "pro" in our system)  
      if (has({ plan: 'plus' })) {
        console.log('✅ User has Plus plan (pro)')
        return 'pro' // Plus plan in Clerk = pro in our system
      }
      
      // Check other plans
      if (has({ plan: 'enterprise' })) {
        console.log('✅ User has Enterprise plan')
        return 'enterprise'
      }
      if (has({ plan: 'team' })) {
        console.log('✅ User has Team plan')
        return 'team'
      }
      
      // Also check with the exact plan IDs from our system
      if (has({ plan: 'premium' })) {
        console.log('✅ User has premium plan (direct)')
        return 'premium'
      }
      if (has({ plan: 'pro' })) {
        console.log('✅ User has pro plan (direct)')
        return 'pro'
      }
      
      console.log('❌ No paid plans found via Clerk billing')
    } else {
      console.log('❌ Clerk billing not available or has() function not working')
    }

    // Fallback: Check database for plan info
    try {
      console.log('🔍 Checking database for plan info...')
      await connectToDatabase()
      const user = await User.findOne({ clerkId: userId }).lean()
      
      if (user) {
        console.log('✅ Found user in database with plan:', user.plan)
        return user.plan || 'spark'
      } else {
        console.log('❌ User not found in database')
      }
    } catch (dbError) {
      console.error('❌ Database error:', dbError)
    }
    
    console.log('🔍 Defaulting to spark plan')
    return 'spark'
    
  } catch (error) {
    console.error('❌ Error getting current plan:', error)
    return 'spark' // Default to free plan on error
  }
}

/**
 * Get current user's plan limits
 */
export async function getCurrentPlanLimits(): Promise<PlanLimits | null> {
  try {
    const currentPlan = await getCurrentPlan()
    console.log('🔍 Getting limits for plan:', currentPlan)
    
    const plan = getPlanById(currentPlan)
    if (plan) {
      console.log('✅ Found plan limits:', plan.limits)
      return plan.limits
    } else {
      console.log('❌ No plan found for ID:', currentPlan)
      return null
    }
  } catch (error) {
    console.error('❌ Error getting plan limits:', error)
    return null
  }
}

/**
 * Check if user has required plan
 */
export async function checkPlanAccess(requiredPlan: string): Promise<boolean> {
  try {
    const { has } = await auth()
    
    if (!has || typeof has !== 'function') {
      console.log('❌ No billing check function available')
      return requiredPlan === 'spark' // Only free plan if no billing
    }

    // Check if user has the required plan or higher
    const hasAccess = has({ plan: requiredPlan })
    console.log(`🔍 Plan access check for ${requiredPlan}:`, hasAccess)
    return hasAccess
    
  } catch (error) {
    console.error('❌ Error checking plan access:', error)
    return false
  }
}

/**
 * Middleware for protecting routes by plan
 */
export async function requirePlan(requiredPlan: string) {
  const hasAccess = await checkPlanAccess(requiredPlan)
  
  if (!hasAccess) {
    return createUpgradeResponse(requiredPlan, 'this feature')
  }
  
  return null // No blocking response needed
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
 * Create a plan upgrade response
 */
export function createUpgradeResponse(requiredPlan: string, feature: string) {
  const plan = getPlanById(requiredPlan)
  const planName = plan?.name || requiredPlan
  
  return NextResponse.json({
    error: 'Plan upgrade required',
    message: `This feature requires ${planName} or higher. Please upgrade your plan to access ${feature}.`,
    requiredPlan,
    upgradeUrl: '/pricing'
  }, { status: 402 })
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