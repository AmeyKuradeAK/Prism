import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import PricingPlans from '@/components/PricingPlans'

export default async function PricingPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container-professional section-professional">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Choose Your <span className="text-white">Plan</span>
          </h1>
          <p className="text-xl text-light mb-8 max-w-3xl mx-auto leading-relaxed">
            Scale your React Native development with AI-powered tools. 
            From hobbyist to enterprise, we've got the perfect plan for your needs.
          </p>
        </div>

        {/* Custom Pricing Plans */}
        <PricingPlans />
      </div>
    </div>
  )
} 