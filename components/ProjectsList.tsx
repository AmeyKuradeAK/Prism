'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { File, Calendar, Eye, Download, Trash2, Edit, ExternalLink } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

interface Project {
  id: string
  name: string
  description: string
  prompt: string
  fileCount: number
  createdAt: string
  updatedAt: string
  analytics: {
    views: number
    downloads: number
  }
  tags: string[]
}

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isLoaded, isSignedIn } = useUser()

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const viewProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      const data = await response.json()
      
      if (data.success) {
        // Open project in a new tab or modal
        console.log('Project files:', data.project.files)
        // You could store this in state and show in a modal
        alert(`Project "${data.project.name}" loaded with ${Object.keys(data.project.files).length} files`)
      }
    } catch (err) {
      console.error('Error viewing project:', err)
    }
  }

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId))
      } else {
        throw new Error('Failed to delete project')
      }
    } catch (err) {
      console.error('Error deleting project:', err)
      alert('Failed to delete project')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchProjects()
    }
  }, [isLoaded, isSignedIn])

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please sign in to view your projects</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="flex space-x-4">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={fetchProjects}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
        <p className="text-gray-500 mb-6">Create your first React Native app using AI</p>
        <a 
          href="/builder"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Building
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
        <p className="text-gray-500">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                
                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.tags.slice(0, 3).map(tag => (
                      <span 
                        key={tag}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="text-gray-500 text-xs">+{project.tags.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => viewProject(project.id)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title="View Project"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Project Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <File className="w-4 h-4" />
                <span>{project.fileCount} files</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{project.analytics?.views || 0} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Created {formatDate(project.createdAt)}</span>
              </div>
              {project.updatedAt !== project.createdAt && (
                <div className="flex items-center space-x-1">
                  <Edit className="w-4 h-4" />
                  <span>Updated {formatDate(project.updatedAt)}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More Button */}
      {projects.length >= 20 && (
        <div className="text-center">
          <button 
            onClick={fetchProjects}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Load More Projects
          </button>
        </div>
      )}
    </div>
  )
} 