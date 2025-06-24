'use client'

import { motion } from 'framer-motion'
import { Zap, Code, Wand2 } from 'lucide-react'
import Link from 'next/link'

export default function QuickActions() {
  const actions = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'AI Builder',
      description: 'Create apps with AI prompts',
      href: '/builder',
      primary: true
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: 'Manual Project',
      description: 'Start with blank Expo template',
      href: '/builder?mode=manual',
      primary: false
    }
  ]

  return (
    <motion.div 
      className="card-glass p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-primary rounded-professional flex items-center justify-center shadow-professional">
          <Wand2 className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Quick Actions</h3>
      </div>
      
      <div className="space-y-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href={action.href}
              className={`block p-4 rounded-professional text-white group transition-professional shadow-professional hover:shadow-glossy ${
                action.primary ? 'btn-glossy' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {action.icon}
                </div>
                <div>
                  <h4 className="font-semibold">{action.title}</h4>
                  <p className="text-sm text-light">{action.description}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        className="mt-6 pt-6 border-t border-glass"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="text-center">
          <p className="text-sm text-light mb-3">Need inspiration?</p>
          <div className="text-muted text-sm">
            Example apps coming soon
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 