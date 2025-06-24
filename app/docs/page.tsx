import { Metadata } from 'next'
import Documentation from '@/components/Documentation'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import { BookOpen, Code, Zap, Smartphone, Download, Users, Star, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Documentation | Prism - AI-Powered React Native Builder',
  description: 'Comprehensive documentation for building React Native apps with AI',
}

export default function DocsPage() {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI-Powered Generation",
      description: "Generate complete React Native apps from natural language prompts using advanced AI models.",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Native Features", 
      description: "Full support for camera, GPS, notifications, storage, and other native device capabilities.",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Real-time Preview",
      description: "Live code preview with syntax highlighting and project structure visualization.", 
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "EAS Build Integration",
      description: "One-click builds for Android and iOS using Expo Application Services.",
      color: "from-purple-400 to-purple-600"
    }
  ]

  const quickStartSteps = [
    {
      step: "1",
      title: "Describe Your App",
      description: "Tell us what you want to build in natural language. Be as detailed as possible for better results.",
      icon: <BookOpen className="w-6 h-6" />
    },
    {
      step: "2", 
      title: "AI Generates Code",
      description: "Our AI analyzes your requirements and generates a complete React Native project structure.",
      icon: <Code className="w-6 h-6" />
    },
    {
      step: "3",
      title: "Preview & Customize",
      description: "Review the generated code, make adjustments, and see real-time previews of your app.",
      icon: <Smartphone className="w-6 h-6" />
    },
    {
      step: "4",
      title: "Export & Deploy",
      description: "Download your project files or build directly to Android/iOS using EAS Build.",
      icon: <Download className="w-6 h-6" />
    }
  ]

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="container-professional section-professional pt-20">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="glass-dark inline-flex items-center space-x-2 rounded-professional px-6 py-3 mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <BookOpen className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Documentation • Guides • Examples</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Prism <span className="text-white">Documentation</span>
          </h1>
          <p className="text-xl text-light mb-8 max-w-3xl mx-auto leading-relaxed">
            Learn how to build amazing React Native apps with AI. From quick start guides to advanced features, 
            everything you need to know about Prism.
          </p>
        </motion.div>

        {/* Quick Start Guide */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Quick Start Guide</h2>
            <p className="text-light">Get up and running with Prism in just 4 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickStartSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-glass p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-professional flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">{step.step}</span>
                </div>
                <div className="w-12 h-12 bg-gradient-glossy rounded-professional flex items-center justify-center mx-auto mb-4">
                  <div className="text-white">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-light text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Overview */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Core Features</h2>
            <p className="text-light">Everything you need to build production-ready React Native apps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-glass p-8"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-professional flex items-center justify-center mb-6`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-light leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* API Reference */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="card-glass p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">API Reference</h2>
              <p className="text-light">Integrate Prism into your workflow with our comprehensive API</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-professional p-6">
                <h3 className="text-lg font-bold text-white mb-3">Authentication</h3>
                <p className="text-light text-sm mb-4">Secure API access with Clerk authentication</p>
                <div className="text-xs text-muted font-mono bg-black/20 p-2 rounded">
                  Authorization: Bearer YOUR_API_KEY
                </div>
              </div>

              <div className="bg-white/5 rounded-professional p-6">
                <h3 className="text-lg font-bold text-white mb-3">Project Generation</h3>
                <p className="text-light text-sm mb-4">Generate complete React Native projects</p>
                <div className="text-xs text-muted font-mono bg-black/20 p-2 rounded">
                  POST /api/generate
                </div>
              </div>

              <div className="bg-white/5 rounded-professional p-6">
                <h3 className="text-lg font-bold text-white mb-3">Usage Tracking</h3>
                <p className="text-light text-sm mb-4">Monitor your API usage and limits</p>
                <div className="text-xs text-muted font-mono bg-black/20 p-2 rounded">
                  GET /api/user/usage-stats
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Examples */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Example Prompts</h2>
            <p className="text-light">Get inspired with these example prompts and see what Prism can build</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Create a todo app with React Native and Expo",
              "Build a weather app with location services",
              "Generate a social media app with authentication",
              "Create an e-commerce app with shopping cart",
              "Build a fitness tracking app with charts",
              "Generate a chat app with real-time messaging"
            ].map((prompt, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-glass p-6 hover:bg-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-medium">Example {index + 1}</span>
                </div>
                <p className="text-light text-sm">{prompt}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="card-glass p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Building?</h2>
            <p className="text-light mb-8 max-w-2xl mx-auto">
              Join thousands of developers using Prism to create amazing React Native apps with AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/builder"
                className="btn-glossy inline-flex items-center space-x-3 px-8 py-4 text-lg"
              >
                <span>Start Building</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/pricing"
                className="btn-primary inline-flex items-center space-x-3 px-8 py-4 text-lg"
              >
                <span>View Pricing</span>
                <CheckCircle className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 