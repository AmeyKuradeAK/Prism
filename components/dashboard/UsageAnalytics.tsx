'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Target, 
  AlertCircle,
  RefreshCw,
  Clock,
  Smartphone
} from 'lucide-react'

interface UsageData {
  promptsUsed: number
  promptsLimit: number
  projectsCreated: number
  projectsLimit: number
  isOverLimit: boolean
  canUseAI: boolean
  resetDate: Date
}

interface UsageAnalyticsProps {
  userId: string
}

export default function UsageAnalytics({ userId }: UsageAnalyticsProps) {
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsageData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/user/usage-stats')
      if (!response.ok) {
        throw new Error('Failed to fetch usage data')
      }
      
      const data = await response.json()
      setUsageData({
        ...data,
        resetDate: new Date(data.resetDate)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load usage data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchUsageData()
    }
  }, [userId])

  const getUsagePercentage = (used: number, limit: number): number => {
    if (limit === -1) return 0
    if (limit === 0) return 100
    return Math.min(Math.round((used / limit) * 100), 100)
  }

  const formatUsageText = (used: number, limit: number): string => {
    if (limit === -1) {
      return `${used.toLocaleString()} used`
    }
    return `${used.toLocaleString()} / ${limit.toLocaleString()}`
  }

  const getDaysUntilReset = (resetDate: Date): number => {
    const now = new Date()
    const timeDiff = resetDate.getTime() - now.getTime()
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  }

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 100) return 'text-red-400'
    if (percentage >= 80) return 'text-yellow-400'
    return 'text-white'
  }

  const getUsageBarColor = (percentage: number): string => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-gradient-glossy'
  }

  if (loading) {
    return (
      <motion.div 
        className="card-glass p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 text-light animate-spin" />
        </div>
      </motion.div>
    )
  }

  if (error || !usageData) {
    return (
      <motion.div 
        className="card-glass p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-light mx-auto mb-3" />
          <p className="text-light">Failed to load usage data</p>
          <button 
            onClick={fetchUsageData}
            className="btn-glossy mt-4 px-4 py-2 text-sm"
          >
            Retry
          </button>
        </div>
      </motion.div>
    )
  }

  const promptPercentage = getUsagePercentage(usageData.promptsUsed, usageData.promptsLimit)
  const projectPercentage = getUsagePercentage(usageData.projectsCreated, usageData.projectsLimit)
  const daysUntilReset = getDaysUntilReset(usageData.resetDate)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-professional flex items-center justify-center shadow-professional">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Usage Analytics</h2>
            <p className="text-light">Track your prompt and project usage</p>
          </div>
        </div>
        <button
          onClick={fetchUsageData}
          disabled={loading}
          className="p-2 text-light hover:text-white hover:bg-white/10 rounded-professional transition-professional"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-glass p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-glossy rounded-professional flex items-center justify-center shadow-glossy">
              <Zap className="w-6 h-6 text-white" />
            </div>
            {usageData.isOverLimit && (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
          </div>
          
          <h3 className="text-sm font-medium text-light mb-2">Prompts Used</h3>
          <p className={`text-2xl font-bold ${getUsageColor(promptPercentage)} mb-3`}>
            {formatUsageText(usageData.promptsUsed, usageData.promptsLimit)}
          </p>
          
          {usageData.promptsLimit !== -1 && (
            <div className="w-full bg-gray-800 rounded-professional h-2 mb-2">
              <div 
                className={`h-2 rounded-professional transition-all ${getUsageBarColor(promptPercentage)}`}
                style={{ width: `${Math.min(promptPercentage, 100)}%` }}
              />
            </div>
          )}
          
          <p className="text-xs text-muted">
            {usageData.promptsLimit === -1 ? 'Unlimited' : `${promptPercentage}% used`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-glass p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-glossy rounded-professional flex items-center justify-center shadow-glossy">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h3 className="text-sm font-medium text-light mb-2">Projects Created</h3>
          <p className={`text-2xl font-bold ${getUsageColor(projectPercentage)} mb-3`}>
            {formatUsageText(usageData.projectsCreated, usageData.projectsLimit)}
          </p>
          
          {usageData.projectsLimit !== -1 && (
            <div className="w-full bg-gray-800 rounded-professional h-2 mb-2">
              <div 
                className={`h-2 rounded-professional transition-all ${getUsageBarColor(projectPercentage)}`}
                style={{ width: `${Math.min(projectPercentage, 100)}%` }}
              />
            </div>
          )}
          
          <p className="text-xs text-muted">
            {usageData.projectsLimit === -1 ? 'Unlimited' : `${projectPercentage}% used`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-glass p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-glossy rounded-professional flex items-center justify-center shadow-glossy">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h3 className="text-sm font-medium text-light mb-2">Usage Resets In</h3>
          <p className="text-2xl font-bold text-white mb-3">
            {daysUntilReset} {daysUntilReset === 1 ? 'day' : 'days'}
          </p>
          
          <p className="text-xs text-muted">
            {usageData.resetDate.toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-glass p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-professional flex items-center justify-center shadow-glossy ${
              usageData.canUseAI ? 'bg-gradient-glossy' : 'bg-gray-800'
            }`}>
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h3 className="text-sm font-medium text-light mb-2">AI Generation</h3>
          <p className={`text-lg font-bold mb-3 ${usageData.canUseAI ? 'text-white' : 'text-red-400'}`}>
            {usageData.canUseAI ? 'Available' : 'Unavailable'}
          </p>
          
          <p className="text-xs text-muted">
            {usageData.canUseAI ? 'Ready for new prompts' : 'Limit exceeded'}
          </p>
        </motion.div>
      </div>

      {(promptPercentage >= 80 || projectPercentage >= 80) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-glass p-6 border-l-4 border-yellow-500"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h4 className="text-white font-semibold mb-1">Usage Warning</h4>
              <p className="text-light text-sm mb-3">
                You're approaching your usage limits. Consider upgrading your plan to continue using AI generation.
              </p>
              <button className="btn-glossy px-4 py-2 text-sm">
                Upgrade Plan
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
} 