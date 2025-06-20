'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Terminal, AlertCircle, CheckCircle } from 'lucide-react'
import { StreamingConsoleProps } from '@/types'

export default function StreamingConsole({ logs, isGenerating, error }: StreamingConsoleProps) {
  const consoleRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (consoleRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (consoleRef.current) {
          consoleRef.current.scrollTop = consoleRef.current.scrollHeight
        }
      })
    }
  }, [logs])

  const getLogIcon = (log: string) => {
    if (log.includes('Error:') || log.includes('Failed:')) {
      return <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
    }
    if (log.includes('completed') || log.includes('success')) {
      return <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
    }
    return <div className="w-1 h-1 bg-blue-400 rounded-full flex-shrink-0 mt-2" />
  }

  const getLogColor = (log: string) => {
    if (log.includes('Error:') || log.includes('Failed:')) {
      return 'text-red-400'
    }
    if (log.includes('completed') || log.includes('success')) {
      return 'text-green-400'
    }
    if (log.includes('Starting') || log.includes('Generating')) {
      return 'text-blue-400'
    }
    return 'text-slate-300'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-slate-200/50 overflow-hidden"
    >
      <div className="bg-slate-800 px-4 py-3 flex items-center space-x-2">
        <Terminal className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-200">Generation Console</span>
        {isGenerating && (
          <div className="flex items-center space-x-2 ml-auto">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse delay-75"></div>
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse delay-150"></div>
            </div>
            <span className="text-xs text-green-400">Generating...</span>
          </div>
        )}
      </div>

      <div
        ref={consoleRef}
        className="h-80 bg-slate-900 p-4 font-mono text-sm overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
      >
        {logs.length === 0 && !error ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Console ready. Start generating to see logs...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start space-x-2"
              >
                {getLogIcon(log)}
                <span className={`${getLogColor(log)} leading-relaxed`}>
                  {log}
                </span>
              </motion.div>
            ))}
            
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start space-x-2 mt-4 p-3 bg-red-900/20 border border-red-500/20 rounded"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Generation Error</p>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              </motion.div>
            )}
            
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2 text-slate-400"
              >
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-sm">Processing...</span>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Footer with status */}
      <div className="bg-slate-50 px-4 py-2 text-xs text-slate-600 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span>
            {logs.length} log{logs.length !== 1 ? 's' : ''} 
            {error && ' • Error occurred'}
          </span>
          {isGenerating ? (
            <span className="text-blue-600 font-medium">● Live</span>
          ) : (
            <span className="text-slate-500">○ Idle</span>
          )}
        </div>
      </div>
    </motion.div>
  )
} 