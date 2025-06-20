'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Bell, Search, Settings, HelpCircle, Wand2, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'

export default function DashboardHeader() {
  const { user } = useUser()

  return (
    <header className="bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Wand2 className="w-5 h-5 text-white" />
                  </div>
                  <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Prism
                  </span>
                  <p className="text-xs text-purple-300 -mt-1">AI Builder</p>
                </div>
              </Link>
            </motion.div>
            
            <nav className="hidden lg:flex items-center space-x-6">
              <Link 
                href="/dashboard" 
                className="text-white/80 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
              >
                Dashboard
              </Link>
              <Link 
                href="/builder" 
                className="text-white/80 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5 flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Builder</span>
              </Link>
              <Link 
                href="/templates" 
                className="text-white/80 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
              >
                Templates
              </Link>
              <Link 
                href="/community" 
                className="text-white/80 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
              >
                Community
              </Link>
            </nav>
          </div>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-4">
            {/* Global Search */}
            <div className="hidden md:block relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search projects, templates..."
                className="pl-12 pr-4 py-3 w-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/40 transition-all"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-3 text-white/60 hover:text-white hover:bg-white/5 transition-all rounded-xl"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></span>
              </motion.button>

              {/* Help */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 text-white/60 hover:text-white hover:bg-white/5 transition-all rounded-xl"
              >
                <HelpCircle className="w-5 h-5" />
              </motion.button>

              {/* Settings */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/settings"
                  className="p-3 text-white/60 hover:text-white hover:bg-white/5 transition-all rounded-xl inline-block"
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
                    avatarBox: 'w-10 h-10 ring-2 ring-purple-500/20 hover:ring-purple-500/40 transition-all',
                    userButtonPopoverCard: 'bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl',
                    userButtonPopoverActions: 'p-3',
                    userButtonPopoverActionButton: 'text-white/70 hover:text-white hover:bg-white/5 rounded-lg',
                    userButtonPopoverActionButtonText: 'text-white/70',
                    userButtonPopoverActionButtonIcon: 'text-white/40'
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