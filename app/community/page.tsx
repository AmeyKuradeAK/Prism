'use client'

import { motion } from 'framer-motion'
import Header from '@/components/Header'
import { 
  Users, 
  MessageCircle, 
  Github, 
  Twitter, 
  Youtube, 
  BookOpen, 
  Star, 
  Heart, 
  TrendingUp,
  Calendar,
  Award,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function CommunityPage() {
  const communityStats = [
    { label: 'Active Developers', value: '2,847', icon: <Users className="w-6 h-6" /> },
    { label: 'Apps Created', value: '15,392', icon: <Star className="w-6 h-6" /> },
    { label: 'Community Posts', value: '8,456', icon: <MessageCircle className="w-6 h-6" /> },
    { label: 'GitHub Stars', value: '1,234', icon: <Github className="w-6 h-6" /> }
  ]

  const socialLinks = [
    { name: 'Discord', icon: <MessageCircle className="w-6 h-6" />, url: '#', members: '2.1k' },
    { name: 'Twitter', icon: <Twitter className="w-6 h-6" />, url: '#', followers: '5.2k' },
    { name: 'YouTube', icon: <Youtube className="w-6 h-6" />, url: '#', subscribers: '1.8k' },
    { name: 'GitHub', icon: <Github className="w-6 h-6" />, url: '#', stars: '1.2k' }
  ]

  const upcomingEvents = [
    {
      title: 'Prism AI Workshop',
      date: 'Dec 15, 2024',
      time: '2:00 PM EST',
      type: 'Workshop',
      attendees: '156'
    },
    {
      title: 'Community Showcase',
      date: 'Dec 20, 2024', 
      time: '7:00 PM EST',
      type: 'Showcase',
      attendees: '89'
    },
    {
      title: 'Q&A Session',
      date: 'Dec 25, 2024',
      time: '3:00 PM EST', 
      type: 'Q&A',
      attendees: '203'
    }
  ]

  const featuredProjects = [
    {
      title: 'Weather App Pro',
      author: 'Sarah Chen',
      description: 'Beautiful weather app with location services and animated forecasts',
      stars: 45,
      category: 'Weather'
    },
    {
      title: 'Fitness Tracker',
      author: 'Mike Johnson',
      description: 'Comprehensive fitness tracking with charts and social features',
      stars: 32,
      category: 'Health'
    },
    {
      title: 'E-commerce Store',
      author: 'Alex Rodriguez',
      description: 'Full-featured online store with payment integration',
      stars: 28,
      category: 'Commerce'
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
            <Users className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Community • Collaboration • Innovation</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Join the <span className="text-white">Community</span>
          </h1>
          <p className="text-xl text-light mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect with thousands of developers building amazing React Native apps with AI. 
            Share ideas, get help, and showcase your projects.
          </p>
        </motion.div>

        {/* Community Stats */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {communityStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-glass p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-professional flex items-center justify-center mx-auto mb-4">
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-light text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Connect With Us</h2>
            <p className="text-light">Join our community across all platforms</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.url}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-glass p-6 text-center hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 bg-gradient-primary rounded-professional flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <div className="text-white">
                    {social.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{social.name}</h3>
                <p className="text-light text-sm">
                  {social.members || social.followers || social.subscribers || social.stars} members
                </p>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Upcoming Events</h2>
            <p className="text-light">Join our live sessions and workshops</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-glass p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="text-light text-sm">{event.date}</span>
                  </div>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                    {event.type}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                <p className="text-light text-sm mb-4">{event.time}</p>
                <div className="flex items-center justify-between">
                  <span className="text-light text-sm">{event.attendees} attending</span>
                  <button className="btn-primary px-4 py-2 text-sm">
                    Join
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Featured Projects */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Featured Projects</h2>
            <p className="text-light">Amazing apps built by our community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-glass p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                    {project.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-light text-sm">{project.stars}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                <p className="text-light text-sm mb-4">by {project.author}</p>
                <p className="text-light text-sm mb-4">{project.description}</p>
                <button className="btn-glossy w-full">
                  View Project
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Resources */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="card-glass p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Community Resources</h2>
              <p className="text-light">Everything you need to succeed with Prism</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/docs" className="card-glass p-6 hover:bg-white/10 transition-all">
                <BookOpen className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Documentation</h3>
                <p className="text-light text-sm">Comprehensive guides and API reference</p>
              </Link>

              <Link href="/templates" className="card-glass p-6 hover:bg-white/10 transition-all">
                <Award className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Templates</h3>
                <p className="text-light text-sm">Ready-to-use app templates and examples</p>
              </Link>

              <Link href="/support" className="card-glass p-6 hover:bg-white/10 transition-all">
                <Heart className="w-8 h-8 text-red-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Support</h3>
                <p className="text-light text-sm">Get help from our team and community</p>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="card-glass p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Join?</h2>
            <p className="text-light mb-8 max-w-2xl mx-auto">
              Connect with thousands of developers, share your projects, and get inspired by the community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/sign-up"
                className="btn-glossy inline-flex items-center space-x-3 px-8 py-4 text-lg"
              >
                <span>Join Community</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/builder"
                className="btn-primary inline-flex items-center space-x-3 px-8 py-4 text-lg"
              >
                <span>Start Building</span>
                <TrendingUp className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 