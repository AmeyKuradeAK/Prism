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
    icon: <Play className="w-4 h-4" />
  },
  {
    id: 2,
    type: 'build_completed',
    message: 'Build completed for "Weather Dashboard"',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    icon: <GitCommit className="w-4 h-4" />
  },
  {
    id: 3,
    type: 'project_shared',
    message: 'Shared "E-commerce Mobile App" with community',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    icon: <Share className="w-4 h-4" />
  },
  {
    id: 4,
    type: 'template_starred',
    message: 'Starred template "Social Media Clone"',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    icon: <Star className="w-4 h-4" />
  },
  {
    id: 5,
    type: 'project_downloaded',
    message: 'Downloaded "Chat Application" source code',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    icon: <Download className="w-4 h-4" />
  }
]

export default function RecentActivity() {
  return (
    <motion.div 
      className="card-glass p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-professional flex items-center justify-center shadow-professional">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Recent Activity</h3>
        </div>
        <div className="text-sm text-muted">
          View all coming soon
        </div>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <motion.div 
            key={activity.id}
            className="flex items-start space-x-3 p-3 hover:bg-white/10 rounded-professional transition-professional group cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex-shrink-0 p-2 rounded-professional border border-glass glass-dark">
              <div className="text-white">
                {activity.icon}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium leading-relaxed">
                {activity.message}
              </p>
              <div className="flex items-center space-x-2 mt-2 text-xs text-muted">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        className="mt-6 pt-6 border-t border-glass"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="text-center">
          <p className="text-sm text-light mb-3">Stay updated with your progress</p>
          <div className="text-muted text-sm">
            Notifications coming soon
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 