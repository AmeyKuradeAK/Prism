'use client'

import { motion } from 'framer-motion'
import { Plus, Layout, Zap, Rocket, FileText, Users, Wand2, Code, Smartphone } from 'lucide-react'
import Link from 'next/link'

export default function QuickActions() {
  const actions = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'AI Builder',
      description: 'Create apps with AI prompts',
      href: '/builder',
      gradient: 'from-purple-500 to-pink-600',
      hoverGradient: 'hover:from-purple-600 hover:to-pink-700'
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: 'Manual Project',
      description: 'Start with blank Expo template',
      href: '/builder?mode=manual',
      gradient: 'from-blue-500 to-cyan-600',
      hoverGradient: 'hover:from-blue-600 hover:to-cyan-700'
    },
    {
      icon: <Layout className="w-5 h-5" />,
      title: 'Templates',
      description: 'Coming soon - Curated templates',
      href: '#',
      gradient: 'from-green-500 to-emerald-600',
      hoverGradient: 'hover:from-green-600 hover:to-emerald-700',
      disabled: true
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Community',
      description: 'Coming soon - Share & discover',
      href: '#',
      gradient: 'from-orange-500 to-red-600',
      hoverGradient: 'hover:from-orange-600 hover:to-red-700',
      disabled: true
    }
  ]

  return (
    <motion.div 
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
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
            whileHover={action.disabled ? {} : { scale: 1.02 }}
            whileTap={action.disabled ? {} : { scale: 0.98 }}
          >
            {action.disabled ? (
              <div className={`block p-4 rounded-2xl bg-gradient-to-r ${action.gradient} opacity-50 cursor-not-allowed group transition-all duration-300`}>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 text-white">
                    {action.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{action.title}</h4>
                    <p className="text-sm text-white/80">{action.description}</p>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href={action.href}
                className={`block p-4 rounded-2xl bg-gradient-to-r ${action.gradient} ${action.hoverGradient} text-white group transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {action.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold">{action.title}</h4>
                    <p className="text-sm text-white/90">{action.description}</p>
                  </div>
                </div>
              </Link>
            )}
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        className="mt-6 pt-6 border-t border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="text-center">
          <p className="text-sm text-white/60 mb-3">Need inspiration?</p>
          <div className="text-white/40 text-sm">
            Example apps coming soon
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 