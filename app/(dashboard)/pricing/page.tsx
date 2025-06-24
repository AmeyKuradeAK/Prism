'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { PricingTable } from '@clerk/nextjs'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { useEffect } from 'react'

export default function PricingPage() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader />
      
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

        {/* Clerk Pricing Table - Only show if billing is properly configured */}
        <div className="flex justify-center">
          <div className="w-full max-w-5xl">
            <PricingTable 
              appearance={{
                elements: {
                  card: 'bg-white/5 border border-white/10 rounded-lg p-6',
                  cardHeader: 'text-white',
                  planTitle: 'text-white text-2xl font-bold',
                  planPrice: 'text-white text-4xl font-bold',
                  planDescription: 'text-white/70',
                  featureList: 'text-white/80',
                  button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl',
                }
              }}
            />
          </div>
        </div>

        {/* Billing Management Section */}
        <div className="mt-16 text-center">
          <div className="card-glass p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Manage Your Subscription</h2>
            <p className="text-light mb-6">
              Need to update payment methods, view invoices, or manage your subscription? 
              Use the billing portal below.
            </p>
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.Clerk) {
                  // @ts-ignore
                  window.Clerk.openBillingPortal?.()
                } else {
                  window.open('/settings', '_self')
                }
              }}
              className="btn-glossy"
            >
              Open Billing Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 