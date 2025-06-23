interface ApiProvider {
  provider: string
  name: string
  models: string[]
  keyPattern: RegExp
  validateKey: (key: string) => boolean
}

export const API_PROVIDERS: ApiProvider[] = [
  {
    provider: 'claude',
    name: 'Claude (Anthropic)',
    models: ['Claude 3.5 Sonnet', 'Claude 3 Opus', 'Claude 3 Haiku'],
    keyPattern: /^sk-ant-api03-[a-zA-Z0-9_-]+$/,
    validateKey: (key: string) => key.startsWith('sk-ant-api03-') && key.length > 20
  },
  {
    provider: 'openai',
    name: 'OpenAI',
    models: ['GPT-4o', 'GPT-4 Turbo', 'GPT-3.5 Turbo'],
    keyPattern: /^sk-[a-zA-Z0-9]{48,}$/,
    validateKey: (key: string) => key.startsWith('sk-') && key.length >= 51
  },
  {
    provider: 'mistral',
    name: 'Mistral AI',
    models: ['Mistral Large', 'Mistral Medium', 'Mistral Small'],
    keyPattern: /^[a-zA-Z0-9]{32}$/,
    validateKey: (key: string) => key.length === 32 && /^[a-zA-Z0-9]+$/.test(key)
  },
  {
    provider: 'deepseek',
    name: 'DeepSeek',
    models: ['DeepSeek Coder', 'DeepSeek Chat', 'DeepSeek V2'],
    keyPattern: /^sk-[a-zA-Z0-9_-]+$/,
    validateKey: (key: string) => key.startsWith('sk-') && key.length > 20
  }
]

export interface UserApiKeys {
  [provider: string]: string
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  codeStyle: 'typescript' | 'javascript'
  expoVersion: string
  preferredProvider: string
  preferredModel: string
  useOwnKeys: boolean
}

// Simple encryption/decryption (client-side only)
class SimpleEncryption {
  private key: string

  constructor(key: string = 'prism-ai-builder-keys') {
    this.key = key
  }

  encrypt(text: string): string {
    try {
      // Simple XOR encryption for client-side storage
      let result = ''
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length))
      }
      return btoa(result)
    } catch (error) {
      console.error('Encryption error:', error)
      return text
    }
  }

  decrypt(encryptedText: string): string {
    try {
      const text = atob(encryptedText)
      let result = ''
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length))
      }
      return result
    } catch (error) {
      console.error('Decryption error:', error)
      return encryptedText
    }
  }
}

export class ApiKeyManager {
  private encryption: SimpleEncryption
  private storagePrefix = 'prism_api_key_'
  private preferencesKey = 'prism_user_preferences'

  constructor() {
    this.encryption = new SimpleEncryption()
  }

  // API Key Management
  saveApiKey(provider: string, key: string): boolean {
    try {
      if (!key.trim()) {
        this.removeApiKey(provider)
        return true
      }

      const providerConfig = API_PROVIDERS.find(p => p.provider === provider)
      if (!providerConfig) {
        throw new Error(`Unknown provider: ${provider}`)
      }

      if (!providerConfig.validateKey(key.trim())) {
        throw new Error(`Invalid API key format for ${providerConfig.name}`)
      }

      const encryptedKey = this.encryption.encrypt(key.trim())
      localStorage.setItem(this.storagePrefix + provider, encryptedKey)
      return true
    } catch (error) {
      console.error('Error saving API key:', error)
      throw error
    }
  }

  getApiKey(provider: string): string | null {
    try {
      const encryptedKey = localStorage.getItem(this.storagePrefix + provider)
      if (!encryptedKey) return null
      
      return this.encryption.decrypt(encryptedKey)
    } catch (error) {
      console.error('Error getting API key:', error)
      return null
    }
  }

  removeApiKey(provider: string): void {
    localStorage.removeItem(this.storagePrefix + provider)
  }

  getAllApiKeys(): UserApiKeys {
    const keys: UserApiKeys = {}
    API_PROVIDERS.forEach(provider => {
      const key = this.getApiKey(provider.provider)
      if (key) {
        keys[provider.provider] = key
      }
    })
    return keys
  }

  hasApiKey(provider: string): boolean {
    return this.getApiKey(provider) !== null
  }

  validateAllKeys(): { [provider: string]: boolean } {
    const validation: { [provider: string]: boolean } = {}
    API_PROVIDERS.forEach(provider => {
      const key = this.getApiKey(provider.provider)
      validation[provider.provider] = key ? provider.validateKey(key) : false
    })
    return validation
  }

  // Preferences Management
  savePreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(this.preferencesKey, JSON.stringify(preferences))
    } catch (error) {
      console.error('Error saving preferences:', error)
      throw error
    }
  }

  getPreferences(): UserPreferences {
    try {
      const saved = localStorage.getItem(this.preferencesKey)
      if (!saved) {
        return this.getDefaultPreferences()
      }
      
      const parsed = JSON.parse(saved)
      return { ...this.getDefaultPreferences(), ...parsed }
    } catch (error) {
      console.error('Error getting preferences:', error)
      return this.getDefaultPreferences()
    }
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'light',
      codeStyle: 'typescript',
      expoVersion: '50.0.0',
      preferredProvider: 'mistral',
      preferredModel: 'Mistral Large',
      useOwnKeys: false
    }
  }

  // Utility Methods
  getProviderConfig(provider: string): ApiProvider | null {
    return API_PROVIDERS.find(p => p.provider === provider) || null
  }

  getAvailableProviders(): string[] {
    return API_PROVIDERS.map(p => p.provider)
  }

  getProvidersWithKeys(): string[] {
    return API_PROVIDERS.filter(p => this.hasApiKey(p.provider)).map(p => p.provider)
  }

  clearAllData(): void {
    // Remove all API keys
    API_PROVIDERS.forEach(provider => {
      this.removeApiKey(provider.provider)
    })
    
    // Remove preferences
    localStorage.removeItem(this.preferencesKey)
  }

  exportData(): { keys: UserApiKeys; preferences: UserPreferences } {
    return {
      keys: this.getAllApiKeys(),
      preferences: this.getPreferences()
    }
  }

  importData(data: { keys?: UserApiKeys; preferences?: UserPreferences }): void {
    if (data.keys) {
      Object.entries(data.keys).forEach(([provider, key]) => {
        this.saveApiKey(provider, key)
      })
    }
    
    if (data.preferences) {
      this.savePreferences(data.preferences)
    }
  }
}

// Export singleton instance
export const apiKeyManager = new ApiKeyManager()

// Helper functions for React components
export const useApiKeys = () => {
  const manager = apiKeyManager

  const saveKey = (provider: string, key: string) => {
    return manager.saveApiKey(provider, key)
  }

  const getKey = (provider: string) => {
    return manager.getApiKey(provider)
  }

  const removeKey = (provider: string) => {
    return manager.removeApiKey(provider)
  }

  const getAllKeys = () => {
    return manager.getAllApiKeys()
  }

  const hasKey = (provider: string) => {
    return manager.hasApiKey(provider)
  }

  return {
    saveKey,
    getKey,
    removeKey,
    getAllKeys,
    hasKey,
    validateAllKeys: manager.validateAllKeys.bind(manager),
    getProviderConfig: manager.getProviderConfig.bind(manager)
  }
}

export const usePreferences = () => {
  const manager = apiKeyManager

  const savePreferences = (prefs: UserPreferences) => {
    return manager.savePreferences(prefs)
  }

  const getPreferences = () => {
    return manager.getPreferences()
  }

  return {
    savePreferences,
    getPreferences
  }
} 