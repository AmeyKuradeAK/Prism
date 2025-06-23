import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import UserSettings from '@/components/UserSettings'

export default async function SettingsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return <UserSettings />
} 