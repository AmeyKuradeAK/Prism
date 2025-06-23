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
  Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardHeader from './dashboard/DashboardHeader'
import { apiKeyManager, API_PROVIDERS, type UserPreferences } from '@/lib/utils/api-key-manager'

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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'ai-keys', label: 'AI Providers', icon: Key },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader />
      
      <div className="container-professional py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl-professional flex items-center justify-center shadow-professional">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="heading-secondary">Settings</h1>
              <p className="text-light">Manage your account and preferences</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="card-glass p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-professional transition-professional ${
                        activeTab === tab.id
                          ? 'bg-white text-black shadow-professional'
                          : 'text-light hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="card-glass p-6">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <User className="w-6 h-6 text-purple-400" />
                    <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Theme
                      </label>
                      <select
                        value={preferences.theme}
                        onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Code Style
                      </label>
                      <select
                        value={preferences.codeStyle}
                        onChange={(e) => setPreferences(prev => ({ ...prev, codeStyle: e.target.value as 'typescript' | 'javascript' }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="typescript">TypeScript</option>
                        <option value="javascript">JavaScript</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Expo Version
                      </label>
                      <input
                        type="text"
                        value={preferences.expoVersion}
                        onChange={(e) => setPreferences(prev => ({ ...prev, expoVersion: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        placeholder="50.0.0"
                      />
                    </div>
                  </div>

                  <button
                    onClick={savePreferences}
                    disabled={isSaving}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <Shield className="w-6 h-6 text-purple-400" />
                    <h2 className="text-2xl font-bold text-white">Security Settings</h2>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <AlertCircle className="w-6 h-6 text-blue-400 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Password Management</h3>
                        <p className="text-white/70 mb-4">
                          Password changes are managed through Clerk. Use the user menu in the top right to access account settings.
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
                          <span>Manage Account</span>
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <CheckCircle2 className="w-6 h-6 text-green-400 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Account Security</h3>
                        <p className="text-white/70">
                          Your account is secured with Clerk's enterprise-grade security. All API keys are encrypted and stored locally in your browser.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Keys Tab */}
              {activeTab === 'ai-keys' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <Key className="w-6 h-6 text-purple-400" />
                    <h2 className="text-2xl font-bold text-white">AI Provider Settings</h2>
                  </div>

                  {/* Usage Mode Toggle */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                      Choose Your AI Usage Mode
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div 
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          !preferences.useOwnKeys 
                            ? 'border-purple-500 bg-purple-500/10' 
                            : 'border-white/20 bg-white/5 hover:border-white/40'
                        }`}
                        onClick={() => setPreferences(prev => ({ ...prev, useOwnKeys: false }))}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            !preferences.useOwnKeys ? 'border-purple-500 bg-purple-500' : 'border-white/40'
                          }`}>
                            {!preferences.useOwnKeys && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                          </div>
                          <h4 className="font-semibold text-white">Use Our Service</h4>
                        </div>
                        <p className="text-white/70 text-sm">
                          Pay for our managed AI service. No API keys needed, just focus on building.
                        </p>
                      </div>

                      <div 
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          preferences.useOwnKeys 
                            ? 'border-purple-500 bg-purple-500/10' 
                            : 'border-white/20 bg-white/5 hover:border-white/40'
                        }`}
                        onClick={() => setPreferences(prev => ({ ...prev, useOwnKeys: true }))}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            preferences.useOwnKeys ? 'border-purple-500 bg-purple-500' : 'border-white/40'
                          }`}>
                            {preferences.useOwnKeys && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                          </div>
                          <h4 className="font-semibold text-white">Use Your Own Keys</h4>
                        </div>
                        <p className="text-white/70 text-sm">
                          Bring your own API keys. More control, potentially lower costs.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* API Key Configuration (only show if using own keys) */}
                  {preferences.useOwnKeys && (
                    <div className="space-y-6">
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-white mb-1">Security Notice</h4>
                            <p className="text-white/70 text-sm">
                              API keys are encrypted and stored locally in your browser. They're never sent to our servers.
                            </p>
                          </div>
                        </div>
                      </div>

                      {API_PROVIDERS.map((provider) => (
                        <div key={provider.provider} className="bg-white/5 rounded-xl p-6 border border-white/10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">
                                {provider.provider === 'claude' && '🤖'}
                                {provider.provider === 'openai' && '🔥'}
                                {provider.provider === 'mistral' && '🌟'}
                                {provider.provider === 'deepseek' && '🧠'}
                              </span>
                              <div>
                                <h3 className="text-lg font-semibold text-white">{provider.name}</h3>
                                <p className="text-white/60 text-sm">
                                  Models: {provider.models.join(', ')}
                                </p>
                              </div>
                            </div>
                            <a
                              href={
                                provider.provider === 'claude' ? 'https://console.anthropic.com/' :
                                provider.provider === 'openai' ? 'https://platform.openai.com/api-keys' :
                                provider.provider === 'mistral' ? 'https://console.mistral.ai/' :
                                'https://platform.deepseek.com/'
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-white/80 mb-2">
                                API Key
                              </label>
                              <div className="relative">
                                <input
                                  type={showApiKeys[provider.provider] ? 'text' : 'password'}
                                  value={apiKeys[provider.provider] || ''}
                                  onChange={(e) => setApiKeys(prev => ({
                                    ...prev,
                                    [provider.provider]: e.target.value
                                  }))}
                                  placeholder={
                                    provider.provider === 'claude' ? 'sk-ant-api03-...' :
                                    provider.provider === 'openai' ? 'sk-...' :
                                    provider.provider === 'mistral' ? 'mistral-...' :
                                    'sk-...'
                                  }
                                  className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => toggleApiKeyVisibility(provider.provider)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                                >
                                  {showApiKeys[provider.provider] ? (
                                    <EyeOff className="w-5 h-5" />
                                  ) : (
                                    <Eye className="w-5 h-5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="flex space-x-3">
                              <button
                                onClick={() => saveApiKey(provider.provider, apiKeys[provider.provider] || '')}
                                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                              >
                                <Save className="w-4 h-4" />
                                <span>Save</span>
                              </button>
                              
                              {apiKeys[provider.provider] && (
                                <button
                                  onClick={() => saveApiKey(provider.provider, '')}
                                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                  <span>Remove</span>
                                </button>
                              )}
                            </div>

                            {apiKeyManager.hasApiKey(provider.provider) && (
                              <div className="flex items-center space-x-2 text-green-400 text-sm">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>API key saved securely</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Preferred Provider Selection */}
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4">Default AI Provider</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Preferred Provider
                            </label>
                            <select
                              value={preferences.preferredProvider}
                              onChange={(e) => setPreferences(prev => ({ ...prev, preferredProvider: e.target.value }))}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            >
                              {API_PROVIDERS.map(provider => (
                                <option key={provider.provider} value={provider.provider}>
                                  {provider.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Preferred Model
                            </label>
                            <select
                              value={preferences.preferredModel}
                              onChange={(e) => setPreferences(prev => ({ ...prev, preferredModel: e.target.value }))}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            >
                              {API_PROVIDERS.find(p => p.provider === preferences.preferredProvider)?.models.map(model => (
                                <option key={model} value={model}>
                                  {model}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={savePreferences}
                    disabled={isSaving}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
                  </button>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <CreditCard className="w-6 h-6 text-purple-400" />
                    <h2 className="text-2xl font-bold text-white">Billing & Usage</h2>
                  </div>

                  <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <Sparkles className="w-6 h-6 text-green-400 mt-1" />
                      <div className="w-full">
                        <h3 className="text-xl font-semibold text-white mb-2">⚡ Spark Plan (Free)</h3>
                        <p className="text-white/70 mb-4">
                          You're currently on our free plan. Upgrade to unlock unlimited generations and premium features!
                        </p>
                        
                        {/* Usage Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-2xl font-bold text-blue-400">3</div>
                            <div className="text-white/80 text-sm">Projects/month</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-2xl font-bold text-green-400">10</div>
                            <div className="text-white/80 text-sm">AI Generations/month</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-2xl font-bold text-purple-400">Basic</div>
                            <div className="text-white/80 text-sm">Features</div>
                          </div>
                        </div>
                        
                        {/* Upgrade CTA */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <a
                            href="/pricing"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-500 hover:to-pink-500 transition-colors text-center"
                          >
                            Upgrade to Plus ($19/month)
                          </a>
                          <button className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors">
                            View All Plans
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Usage Options</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <h4 className="font-medium text-white">Use Our AI Service</h4>
                          <p className="text-white/60 text-sm">Managed AI with no setup required</p>
                        </div>
                        <span className="text-green-400 font-semibold">Free</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <h4 className="font-medium text-white">Bring Your Own Keys</h4>
                          <p className="text-white/60 text-sm">Use your own API keys for more control</p>
                        </div>
                        <span className="text-blue-400 font-semibold">Your Cost</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 