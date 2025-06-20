import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import ProjectBuilder from '@/components/ProjectBuilder'

export default async function BuilderPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return <ProjectBuilder />
} 