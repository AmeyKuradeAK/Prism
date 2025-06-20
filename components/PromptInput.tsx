'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Square, Lightbulb, Code, Wand2 } from 'lucide-react'
import { PromptInputProps } from '@/types'

const EXAMPLE_PROMPTS = [
  "Create a fitness tracking app with step counter, workout timer, and progress charts using native device sensors",
  "Build a photo sharing app with camera integration, GPS location tagging, and push notifications",
  "Make a meditation app with background audio, timer functionality, and daily reminder notifications",
  "Create a weather app with location services, background app refresh, and weather alerts"
]

export default function PromptInput({ onGenerate, onStop, isGenerating, disabled, mode = 'ai' }: PromptInputProps) {
  const [prompt, setPrompt] = useState('')
  const [showExamples, setShowExamples] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && !disabled && mode === 'ai') {
      onGenerate(prompt.trim())
    }
  }

  const handleExampleClick = (example: string) => {
    setPrompt(example)
    setShowExamples(false)
  }

  // Manual mode - show project info instead of prompt input
  if (mode === 'manual') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <Code className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Manual Project</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl">
            <h3 className="text-white font-semibold mb-2">Getting Started</h3>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• A basic Expo template has been loaded for you</li>
              <li>• Edit the code directly in the preview panel</li>
              <li>• Add new files using the file editor</li>
              <li>• Save your project when ready</li>
            </ul>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl">
            <h3 className="text-purple-400 font-semibold mb-2">Manual Mode Features</h3>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Full control over your project structure</li>
              <li>• Direct code editing and file management</li>
              <li>• Build and deploy when ready</li>
              <li>• Perfect for experienced developers</li>
            </ul>
          </div>
        </div>
      </motion.div>
    )
  }

  // AI mode - show prompt input
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">AI App Builder</h2>
        </div>
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="flex items-center space-x-2 text-sm text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl"
        >
          <Lightbulb className="w-4 h-4" />
          <span>Examples</span>
        </button>
      </div>

      {showExamples && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 space-y-3"
        >
          {EXAMPLE_PROMPTS.map((example, index) => (
            <motion.button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="block w-full text-left p-4 text-sm text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl transition-all"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              {example}
            </motion.button>
          ))}
        </motion.div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the React Native app you want to build. Be specific about features, native functionality (camera, GPS, notifications), and UI requirements..."
            className="w-full h-32 p-4 pr-16 text-white bg-white/5 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed placeholder-white/40 backdrop-blur-xl"
            disabled={disabled}
          />
          
          <div className="absolute bottom-3 right-3">
            {isGenerating ? (
              <motion.button
                type="button"
                onClick={onStop}
                className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all shadow-lg"
                title="Stop Generation"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Square className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={!prompt.trim() || disabled}
                className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg"
                title="Generate App"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-white/60">
          <span>{prompt.length}/2000 characters</span>
          <div className="flex items-center space-x-2">
            <span>Supports:</span>
            <div className="flex space-x-1">
              {['Camera', 'GPS', 'Push', 'Storage', 'Sensors'].map((feature, index) => (
                <span 
                  key={feature}
                  className="px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-xs"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  )
} 