'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Bell, Search, Settings, HelpCircle, Wand2, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'

export default function DashboardHeader() {
  const { user } = useUser()

  return (
    <header className="nav-dark sticky top-0 z-50">
      <div className="container-professional">
        <div className="flex items-center justify-between py-4">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-primary rounded-xl-professional flex items-center justify-center shadow-professional">
                    <Wand2 className="w-5 h-5 text-white" />
                  </div>
                  <Sparkles className="w-3 h-3 text-white absolute -top-1 -right-1 animate-pulse" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">
                    Prism
                  </span>
                  <p className="text-xs text-light -mt-1">AI Builder</p>
                </div>
              </Link>
            </motion.div>
            
            <nav className="hidden lg:flex items-center space-x-6">
              <Link 
                href="/dashboard" 
                className="text-light hover:text-white transition-professional px-3 py-2 rounded-professional hover:bg-white/10"
              >
                Dashboard
              </Link>
              <Link 
                href="/builder" 
                className="text-light hover:text-white transition-professional px-3 py-2 rounded-professional hover:bg-white/10 flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Builder</span>
              </Link>
              <Link 
                href="/templates" 
                className="text-light hover:text-white transition-professional px-3 py-2 rounded-professional hover:bg-white/10"
              >
                Templates
              </Link>
              <Link 
                href="/community" 
                className="text-light hover:text-white transition-professional px-3 py-2 rounded-professional hover:bg-white/10"
              >
                Community
              </Link>
            </nav>
          </div>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-4">
            {/* Global Search */}
            <div className="hidden md:block relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-light" />
              <input
                type="text"
                placeholder="Search projects, templates..."
                className="input-dark pl-12 pr-4 py-3 w-80"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-3 text-light hover:text-white hover:bg-white/10 transition-professional rounded-professional"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse"></span>
              </motion.button>

              {/* Help */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 text-light hover:text-white hover:bg-white/10 transition-professional rounded-professional"
              >
                <HelpCircle className="w-5 h-5" />
              </motion.button>

              {/* Settings */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/settings"
                  className="p-3 text-light hover:text-white hover:bg-white/10 transition-professional rounded-professional inline-block"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>

            {/* User Profile */}
            <div className="ml-4">
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