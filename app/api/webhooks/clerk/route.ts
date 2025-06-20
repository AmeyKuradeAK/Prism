import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import connectToDatabase from '@/lib/database/mongodb'
import User from '@/lib/database/models/User'

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
      plan: 'free',
      credits: 999999, // Unlimited for free users
      preferences: {
        expoVersion: '53.0.0',
        codeStyle: 'typescript',
        theme: 'light'
      },
      usage: {
        generationsThisMonth: 0,
        buildsThisMonth: 0,
        storageUsed: 0
      },
      analytics: {
        totalGenerations: 0,
        totalBuilds: 0,
        totalProjects: 0,
        lastActiveAt: new Date()
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

    const updateData = {
      email: primaryEmail,
      firstName: userData.first_name,
      lastName: userData.last_name,
      avatar: userData.image_url,
      updatedAt: new Date()
    }

    const user = await User.findOneAndUpdate(
      { clerkId: userData.id },
      { $set: updateData },
      { new: true, upsert: true }
    )

    console.log('✅ Updated user in MongoDB:', userData.id)
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

async function handleUserDeleted(userData: ClerkWebhookEvent['data']) {
  try {
    // Note: You might want to soft delete or archive user data instead
    // For now, we'll completely remove the user
    await User.findOneAndDelete({ clerkId: userData.id })
    console.log('✅ Deleted user from MongoDB:', userData.id)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
} 