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

        {/* Simple Plan Cards for Public View */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Free Plan */}
          <motion.div 
            className="card-glass p-8 relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <div className="text-4xl font-bold text-white mb-4">$0</div>
              <p className="text-light mb-6">Perfect for getting started</p>
              
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">30 AI prompts/month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">3 projects</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Code export</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Community support</span>
                </li>
              </ul>

              <Link 
                href={isSignedIn ? "/dashboard" : "/sign-up"}
                className="btn-glossy w-full inline-flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Plus Plan */}
          <motion.div 
            className="card-glass p-8 relative border-2 border-white/20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-primary px-4 py-2 rounded-professional text-white text-sm font-medium">
                Popular
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Plus</h3>
              <div className="text-4xl font-bold text-white mb-4">$20<span className="text-lg text-light">/month</span></div>
              <p className="text-light mb-6">For serious developers</p>
              
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">200 AI prompts/month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Unlimited projects</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Priority support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Custom API keys</span>
                </li>
              </ul>

              <Link 
                href={isSignedIn ? "/settings" : "/sign-up"}
                className="btn-glossy w-full inline-flex items-center justify-center space-x-2"
              >
                <span>Upgrade to Plus</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Pro Plan */}
          <motion.div 
            className="card-glass p-8 relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="text-4xl font-bold text-white mb-4">$49<span className="text-lg text-light">/month</span></div>
              <p className="text-light mb-6">For power users</p>
              
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">1000 AI prompts/month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Unlimited projects</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Custom branding</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">API access</span>
                </li>
              </ul>

              <Link 
                href={isSignedIn ? "/settings" : "/sign-up"}
                className="btn-glossy w-full inline-flex items-center justify-center space-x-2"
              >
                <span>Upgrade to Pro</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Clerk Pricing Table for Signed-in Users */}
        {isSignedIn && (
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Manage Your Subscription</h2>
              <p className="text-light">Upgrade, downgrade, or manage your billing preferences</p>
            </div>

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
          </motion.div>
        )}

        {/* Features Comparison */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
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
          transition={{ duration: 0.8, delay: 0.6 }}
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
          transition={{ duration: 0.8, delay: 0.7 }}
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