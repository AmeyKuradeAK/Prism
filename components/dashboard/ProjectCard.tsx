'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Eye, 
  Download, 
  Play, 
  MoreHorizontal,
  Star,
  Share,
  Trash2,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Smartphone,
  Code,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface ProjectCardProps {
  project: any
  viewMode: 'grid' | 'list'
}

const statusConfig = {
  draft: { 
    color: 'text-slate-400', 
    bg: 'bg-slate-500/10 border-slate-500/20', 
    icon: Clock,
    glow: 'shadow-slate-500/20'
  },
  generating: { 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/10 border-blue-500/20', 
    icon: Loader,
    glow: 'shadow-blue-500/20'
  },
  completed: { 
    color: 'text-green-400', 
    bg: 'bg-green-500/10 border-green-500/20', 
    icon: CheckCircle,
    glow: 'shadow-green-500/20'
  },
  failed: { 
    color: 'text-red-400', 
    bg: 'bg-red-500/10 border-red-500/20', 
    icon: XCircle,
    glow: 'shadow-red-500/20'
  },
  building: { 
    color: 'text-purple-400', 
    bg: 'bg-purple-500/10 border-purple-500/20', 
    icon: Loader,
    glow: 'shadow-purple-500/20'
  },
  built: { 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/10 border-emerald-500/20', 
    icon: CheckCircle,
    glow: 'shadow-emerald-500/20'
  }
}

export default function ProjectCard({ project, viewMode }: ProjectCardProps) {
  const [showActions, setShowActions] = useState(false)
  
  const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.draft
  const StatusIcon = status.icon

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
              <Smartphone className="w-7 h-7" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Link 
                  href={`/project/${project._id}`}
                  className="text-xl font-bold text-white hover:text-purple-300 transition-colors"
                >
                  {project.name || 'Untitled Project'}
                </Link>
                
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${status.bg} ${status.color}`}>
                  <StatusIcon className={`w-4 h-4 ${project.status === 'generating' || project.status === 'building' ? 'animate-spin' : ''}`} />
                  <span className="capitalize font-medium">{project.status}</span>
                </div>
              </div>
              
              <p className="text-white/60 mb-3 line-clamp-1">
                {project.description || project.prompt || 'No description available'}
              </p>
              
              <div className="flex items-center space-x-6 text-sm text-white/40">
                <span className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDistanceToNow(new Date(project.updatedAt || Date.now()), { addSuffix: true })}</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>{project.analytics?.views || 0}</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>{project.analytics?.downloads || 0}</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={`/project/${project._id}`}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-2 rounded-xl font-semibold transition-all shadow-lg hover:shadow-purple-500/25"
              >
                Open
              </Link>
            </motion.div>
            
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              
              {showActions && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-12 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 z-10 min-w-[140px]"
                >
                  <Link 
                    href={`/builder?projectId=${project._id}`}
                    className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all flex items-center space-x-3"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Link>
                  <button className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all flex items-center space-x-3">
                    <Share className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all flex items-center space-x-3">
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
          <Smartphone className="w-8 h-8" />
        </div>
        
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-white/40 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all"
          >
            <Star className="w-5 h-5" />
          </motion.button>
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            
            {showActions && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-12 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 z-10 min-w-[140px]"
              >
                <Link 
                  href={`/builder?projectId=${project._id}`}
                  className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all flex items-center space-x-3"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </Link>
                <button className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all flex items-center space-x-3">
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all flex items-center space-x-3">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <Link 
            href={`/project/${project._id}`}
            className="text-xl font-bold text-white hover:text-purple-300 transition-colors line-clamp-1 flex-1"
          >
            {project.name || 'Untitled Project'}
          </Link>
          
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${status.bg} ${status.color}`}>
            <StatusIcon className={`w-4 h-4 ${project.status === 'generating' || project.status === 'building' ? 'animate-spin' : ''}`} />
            <span className="capitalize font-medium text-xs">{project.status}</span>
          </div>
        </div>
        
        <p className="text-white/60 text-sm line-clamp-2 leading-relaxed">
          {project.description || project.prompt || 'No description available'}
        </p>
      </div>
      
      <div className="flex items-center justify-between text-sm text-white/40 mb-6">
        <span className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>{formatDistanceToNow(new Date(project.updatedAt || Date.now()), { addSuffix: true })}</span>
        </span>
        
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{project.analytics?.views || 0}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Download className="w-4 h-4" />
            <span>{project.analytics?.downloads || 0}</span>
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <motion.div 
          className="flex-1"
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
        >
          <Link
            href={`/project/${project._id}`}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-purple-500/25 flex items-center justify-center space-x-2"
          >
            <Code className="w-4 h-4" />
            <span>View Project</span>
          </Link>
        </motion.div>
        
        {project.status === 'completed' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-all border border-white/10 hover:border-white/20"
          >
            <Play className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  )
} 