'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Grid, List, Search, Filter, Zap, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import ProjectCard from './ProjectCard'

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

interface ProjectsGridProps {
  projects: Project[]
  isLoading: boolean
  onRefresh: () => void
}

export default function ProjectsGrid({ projects, isLoading, onRefresh }: ProjectsGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card-glass p-6 animate-pulse">
          <div className="w-12 h-12 bg-white/10 rounded-professional mb-4"></div>
          <div className="h-6 bg-white/10 rounded-professional mb-2"></div>
          <div className="h-4 bg-white/10 rounded-professional mb-4 w-3/4"></div>
          <div className="flex space-x-2">
            <div className="h-6 bg-white/10 rounded-professional w-16"></div>
            <div className="h-6 bg-white/10 rounded-professional w-20"></div>
          </div>
        </div>
      ))}
    </div>
  )

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-20 h-20 glass-dark rounded-professional flex items-center justify-center mx-auto mb-6">
        <Zap className="w-10 h-10 text-light" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">Ready to create your first app?</h3>
      <p className="text-light mb-8 max-w-md mx-auto">
        Transform your ideas into production-ready React Native apps with the power of AI.
      </p>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link
          href="/builder"
          className="inline-flex items-center space-x-3 btn-glossy px-8 py-4 font-semibold"
        >
          <Zap className="w-5 h-5" />
          <span>Create Your First App</span>
        </Link>
      </motion.div>
    </motion.div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass p-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="flex items-center space-x-3 mb-4 lg:mb-0">
          <div className="w-8 h-8 bg-gradient-primary rounded-professional flex items-center justify-center shadow-professional">
            <Grid className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Your Projects ({projects.length})
            </h2>
            <p className="text-light">Manage and organize your applications</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-light hover:text-white hover:bg-white/10 rounded-professional transition-professional disabled:opacity-50"
            title="Refresh projects"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <Link
            href="/builder"
            className="btn-glossy px-6 py-2 font-semibold flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-dark w-full pl-12 pr-4 py-3"
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 glass-dark border border-glass rounded-professional text-white focus:outline-none focus:ring-2 focus:ring-white appearance-none cursor-pointer"
            >
              <option value="all" className="bg-black text-white">All Status</option>
              <option value="draft" className="bg-black text-white">Draft</option>
              <option value="generating" className="bg-black text-white">Generating</option>
              <option value="completed" className="bg-black text-white">Completed</option>
              <option value="building" className="bg-black text-white">Building</option>
              <option value="built" className="bg-black text-white">Built</option>
              <option value="failed" className="bg-black text-white">Failed</option>
            </select>
          </div>

          <div className="flex glass-dark border border-glass rounded-professional p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-professional transition-professional ${
                viewMode === 'grid'
                  ? 'bg-gradient-glossy text-white shadow-glossy'
                  : 'text-light hover:text-white hover:bg-white/10'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-professional transition-professional ${
                viewMode === 'list'
                  ? 'bg-gradient-glossy text-white shadow-glossy'
                  : 'text-light hover:text-white hover:bg-white/10'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : projects.length === 0 ? (
        <EmptyState />
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 glass-dark rounded-professional flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-light" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
          <p className="text-light">Try adjusting your search or filters</p>
        </div>
      ) : (
        <motion.div
          layout
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProjectCard project={project} viewMode={viewMode} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
} 