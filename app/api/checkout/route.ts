import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      // Redirect to sign-in if not authenticated
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(signInUrl)
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
      const contactUrl = new URL('/contact-sales', request.url)
      return NextResponse.redirect(contactUrl)
    }

    // Build Clerk billing URL
    const clerkDomain = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('_test_') 
      ? 'clerk.accountsapi.com' 
      : 'clerk.com'
    
    const applicationId = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.split('_')[2]
    
    // Construct the billing URL for Clerk's hosted checkout
    const billingUrl = `https://${applicationId}.clerk.accounts.dev/user/billing`
    
    // Alternative: Use Clerk's direct subscription URL format
    const subscriptionUrl = `https://billing.clerk.com/subscribe?plan=${planId}&interval=${interval}&application_id=${applicationId}&redirect_url=${encodeURIComponent(new URL('/dashboard', request.url).toString())}`
    
    // Log the checkout attempt
    console.log(`🛒 Checkout initiated: User ${userId} -> Plan ${planId} (${interval})`)
    
    // Redirect to Clerk billing
    return NextResponse.redirect(subscriptionUrl)

  } catch (error) {
    console.error('Error processing checkout:', error)
    
    // Redirect to pricing page with error
    const pricingUrl = new URL('/pricing', request.url)
    pricingUrl.searchParams.set('error', 'checkout_failed')
    return NextResponse.redirect(pricingUrl)
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

    // Build checkout URL
    const applicationId = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.split('_')[2]
    const checkoutUrl = `https://billing.clerk.com/subscribe?plan=${planId}&interval=${interval}&application_id=${applicationId}`
    
    console.log(`🛒 API Checkout: User ${userId} -> Plan ${planId} (${interval})`)
    
    return NextResponse.json({
      action: 'redirect',
      checkoutUrl: checkoutUrl,
      planId: planId,
      interval: interval
    })

  } catch (error) {
    console.error('Error processing API checkout:', error)
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    )
  }
} 