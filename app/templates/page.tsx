import { motion } from 'framer-motion'
import Header from '@/components/Header'
import { 
  Smartphone, 
  ShoppingCart, 
  Heart, 
  MessageCircle, 
  MapPin, 
  Calendar,
  BookOpen,
  Star,
  Download,
  Eye,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react'
import Link from 'next/link'

export default function TemplatesPage() {
  const categories = [
    { name: 'All', count: 24, active: true },
    { name: 'E-commerce', count: 6, active: false },
    { name: 'Social', count: 4, active: false },
    { name: 'Productivity', count: 5, active: false },
    { name: 'Health', count: 3, active: false },
    { name: 'Entertainment', count: 3, active: false },
    { name: 'Education', count: 3, active: false }
  ]

  const templates = [
    {
      id: 1,
      title: 'E-commerce Store',
      description: 'Complete online store with product catalog, shopping cart, and payment integration',
      category: 'E-commerce',
      difficulty: 'Intermediate',
      rating: 4.8,
      downloads: 1247,
      image: '/templates/ecommerce.jpg',
      features: ['Product Catalog', 'Shopping Cart', 'Payment Integration', 'User Reviews', 'Order Tracking'],
      tags: ['React Native', 'Expo', 'Stripe', 'Firebase']
    },
    {
      id: 2,
      title: 'Social Media App',
      description: 'Instagram-like social platform with photo sharing, stories, and direct messaging',
      category: 'Social',
      difficulty: 'Advanced',
      rating: 4.9,
      downloads: 892,
      image: '/templates/social.jpg',
      features: ['Photo Sharing', 'Stories', 'Direct Messaging', 'User Profiles', 'Feed Algorithm'],
      tags: ['React Native', 'Expo', 'AWS S3', 'Socket.io']
    },
    {
      id: 3,
      title: 'Fitness Tracker',
      description: 'Comprehensive fitness app with workout tracking, progress charts, and social features',
      category: 'Health',
      difficulty: 'Intermediate',
      rating: 4.7,
      downloads: 1563,
      image: '/templates/fitness.jpg',
      features: ['Workout Tracking', 'Progress Charts', 'Social Features', 'Nutrition Log', 'Goal Setting'],
      tags: ['React Native', 'Expo', 'Charts', 'HealthKit']
    },
    {
      id: 4,
      title: 'Food Delivery',
      description: 'Uber Eats-style food delivery app with restaurant listings and order tracking',
      category: 'E-commerce',
      difficulty: 'Advanced',
      rating: 4.6,
      downloads: 734,
      image: '/templates/food.jpg',
      features: ['Restaurant Listings', 'Order Tracking', 'Payment Integration', 'Driver App', 'Reviews'],
      tags: ['React Native', 'Expo', 'Maps', 'Stripe']
    },
    {
      id: 5,
      title: 'Task Manager',
      description: 'Todo app with project management, team collaboration, and progress tracking',
      category: 'Productivity',
      difficulty: 'Beginner',
      rating: 4.5,
      downloads: 2103,
      image: '/templates/tasks.jpg',
      features: ['Task Management', 'Team Collaboration', 'Progress Tracking', 'Reminders', 'Categories'],
      tags: ['React Native', 'Expo', 'AsyncStorage', 'Notifications']
    },
    {
      id: 6,
      title: 'Weather App',
      description: 'Beautiful weather app with location services, forecasts, and weather alerts',
      category: 'Productivity',
      difficulty: 'Beginner',
      rating: 4.4,
      downloads: 1876,
      image: '/templates/weather.jpg',
      features: ['Location Services', 'Weather Forecasts', 'Alerts', 'Maps Integration', 'Widgets'],
      tags: ['React Native', 'Expo', 'Geolocation', 'Weather API']
    },
    {
      id: 7,
      title: 'Chat App',
      description: 'Real-time messaging app with group chats, file sharing, and voice messages',
      category: 'Social',
      difficulty: 'Advanced',
      rating: 4.8,
      downloads: 945,
      image: '/templates/chat.jpg',
      features: ['Real-time Messaging', 'Group Chats', 'File Sharing', 'Voice Messages', 'Push Notifications'],
      tags: ['React Native', 'Expo', 'Socket.io', 'Firebase']
    },
    {
      id: 8,
      title: 'Learning Platform',
      description: 'Educational app with courses, quizzes, progress tracking, and certificates',
      category: 'Education',
      difficulty: 'Intermediate',
      rating: 4.6,
      downloads: 678,
      image: '/templates/learning.jpg',
      features: ['Course Management', 'Quizzes', 'Progress Tracking', 'Certificates', 'Offline Access'],
      tags: ['React Native', 'Expo', 'Video Player', 'SQLite']
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
            <Smartphone className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Templates • Examples • Boilerplates</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            App <span className="text-white">Templates</span>
          </h1>
          <p className="text-xl text-light mb-8 max-w-3xl mx-auto leading-relaxed">
            Jump-start your development with professionally designed templates. 
            From simple todo apps to complex e-commerce platforms.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="card-glass p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-professional text-white placeholder-light focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-light" />
                <select className="px-4 py-3 bg-white/5 border border-white/10 rounded-professional text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mt-6">
              {categories.map((category) => (
                <button
                  key={category.name}
                  className={`px-4 py-2 rounded-professional text-sm transition-all ${
                    category.active
                      ? 'bg-gradient-primary text-white'
                      : 'text-light hover:text-white hover:bg-white/10'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Templates Grid */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-glass overflow-hidden hover:shadow-glossy transition-all duration-300"
              >
                {/* Template Image */}
                <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <Smartphone className="w-16 h-16 text-white/50" />
                </div>

                {/* Template Content */}
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{template.title}</h3>
                      <p className="text-light text-sm mb-3">{template.description}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-white text-sm">{template.rating}</span>
                    </div>
                  </div>

                  {/* Category and Difficulty */}
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                      {template.category}
                    </span>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                      {template.difficulty}
                    </span>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2">Key Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {template.features.slice(0, 3).map((feature) => (
                        <span key={feature} className="text-xs bg-white/10 text-light px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                      {template.features.length > 3 && (
                        <span className="text-xs text-muted">+{template.features.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-white/5 text-muted px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-light">
                      {template.downloads.toLocaleString()} downloads
                    </div>
                    <div className="flex space-x-2">
                      <button className="btn-glossy px-3 py-2 text-sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </button>
                      <button className="btn-primary px-3 py-2 text-sm">
                        <Download className="w-4 h-4 mr-1" />
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="card-glass p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Can't Find What You Need?</h2>
            <p className="text-light mb-8 max-w-2xl mx-auto">
              Create your own custom app from scratch with our AI-powered builder
            </p>
            <Link 
              href="/builder"
              className="btn-glossy inline-flex items-center space-x-3 px-8 py-4 text-lg"
            >
              <span>Start Building</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 