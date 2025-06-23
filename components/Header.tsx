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
      className="nav-professional sticky top-0 z-50"
    >
      <div className="container-professional">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-professional flex items-center justify-center shadow-professional">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-professional">Prism</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/about"
              className="text-muted hover:text-professional transition-professional"
            >
              About
            </Link>
            <Link
              href="/examples"
              className="text-muted hover:text-professional transition-professional"
            >
              Examples
            </Link>
            <Link
              href="/pricing"
              className="text-muted hover:text-professional transition-professional font-medium"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="text-muted hover:text-professional transition-professional"
            >
              Documentation
            </Link>
            <a
              href="https://github.com/yourusername/prism"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-professional transition-professional"
            >
              <Github className="w-5 h-5" />
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="/dashboard"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Get Started</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-muted hover:text-professional transition-professional"
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
            className="md:hidden mt-4 pt-4 border-professional"
          >
            <nav className="space-y-4">
              <Link
                href="/about"
                className="block text-muted hover:text-professional transition-professional"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/examples"
                className="block text-muted hover:text-professional transition-professional"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Examples
              </Link>
              <Link
                href="/pricing"
                className="block text-muted hover:text-professional transition-professional font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className="block text-muted hover:text-professional transition-professional"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Documentation
              </Link>
              <a
                href="https://github.com/yourusername/prism"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted hover:text-professional transition-professional"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              <Link
                href="/dashboard"
                className="btn-primary block text-center"
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