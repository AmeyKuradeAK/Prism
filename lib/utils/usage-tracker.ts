import connectToDatabase from '@/lib/database/mongodb'
import User from '@/lib/database/models/User'
import { SUBSCRIPTION_PLANS, getMonthlyLimit } from './subscription-plans'

export interface UsageStats {
  promptsUsed: number
  promptsLimit: number
  projectsCreated: number
  projectsLimit: number
  isOverLimit: boolean
  canUseAI: boolean
  resetDate: Date
}

export interface DailyUsage {
  date: Date
  promptsUsed: number
  projectsCreated: number
}

/**
 * Track prompt usage for a user
 */
export async function trackPromptUsage(userId: string): Promise<boolean> {
  try {
    await connectToDatabase()
    
    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      throw new Error('User not found')
    }

    // Check if user has exceeded their limit
    const stats = await getUserUsageStats(userId)
    if (!stats.canUseAI) {
      return false // Cannot use AI - over limit
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Update monthly usage
    user.usage.promptsThisMonth += 1
    user.analytics.totalPrompts += 1
    user.analytics.lastActiveAt = new Date()

    // Update daily usage
    const todayUsage = user.usage.dailyUsage.find(day => 
      day.date.getTime() === today.getTime()
    )

    if (todayUsage) {
      todayUsage.promptsUsed += 1
    } else {
      user.usage.dailyUsage.push({
        date: today,
        promptsUsed: 1,
        projectsCreated: 0
      })
    }

    // Keep only last 30 days of daily usage
    user.usage.dailyUsage = user.usage.dailyUsage
      .filter(day => day.date >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .sort((a, b) => b.date.getTime() - a.date.getTime())

    await user.save()
    return true
  } catch (error) {
    console.error('Error tracking prompt usage:', error)
    return false
  }
}

/**
 * Track project creation for a user
 */
export async function trackProjectCreation(userId: string): Promise<boolean> {
  try {
    await connectToDatabase()
    
    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      throw new Error('User not found')
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Update monthly usage
    user.usage.projectsThisMonth += 1
    user.analytics.totalProjects += 1
    user.analytics.lastActiveAt = new Date()

    // Update daily usage
    const todayUsage = user.usage.dailyUsage.find(day => 
      day.date.getTime() === today.getTime()
    )

    if (todayUsage) {
      todayUsage.projectsCreated += 1
    } else {
      user.usage.dailyUsage.push({
        date: today,
        promptsUsed: 0,
        projectsCreated: 1
      })
    }

    // Keep only last 30 days
    user.usage.dailyUsage = user.usage.dailyUsage
      .filter(day => day.date >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .sort((a, b) => b.date.getTime() - a.date.getTime())

    await user.save()
    return true
  } catch (error) {
    console.error('Error tracking project creation:', error)
    return false
  }
}

/**
 * Get user's current usage statistics
 */
export async function getUserUsageStats(userId: string): Promise<UsageStats> {
  try {
    await connectToDatabase()
    
    let user = await User.findOne({ clerkId: userId })
    if (!user) {
      // Create user with proper free plan defaults
      console.log(`Creating new user with free plan defaults: ${userId}`)
      user = await User.create({
        clerkId: userId,
        plan: 'spark', // Free plan
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
    }

    // Check if we need to reset monthly usage
    await checkAndResetMonthlyUsage(user)

    // Get plan limits - ensure minimum values for free plan
    const promptsLimit = getMonthlyLimit(user.plan, 'promptsPerMonth')
    const projectsLimit = getMonthlyLimit(user.plan, 'projectsPerMonth')
    
    // Ensure free plan has correct limits
    const finalPromptsLimit = user.plan === 'spark' ? Math.max(15, promptsLimit === Infinity ? 15 : promptsLimit) : promptsLimit
    const finalProjectsLimit = user.plan === 'spark' ? Math.max(3, projectsLimit === Infinity ? 3 : projectsLimit) : projectsLimit

    const promptsUsed = user.usage.promptsThisMonth || 0
    const projectsCreated = user.usage.projectsThisMonth || 0

    const isOverPromptLimit = finalPromptsLimit !== Infinity && promptsUsed >= finalPromptsLimit
    const isOverProjectLimit = finalProjectsLimit !== Infinity && projectsCreated >= finalProjectsLimit

    // Calculate next reset date (first day of next month)
    const resetDate = new Date()
    resetDate.setMonth(resetDate.getMonth() + 1)
    resetDate.setDate(1)
    resetDate.setHours(0, 0, 0, 0)

    const stats = {
      promptsUsed,
      promptsLimit: finalPromptsLimit === Infinity ? -1 : finalPromptsLimit,
      projectsCreated,
      projectsLimit: finalProjectsLimit === Infinity ? -1 : finalProjectsLimit,
      isOverLimit: isOverPromptLimit || isOverProjectLimit,
      canUseAI: !isOverPromptLimit, // AI generation is prompt-based
      resetDate
    }

    console.log(`📊 Usage stats for ${userId} (${user.plan}):`, {
      promptsUsed: stats.promptsUsed,
      promptsLimit: stats.promptsLimit,
      projectsUsed: stats.projectsCreated,
      projectsLimit: stats.projectsLimit,
      canUseAI: stats.canUseAI
    })

    return stats
  } catch (error) {
    console.error('Error getting usage stats for user:', userId, error)
    // Return safe defaults with proper free tier limits
    const defaultStats = {
      promptsUsed: 0,
      promptsLimit: 15, // Free tier default
      projectsCreated: 0,
      projectsLimit: 3,
      isOverLimit: false,
      canUseAI: true,
      resetDate: new Date()
    }
    console.log('Returning default usage stats:', defaultStats)
    return defaultStats
  }
}

/**
 * Get user's daily usage data for analytics
 */
export async function getUserDailyUsage(userId: string, days: number = 30): Promise<DailyUsage[]> {
  try {
    await connectToDatabase()
    
    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      return []
    }

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    
    return user.usage.dailyUsage
      .filter(day => day.date >= cutoffDate)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(day => ({
        date: day.date,
        promptsUsed: day.promptsUsed,
        projectsCreated: day.projectsCreated
      }))
  } catch (error) {
    console.error('Error getting daily usage:', error)
    return []
  }
}

/**
 * Check if monthly usage needs to be reset
 */
async function checkAndResetMonthlyUsage(user: any): Promise<void> {
  const now = new Date()
  const lastReset = new Date(user.usage.lastResetAt)
  
  // Reset if it's a new month
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    user.usage.promptsThisMonth = 0
    user.usage.projectsThisMonth = 0
    user.usage.lastResetAt = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Update account age
    const accountCreated = new Date(user.createdAt)
    user.analytics.accountAge = Math.floor((now.getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24))
    
    await user.save()
  }
}

/**
 * Check if user can perform an action based on their plan limits
 */
export async function canUserPerformAction(userId: string, action: 'prompt' | 'project'): Promise<boolean> {
  const stats = await getUserUsageStats(userId)
  
  if (action === 'prompt') {
    return stats.canUseAI
  } else if (action === 'project') {
    return stats.projectsLimit === -1 || stats.projectsCreated < stats.projectsLimit
  }
  
  return false
}

/**
 * Get usage percentage for display
 */
export function getUsagePercentage(used: number, limit: number): number {
  if (limit === -1 || limit === Infinity) return 0 // Unlimited
  if (limit === 0) return 100
  return Math.min(Math.round((used / limit) * 100), 100)
}

/**
 * Format usage display text
 */
export function formatUsageText(used: number, limit: number): string {
  if (limit === -1 || limit === Infinity) {
    return `${used.toLocaleString()} used`
  }
  return `${used.toLocaleString()} / ${limit.toLocaleString()}`
} 