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
      return 'spark' // Default free plan
    }

    // Check Clerk billing subscription status
    if (has && typeof has === 'function') {
      // Check in order of highest to lowest plan
      if (has({ plan: 'enterprise' })) return 'enterprise'
      if (has({ plan: 'team' })) return 'team'  
      if (has({ plan: 'premium' })) return 'premium'
      if (has({ plan: 'pro' })) return 'pro'
    }

    // Fallback: Check database for plan info
    await connectToDatabase()
    const user = await User.findOne({ clerkId: userId }).lean()
    return user?.plan || 'spark'
    
  } catch (error) {
    console.error('Error getting current plan:', error)
    return 'spark' // Default to free plan on error
  }
}

/**
 * Get current user's plan limits
 */
export async function getCurrentPlanLimits(): Promise<PlanLimits | null> {
  try {
    const currentPlan = await getCurrentPlan()
    const plan = getPlanById(currentPlan)
    return plan?.limits || null
  } catch (error) {
    console.error('Error getting plan limits:', error)
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
      return requiredPlan === 'spark' // Only free plan if no billing
    }

    // Check if user has the required plan or higher
    return has({ plan: requiredPlan })
    
  } catch (error) {
    console.error('Error checking plan access:', error)
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
    await connectToDatabase()
    
    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      throw new Error('User not found')
    }

    const planLimits = await getCurrentPlanLimits()
    if (!planLimits) {
      return { allowed: false, reason: 'Unable to determine plan limits' }
    }

    // Check monthly prompts limit
    const promptsUsed = user.usage?.promptsThisMonth || 0
    if (planLimits.promptsPerMonth > 0 && promptsUsed >= planLimits.promptsPerMonth) {
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
      return { 
        allowed: false, 
        reason: 'Monthly project limit reached',
        limit: planLimits.projectsPerMonth,
        used: projectsUsed
      }
    }

    return { allowed: true }
    
  } catch (error) {
    console.error('Error checking usage limits:', error)
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