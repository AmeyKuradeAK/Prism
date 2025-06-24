import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-8xl font-bold text-white mb-4">404</div>
          <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
          <p className="text-light text-lg mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="btn-glossy inline-flex items-center space-x-2 px-6 py-3"
            >
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </Link>
            
            <Link
              href="/builder"
              className="btn-primary inline-flex items-center space-x-2 px-6 py-3"
            >
              <Search className="w-4 h-4" />
              <span>Start Building</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 