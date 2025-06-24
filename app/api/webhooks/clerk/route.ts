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
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
    
    if (!webhookSecret) {
      console.error('❌ CLERK_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    const body = await request.text()
    const headers = request.headers

    // Verify webhook signature
    const wh = new Webhook(webhookSecret)
    let event: ClerkWebhookEvent

    try {
      event = wh.verify(body, {
        'svix-id': headers.get('svix-id') || '',
        'svix-timestamp': headers.get('svix-timestamp') || '',
        'svix-signature': headers.get('svix-signature') || ''
      }) as ClerkWebhookEvent
    } catch (error) {
      console.error('❌ Webhook signature verification failed:', error)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('📨 Received Clerk webhook:', event.type)

    // Handle different event types
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
      
      // Billing events
      case 'billing.subscription.created':
        await handleBillingSubscriptionCreated(event.data)
        break
      
      case 'billing.subscription.updated':
        await handleBillingSubscriptionUpdated(event.data)
        break
      
      case 'billing.subscription.cancelled':
        await handleBillingSubscriptionCancelled(event.data)
        break
      
      // Legacy subscription events (keep for backward compatibility)
      case 'subscription.created':
        await handleSubscriptionCreated(event.data)
        break
      
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data)
        break
      
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.data)
        break
      
      default:
        console.log('⚠️ Unhandled webhook event type:', event.type)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// User management handlers
async function handleUserCreated(data: ClerkWebhookEvent['data']) {
  try {
    console.log('👤 User created:', data.id)
    
    await connectToDatabase()
    
    const user = await User.create({
      clerkId: data.id,
      email: data.email_addresses?.[0]?.email_address,
      firstName: data.first_name,
      lastName: data.last_name,
      avatar: data.image_url,
      plan: 'free', // Default to free plan
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

    console.log('✅ User created in database:', user._id)
  } catch (error) {
    console.error('❌ Error creating user:', error)
    throw error
  }
}

async function handleUserUpdated(data: ClerkWebhookEvent['data']) {
  try {
    console.log('👤 User updated:', data.id)
    
    await connectToDatabase()
    
    await User.findOneAndUpdate(
      { clerkId: data.id },
      {
        email: data.email_addresses?.[0]?.email_address,
        firstName: data.first_name,
        lastName: data.last_name,
        avatar: data.image_url,
        updatedAt: new Date()
      }
    )

    console.log('✅ User updated in database')
  } catch (error) {
    console.error('❌ Error updating user:', error)
    throw error
  }
}

async function handleUserDeleted(data: ClerkWebhookEvent['data']) {
  try {
    console.log('👤 User deleted:', data.id)
    
    await connectToDatabase()
    
    await User.findOneAndDelete({ clerkId: data.id })

    console.log('✅ User deleted from database')
  } catch (error) {
    console.error('❌ Error deleting user:', error)
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

    await connectToDatabase()
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
    const internalPlan = planId ? mapClerkPlanToInternal(planId) : 'free'

    await connectToDatabase()
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

    await connectToDatabase()
    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        plan: 'free', // Revert to free plan
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

    const internalPlan = data.plan_id ? mapClerkPlanToInternal(data.plan_id) : 'free'

    await connectToDatabase()
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

    const internalPlan = data.plan_id ? mapClerkPlanToInternal(data.plan_id) : 'free'

    await connectToDatabase()
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

    await connectToDatabase()
    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        plan: 'free', // Revert to free plan
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