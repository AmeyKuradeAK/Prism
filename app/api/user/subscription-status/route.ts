import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentPlan, getCurrentPlanLimits } from '@/lib/utils/plan-protection'
import connectToDatabase from '@/lib/database/mongodb'
import User from '@/lib/database/models/User'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    // Get user data from database
    const user = await User.findOne({ clerkId: userId }).lean()
    
    // Get current plan from Clerk
    const currentPlan = await getCurrentPlan()
    const planLimits = await getCurrentPlanLimits()
    
    // Calculate usage percentages - using new prompt-based system
    const monthlyPrompts = user?.usage?.promptsThisMonth || 0
    const monthlyProjects = user?.usage?.projectsThisMonth || 0
    
    // Get the prompt limit from the plan
    const promptLimit = planLimits?.promptsPerMonth || 0
    
    let promptUsagePercent = 0
    if (promptLimit && promptLimit > 0) {
      promptUsagePercent = Math.round((monthlyPrompts / promptLimit) * 100)
    }
    
    let projectUsagePercent = 0
    if (planLimits?.projectsPerMonth && planLimits.projectsPerMonth > 0) {
      projectUsagePercent = Math.round((monthlyProjects / planLimits.projectsPerMonth) * 100)
    }

    // Calculate remaining prompts
    const promptsRemaining = Math.max(0, promptLimit - monthlyPrompts)
    
    return NextResponse.json({
      plan: currentPlan,
      limits: planLimits,
      usage: {
        promptsThisMonth: monthlyPrompts,
        projectsThisMonth: monthlyProjects,
        promptsRemaining,
        promptLimit,
        promptUsagePercent,
        projectUsagePercent,
        // Keep backward compatibility for any existing frontend code
        generationsThisMonth: monthlyPrompts, // For backward compatibility
        generationsRemaining: promptsRemaining,
        generationLimit: promptLimit,
        generationUsagePercent: promptUsagePercent
      },
      features: {
        customApiKeys: planLimits?.customApiKeys || false,
        prioritySupport: planLimits?.prioritySupport || false,
        teamCollaboration: planLimits?.teamCollaboration || false,
        customBranding: planLimits?.customBranding || false,
        apiAccess: planLimits?.apiAccess || false
      },
      subscription: user?.subscription || null,
      lastResetAt: user?.usage?.lastResetAt || new Date()
    })
  } catch (error) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    )
  }
} 