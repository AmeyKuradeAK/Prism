import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      // Use redirect function instead of NextResponse.redirect for proper header handling
      redirect('/sign-in')
    }

    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('plan')
    const interval = searchParams.get('interval') || 'month'

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    // Validate plan ID
    const validPlans = ['pro', 'premium', 'team', 'enterprise']
    if (!validPlans.includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    // For enterprise, redirect to contact sales
    if (planId === 'enterprise') {
      redirect('/contact-sales')
    }

    // Log the checkout attempt
    console.log(`🛒 Checkout initiated: User ${userId} -> Plan ${planId} (${interval})`)
    
    // For development, redirect to pricing page with plan selection
    // In production, this would integrate with Clerk's billing system
    redirect(`/pricing?selected=${planId}&interval=${interval}`)

  } catch (error) {
    console.error('Error processing checkout:', error)
    
    // Use redirect instead of NextResponse.redirect to prevent header issues
    redirect('/pricing?error=checkout_failed')
  }
}

// Handle POST requests for API-based checkout
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, interval = 'month' } = await request.json()

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    // Validate plan ID
    const validPlans = ['pro', 'premium', 'team', 'enterprise']
    if (!validPlans.includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    // For enterprise, return contact sales info
    if (planId === 'enterprise') {
      return NextResponse.json({ 
        action: 'contact_sales',
        message: 'Enterprise plans require custom pricing. Please contact sales.',
        contactEmail: 'sales@yourapp.com'
      })
    }

    console.log(`🛒 API Checkout: User ${userId} -> Plan ${planId} (${interval})`)
    
    // For development, return success with mock checkout
    return NextResponse.json({
      action: 'success',
      message: 'Upgrade initiated successfully',
      planId: planId,
      interval: interval,
      redirectUrl: '/dashboard'
    })

  } catch (error) {
    console.error('Error processing API checkout:', error)
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    )
  }
} 