import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserUsageStats } from '@/lib/utils/usage-tracker'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const usageStats = await getUserUsageStats(userId)
    
    return new Response(
      JSON.stringify(usageStats),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error fetching usage stats:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch usage statistics' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 