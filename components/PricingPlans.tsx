'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Star, Crown, Users, Building } from 'lucide-react'
import { SUBSCRIPTION_PLANS, formatPrice, calculateYearlySavings } from '@/lib/utils/subscription-plans'

export default function PricingPlans() {
  const [isYearly, setIsYearly] = useState(false)

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'spark': return <Zap className="w-8 h-8" />
      case 'pro': return <Star className="w-8 h-8" />
      case 'premium': return <Crown className="w-8 h-8" />
      case 'team': return <Users className="w-8 h-8" />
      case 'enterprise': return <Building className="w-8 h-8" />
      default: return <Zap className="w-8 h-8" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'spark': return 'from-blue-500 to-cyan-500'
      case 'pro': return 'from-purple-500 to-pink-500'
      case 'premium': return 'from-orange-500 to-red-500'
      case 'team': return 'from-green-500 to-emerald-500'
      case 'enterprise': return 'from-slate-500 to-gray-500'
      default: return 'from-blue-500 to-cyan-500'
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-white/10 backdrop-blur-xl rounded-full p-1 border border-white/20">
          <div className="flex">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                !isYearly 
                  ? 'bg-white text-slate-900' 
                  : 'text-white hover:text-white/80'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full font-medium transition-all relative ${
                isYearly 
                  ? 'bg-white text-slate-900' 
                  : 'text-white hover:text-white/80'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                Save up to 17%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {SUBSCRIPTION_PLANS.map((plan, index) => {
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
              className={`relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-purple-500/50 scale-105' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Icon & Name */}
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${getPlanColor(plan.id)} flex items-center justify-center text-white`}>
                  {getPlanIcon(plan.id)}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-white/60 text-sm">{plan.tagline}</p>
              </div>

              {/* Pricing */}
              <div className="text-center mb-6">
                {plan.id === 'enterprise' ? (
                  <div>
                    <div className="text-3xl font-bold text-white">Custom</div>
                    <div className="text-white/60 text-sm">Contact us</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {formatPrice(price)}
                      {price > 0 && (
                        <span className="text-lg font-normal text-white/60">
                          /{isYearly ? 'year' : 'month'}
                        </span>
                      )}
                    </div>
                    
                    {isYearly && savings > 0 && (
                      <div className="text-green-400 text-sm font-medium">
                        Save {savings}% yearly
                      </div>
                    )}
                    
                    {!isYearly && plan.price.yearly > 0 && (
                      <div className="text-white/50 text-sm">
                        or {formatPrice(Math.round(plan.price.yearly / 12))}/month billed yearly
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/80 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="mt-auto">
                {plan.id === 'spark' ? (
                  <button className="w-full bg-white/10 border border-white/20 text-white py-3 rounded-xl font-medium hover:bg-white/20 transition-colors">
                    Get Started Free
                  </button>
                ) : plan.id === 'enterprise' ? (
                  <button className="w-full bg-gradient-to-r from-slate-600 to-gray-600 text-white py-3 rounded-xl font-medium hover:from-slate-500 hover:to-gray-500 transition-colors">
                    Contact Sales
                  </button>
                ) : (
                  <button className={`w-full bg-gradient-to-r ${getPlanColor(plan.id)} text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity`}>
                    Upgrade to {plan.name.split(' ')[1]}
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