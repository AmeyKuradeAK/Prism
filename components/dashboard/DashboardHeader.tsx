'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Settings, HelpCircle, Wand2, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'

declare global {
  interface Window {
    Clerk?: {
      openBillingPortal?: () => void
    }
  }
}

export default function DashboardHeader() {
  const { user } = useUser()

  const handleBilling = () => {
    if (typeof window !== 'undefined' && window.Clerk && typeof window.Clerk.openBillingPortal === 'function') {
      window.Clerk.openBillingPortal()
    } else {
      alert('Billing portal is not available. Please contact support.')
    }
  }

  return (
    <header className="nav-professional sticky top-0 z-50">
      <div className="container-professional">
        <div className="flex items-center justify-between py-4">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-primary rounded-professional flex items-center justify-center shadow-professional">
                    <Wand2 className="w-5 h-5 text-white" />
                  </div>
                  <Sparkles className="w-3 h-3 text-white absolute -top-1 -right-1 animate-pulse" />
                </div>
                <span className="text-xl font-bold text-professional">Prism</span>
              </Link>
            </motion.div>
            
            <nav className="hidden lg:flex items-center space-x-6">
              <Link 
                href="/dashboard" 
                className="text-muted hover:text-professional transition-professional px-3 py-2 rounded-professional hover:bg-white/10"
              >
                Dashboard
              </Link>
              <Link 
                href="/builder" 
                className="text-muted hover:text-professional transition-professional px-3 py-2 rounded-professional hover:bg-white/10 flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Builder</span>
              </Link>
              <Link 
                href="/pricing" 
                className="text-muted hover:text-professional transition-professional px-3 py-2 rounded-professional hover:bg-white/10"
              >
                Pricing
              </Link>
              <Link 
                href="/docs" 
                className="text-muted hover:text-professional transition-professional px-3 py-2 rounded-professional hover:bg-white/10"
              >
                Docs
              </Link>
            </nav>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              {/* Help */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 text-muted hover:text-professional hover:bg-white/10 transition-professional rounded-professional"
              >
                <HelpCircle className="w-5 h-5" />
              </motion.button>

              {/* Settings */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/settings"
                  className="p-3 text-muted hover:text-professional hover:bg-white/10 transition-professional rounded-professional inline-block"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>

            {/* User Profile and Billing */}
            <div className="ml-4 flex items-center space-x-2">
              <button
                onClick={handleBilling}
                className="px-4 py-2 bg-gradient-primary text-white rounded-professional font-semibold shadow-professional hover:bg-white/20 transition-professional"
                type="button"
              >
                Billing
              </button>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10 ring-2 ring-white/20 hover:ring-white/40 transition-professional',
                    userButtonPopoverCard: 'glass-dark shadow-professional',
                    userButtonPopoverActions: 'p-3',
                    userButtonPopoverActionButton: 'text-light hover:text-white hover:bg-white/10 rounded-professional',
                    userButtonPopoverActionButtonText: 'text-light',
                    userButtonPopoverActionButtonIcon: 'text-light'
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 