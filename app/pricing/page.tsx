'use client'

import { useUser } from '@clerk/nextjs'
import { PricingTable } from '@clerk/nextjs'
import Header from '@/components/Header'
import Link from 'next/link'
import { CheckCircle, Zap, Users, Shield, Star, ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PricingPage() {
  const { isSignedIn } = useUser()

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="container-professional section-professional pt-20">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="glass-dark inline-flex items-center space-x-2 rounded-professional px-6 py-3 mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Simple • Transparent • No Hidden Fees</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Choose Your <span className="text-white">Plan</span>
          </h1>
          <p className="text-xl text-light mb-8 max-w-3xl mx-auto leading-relaxed">
            Scale your React Native development with AI-powered tools. 
            From hobbyist to enterprise, we've got the perfect plan for your needs.
          </p>
        </motion.div>

        {/* Clerk Pricing Table */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              {isSignedIn ? 'Select Your Plan' : 'Choose Your Plan'}
            </h2>
            <p className="text-light">
              {isSignedIn 
                ? 'Upgrade, downgrade, or manage your billing preferences' 
                : 'Start building with our AI-powered React Native generator'
              }
            </p>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-6xl">
              <PricingTable 
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    pricingCard: 'bg-white/5 border border-white/10 rounded-professional p-8 hover:bg-white/10 transition-all duration-300 shadow-professional hover:shadow-glossy',
                    pricingCardHeader: 'text-center mb-6',
                    planTitle: 'text-white text-3xl font-bold mb-2',
                    planPrice: 'text-white text-5xl font-bold mb-1',
                    planPriceAmount: 'text-white text-5xl font-bold',
                    planPriceCurrency: 'text-white text-2xl font-bold',
                    planPriceInterval: 'text-light text-lg',
                    planDescription: 'text-light text-lg mb-6',
                    featureList: 'space-y-4 mb-8',
                    featureListItem: 'flex items-center space-x-3 text-white',
                    featureListIcon: 'w-5 h-5 text-green-400',
                    featureListText: 'text-white',
                    button: 'w-full bg-gradient-primary hover:bg-gradient-to-r hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-professional transition-all duration-300 shadow-professional hover:shadow-glossy transform hover:scale-105',
                    popularPlanPricingCard: 'border-2 border-white/30 bg-white/10 relative',
                    popularPlanBadge: 'absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-primary px-6 py-2 rounded-professional text-white text-sm font-bold shadow-professional',
                  }
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Features Comparison */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose Prism?</h2>
            <p className="text-light">Professional-grade features for every development need</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-professional flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
              <p className="text-light">Generate complete apps in seconds with our AI engine</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-professional flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Production Ready</h3>
              <p className="text-light">Clean, optimized code ready for app stores</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-professional flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Team Collaboration</h3>
              <p className="text-light">Work together seamlessly on Pro and Team plans</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-professional flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Premium Support</h3>
              <p className="text-light">Priority support and dedicated assistance</p>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                q: "Can I change plans anytime?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                q: "What happens if I exceed my prompt limit?",
                a: "You'll be notified when approaching your limit. Upgrade anytime to continue building."
              },
              {
                q: "Do I own the code generated?",
                a: "Absolutely! All generated code belongs to you. Export and use it however you like."
              },
              {
                q: "Is there a free trial?",
                a: "Our Free plan includes 30 prompts to try Prism. No credit card required to start."
              }
            ].map((faq, index) => (
              <div key={index} className="card-glass p-6">
                <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-light">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="card-glass p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Building?</h2>
            <p className="text-light mb-8 max-w-2xl mx-auto">
              Join thousands of developers using Prism to create amazing React Native apps with AI
            </p>
            <Link 
              href={isSignedIn ? "/dashboard" : "/sign-up"}
              className="btn-glossy inline-flex items-center space-x-3 px-8 py-4 text-lg"
            >
              <span>Get Started for Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 