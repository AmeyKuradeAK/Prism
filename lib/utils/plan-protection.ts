import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { SUBSCRIPTION_PLANS, getPlanById } from './subscription-plans'
import User from '../database/models/User'
import connectToDatabase from '../database/mongodb'

export interface PlanLimits {
  projectsPerMonth: number
  aiGenerationsPerMonth: number
  customApiKeys: boolean
  prioritySupport: boolean
  exportCode: boolean
  teamCollaboration: boolean
  customBranding: boolean
  apiAccess: boolean
}

/**
 * Check if user has access to a specific plan or higher
 */
export async function hasActivePlan(minimumPlan: string): Promise<boolean> {
  try {
    const { has } = await auth()
    return has({ plan: minimumPlan })
  } catch (error) {
    console.error('Error checking plan access:', error)
    return false
  }
}

/**
 * Get current user's plan limits
 */
export async function getCurrentPlanLimits(): Promise<PlanLimits | null> {
  try {
    const { userId, has } = await auth()
    
    if (!userId) return null

    // Check plans in order of hierarchy
    if (has({ plan: 'enterprise' })) {
      return getPlanById('enterprise')?.limits || null
    }
    if (has({ plan: 'team' })) {
      return getPlanById('team')?.limits || null
    }
    if (has({ plan: 'premium' })) {
      return getPlanById('premium')?.limits || null
    }
    if (has({ plan: 'pro' })) {
      return getPlanById('pro')?.limits || null
    }
    
    // Default to free plan
    return getPlanById('spark')?.limits || null
  } catch (error) {
    console.error('Error getting plan limits:', error)
    return null
  }
}

/**
 * Check if user can perform a specific action based on their plan
 */
export async function canPerformAction(action: keyof PlanLimits): Promise<boolean> {
  try {
    const limits = await getCurrentPlanLimits()
    if (!limits) return false
    
    return limits[action] === true
  } catch (error) {
    console.error('Error checking action permission:', error)
    return false
  }
}

/**
 * Check and update usage limits for AI generations
 */
export async function checkGenerationLimit(): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  try {
    const { userId, has } = await auth()
    
    if (!userId) {
      return { allowed: false, remaining: 0, limit: 0 }
    }

    await connectToDatabase()
    const user = await User.findOne({ clerkId: userId })
    
    if (!user) {
      return { allowed: false, remaining: 0, limit: 0 }
    }

    // Check if user has unlimited generations (Premium or higher)
    if (has({ plan: 'premium' }) || has({ plan: 'team' }) || has({ plan: 'enterprise' })) {
      return { allowed: true, remaining: -1, limit: -1 } // -1 indicates unlimited
    }

    // Check Plus plan limit (200 generations)
    let monthlyLimit = 10 // Default free plan limit
    if (has({ plan: 'pro' })) { // This is the Plus plan
      monthlyLimit = 200
    }

    const currentUsage = user.usage?.generationsThisMonth || 0
    const remaining = monthlyLimit - currentUsage
    
    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
      limit: monthlyLimit
    }
  } catch (error) {
    console.error('Error checking generation limit:', error)
    return { allowed: false, remaining: 0, limit: 0 }
  }
}

/**
 * Increment user's generation count
 */
export async function incrementGenerationCount(): Promise<void> {
  try {
    const { userId } = await auth()
    
    if (!userId) return

    await connectToDatabase()
    await User.findOneAndUpdate(
      { clerkId: userId },
      { 
        $inc: { 
          'usage.generationsThisMonth': 1,
          'analytics.totalGenerations': 1
        },
        $set: {
          'analytics.lastActiveAt': new Date()
        }
      }
    )
  } catch (error) {
    console.error('Error incrementing generation count:', error)
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
    message: `You've reached your monthly limit of ${limit} ${feature}. Upgrade to Premium for unlimited access.`,
    limit,
    upgradeUrl: '/pricing'
  }, { status: 429 })
}

/**
 * Middleware-like function to protect API routes
 */
export async function protectRoute(minimumPlan: string, feature: string) {
  const hasAccess = await hasActivePlan(minimumPlan)
  
  if (!hasAccess) {
    return createUpgradeResponse(minimumPlan, feature)
  }
  
  return null // No error, access granted
}

/**
 * Get user's current plan information
 */
export async function getCurrentPlan(): Promise<{ planId: string; planName: string } | null> {
  try {
    const { userId, has } = await auth()
    
    if (!userId) return null

    // Check plans in order of hierarchy
    if (has({ plan: 'enterprise' })) {
      return { planId: 'enterprise', planName: '🏢 Enterprise' }
    }
    if (has({ plan: 'team' })) {
      return { planId: 'team', planName: '👥 Team' }
    }
    if (has({ plan: 'premium' })) {
      return { planId: 'premium', planName: '💎 Pro' }
    }
    if (has({ plan: 'pro' })) {
      return { planId: 'pro', planName: '🚀 Plus' }
    }
    
    return { planId: 'spark', planName: '⚡ Spark' }
  } catch (error) {
    console.error('Error getting current plan:', error)
    return null
  }
} 