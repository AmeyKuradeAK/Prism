'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Github, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">NativeForge</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/about"
              className="text-slate-600 hover:text-slate-800 transition-colors"
            >
              About
            </Link>
            <Link
              href="/examples"
              className="text-slate-600 hover:text-slate-800 transition-colors"
            >
              Examples
            </Link>
            <Link
              href="/docs"
              className="text-slate-600 hover:text-slate-800 transition-colors"
            >
              Documentation
            </Link>
            <a
              href="https://github.com/yourusername/nativeforge"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-800 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Get Started</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pt-4 border-t border-slate-200"
          >
            <nav className="space-y-4">
              <Link
                href="/about"
                className="block text-slate-600 hover:text-slate-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/examples"
                className="block text-slate-600 hover:text-slate-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Examples
              </Link>
              <Link
                href="/docs"
                className="block text-slate-600 hover:text-slate-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Documentation
              </Link>
              <a
                href="https://github.com/yourusername/nativeforge"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              <Link
                href="/dashboard"
                className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
} 