'use client'

import { motion } from 'framer-motion'
import Header from '@/components/Header'
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  BookOpen, 
  Video, 
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      question: "How do I get started with Prism?",
      answer: "Getting started is easy! Simply sign up for a free account, navigate to the Builder page, and describe the app you want to create. Our AI will generate a complete React Native project for you."
    },
    {
      question: "What programming languages do I need to know?",
      answer: "No programming knowledge required! Prism generates complete React Native apps from natural language descriptions. However, basic JavaScript/TypeScript knowledge will help you customize the generated code."
    },
    {
      question: "Can I export my generated apps?",
      answer: "Absolutely! All generated code belongs to you. You can download the complete project files, modify them as needed, and deploy to app stores or use them in your own projects."
    },
    {
      question: "What's included in the free plan?",
      answer: "The free plan includes 30 prompts per month, access to all basic features, and the ability to generate and download React Native apps. Perfect for trying out Prism!"
    },
    {
      question: "How do I upgrade my plan?",
      answer: "You can upgrade anytime from your dashboard or the pricing page. Simply select a plan and complete the payment process. Your new limits will be available immediately."
    },
    {
      question: "Is my data secure?",
      answer: "Yes! We use industry-standard encryption and security practices. Your projects and data are protected and never shared with third parties without your consent."
    },
    {
      question: "Can I build apps for both iOS and Android?",
      answer: "Yes! Prism generates React Native apps that work on both iOS and Android. You can build and deploy to both platforms using the generated code."
    },
    {
      question: "What if I exceed my monthly prompt limit?",
      answer: "You'll be notified when approaching your limit. You can upgrade your plan anytime to continue building, or wait until your quota resets the following month."
    }
  ]

  const supportChannels = [
    {
      title: "Documentation",
      description: "Comprehensive guides and tutorials",
      icon: <BookOpen className="w-8 h-8" />,
      color: "from-blue-400 to-blue-600",
      link: "/docs"
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      icon: <Video className="w-8 h-8" />,
      color: "from-red-400 to-red-600",
      link: "#"
    },
    {
      title: "Community Forum",
      description: "Get help from other developers",
      icon: <Users className="w-8 h-8" />,
      color: "from-green-400 to-green-600",
      link: "/community"
    },
    {
      title: "Live Chat",
      description: "Real-time support from our team",
      icon: <MessageCircle className="w-8 h-8" />,
      color: "from-purple-400 to-purple-600",
      link: "#"
    }
  ]

  const contactMethods = [
    {
      title: "Email Support",
      description: "Get detailed responses within 24 hours",
      icon: <Mail className="w-6 h-6" />,
      contact: "support@prism.ai",
      response: "24 hours"
    },
    {
      title: "Priority Support",
      description: "Exclusive support for Pro and Team plans",
      icon: <Star className="w-6 h-6" />,
      contact: "priority@prism.ai",
      response: "4 hours"
    },
    {
      title: "Phone Support",
      description: "Available for Enterprise customers",
      icon: <Phone className="w-6 h-6" />,
      contact: "+1 (555) 123-4567",
      response: "Immediate"
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
            <HelpCircle className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Support • Help • Resources</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            How Can We <span className="text-white">Help?</span>
          </h1>
          <p className="text-xl text-light mb-8 max-w-3xl mx-auto leading-relaxed">
            Get the support you need to build amazing React Native apps. 
            From quick answers to detailed guidance, we're here to help.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-light w-6 h-6" />
              <input
                type="text"
                placeholder="Search for help articles, tutorials, or contact support..."
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-professional text-white placeholder-light focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
            </div>
          </div>
        </motion.div>

        {/* Support Channels */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Support Channels</h2>
            <p className="text-light">Choose the best way to get help</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportChannels.map((channel, index) => (
              <motion.div
                key={channel.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-glass p-6 text-center hover:bg-white/10 transition-all cursor-pointer"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${channel.color} rounded-professional flex items-center justify-center mx-auto mb-4`}>
                  <div className="text-white">
                    {channel.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{channel.title}</h3>
                <p className="text-light text-sm mb-4">{channel.description}</p>
                <Link href={channel.link} className="btn-glossy w-full">
                  Access
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Methods */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Contact Support</h2>
            <p className="text-light">Get in touch with our support team</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-glass p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-primary rounded-professional flex items-center justify-center">
                    <div className="text-white">
                      {method.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{method.title}</h3>
                    <p className="text-light text-sm">{method.description}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-light text-sm">Contact:</span>
                    <span className="text-white font-medium">{method.contact}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-light text-sm">Response time:</span>
                    <span className="text-green-400 text-sm">{method.response}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-light">Quick answers to common questions</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-glass"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-all"
                >
                  <h3 className="text-lg font-bold text-white">{faq.question}</h3>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-light" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-light" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-light leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="card-glass p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Quick Actions</h2>
              <p className="text-light">Get started quickly with these common tasks</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/builder" className="card-glass p-6 hover:bg-white/10 transition-all">
                <CheckCircle className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Start Building</h3>
                <p className="text-light text-sm">Create your first app with our AI builder</p>
              </Link>

              <Link href="/docs" className="card-glass p-6 hover:bg-white/10 transition-all">
                <BookOpen className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Read Documentation</h3>
                <p className="text-light text-sm">Learn how to use Prism effectively</p>
              </Link>

              <Link href="/templates" className="card-glass p-6 hover:bg-white/10 transition-all">
                <Star className="w-8 h-8 text-yellow-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Browse Templates</h3>
                <p className="text-light text-sm">Explore pre-built app templates</p>
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
            <h2 className="text-3xl font-bold text-white mb-4">Still Need Help?</h2>
            <p className="text-light mb-8 max-w-2xl mx-auto">
              Our support team is here to help you succeed. Don't hesitate to reach out!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="mailto:support@prism.ai"
                className="btn-glossy inline-flex items-center space-x-3 px-8 py-4 text-lg"
              >
                <span>Email Support</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/builder"
                className="btn-primary inline-flex items-center space-x-3 px-8 py-4 text-lg"
              >
                <span>Start Building</span>
                <CheckCircle className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 