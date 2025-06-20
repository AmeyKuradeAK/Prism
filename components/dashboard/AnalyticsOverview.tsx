'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, Download, Eye, BarChart3 } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

interface UserStats {
  totalProjects: number
  completedProjects: number
  totalGenerations: number
  thisMonthProjects: number
}

interface AnalyticsOverviewProps {
  userStats: UserStats
}

export default function AnalyticsOverview({ userStats }: AnalyticsOverviewProps) {
  // Generate sample data based on real stats
  const generateChartData = () => {
    const data = []
    const currentDate = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate)
      date.setDate(date.getDate() - i)
      
      // Generate values based on actual stats with some variation
      const baseProjects = Math.max(userStats.totalProjects / 7, 0)
      const projects = Math.round(baseProjects + (Math.random() - 0.5) * baseProjects * 0.5)
      const generations = Math.round(projects * (0.8 + Math.random() * 0.4))
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        projects: projects,
        generations: generations,
        completions: Math.round(projects * 0.7)
      })
    }
    
    return data
  }

  const chartData = generateChartData()

  const metrics = [
    {
      title: 'Projects Created',
      value: userStats.totalProjects,
      change: userStats.thisMonthProjects > 0 ? `+${userStats.thisMonthProjects}` : '0',
      trend: userStats.thisMonthProjects > 0 ? 'up' : 'neutral',
      icon: <BarChart3 className="w-4 h-4" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Completed',
      value: userStats.completedProjects,
      change: userStats.completedProjects > 0 ? `${Math.round((userStats.completedProjects / Math.max(userStats.totalProjects, 1)) * 100)}%` : '0%',
      trend: userStats.completedProjects > 0 ? 'up' : 'neutral',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'AI Generations',
      value: userStats.totalGenerations,
      change: userStats.totalGenerations > 0 ? `${userStats.totalGenerations} total` : 'None yet',
      trend: userStats.totalGenerations > 0 ? 'up' : 'neutral',
      icon: <Eye className="w-4 h-4" />,
      color: 'from-purple-500 to-pink-500'
    }
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Analytics Overview</h3>
          <p className="text-white/60 text-sm">Your development insights</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-4 mb-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <div className="text-white">
                  {metric.icon}
                </div>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                metric.trend === 'up' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {metric.change}
              </div>
            </div>
            
            <div>
              <h4 className="text-white/80 text-sm font-medium">{metric.title}</h4>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      {userStats.totalProjects > 0 ? (
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-sm">Activity Timeline</h4>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="projectsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#ffffff60' }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="projects"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fill="url(#projectsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-6 h-6 text-white/40" />
          </div>
          <p className="text-white/60 text-sm">Start creating projects to see analytics</p>
        </div>
      )}
    </motion.div>
  )
} 