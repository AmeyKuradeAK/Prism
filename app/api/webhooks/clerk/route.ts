import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import connectToDatabase from '@/lib/database/mongodb'
import User from '@/lib/database/models/User'
import { mapClerkPlanToInternal } from '@/lib/utils/subscription-plans'

// Webhook event types from Clerk
type ClerkWebhookEvent = {
  type: string
  data: {
    id: string
    email_addresses?: Array<{
      email_address: string
      id: string
    }>
    first_name?: string
    last_name?: string
    image_url?: string
    username?: string
    created_at?: number
    updated_at?: number
    // Billing-specific data
    user_id?: string
    plan_id?: string
    subscription_id?: string
    status?: string
    current_period_start?: number
    current_period_end?: number
    cancel_at_period_end?: boolean
    metadata?: any
  }
}

export async function POST(request: NextRequest) {
  // Verify the webhook signature
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET environment variable')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  // Get headers from the request
  const svixId = request.headers.get('svix-id')
  const svixTimestamp = request.headers.get('svix-timestamp')
  const svixSignature = request.headers.get('svix-signature')

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    )
  }

  // Get the body
  const payload = await request.text()

  // Create a new Svix instance with your secret
  const webhook = new Webhook(WEBHOOK_SECRET)

  let event: ClerkWebhookEvent

  // Verify the payload with the headers
  try {
    event = webhook.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  console.log('📨 Received Clerk webhook:', event.type)

  try {
    await connectToDatabase()

    switch (event.type) {
      case 'user.created':
        await handleUserCreated(event.data)
        break
      case 'user.updated':
        await handleUserUpdated(event.data)
        break
      case 'user.deleted':
        await handleUserDeleted(event.data)
        break
      // Clerk billing webhook events
      case 'subscription.created':
        await handleSubscriptionCreated(event.data)
        break
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data)
        break
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.data)
        break
      case 'subscription.renewed':
        await handleSubscriptionRenewed(event.data)
        break
      case 'billing.subscription.created':
        await handleBillingSubscriptionCreated(event.data)
        break
      case 'billing.subscription.updated':
        await handleBillingSubscriptionUpdated(event.data)
        break
      case 'billing.subscription.cancelled':
        await handleBillingSubscriptionCancelled(event.data)
        break
      default:
        console.log(`Unhandled webhook event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleUserCreated(userData: ClerkWebhookEvent['data']) {
  try {
    const primaryEmail = userData.email_addresses?.[0]?.email_address

    const newUser = new User({
      clerkId: userData.id,
      email: primaryEmail,
      firstName: userData.first_name,
      lastName: userData.last_name,
      avatar: userData.image_url,
      plan: 'spark', // Start with free plan
      preferences: {
        expoVersion: '53.0.0',
        codeStyle: 'typescript',
        theme: 'light'
      },
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

    await newUser.save()
    console.log('✅ Created user in MongoDB:', userData.id)
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

async function handleUserUpdated(userData: ClerkWebhookEvent['data']) {
  try {
    const primaryEmail = userData.email_addresses?.[0]?.email_address

    await User.findOneAndUpdate(
      { clerkId: userData.id },
      {
        email: primaryEmail,
        firstName: userData.first_name,
        lastName: userData.last_name,
        avatar: userData.image_url,
        updatedAt: new Date()
      }
    )

    console.log('✅ Updated user in MongoDB:', userData.id)
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

async function handleUserDeleted(userData: ClerkWebhookEvent['data']) {
  try {
    await User.findOneAndDelete({ clerkId: userData.id })
    console.log('✅ Deleted user from MongoDB:', userData.id)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

// New Clerk billing webhook handlers
async function handleBillingSubscriptionCreated(data: ClerkWebhookEvent['data']) {
  try {
    console.log('💳 Clerk billing subscription created:', data)
    
    const userId = data.user_id || data.id
    const planId = data.plan_id
    
    if (!userId || !planId) {
      console.error('Missing user ID or plan ID in billing subscription created event')
      return
    }

    // Map Clerk plan ID to our internal plan
    const internalPlan = mapClerkPlanToInternal(planId)

    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        plan: internalPlan,
        'subscription.planId': planId,
        'subscription.status': 'active',
        'subscription.currentPeriodEnd': data.current_period_end ? new Date(data.current_period_end * 1000) : null,
        'subscription.cancelAtPeriodEnd': false,
        updatedAt: new Date()
      },
      { upsert: true }
    )

    console.log(`✅ Updated user billing subscription: ${userId} -> ${internalPlan} (${planId})`)
  } catch (error) {
    console.error('Error handling billing subscription created:', error)
    throw error
  }
}

async function handleBillingSubscriptionUpdated(data: ClerkWebhookEvent['data']) {
  try {
    console.log('💳 Clerk billing subscription updated:', data)
    
    const userId = data.user_id || data.id
    const planId = data.plan_id
    
    if (!userId) {
      console.error('Missing user ID in billing subscription updated event')
      return
    }

    // Map Clerk plan ID to our internal plan
    const internalPlan = planId ? mapClerkPlanToInternal(planId) : 'spark'

    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        plan: internalPlan,
        'subscription.planId': planId,
        'subscription.status': data.status || 'active',
        'subscription.currentPeriodEnd': data.current_period_end ? new Date(data.current_period_end * 1000) : null,
        'subscription.cancelAtPeriodEnd': data.cancel_at_period_end || false,
        updatedAt: new Date()
      }
    )

    console.log(`✅ Updated user billing subscription: ${userId} -> ${internalPlan} (${data.status})`)
  } catch (error) {
    console.error('Error handling billing subscription updated:', error)
    throw error
  }
}

async function handleBillingSubscriptionCancelled(data: ClerkWebhookEvent['data']) {
  try {
    console.log('💳 Clerk billing subscription cancelled:', data)
    
    const userId = data.user_id || data.id
    if (!userId) {
      console.error('Missing user ID in billing subscription cancelled event')
      return
    }

    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        plan: 'spark', // Revert to free plan
        'subscription.status': 'canceled',
        'subscription.cancelAtPeriodEnd': true,
        updatedAt: new Date()
      }
    )

    console.log(`✅ Cancelled user billing subscription: ${userId}`)
  } catch (error) {
    console.error('Error handling billing subscription cancelled:', error)
    throw error
  }
}

// Legacy subscription webhook handlers (keep for backward compatibility)
async function handleSubscriptionCreated(data: ClerkWebhookEvent['data']) {
  try {
    console.log('💳 Legacy subscription created:', data.subscription_id)
    
    const userId = data.user_id || data.id
    if (!userId) {
      console.error('No user ID in subscription created event')
      return
    }

    const internalPlan = data.plan_id ? mapClerkPlanToInternal(data.plan_id) : 'spark'

    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        plan: internalPlan,
        'subscription.planId': data.plan_id,
        'subscription.status': 'active',
        'subscription.currentPeriodEnd': data.current_period_end ? new Date(data.current_period_end * 1000) : null,
        'subscription.cancelAtPeriodEnd': false,
        updatedAt: new Date()
      },
      { upsert: true }
    )

    console.log(`✅ Updated user subscription: ${userId} -> ${internalPlan}`)
  } catch (error) {
    console.error('Error handling subscription created:', error)
    throw error
  }
}

async function handleSubscriptionUpdated(data: ClerkWebhookEvent['data']) {
  try {
    console.log('💳 Legacy subscription updated:', data.subscription_id)
    
    const userId = data.user_id || data.id
    if (!userId) {
      console.error('No user ID in subscription updated event')
      return
    }

    const internalPlan = data.plan_id ? mapClerkPlanToInternal(data.plan_id) : 'spark'

    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        plan: internalPlan,
        'subscription.planId': data.plan_id,
        'subscription.status': data.status || 'active',
        'subscription.currentPeriodEnd': data.current_period_end ? new Date(data.current_period_end * 1000) : null,
        'subscription.cancelAtPeriodEnd': data.cancel_at_period_end || false,
        updatedAt: new Date()
      }
    )

    console.log(`✅ Updated user subscription: ${userId} -> ${internalPlan} (${data.status})`)
  } catch (error) {
    console.error('Error handling subscription updated:', error)
    throw error
  }
}

async function handleSubscriptionCancelled(data: ClerkWebhookEvent['data']) {
  try {
    console.log('💳 Legacy subscription cancelled:', data.subscription_id)
    
    const userId = data.user_id || data.id
    if (!userId) {
      console.error('No user ID in subscription cancelled event')
      return
    }

    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        plan: 'spark', // Revert to free plan
        'subscription.status': 'canceled',
        'subscription.cancelAtPeriodEnd': true,
        updatedAt: new Date()
      }
    )

    console.log(`✅ Cancelled user subscription: ${userId}`)
  } catch (error) {
    console.error('Error handling subscription cancelled:', error)
    throw error
  }
}

async function handleSubscriptionRenewed(data: ClerkWebhookEvent['data']) {
  try {
    console.log('💳 Legacy subscription renewed:', data.subscription_id)
    
    const userId = data.user_id || data.id
    if (!userId) {
      console.error('No user ID in subscription renewed event')
      return
    }

    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        'subscription.status': 'active',
        'subscription.currentPeriodEnd': data.current_period_end ? new Date(data.current_period_end * 1000) : null,
        'subscription.cancelAtPeriodEnd': false,
        updatedAt: new Date()
      }
    )

    console.log(`✅ Renewed user subscription: ${userId}`)
  } catch (error) {
    console.error('Error handling subscription renewed:', error)
    throw error
  }
} 