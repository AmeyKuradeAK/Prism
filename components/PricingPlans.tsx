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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="glass rounded-xl-professional p-1">
          <div className="flex">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-8 py-3 rounded-professional font-medium transition-professional ${
                !isYearly 
                  ? 'bg-white text-black shadow-professional' 
                  : 'text-light hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-8 py-3 rounded-professional font-medium transition-professional relative ${
                isYearly 
                  ? 'bg-white text-black shadow-professional' 
                  : 'text-light hover:text-white'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-white text-black text-xs px-2 py-0.5 rounded-professional font-semibold">
                2 months free
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
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
              className={`relative transition-professional ${
                plan.popular 
                  ? 'card-glass shadow-professional scale-105' 
                  : 'card-glass hover:shadow-professional'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-white text-black text-sm font-bold px-6 py-2 rounded-xl-professional shadow-professional">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan Icon & Name */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl-professional bg-gradient-glossy flex items-center justify-center text-white shadow-glossy">
                    {getPlanIcon(plan.id)}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-light text-sm">{plan.tagline}</p>
                </div>

                {/* Pricing */}
                <div className="text-center mb-8">
                  {plan.id === 'spark' ? (
                    /* Free Plan - Always Free */
                    <div className="text-4xl font-bold text-white mb-2">
                      Free
                      <div className="text-lg font-normal text-light">Forever</div>
                    </div>
                  ) : (
                    /* Paid Plans - Show pricing based on toggle */
                    <>
                      <div className="text-4xl font-bold text-white mb-2">
                        {isYearly && plan.price.yearly > 0 ? (
                          <>
                            {formatPrice(Math.round(plan.price.yearly / 12))}
                            <span className="text-lg font-normal text-light">/month</span>
                          </>
                        ) : (
                          <>
                            {formatPrice(price)}
                            {price > 0 && (
                              <span className="text-lg font-normal text-light">/month</span>
                            )}
                          </>
                        )}
                      </div>
                      
                      {isYearly && plan.price.yearly > 0 && (
                        <div className="text-muted text-sm">
                          Billed annually ({formatPrice(plan.price.yearly)}/year)
                        </div>
                      )}
                      
                      {isYearly && savings > 0 && (
                        <div className="text-white text-sm font-medium">
                          Save {savings}% with yearly billing
                        </div>
                      )}
                      
                      {!isYearly && plan.price.yearly > 0 && (
                        <div className="text-muted text-sm">
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
                      <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                      <span className="text-light text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="mt-auto">
                  {plan.id === 'spark' ? (
                    <button 
                      onClick={() => handleUpgrade('spark')}
                      className="btn-ghost w-full py-3 text-center"
                    >
                      Get Started Free
                    </button>
                  ) : plan.id === 'enterprise' ? (
                    <div className="space-y-3">
                      <button 
                        onClick={() => handleUpgrade('enterprise')}
                        className="btn-secondary w-full py-3 text-center"
                      >
                        Contact Sales
                      </button>
                      <p className="text-xs text-muted text-center">
                        Custom pricing and features
                      </p>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleUpgrade(plan.id)}
                      className={`w-full py-3 text-center transition-professional ${
                        plan.popular 
                          ? 'btn-glossy font-bold' 
                          : 'btn-secondary'
                      }`}
                    >
                      Upgrade to {plan.name}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-24"
      >
        <h2 className="heading-tertiary text-center mb-12">Frequently Asked Questions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              question: "Can I change plans anytime?",
              answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
            },
            {
              question: "What happens if I exceed my limits?",
              answer: "We'll notify you when you're approaching your limits and help you upgrade to continue building."
            },
            {
              question: "Do you offer refunds?",
              answer: "Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked."
            },
            {
              question: "Is there a free trial?",
              answer: "Our Spark plan is completely free forever. You can start building immediately without any commitment."
            }
          ].map((faq, index) => (
            <div key={index} className="glass-dark rounded-lg-professional p-6">
              <h3 className="text-white font-semibold mb-3">{faq.question}</h3>
              <p className="text-light text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
} 