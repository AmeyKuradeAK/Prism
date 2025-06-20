import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectToDatabase from '@/lib/database/mongodb'
import User from '@/lib/database/models/User'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    let user = await User.findOne({ clerkId: userId }).lean()
    
    // Create user if doesn't exist
    if (!user) {
      const newUser = new User({
        clerkId: userId,
        plan: 'free',
        credits: 100,
        preferences: {
          expoVersion: '49.0.0',
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
      })
      user = (await newUser.save()).toObject() as any
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { preferences, bio, website, location } = body

    await connectToDatabase()

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $set: {
          preferences,
          bio,
          website,
          location,
          updatedAt: new Date()
        }
      },
      { new: true, upsert: true }
    )

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
} 