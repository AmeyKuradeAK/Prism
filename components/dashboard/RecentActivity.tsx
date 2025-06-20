'use client'

import { motion } from 'framer-motion'
import { Clock, Play, Download, Share, Star, GitCommit, Activity } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

const activities = [
  {
    id: 1,
    type: 'project_created',
    message: 'Created new project "Food Delivery App"',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    icon: <Play className="w-4 h-4" />,
    gradient: 'from-blue-500 to-cyan-600',
    iconBg: 'bg-blue-500/20 border-blue-500/30'
  },
  {
    id: 2,
    type: 'build_completed',
    message: 'Build completed for "Weather Dashboard"',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    icon: <GitCommit className="w-4 h-4" />,
    gradient: 'from-green-500 to-emerald-600',
    iconBg: 'bg-green-500/20 border-green-500/30'
  },
  {
    id: 3,
    type: 'project_shared',
    message: 'Shared "E-commerce Mobile App" with community',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    icon: <Share className="w-4 h-4" />,
    gradient: 'from-purple-500 to-pink-600',
    iconBg: 'bg-purple-500/20 border-purple-500/30'
  },
  {
    id: 4,
    type: 'template_starred',
    message: 'Starred template "Social Media Clone"',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    icon: <Star className="w-4 h-4" />,
    gradient: 'from-yellow-500 to-orange-600',
    iconBg: 'bg-yellow-500/20 border-yellow-500/30'
  },
  {
    id: 5,
    type: 'project_downloaded',
    message: 'Downloaded "Chat Application" source code',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    icon: <Download className="w-4 h-4" />,
    gradient: 'from-slate-500 to-slate-600',
    iconBg: 'bg-slate-500/20 border-slate-500/30'
  }
]

export default function RecentActivity() {
  return (
    <motion.div 
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Recent Activity</h3>
        </div>
        <div className="text-sm text-white/40">
          View all coming soon
        </div>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <motion.div 
            key={activity.id}
            className="flex items-start space-x-3 p-3 hover:bg-white/5 rounded-2xl transition-all group cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className={`flex-shrink-0 p-2 rounded-xl border backdrop-blur-xl ${activity.iconBg}`}>
              <div className="text-white">
                {activity.icon}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium leading-relaxed">
                {activity.message}
              </p>
              <div className="flex items-center space-x-2 mt-2 text-xs text-white/40">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        className="mt-6 pt-6 border-t border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="text-center">
          <p className="text-sm text-white/60 mb-3">Stay updated with your progress</p>
          <div className="text-white/40 text-sm">
            Notifications coming soon
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 