'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiKeyManager, type UserPreferences, type UserApiKeys } from '@/lib/utils/api-key-manager'
import toast from 'react-hot-toast'

interface UseUserSettingsReturn {
  // API Keys
  apiKeys: UserApiKeys
  saveApiKey: (provider: string, key: string) => Promise<boolean>
  removeApiKey: (provider: string) => Promise<boolean>
  hasApiKey: (provider: string) => boolean
  validateAllKeys: () => { [provider: string]: boolean }
  
  // Preferences
  preferences: UserPreferences
  savePreferences: (prefs: UserPreferences) => Promise<boolean>
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void
  
  // State
  isLoading: boolean
  isSaving: boolean
  
  // Utilities
  exportData: () => { keys: UserApiKeys; preferences: UserPreferences }
  importData: (data: { keys?: UserApiKeys; preferences?: UserPreferences }) => Promise<boolean>
  clearAllData: () => Promise<boolean>
}

export function useUserSettings(): UseUserSettingsReturn {
  const [apiKeys, setApiKeys] = useState<UserApiKeys>({})
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    codeStyle: 'typescript',
    expoVersion: '50.0.0',
    preferredProvider: 'mistral',
    preferredModel: 'Mistral Large',
    useOwnKeys: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Load from localStorage first (fast)
        const localKeys = apiKeyManager.getAllApiKeys()
        const localPrefs = apiKeyManager.getPreferences()
        
        setApiKeys(localKeys)
        setPreferences(localPrefs)
        
        // Try to sync with server for preferences (slower)
        try {
          const response = await fetch('/api/user/api-preferences')
          if (response.ok) {
            const serverPrefs = await response.json()
            setPreferences(prev => ({ ...prev, ...serverPrefs }))
            // Update localStorage with server data
            apiKeyManager.savePreferences({ ...localPrefs, ...serverPrefs })
          }
        } catch (serverError) {
          console.log('Server sync failed, using local preferences:', serverError)
          // Continue with local preferences
        }
      } catch (error) {
        console.error('Error loading user settings:', error)
        toast.error('Error loading settings')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // API Key management
  const saveApiKey = useCallback(async (provider: string, key: string): Promise<boolean> => {
    try {
      const success = apiKeyManager.saveApiKey(provider, key)
      if (success) {
        if (key.trim()) {
          setApiKeys(prev => ({ ...prev, [provider]: key.trim() }))
        } else {
          setApiKeys(prev => {
            const newKeys = { ...prev }
            delete newKeys[provider]
            return newKeys
          })
        }
        return true
      }
      return false
    } catch (error: any) {
      console.error('Error saving API key:', error)
      toast.error(error.message || 'Error saving API key')
      return false
    }
  }, [])

  const removeApiKey = useCallback(async (provider: string): Promise<boolean> => {
    try {
      apiKeyManager.removeApiKey(provider)
      setApiKeys(prev => {
        const newKeys = { ...prev }
        delete newKeys[provider]
        return newKeys
      })
      return true
    } catch (error) {
      console.error('Error removing API key:', error)
      toast.error('Error removing API key')
      return false
    }
  }, [])

  const hasApiKey = useCallback((provider: string): boolean => {
    return apiKeyManager.hasApiKey(provider)
  }, [])

  const validateAllKeys = useCallback(() => {
    return apiKeyManager.validateAllKeys()
  }, [])

  // Preferences management
  const savePreferences = useCallback(async (prefs: UserPreferences): Promise<boolean> => {
    try {
      setIsSaving(true)
      
      // Save locally first (fast)
      apiKeyManager.savePreferences(prefs)
      setPreferences(prefs)
      
      // Then sync with server
      const response = await fetch('/api/user/api-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs)
      })
      
      if (response.ok) {
        toast.success('Preferences saved successfully')
        return true
      } else {
        toast.success('Preferences saved locally (server sync failed)')
        return true // Still consider it successful since local save worked
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Error saving preferences')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [])

  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }, [])

  // Utility functions
  const exportData = useCallback(() => {
    return apiKeyManager.exportData()
  }, [])

  const importData = useCallback(async (data: { keys?: UserApiKeys; preferences?: UserPreferences }): Promise<boolean> => {
    try {
      apiKeyManager.importData(data)
      
      if (data.keys) {
        setApiKeys(data.keys)
      }
      
      if (data.preferences) {
        setPreferences(data.preferences)
        // Also save to server
        await savePreferences(data.preferences)
      }
      
      toast.success('Data imported successfully')
      return true
    } catch (error) {
      console.error('Error importing data:', error)
      toast.error('Error importing data')
      return false
    }
  }, [savePreferences])

  const clearAllData = useCallback(async (): Promise<boolean> => {
    try {
      apiKeyManager.clearAllData()
      setApiKeys({})
      setPreferences({
        theme: 'light',
        codeStyle: 'typescript',
        expoVersion: '50.0.0',
        preferredProvider: 'mistral',
        preferredModel: 'Mistral Large',
        useOwnKeys: false
      })
      
      // Reset on server too
      await fetch('/api/user/api-preferences', { method: 'DELETE' })
      
      toast.success('All settings cleared')
      return true
    } catch (error) {
      console.error('Error clearing data:', error)
      toast.error('Error clearing settings')
      return false
    }
  }, [])

  return {
    // API Keys
    apiKeys,
    saveApiKey,
    removeApiKey,
    hasApiKey,
    validateAllKeys,
    
    // Preferences
    preferences,
    savePreferences,
    updatePreference,
    
    // State
    isLoading,
    isSaving,
    
    // Utilities
    exportData,
    importData,
    clearAllData
  }
} 