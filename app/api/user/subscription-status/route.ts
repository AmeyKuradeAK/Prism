import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentPlan, getCurrentPlanLimits } from '@/lib/utils/plan-protection'
import { getUserUsageStats } from '@/lib/utils/usage-tracker'
import connectToDatabase from '@/lib/database/mongodb'
import User from '@/lib/database/models/User'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get usage stats first (this handles user creation and plan defaults)
    const usageStats = await getUserUsageStats(userId)
    
    // Get current plan from Clerk (but fall back to default)
    const currentPlan = await getCurrentPlan()
    const planLimits = await getCurrentPlanLimits()
    
    // Ensure user exists in database
    await connectToDatabase()
    let user = await User.findOne({ clerkId: userId }).lean()
    
    if (!user) {
      // Create user with proper defaults - let usage stats handle this instead
      console.log('User not found, but usage stats will handle creation')
      user = null
    }
    
    // Use usage stats for accurate data
    const promptsUsed = usageStats.promptsUsed
    const projectsUsed = usageStats.projectsCreated
    const promptLimit = usageStats.promptsLimit === -1 ? -1 : Math.max(15, usageStats.promptsLimit) // Ensure minimum 15 for free
    const projectLimit = usageStats.projectsLimit === -1 ? -1 : Math.max(3, usageStats.projectsLimit) // Ensure minimum 3 for free
    
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
    
    return NextResponse.json({
      plan: currentPlan,
      limits: {
        promptsPerMonth: promptLimit,
        projectsPerMonth: projectLimit,
        customApiKeys: planLimits?.customApiKeys || false,
        prioritySupport: planLimits?.prioritySupport || false,
        exportCode: planLimits?.exportCode || true,
        teamCollaboration: planLimits?.teamCollaboration || false,
        customBranding: planLimits?.customBranding || false,
        apiAccess: planLimits?.apiAccess || false
      },
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
        customApiKeys: planLimits?.customApiKeys || false,
        prioritySupport: planLimits?.prioritySupport || false,
        teamCollaboration: planLimits?.teamCollaboration || false,
        customBranding: planLimits?.customBranding || false,
        apiAccess: planLimits?.apiAccess || false
      },
      subscription: user?.subscription || null,
      lastResetAt: user?.usage?.lastResetAt || usageStats.resetDate,
      resetDate: usageStats.resetDate
    })
  } catch (error) {
    console.error('Error fetching subscription status:', error)
    
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
      lastResetAt: new Date(),
      resetDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
    })
  }
} 