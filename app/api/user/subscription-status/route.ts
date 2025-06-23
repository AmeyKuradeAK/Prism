import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentPlan, getCurrentPlanLimits, checkGenerationLimit } from '@/lib/utils/plan-protection'
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
    const generationStatus = await checkGenerationLimit()
    
    // Calculate usage percentages
    const monthlyGenerations = user?.usage?.generationsThisMonth || 0
    const monthlyProjects = user?.usage?.projectsThisMonth || 0
    
    let generationUsagePercent = 0
    if (planLimits?.aiGenerationsPerMonth && planLimits.aiGenerationsPerMonth > 0) {
      generationUsagePercent = Math.round((monthlyGenerations / planLimits.aiGenerationsPerMonth) * 100)
    }
    
    let projectUsagePercent = 0
    if (planLimits?.projectsPerMonth && planLimits.projectsPerMonth > 0) {
      projectUsagePercent = Math.round((monthlyProjects / planLimits.projectsPerMonth) * 100)
    }
    
    return NextResponse.json({
      plan: currentPlan,
      limits: planLimits,
      usage: {
        generationsThisMonth: monthlyGenerations,
        projectsThisMonth: monthlyProjects,
        generationsRemaining: generationStatus.remaining,
        generationLimit: generationStatus.limit,
        generationUsagePercent,
        projectUsagePercent
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