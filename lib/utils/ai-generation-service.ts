'use client'

import { apiKeyManager, API_PROVIDERS } from './api-key-manager'

interface GenerationRequest {
  prompt: string
  maxTokens?: number
  temperature?: number
  userId?: string
}

interface GenerationResponse {
  content: string
  provider: string
  model: string
  cost: string
  tokensUsed?: number
}

export class AIGenerationService {
  private async getActiveProvider(): Promise<{
    provider: string
    apiKey: string
    model: string
    isUserOwned: boolean
  }> {
    const preferences = apiKeyManager.getPreferences()
    
    // If user wants to use their own keys and has them
    if (preferences.useOwnKeys) {
      const userApiKey = apiKeyManager.getApiKey(preferences.preferredProvider)
      
      if (userApiKey) {
        const providerConfig = API_PROVIDERS.find(p => p.provider === preferences.preferredProvider)
        if (providerConfig && providerConfig.validateKey(userApiKey)) {
          return {
            provider: preferences.preferredProvider,
            apiKey: userApiKey,
            model: preferences.preferredModel,
            isUserOwned: true
          }
        }
      }
      
      // If preferred provider key doesn't work, try other user keys
      for (const providerConfig of API_PROVIDERS) {
        const key = apiKeyManager.getApiKey(providerConfig.provider)
        if (key && providerConfig.validateKey(key)) {
          return {
            provider: providerConfig.provider,
            apiKey: key,
            model: providerConfig.models[0],
            isUserOwned: true
          }
        }
      }
    }
    
    // Fall back to server-side API via proxy
    return {
      provider: 'mistral',
      apiKey: 'server-managed',
      model: 'Mistral Large',
      isUserOwned: false
    }
  }

