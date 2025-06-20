'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Hammer, 
  Download, 
  CheckCircle, 
  XCircle, 
  Loader, 
  ExternalLink,
  Package,
  Clock,
  Save,
  X
} from 'lucide-react'
import { BuildStatusProps } from '@/types'

export default function BuildStatus({ 
  buildInfo, 
  onBuild, 
  onDownload, 
  onSave,
  hasFiles, 
  isGenerating 
}: BuildStatusProps) {
  const [isBuilding, setIsBuilding] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')

  const handleBuild = async () => {
    setIsBuilding(true)
    try {
      await onBuild()
    } finally {
      setIsBuilding(false)
    }
  }

  const handleSave = async () => {
    if (!onSave || !projectName.trim()) return
    
    setIsSaving(true)
    try {
      await onSave(projectName.trim(), projectDescription.trim())
      setShowSaveModal(false)
      setProjectName('')
      setProjectDescription('')
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getBuildStatusIcon = () => {
    if (!buildInfo) return null
    
    switch (buildInfo.status) {
      case 'building':
        return <Loader className="w-5 h-5 text-blue-400 animate-spin" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <Clock className="w-5 h-5 text-white/40" />
    }
  }

  const getBuildStatusColor = () => {
    if (!buildInfo) return 'text-white/60'
    
    switch (buildInfo.status) {
      case 'building':
        return 'text-blue-400'
      case 'success':
        return 'text-green-400'
      case 'failed':
        return 'text-red-400'
      default:
        return 'text-white/60'
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Build & Deploy</h3>
        </div>

        {/* Build Status */}
        {buildInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
          >
            <div className="flex items-center space-x-3 mb-3">
              {getBuildStatusIcon()}
              <div>
                <p className={`font-semibold ${getBuildStatusColor()}`}>
                  {buildInfo.status === 'building' && 'Building your app...'}
                  {buildInfo.status === 'success' && 'Build completed successfully!'}
                  {buildInfo.status === 'failed' && 'Build failed'}
                </p>
                {buildInfo.buildId && (
                  <p className="text-sm text-white/60">
                    Build ID: <code className="font-mono text-xs bg-white/10 px-2 py-1 rounded">{buildInfo.buildId}</code>
                  </p>
                )}
              </div>
            </div>

            {/* Build Progress */}
            {buildInfo.status === 'building' && (
              <div className="space-y-3">
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </div>
                <p className="text-sm text-white/70">
                  Estimated time: ~10 minutes
                </p>
              </div>
            )}

            {/* Build Logs */}
            {buildInfo.logs && buildInfo.logs.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-white/80 mb-2">Build Log:</p>
                <div className="bg-black/40 rounded-xl p-3 font-mono text-xs max-h-32 overflow-y-auto border border-white/10">
                  {buildInfo.logs.map((log, index) => (
                    <div key={index} className="text-white/70">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download Link */}
            {buildInfo.status === 'success' && buildInfo.downloadUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-green-400">
                      Your app is ready!
                    </p>
                    <p className="text-xs text-green-300/80">
                      Download the APK/IPA file
                    </p>
                  </div>
                  <a
                    href={buildInfo.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl text-sm transition-all shadow-lg hover:shadow-xl"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Save Project Button */}
          {onSave && (
            <motion.button
              onClick={() => setShowSaveModal(true)}
              disabled={!hasFiles || isGenerating}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="w-4 h-4" />
              <span>Save Project</span>
            </motion.button>
          )}

          {/* Build Button */}
          <motion.button
            onClick={handleBuild}
            disabled={!hasFiles || isGenerating || isBuilding || buildInfo?.status === 'building'}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {(isBuilding || buildInfo?.status === 'building') ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Building...</span>
              </>
            ) : (
              <>
                <Hammer className="w-4 h-4" />
                <span>Build with Expo EAS</span>
              </>
            )}
          </motion.button>

          {/* Download Source Code Button */}
          <motion.button
            onClick={onDownload}
            disabled={!hasFiles || isGenerating}
            className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-2xl flex items-center justify-center space-x-2 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            <span>Download Source Code</span>
          </motion.button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
          <p className="text-sm text-blue-400 font-semibold mb-2">
            Building with Expo EAS
          </p>
          <ul className="text-xs text-blue-300/80 space-y-1">
            <li>• Creates production-ready APK/IPA files</li>
            <li>• Optimized for app store distribution</li>
            <li>• Includes all native dependencies</li>
            <li>• Takes ~10 minutes to complete</li>
          </ul>
        </div>
      </motion.div>

      {/* Save Project Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Save Project</h3>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Describe your project"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!projectName.trim() || isSaving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-2xl transition-all flex items-center justify-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Project</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 