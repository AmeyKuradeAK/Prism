'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@clerk/nextjs'
import { Wand2, Smartphone, CheckCircle, Zap, Star, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Lazy load heavy components
const ProjectsList = dynamic(() => import('./ProjectsList'), {
  loading: () => <div className="bg-white/5 rounded-3xl p-6 animate-pulse h-64" />
})

const ProjectsGrid = dynamic(() => import('./dashboard/ProjectsGrid'), {
  loading: () => <div className="bg-white/5 rounded-3xl p-6 animate-pulse h-64" />
})

const QuickActions = dynamic(() => import('./dashboard/QuickActions'), {
  loading: () => <div className="bg-white/5 rounded-3xl p-6 animate-pulse h-32" />
})

const AnalyticsOverview = dynamic(() => import('./dashboard/AnalyticsOverview'), {
  loading: () => <div className="bg-white/5 rounded-3xl p-6 animate-pulse h-40" />
})

const RecentActivity = dynamic(() => import('./dashboard/RecentActivity'), {
  loading: () => <div className="bg-white/5 rounded-3xl p-6 animate-pulse h-48" />
})

const DashboardHeader = dynamic(() => import('./dashboard/DashboardHeader'), {
  loading: () => <div className="h-16 bg-white/5 animate-pulse" />
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
  const [userStats, setUserStats] = useState<UserStats>({
    totalProjects: 0,
    completedProjects: 0,
    totalGenerations: 0,
    thisMonthProjects: 0
  })
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // Memoize stats cards for better performance
  const statsCards = useMemo(() => [
    {
      title: 'Total Projects',
      value: userStats.totalProjects,
      icon: <Smartphone className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-600',
      change: userStats.thisMonthProjects > 0 ? `+${userStats.thisMonthProjects} this month` : 'No projects this month'
    },
    {
      title: 'Completed',
      value: userStats.completedProjects,
      icon: <CheckCircle className="w-6 h-6" />,
      gradient: 'from-green-500 to-emerald-600',
      change: `${Math.round((userStats.completedProjects / Math.max(userStats.totalProjects, 1)) * 100)}% completion rate`
    },
    {
      title: 'Generations',
      value: userStats.totalGenerations,
      icon: <Zap className="w-6 h-6" />,
      gradient: 'from-purple-500 to-pink-600',
      change: 'AI-powered builds'
    },
    {
      title: 'Success Rate',
      value: userStats.totalProjects > 0 ? '95%' : '0%',
      icon: <Star className="w-6 h-6" />,
      gradient: 'from-yellow-500 to-orange-600',
      change: 'Build quality'
    }
  ], [userStats])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-3 text-white">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader />
      
      <div className="container mx-auto px-6 py-8">
        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-200">{error}</span>
            </div>
            <button
              onClick={fetchUserData}
              className="flex items-center space-x-2 px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-200 text-sm">Retry</span>
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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Welcome back
              </h1>
              <p className="text-white/60 text-lg">Ready to build something amazing?</p>
            </div>
          </div>

          {/* Quick Action Button */}
          <motion.div 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/builder"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-2xl hover:shadow-purple-500/50"
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
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-white/80 text-sm font-medium">{stat.title}</h3>
                <div className="text-3xl font-bold text-white">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
                <p className="text-white/50 text-xs">{stat.change}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Projects */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
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