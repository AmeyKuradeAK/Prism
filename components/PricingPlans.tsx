'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Star, Crown, Users, Building } from 'lucide-react'
import { SUBSCRIPTION_PLANS, formatPrice, calculateYearlySavings } from '@/lib/utils/subscription-plans'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

export default function PricingPlans() {
  const [isYearly, setIsYearly] = useState(false)
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()

  const handleUpgrade = (planId: string) => {
    if (!isLoaded || !isSignedIn) {
      router.push('/sign-in')
      return
    }

    if (planId === 'spark') {
      router.push('/dashboard')
      return
    }

    if (planId === 'enterprise') {
      // Handle enterprise contact
      window.location.href = 'mailto:sales@yourapp.com?subject=Enterprise Plan Inquiry'
      return
    }

    // For paid plans, redirect to Clerk billing
    const billingInterval = isYearly ? 'year' : 'month'
    const checkoutUrl = `/api/checkout?plan=${planId}&interval=${billingInterval}`
    window.location.href = checkoutUrl
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'spark': return <Zap className="w-8 h-8" />
      case 'pro': return <Star className="w-8 h-8" /> // Plus plan
      case 'premium': return <Crown className="w-8 h-8" /> // Pro plan
      case 'team': return <Users className="w-8 h-8" />
      case 'enterprise': return <Building className="w-8 h-8" />
      default: return <Zap className="w-8 h-8" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'spark': return 'from-blue-500 to-cyan-500'
      case 'pro': return 'from-purple-500 to-pink-500' // Plus plan
      case 'premium': return 'from-orange-500 to-red-500' // Pro plan
      case 'team': return 'from-green-500 to-emerald-500'
      case 'enterprise': return 'from-slate-500 to-gray-500'
      default: return 'from-blue-500 to-cyan-500'
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-gray-100 rounded-full p-1 border border-gray-200">
          <div className="flex">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                !isYearly 
                  ? 'bg-black text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full font-medium transition-all relative ${
                isYearly 
                  ? 'bg-black text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs px-2 py-0.5 rounded-full">
                2 months free
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {SUBSCRIPTION_PLANS.map((plan, index) => {
          // For free plan, always show free pricing regardless of toggle
          const price = plan.id === 'spark' ? 0 : (isYearly ? plan.price.yearly : plan.price.monthly)
          const yearlyPrice = plan.price.yearly
          const monthlyPrice = plan.price.monthly
          const savings = calculateYearlySavings(monthlyPrice, yearlyPrice)
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl border-2 p-8 hover:shadow-xl transition-all duration-300 ${
                plan.popular ? 'border-black shadow-lg scale-105' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black text-white text-sm font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Icon & Name */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-100 flex items-center justify-center text-gray-800">
                  {getPlanIcon(plan.id)}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm">{plan.tagline}</p>
              </div>

              {/* Pricing */}
              <div className="text-center mb-8">
                {plan.id === 'spark' ? (
                  /* Free Plan - Always Free */
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    Free
                    <div className="text-lg font-normal text-gray-600">Forever</div>
                  </div>
                ) : (
                  /* Paid Plans - Show pricing based on toggle */
                  <>
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {isYearly && plan.price.yearly > 0 ? (
                        <>
                          {formatPrice(Math.round(plan.price.yearly / 12))}
                          <span className="text-lg font-normal text-gray-600">/month</span>
                        </>
                      ) : (
                        <>
                          {formatPrice(price)}
                          {price > 0 && (
                            <span className="text-lg font-normal text-gray-600">/month</span>
                          )}
                        </>
                      )}
                    </div>
                    
                    {isYearly && plan.price.yearly > 0 && (
                      <div className="text-gray-500 text-sm">
                        Billed annually ({formatPrice(plan.price.yearly)}/year)
                      </div>
                    )}
                    
                    {isYearly && savings > 0 && (
                      <div className="text-gray-900 text-sm font-medium">
                        Save {savings}% with yearly billing
                      </div>
                    )}
                    
                    {!isYearly && plan.price.yearly > 0 && (
                      <div className="text-gray-500 text-sm">
                        or {formatPrice(Math.round(plan.price.yearly / 12))}/month billed yearly
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="mt-auto">
                {plan.id === 'spark' ? (
                  <button 
                    onClick={() => handleUpgrade('spark')}
                    className="w-full bg-gray-100 border border-gray-300 text-gray-900 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Get Started Free
                  </button>
                ) : plan.id === 'enterprise' ? (
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleUpgrade('enterprise')}
                      className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                    >
                      Contact Sales
                    </button>
                    <button 
                      onClick={() => window.location.href = 'mailto:sales@yourapp.com?subject=Custom Pricing Request'}
                      className="w-full bg-gray-100 border border-gray-300 text-gray-900 py-2 rounded-xl text-sm hover:bg-gray-200 transition-colors"
                    >
                      Custom Pricing
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleUpgrade(plan.id)}
                    className={`w-full text-white py-3 rounded-xl font-medium transition-colors ${
                      plan.popular 
                        ? 'bg-black hover:bg-gray-800' 
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {!isSignedIn ? 'Sign Up' : `Upgrade to ${plan.name.split(' ')[1]}`}
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Enterprise CTA */}
      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4">Need something custom?</h3>
          <p className="text-white/70 mb-6">
            Our Enterprise plan can be tailored to your organization's specific needs. 
            On-premise deployment, custom integrations, and dedicated support included.
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-medium hover:from-purple-500 hover:to-pink-500 transition-colors">
            Schedule a Demo
          </button>
        </div>
      </div>
    </div>
  )
} 