  private async generateWithClaude(
    apiKey: string, 
    prompt: string, 
    model: string, 
    maxTokens: number = 2000,
    temperature: number = 0.2
  ): Promise<{ content: string; tokensUsed?: number }> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model.toLowerCase().includes('sonnet') ? 'claude-3-5-sonnet-20241022' :
                model.toLowerCase().includes('opus') ? 'claude-3-opus-20240229' : 
                'claude-3-haiku-20240307',
          max_tokens: maxTokens,
          temperature,
          messages: [{ role: 'user', content: prompt }]
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Claude API error: ${response.status} - ${error}`)
      }

      const data = await response.json()
      return {
        content: data.content[0]?.text || '',
        tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens
      }
    } catch (error) {
      console.error('Claude generation error:', error)
      throw error
    }
  }

  private async generateWithOpenAI(
    apiKey: string, 
    prompt: string, 
    model: string, 
    maxTokens: number = 2000,
    temperature: number = 0.2
  ): Promise<{ content: string; tokensUsed?: number }> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model.toLowerCase().includes('4o') ? 'gpt-4o' :
                model.toLowerCase().includes('4') ? 'gpt-4-turbo' :
                'gpt-3.5-turbo',
          max_tokens: maxTokens,
          temperature,
          messages: [{ role: 'user', content: prompt }]
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenAI API error: ${response.status} - ${error}`)
      }

      const data = await response.json()
      return {
        content: data.choices[0]?.message?.content || '',
        tokensUsed: data.usage?.total_tokens
      }
    } catch (error) {
      console.error('OpenAI generation error:', error)
      throw error
    }
  }

  private async generateWithMistral(
    apiKey: string, 
    prompt: string, 
    model: string, 
    maxTokens: number = 2000,
    temperature: number = 0.2,
    isUserOwned: boolean = false
  ): Promise<{ content: string; tokensUsed?: number }> {
    try {
      // Use appropriate endpoint based on key ownership
      const endpoint = isUserOwned 
        ? 'https://api.mistral.ai/v1/chat/completions'
        : '/api/ai-proxy' // Use our proxy for server-side keys

      const requestBody = {
        messages: [{ role: 'user', content: prompt }],
        maxTokens,
        temperature
      }

      const requestOptions: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }

      if (isUserOwned) {
        // Direct API call with user's key
        requestOptions.headers = {
          ...requestOptions.headers,
          'Authorization': `Bearer ${apiKey}`
        }
        requestOptions.body = JSON.stringify({
          model: model.toLowerCase().includes('large') ? 'mistral-large-latest' :
                model.toLowerCase().includes('medium') ? 'mistral-medium-latest' :
                'mistral-small-latest',
          ...requestBody
        })
      } else {
        // Use our proxy
        requestOptions.body = JSON.stringify(requestBody)
      }

      const response = await fetch(endpoint, requestOptions)

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Mistral API error: ${response.status} - ${error}`)
      }

      const data = await response.json()
      
      if (isUserOwned) {
        return {
          content: data.choices[0]?.message?.content || '',
          tokensUsed: data.usage?.total_tokens
        }
      } else {
        // Proxy response format
        return {
          content: data.content || '',
          tokensUsed: data.usage?.total_tokens
        }
      }
    } catch (error) {
      console.error('Mistral generation error:', error)
      throw error
    }
  }

  private async generateWithDeepSeek(
    apiKey: string, 
    prompt: string, 
    model: string, 
    maxTokens: number = 2000,
    temperature: number = 0.2
  ): Promise<{ content: string; tokensUsed?: number }> {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model.toLowerCase().includes('coder') ? 'deepseek-coder' :
                model.toLowerCase().includes('chat') ? 'deepseek-chat' :
                'deepseek-v2',
          max_tokens: maxTokens,
          temperature,
          messages: [{ role: 'user', content: prompt }]
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`DeepSeek API error: ${response.status} - ${error}`)
      }

      const data = await response.json()
      return {
        content: data.choices[0]?.message?.content || '',
        tokensUsed: data.usage?.total_tokens
      }
    } catch (error) {
      console.error('DeepSeek generation error:', error)
      throw error
    }
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    const { prompt, maxTokens = 2000, temperature = 0.2 } = request
    
    try {
      // Get the active provider based on user preferences
      const { provider, apiKey, model, isUserOwned } = await this.getActiveProvider()
      
      console.log(`🤖 Using ${provider} (${isUserOwned ? 'user-owned' : 'server-managed'}) with model: ${model}`)
      
      let result: { content: string; tokensUsed?: number }
      
      // Generate based on provider
      switch (provider) {
        case 'claude':
          result = await this.generateWithClaude(apiKey, prompt, model, maxTokens, temperature)
          break
          
        case 'openai':
          result = await this.generateWithOpenAI(apiKey, prompt, model, maxTokens, temperature)
          break
          
        case 'mistral':
          result = await this.generateWithMistral(apiKey, prompt, model, maxTokens, temperature, isUserOwned)
          break
          
        case 'deepseek':
          result = await this.generateWithDeepSeek(apiKey, prompt, model, maxTokens, temperature)
          break
          
        default:
          throw new Error(`Unsupported provider: ${provider}`)
      }
      
      if (!result.content) {
        throw new Error('Empty response from AI provider')
      }
      
      return {
        content: result.content,
        provider: API_PROVIDERS.find(p => p.provider === provider)?.name || provider,
        model,
        cost: isUserOwned ? 'Your API costs' : 'Free (our service)',
        tokensUsed: result.tokensUsed
      }
      
    } catch (error) {
      console.error('AI generation failed:', error)
      
      // If user's API key failed, try falling back to server Mistral
      const preferences = apiKeyManager.getPreferences()
      if (preferences.useOwnKeys) {
        console.log('🔄 User API failed, falling back to server Mistral...')
        try {
          const result = await this.generateWithMistral(
            'server-managed', 
            prompt, 
            'Mistral Large', 
            maxTokens, 
            temperature, 
            false
          )
          
          return {
            content: result.content,
            provider: 'Mistral AI (Fallback)',
            model: 'Mistral Large',
            cost: 'Free (fallback service)',
            tokensUsed: result.tokensUsed
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError)
        }
      }
      
      throw error
    }
  }

  // Utility method to check if user has any valid API keys
  hasUserApiKeys(): boolean {
    const preferences = apiKeyManager.getPreferences()
    if (!preferences.useOwnKeys) return false
    
    return API_PROVIDERS.some(provider => {
      const key = apiKeyManager.getApiKey(provider.provider)
      return key && provider.validateKey(key)
    })
  }

  // Get provider status for UI
  getProviderStatus(): {
    provider: string
    model: string
    isUserOwned: boolean
    available: boolean
  } {
    try {
      const preferences = apiKeyManager.getPreferences()
      
      if (preferences.useOwnKeys) {
        const userKey = apiKeyManager.getApiKey(preferences.preferredProvider)
        const providerConfig = API_PROVIDERS.find(p => p.provider === preferences.preferredProvider)
        
        if (userKey && providerConfig?.validateKey(userKey)) {
          return {
            provider: providerConfig.name,
            model: preferences.preferredModel,
            isUserOwned: true,
            available: true
          }
        }
      }
      
      return {
        provider: 'Mistral AI',
        model: 'Mistral Large',
        isUserOwned: false,
        available: true // Always available via proxy
      }
    } catch {
      return {
        provider: 'None',
        model: 'None',
        isUserOwned: false,
        available: false
      }
    }
  }
}

// Export singleton instance
export const aiGenerationService = new AIGenerationService() 