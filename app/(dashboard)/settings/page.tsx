'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserButton, useUser } from '@clerk/nextjs'
import { 
  Settings, 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  Palette, 
  Download, 
  Trash2,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

declare global {
  interface Window {
    Clerk?: {
      openBillingPortal?: () => void
    }
  }
}

export default function SettingsPage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('profile')
  const [showApiKey, setShowApiKey] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false
  })
  const [theme, setTheme] = useState('dark')
  const [autoSave, setAutoSave] = useState(true)

  const handleBilling = () => {
    if (typeof window !== 'undefined' && window.Clerk && typeof window.Clerk.openBillingPortal === 'function') {
      window.Clerk.openBillingPortal()
    } else {
      alert('Billing portal is not available. Please contact support.')
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferences', icon: <Palette className="w-4 h-4" /> }
  ]

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <h3 className="text-xl font-bold text-white mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-light text-sm font-medium mb-2">Full Name</label>
            <input 
              type="text" 
              defaultValue={user?.fullName || ''}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-professional text-white placeholder-light focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-light text-sm font-medium mb-2">Email</label>
            <input 
              type="email" 
              defaultValue={user?.primaryEmailAddress?.emailAddress || ''}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-professional text-white placeholder-light focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-light text-sm font-medium mb-2">Bio</label>
            <textarea 
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-professional text-white placeholder-light focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>
      </div>

      <div className="card-glass p-6">
        <h3 className="text-xl font-bold text-white mb-4">API Access</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-light text-sm font-medium mb-2">API Key</label>
            <div className="relative">
              <input 
                type={showApiKey ? "text" : "password"}
                defaultValue="pk_live_1234567890abcdef"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-professional text-white placeholder-light focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                readOnly
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light hover:text-white"
              >
                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-muted mt-2">Keep your API key secure. Never share it publicly.</p>
          </div>
          <div className="flex space-x-3">
            <button className="btn-primary px-4 py-2 text-sm">
              <Save className="w-4 h-4 mr-2" />
              Regenerate Key
            </button>
            <button className="btn-glossy px-4 py-2 text-sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBillingTab = () => (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <h3 className="text-xl font-bold text-white mb-4">Current Plan</h3>
        <div className="bg-gradient-primary p-6 rounded-professional mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-white">Pro Plan</h4>
              <p className="text-white/80">$29/month</p>
            </div>
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-light">Next billing date</span>
            <span className="text-white">December 15, 2024</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-light">Prompts used this month</span>
            <span className="text-white">247 / 1000</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-light">Projects created</span>
            <span className="text-white">12 / Unlimited</span>
          </div>
        </div>
        <button 
          onClick={handleBilling}
          className="btn-primary w-full mt-4"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Manage Billing
        </button>
      </div>

      <div className="card-glass p-6">
        <h3 className="text-xl font-bold text-white mb-4">Payment Method</h3>
        <div className="bg-white/5 p-4 rounded-professional border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">•••• •••• •••• 4242</p>
              <p className="text-light text-sm">Expires 12/25</p>
            </div>
          </div>
        </div>
        <button className="btn-glossy w-full mt-4">
          Update Payment Method
        </button>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <h3 className="text-xl font-bold text-white mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium capitalize">{key} Notifications</p>
                <p className="text-light text-sm">
                  {key === 'email' && 'Receive email updates about your projects'}
                  {key === 'push' && 'Get push notifications for important updates'}
                  {key === 'marketing' && 'Receive promotional emails and updates'}
                </p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  value ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <h3 className="text-xl font-bold text-white mb-4">Security Settings</h3>
        <div className="space-y-4">
          <button className="btn-primary w-full">
            <Shield className="w-4 h-4 mr-2" />
            Enable Two-Factor Authentication
          </button>
          <button className="btn-glossy w-full">
            <User className="w-4 h-4 mr-2" />
            Change Password
          </button>
          <button className="btn-glossy w-full">
            <Bell className="w-4 h-4 mr-2" />
            View Login History
          </button>
        </div>
      </div>

      <div className="card-glass p-6">
        <h3 className="text-xl font-bold text-white mb-4">Danger Zone</h3>
        <div className="space-y-4">
          <button className="btn-glossy w-full text-red-400 hover:text-red-300">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <h3 className="text-xl font-bold text-white mb-4">App Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-light text-sm font-medium mb-2">Theme</label>
            <select 
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-professional text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Auto-save projects</p>
              <p className="text-light text-sm">Automatically save your work every few minutes</p>
            </div>
            <button
              onClick={() => setAutoSave(!autoSave)}
              className={`w-12 h-6 rounded-full transition-colors ${
                autoSave ? 'bg-blue-500' : 'bg-white/20'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                autoSave ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black">
      <div className="container-professional section-professional pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">Settings</h1>
            <p className="text-light">Manage your account, preferences, and billing</p>
          </motion.div>

          {/* Tabs */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-professional transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-primary text-white'
                      : 'text-light hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'billing' && renderBillingTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'security' && renderSecurityTab()}
            {activeTab === 'preferences' && renderPreferencesTab()}
          </motion.div>
        </div>
      </div>
    </div>
  )
} 