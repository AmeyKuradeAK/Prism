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
    
    const user = await User.findOne({ clerkId: userId }).lean()
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return only AI preferences, not actual keys
    const aiPreferences = {
      preferredProvider: user.preferences?.preferredProvider || 'mistral',
      preferredModel: user.preferences?.preferredModel || 'Mistral Large',
      useOwnKeys: user.preferences?.useOwnKeys || false,
      theme: user.preferences?.theme || 'light',
      codeStyle: user.preferences?.codeStyle || 'typescript',
      expoVersion: user.preferences?.expoVersion || '50.0.0'
    }

    return NextResponse.json(aiPreferences)
  } catch (error) {
    console.error('Error fetching AI preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI preferences' },
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
    const { 
      preferredProvider, 
      preferredModel, 
      useOwnKeys, 
      theme, 
      codeStyle, 
      expoVersion 
    } = body

    await connectToDatabase()

    // Validate inputs
    const validProviders = ['claude', 'openai', 'mistral', 'deepseek']
    const validThemes = ['light', 'dark']
    const validCodeStyles = ['typescript', 'javascript']

    if (preferredProvider && !validProviders.includes(preferredProvider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    if (theme && !validThemes.includes(theme)) {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 })
    }

    if (codeStyle && !validCodeStyles.includes(codeStyle)) {
      return NextResponse.json({ error: 'Invalid code style' }, { status: 400 })
    }

    const updateData: any = {
      updatedAt: new Date()
    }

    // Build preferences update object
    if (preferredProvider !== undefined) {
      updateData['preferences.preferredProvider'] = preferredProvider
    }
    if (preferredModel !== undefined) {
      updateData['preferences.preferredModel'] = preferredModel
    }
    if (useOwnKeys !== undefined) {
      updateData['preferences.useOwnKeys'] = useOwnKeys
    }
    if (theme !== undefined) {
      updateData['preferences.theme'] = theme
    }
    if (codeStyle !== undefined) {
      updateData['preferences.codeStyle'] = codeStyle
    }
    if (expoVersion !== undefined) {
      updateData['preferences.expoVersion'] = expoVersion
    }

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: updateData },
      { new: true, upsert: true }
    )

    return NextResponse.json({
      message: 'AI preferences updated successfully',
      preferences: user.preferences
    })
  } catch (error) {
    console.error('Error updating AI preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update AI preferences' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Reset to defaults
    await User.findOneAndUpdate(
      { clerkId: userId },
      { 
        $set: {
          'preferences.preferredProvider': 'mistral',
          'preferences.preferredModel': 'Mistral Large',
          'preferences.useOwnKeys': false,
          updatedAt: new Date()
        }
      },
      { new: true }
    )

    return NextResponse.json({
      message: 'AI preferences reset to defaults'
    })
  } catch (error) {
    console.error('Error resetting AI preferences:', error)
    return NextResponse.json(
      { error: 'Failed to reset AI preferences' },
      { status: 500 }
    )
  }
} 