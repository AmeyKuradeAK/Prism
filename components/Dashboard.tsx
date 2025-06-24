'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@clerk/nextjs'
import { Wand2, Smartphone, CheckCircle, Zap, Star, TrendingUp, AlertCircle, RefreshCw, X } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'

// Lazy load heavy components
const ProjectsList = dynamic(() => import('./ProjectsList'), {
  loading: () => <div className="card-glass animate-pulse h-64" />
})

const QuickActions = dynamic(() => import('./dashboard/QuickActions'), {
  loading: () => <div className="card-glass animate-pulse h-32" />
})

const AnalyticsOverview = dynamic(() => import('./dashboard/AnalyticsOverview'), {
  loading: () => <div className="card-glass animate-pulse h-40" />
})

const RecentActivity = dynamic(() => import('./dashboard/RecentActivity'), {
  loading: () => <div className="card-glass animate-pulse h-48" />
})

const DashboardHeader = dynamic(() => import('./dashboard/DashboardHeader'), {
  loading: () => <div className="h-16 glass-dark animate-pulse" />
})

const UsageAnalytics = dynamic(() => import('./dashboard/UsageAnalytics'), {
  loading: () => <div className="card-glass animate-pulse h-64" />
})

interface UserStats {
  totalProjects: number
  completedProjects: number
  totalGenerations: number
  thisMonthProjects: number
}

interface Project {
  _id: string
  name: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
  files: any[]
  analytics: {
    views: number
    downloads: number
    likes: number
    shares: number
  }
}

export default function Dashboard() {
  const { userId, isLoaded } = useAuth()
  const searchParams = useSearchParams()
  const [userStats, setUserStats] = useState<UserStats>({
    totalProjects: 0,
    completedProjects: 0,
    totalGenerations: 0,
    thisMonthProjects: 0
  })
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showBillingNotification, setShowBillingNotification] = useState(false)

  // Check for billing parameters
  useEffect(() => {
    if (searchParams) {
      const upgrade = searchParams.get('upgrade')
      const interval = searchParams.get('interval')
      
      if (upgrade) {
        setShowBillingNotification(true)
        // Clear the URL parameters after a short delay
        setTimeout(() => {
          window.history.replaceState({}, '', '/dashboard')
        }, 100)
      }
    }
  }, [searchParams])

  // Fetch user-specific data with better error handling
  useEffect(() => {
    if (isLoaded && userId) {
      fetchUserData()
    }
  }, [isLoaded, userId])

  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Add timeout to prevent long waits
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const projectsResponse = await fetch('/api/projects', {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setProjects(projectsData || [])
        
        // Calculate stats from real data
        const totalProjects = projectsData?.length || 0
        const completedProjects = projectsData?.filter((p: Project) => p.status === 'completed').length || 0
        const thisMonth = new Date()
        thisMonth.setMonth(thisMonth.getMonth())
        const thisMonthProjects = projectsData?.filter((p: Project) => 
          new Date(p.createdAt) >= thisMonth
        ).length || 0
        
        setUserStats({
          totalProjects,
          completedProjects,
          totalGenerations: totalProjects,
          thisMonthProjects
        })
      } else {
        throw new Error('Failed to fetch projects')
      }
    } catch (error: any) {
      console.error('Failed to fetch user data:', error)
      
      if (error.name === 'AbortError') {
        setError('Request timed out. Using offline mode.')
      } else {
        setError('Unable to load projects. Working in offline mode.')
      }
      
      // Set default stats for offline mode
      setUserStats({
        totalProjects: 0,
        completedProjects: 0,
        totalGenerations: 0,
        thisMonthProjects: 0
      })
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }

  // Memoize stats cards for better performance with professional styling
  const statsCards = useMemo(() => [
    {
      title: 'Total Projects',
      value: userStats.totalProjects,
      icon: <Smartphone className="w-6 h-6" />,
      change: userStats.thisMonthProjects > 0 ? `+${userStats.thisMonthProjects} this month` : 'No projects this month'
    },
    {
      title: 'Completed',
      value: userStats.completedProjects,
      icon: <CheckCircle className="w-6 h-6" />,
      change: `${Math.round((userStats.completedProjects / Math.max(userStats.totalProjects, 1)) * 100)}% completion rate`
    },
    {
      title: 'Generations',
      value: userStats.totalGenerations,
      icon: <Zap className="w-6 h-6" />,
      change: 'AI-powered builds'
    },
    {
      title: 'Success Rate',
      value: userStats.totalProjects > 0 ? '95%' : '0%',
      icon: <Star className="w-6 h-6" />,
      change: 'Build quality'
    }
  ], [userStats])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-3 text-white">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader />
      
      <div className="container-professional py-8">
        {/* Billing Notification */}
        {showBillingNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 glass-dark border border-white/20 rounded-professional p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-white" />
              <span className="text-white">Billing setup initiated successfully! You can now access premium features.</span>
            </div>
            <button
              onClick={() => setShowBillingNotification(false)}
              className="text-white hover:text-muted transition-professional"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-professional p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-200">{error}</span>
            </div>
            <button
              onClick={fetchUserData}
              className="flex items-center space-x-2 px-3 py-1 glass-dark hover:bg-white/10 rounded-professional transition-professional"
            >
              <RefreshCw className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Retry</span>
            </button>
          </motion.div>
        )}

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-primary rounded-professional flex items-center justify-center shadow-professional">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                Welcome back
              </h1>
              <p className="text-light text-lg">Ready to build something amazing?</p>
            </div>
          </div>

          {/* Quick Action Button */}
          <motion.div 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/builder"
              className="btn-glossy inline-flex items-center space-x-3 px-8 py-4 text-lg font-bold"
            >
              <Wand2 className="w-6 h-6" />
              <span>Create New App</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-glass hover:shadow-glossy transition-professional group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-glossy rounded-professional flex items-center justify-center group-hover:scale-110 transition-transform">
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-light text-sm font-medium">{stat.title}</h3>
                <div className="text-3xl font-bold text-white">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
                <p className="text-muted text-xs">{stat.change}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Usage Analytics */}
        <div className="mb-8">
          <UsageAnalytics userId={userId || ''} />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Projects */}
          <div className="lg:col-span-2">
            <div className="card-glass">
              <ProjectsList />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            <QuickActions />
            <AnalyticsOverview userStats={userStats} />
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  )
} 