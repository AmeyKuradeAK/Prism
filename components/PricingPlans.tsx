'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Star, Crown, Users, Building, X } from 'lucide-react'
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

    // For paid plans, redirect to checkout
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

  // Separate free and paid plans
  const freePlan = SUBSCRIPTION_PLANS.find(plan => plan.id === 'spark')
  const paidPlans = SUBSCRIPTION_PLANS.filter(plan => plan.id !== 'spark')

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      {/* Free Plan Section - Always Visible */}
      {freePlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Start Building for Free</h2>
            <p className="text-light text-lg max-w-2xl mx-auto">
              Get started with our free plan - no credit card required, no time limits
            </p>
          </div>
          
          <div className="max-w-lg mx-auto">
            <div className="card-glass p-8 text-center border-2 border-white/20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-professional bg-gradient-glossy flex items-center justify-center text-white shadow-glossy">
                {getPlanIcon(freePlan.id)}
              </div>
              
              <h3 className="text-3xl font-bold text-white mb-2">{freePlan.name}</h3>
              <p className="text-light mb-6">{freePlan.tagline}</p>

              <div className="text-5xl font-bold text-white mb-8">
                Free
                <div className="text-lg font-normal text-light">Forever</div>
              </div>

              <div className="space-y-4 mb-8 text-left">
                {freePlan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-light">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleUpgrade('spark')}
                className="btn-glossy w-full py-4 text-lg font-bold"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Paid Plans Section */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Upgrade for More Power</h2>
          <p className="text-light text-xl max-w-3xl mx-auto mb-12">
            Unlock advanced features, higher limits, and premium support
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center">
            <div className="glass-dark rounded-professional p-1">
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
        </div>

        {/* Paid Plans Grid - Bigger and More Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
          {paidPlans.map((plan, index) => {
            const price = isYearly ? plan.price.yearly : plan.price.monthly
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
                    ? 'card-glass shadow-glossy scale-105 border-2 border-white/30' 
                    : 'card-glass hover:shadow-glossy border border-glass'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-white text-black text-sm font-bold px-6 py-2 rounded-professional shadow-professional">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8 lg:p-10">
                  {/* Plan Icon & Name */}
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-professional bg-gradient-glossy flex items-center justify-center text-white shadow-glossy">
                      {getPlanIcon(plan.id)}
                    </div>
                    
                    <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">{plan.name}</h3>
                    <p className="text-light">{plan.tagline}</p>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-8">
                    <div className="text-4xl lg:text-5xl font-bold text-white mb-3">
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
                      <div className="text-muted text-sm mb-2">
                        Billed annually ({formatPrice(plan.price.yearly)}/year)
                      </div>
                    )}
                    
                    {isYearly && savings > 0 && (
                      <div className="text-white text-sm font-medium bg-white/10 rounded-professional px-3 py-1 inline-block">
                        Save {savings}% yearly
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                        <span className="text-light">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    {plan.id === 'enterprise' ? (
                      <div className="space-y-3">
                        <button 
                          onClick={() => handleUpgrade('enterprise')}
                          className="glass-dark w-full py-4 text-center font-bold text-white hover:bg-white/10 transition-professional rounded-professional"
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
                        className={`w-full py-4 text-center transition-professional font-bold ${
                          plan.popular 
                            ? 'btn-glossy' 
                            : 'glass-dark text-white hover:bg-white/10 rounded-professional'
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
      </div>

      {/* Feature Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-8"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Compare All Plans</h2>
          <p className="text-light text-lg">
            Detailed feature comparison across all plans
          </p>
        </div>

        <div className="card-glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-glass">
                  <th className="text-left p-6 text-white font-bold">Features</th>
                  <th className="text-center p-6 text-white font-bold">Free</th>
                  <th className="text-center p-6 text-white font-bold">Plus</th>
                  <th className="text-center p-6 text-white font-bold">Pro</th>
                  <th className="text-center p-6 text-white font-bold">Team</th>
                  <th className="text-center p-6 text-white font-bold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Prompts per month', values: ['15', '200', '500', '1,000', 'Unlimited'] },
                  { feature: 'Projects', values: ['5', '50', '100', '200', 'Unlimited'] },
                  { feature: 'AI Providers', values: ['1', '2', 'All', 'All', 'All + Custom'] },
                  { feature: 'Export Code', values: ['✓', '✓', '✓', '✓', '✓'] },
                  { feature: 'Real-time Preview', values: ['✓', '✓', '✓', '✓', '✓'] },
                  { feature: 'EAS Build Integration', values: ['×', '✓', '✓', '✓', '✓'] },
                  { feature: 'Priority Support', values: ['×', '×', '✓', '✓', '✓'] },
                  { feature: 'Team Collaboration', values: ['×', '×', '×', '✓', '✓'] },
                  { feature: 'Custom Templates', values: ['×', '×', '×', '✓', '✓'] },
                  { feature: 'White-label Solution', values: ['×', '×', '×', '×', '✓'] },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-glass/50">
                    <td className="p-6 text-light font-medium">{row.feature}</td>
                    {row.values.map((value, valueIndex) => (
                      <td key={valueIndex} className="p-6 text-center">
                        {value === '✓' ? (
                          <Check className="w-5 h-5 text-white mx-auto" />
                        ) : value === '×' ? (
                          <X className="w-5 h-5 text-muted mx-auto" />
                        ) : (
                          <span className="text-white font-medium">{value}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="space-y-8"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-light text-lg">
            Everything you need to know about our pricing plans
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {[
            {
              question: "Can I change plans anytime?",
              answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate the billing."
            },
            {
              question: "What happens if I exceed my limits?",
              answer: "We'll notify you when you're approaching your limits. You can upgrade to continue building or wait until your monthly limits reset."
            },
            {
              question: "Do you offer refunds?",
              answer: "Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked, full refund within 30 days."
            },
            {
              question: "Is there a free trial for paid plans?",
              answer: "Our Free plan gives you full access to core features. You can also try any paid plan risk-free with our 30-day money-back guarantee."
            },
            {
              question: "How does prompt-based billing work?",
              answer: "Each AI generation request counts as one prompt (up to 400k tokens). This includes app generation, code modifications, and feature additions."
            },
            {
              question: "Can I use my own API keys?",
              answer: "Yes! All paid plans allow you to use your own AI provider API keys, which can reduce costs for high-volume usage."
            }
          ].map((faq, index) => (
            <div key={index} className="card-glass p-6">
              <h3 className="text-white font-bold mb-3 text-lg">{faq.question}</h3>
              <p className="text-light leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
} 