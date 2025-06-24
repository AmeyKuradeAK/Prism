'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { 
  User, 
  Key, 
  Shield, 
  CreditCard, 
  Settings, 
  Save, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Crown,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardHeader from './dashboard/DashboardHeader'
import { apiKeyManager, API_PROVIDERS, type UserPreferences } from '@/lib/utils/api-key-manager'
import { SUBSCRIPTION_PLANS } from '@/lib/utils/subscription-plans'

declare global {
  interface Window {
    Clerk?: {
      openBillingPortal?: () => void
    }
  }
}

export default function UserSettings() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('profile')
  const [showApiKeys, setShowApiKeys] = useState<{[key: string]: boolean}>({})
  const [apiKeys, setApiKeys] = useState<{[key: string]: string}>({})
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    codeStyle: 'typescript',
    expoVersion: '50.0.0',
    preferredProvider: 'mistral',
    preferredModel: 'Mistral Large',
    useOwnKeys: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null)

  // Load saved API keys and preferences
  useEffect(() => {
    try {
      const savedKeys = apiKeyManager.getAllApiKeys()
      const savedPrefs = apiKeyManager.getPreferences()
      
      setApiKeys(savedKeys)
      setPreferences(savedPrefs)
    } catch (error) {
      console.error('Error loading saved data:', error)
      toast.error('Error loading saved settings')
    }
  }, [])

  // Load subscription status
  useEffect(() => {
    const loadSubscriptionStatus = async () => {
      try {
        const response = await fetch('/api/user/subscription-status')
        if (response.ok) {
          const data = await response.json()
          setSubscriptionStatus(data)
        }
      } catch (error) {
        console.error('Error loading subscription status:', error)
      }
    }
    
    if (user) {
      loadSubscriptionStatus()
    }
  }, [user])

  const saveApiKey = async (provider: string, key: string) => {
    try {
      if (key.trim()) {
        apiKeyManager.saveApiKey(provider, key.trim())
        setApiKeys(prev => ({ ...prev, [provider]: key.trim() }))
        toast.success(`${API_PROVIDERS.find(p => p.provider === provider)?.name} API key saved securely`)
      } else {
        apiKeyManager.removeApiKey(provider)
        setApiKeys(prev => {
          const newKeys = { ...prev }
          delete newKeys[provider]
          return newKeys
        })
        toast.success(`${API_PROVIDERS.find(p => p.provider === provider)?.name} API key removed`)
      }
    } catch (error: any) {
      console.error('Error saving API key:', error)
      toast.error(error.message || 'Error saving API key')
    }
  }

  const savePreferences = async () => {
    setIsSaving(true)
    try {
      apiKeyManager.savePreferences(preferences)
      
      // Also save to backend
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences })
      })
      
      if (response.ok) {
        toast.success('Preferences saved successfully')
      } else {
        toast.success('Preferences saved locally (server sync failed)')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Error saving preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleApiKeyVisibility = (provider: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }))
  }

  const handleBillingPortal = () => {
    try {
      // Try to use Clerk's billing portal if available
      if (typeof window !== 'undefined' && window.Clerk && typeof window.Clerk.openBillingPortal === 'function') {
        window.Clerk.openBillingPortal()
      } else {
        // Fallback: redirect to pricing page
        console.log('Clerk billing portal not available, redirecting to pricing page')
        window.location.href = '/pricing'
      }
    } catch (error) {
      console.error('Error opening billing portal:', error)
      // Fallback to pricing page
      window.location.href = '/pricing'
    }
  }

  const getCurrentPlanName = () => {
    if (!subscriptionStatus) return 'Free'
    
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscriptionStatus.currentPlan)
    return plan?.name || 'Free'
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'spark': return <Zap className="w-5 h-5" />
      case 'pro': return <Sparkles className="w-5 h-5" />
      case 'premium': return <Crown className="w-5 h-5" />
      case 'team': return <User className="w-5 h-5" />
      case 'enterprise': return <Shield className="w-5 h-5" />
      default: return <Zap className="w-5 h-5" />
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'ai-keys', label: 'AI Providers', icon: Key },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader />
      
      <div className="container-professional section-professional">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">Settings</h1>
            <p className="text-xl text-light">
              Manage your account, preferences, and subscription
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 p-2 bg-white/5 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-black shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="card-glass p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                  <User className="w-6 h-6" />
                  <span>Profile Information</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white mb-2 font-medium">Email</label>
                    <div className="bg-white/10 border border-white/20 rounded-lg p-4 text-white">
                      {user?.emailAddresses[0]?.emailAddress || 'Not available'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2 font-medium">Name</label>
                    <div className="bg-white/10 border border-white/20 rounded-lg p-4 text-white">
                      {user?.fullName || 'Not available'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2 font-medium">Current Plan</label>
                    <div className="bg-white/10 border border-white/20 rounded-lg p-4 text-white flex items-center space-x-2">
                      {getPlanIcon(subscriptionStatus?.currentPlan || 'spark')}
                      <span>{getCurrentPlanName()}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2 font-medium">Account Status</label>
                    <div className="bg-white/10 border border-white/20 rounded-lg p-4 text-white flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span>Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="card-glass p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                  <Settings className="w-6 h-6" />
                  <span>Preferences</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white mb-2 font-medium">Theme</label>
                    <select
                      value={preferences.theme}
                      onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-4 text-white"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2 font-medium">Code Style</label>
                    <select
                      value={preferences.codeStyle}
                      onChange={(e) => setPreferences(prev => ({ ...prev, codeStyle: e.target.value as 'typescript' | 'javascript' }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-4 text-white"
                    >
                      <option value="typescript">TypeScript</option>
                      <option value="javascript">JavaScript</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2 font-medium">Expo Version</label>
                    <select
                      value={preferences.expoVersion}
                      onChange={(e) => setPreferences(prev => ({ ...prev, expoVersion: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-4 text-white"
                    >
                      <option value="50.0.0">Expo 50</option>
                      <option value="51.0.0">Expo 51</option>
                      <option value="52.0.0">Expo 52</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={savePreferences}
                    disabled={isSaving}
                    className="btn-glossy flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="card-glass p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                  <Shield className="w-6 h-6" />
                  <span>Security Settings</span>
                </h2>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <AlertCircle className="w-6 h-6 text-blue-400 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Account Security</h3>
                      <p className="text-white/70 mb-4">
                        Security settings including password, two-factor authentication, and account recovery are managed through Clerk. 
                        Click the user menu in the top right to access these settings.
                      </p>
                      <button
                        onClick={() => {
                          // This will open Clerk's user management
                          const userButton = document.querySelector('[data-clerk-user-button]') as HTMLElement
                          userButton?.click()
                        }}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Manage Account Security</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* AI Keys Tab */}
          {activeTab === 'ai-keys' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="card-glass p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                  <Key className="w-6 h-6" />
                  <span>AI Provider Keys</span>
                </h2>
                
                <div className="space-y-6">
                  {API_PROVIDERS.map((provider) => (
                    <div key={provider.provider} className="bg-white/5 border border-white/10 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">{provider.name[0]}</span>
                          </div>
                                                     <div>
                             <h3 className="text-white font-semibold">{provider.name}</h3>
                             <p className="text-white/70 text-sm">Models: {provider.models.join(', ')}</p>
                           </div>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <input
                          type={showApiKeys[provider.provider] ? 'text' : 'password'}
                          value={apiKeys[provider.provider] || ''}
                          onChange={(e) => setApiKeys(prev => ({ ...prev, [provider.provider]: e.target.value }))}
                          placeholder={`Enter your ${provider.name} API key`}
                          className="w-full bg-white/10 border border-white/20 rounded-lg p-4 pr-24 text-white placeholder-white/50"
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                          <button
                            onClick={() => toggleApiKeyVisibility(provider.provider)}
                            className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            {showApiKeys[provider.provider] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => saveApiKey(provider.provider, apiKeys[provider.provider] || '')}
                            className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="card-glass p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                  <CreditCard className="w-6 h-6" />
                  <span>Billing & Subscription</span>
                </h2>
                
                {/* Current Plan */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getPlanIcon(subscriptionStatus?.currentPlan || 'spark')}
                      <div>
                        <h3 className="text-white font-semibold text-lg">{getCurrentPlanName()}</h3>
                        <p className="text-white/70">
                          {subscriptionStatus?.currentPlan === 'spark' ? 'Free Plan' : 'Paid Subscription'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.location.href = '/pricing'}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
                    >
                      Upgrade Plan
                    </button>
                  </div>
                  
                  {subscriptionStatus && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-white/70">Monthly Prompts</span>
                        <div className="text-white font-semibold">
                          {subscriptionStatus.usage?.promptsThisMonth || 0} / {subscriptionStatus.usage?.promptLimit === -1 ? '∞' : subscriptionStatus.usage?.promptLimit || 15}
                        </div>
                      </div>
                      <div>
                        <span className="text-white/70">Projects</span>
                        <div className="text-white font-semibold">
                          {subscriptionStatus.usage?.projectsThisMonth || 0} / {subscriptionStatus.usage?.projectLimit === -1 ? '∞' : subscriptionStatus.usage?.projectLimit || 3}
                        </div>
                      </div>
                      <div>
                        <span className="text-white/70">Status</span>
                        <div className="text-green-400 font-semibold">Active</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Billing Management */}
                <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-3">Billing Management</h3>
                  <p className="text-white/70 mb-4">
                    Manage your subscription, payment methods, and billing history through the Clerk billing portal.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={handleBillingPortal}
                      className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium transition-colors border border-white/20 flex items-center space-x-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Open Billing Portal</span>
                    </button>
                    <button
                      onClick={() => window.location.href = '/pricing'}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>View All Plans</span>
                    </button>
                  </div>
                  
                  {/* Billing Status */}
                  <div className="mt-4 p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-white/70">Billing portal available</span>
                    </div>
                    <p className="text-white/50 text-xs mt-1">
                      Click "Open Billing Portal" to manage your subscription and payment methods
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
} 