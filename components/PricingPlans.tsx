'use client'

import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { PricingTable } from '@clerk/nextjs'
import { Check, Zap, ArrowRight } from 'lucide-react'
import { SUBSCRIPTION_PLANS } from '@/lib/utils/subscription-plans'

export default function PricingPlans() {
  const { isLoaded, isSignedIn, user } = useUser()

  // Show the free plan for non-signed in users
  const freePlan = SUBSCRIPTION_PLANS.find(plan => plan.id === 'spark')

  return (
    <div className="min-h-screen pt-20 px-4 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-light max-w-3xl mx-auto">
            Start building amazing React Native apps with AI. Upgrade anytime as your needs grow.
          </p>
        </motion.div>

        {/* Free Plan Preview (for non-signed in users) */}
        {!isSignedIn && freePlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="max-w-md mx-auto">
              <div className="card-glass p-8 text-center border-2 border-white/10">
                <div className="flex items-center justify-center mb-6">
                  <Zap className="w-12 h-12 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{freePlan.name}</h3>
                <p className="text-light mb-4">{freePlan.tagline}</p>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-2">Free</div>
                  <p className="text-light">Perfect to get started</p>
                </div>
                
                <div className="space-y-3 mb-8">
                  {freePlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-white">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => window.location.href = '/sign-up'}
                  className="btn-glossy w-full inline-flex items-center justify-center space-x-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Clerk Pricing Table (for signed-in users or as main display) */}
        {isLoaded && (
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                {isSignedIn ? 'Manage Your Subscription' : 'Premium Plans'}
              </h2>
              <p className="text-light">
                {isSignedIn 
                  ? 'Upgrade, downgrade, or manage your billing preferences' 
                  : 'Unlock the full power of AI-driven React Native development'
                }
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-6xl">
                <PricingTable 
                  appearance={{
                    elements: {
                      // Main container
                      card: 'bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20',
                      cardHeader: 'text-center mb-6',
                      
                      // Plan details
                      planTitle: 'text-white text-2xl font-bold mb-2',
                      planPrice: 'text-white text-4xl font-bold mb-1',
                      planDescription: 'text-white/70 text-sm mb-6',
                      
                      // Features
                      featureList: 'space-y-3 mb-8',
                      featureListItem: 'flex items-center space-x-3 text-white/80',
                      featureListItemIcon: 'w-5 h-5 text-green-400 flex-shrink-0',
                      featureListItemText: 'text-sm',
                      
                      // Button
                      button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl w-full',
                      
                      // Popular plan badge
                      badge: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4',
                    },
                    variables: {
                      colorPrimary: '#8b5cf6',
                      colorText: '#ffffff',
                      colorTextSecondary: '#e5e7eb',
                      colorBackground: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                    }
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Call to action for non-signed in users */}
        {!isSignedIn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
              <p className="text-light mb-6">
                Sign up now to access our free plan and upgrade anytime as your needs grow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/sign-up'}
                  className="btn-glossy"
                >
                  Start Building for Free
                </button>
                <button
                  onClick={() => window.location.href = '/docs'}
                  className="btn-outline"
                >
                  View Documentation
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Features comparison hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-white/60 text-sm">
            All plans include core AI generation, Expo SDK support, and community access. 
            {isSignedIn ? ' Visit your dashboard to track usage.' : ' Sign up to view detailed comparisons.'}
          </p>
        </motion.div>
      </div>
    </div>
  )
} 