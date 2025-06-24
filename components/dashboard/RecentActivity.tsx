'use client'

import { motion } from 'framer-motion'
import { Clock, Play, GitCommit, Activity } from 'lucide-react'
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
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-primary rounded-professional flex items-center justify-center shadow-professional">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Recent Activity</h3>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <motion.div 
            key={activity.id}
            className="flex items-start space-x-3 p-3 hover:bg-white/10 rounded-professional transition-professional group"
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
    </motion.div>
  )
} 