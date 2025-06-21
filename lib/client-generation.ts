import { GenerationPlan, V0StyleResponse } from '@/lib/generators/expo-v0-generator'

export interface ClientGenerationProgress {
  type: 'log' | 'file_complete' | 'complete' | 'error'
  message: string
  file?: {
    path: string
    content: string
    isComplete: boolean
  }
  progress?: {
    current: number
    total: number
    percentage: number
  }
}

export class ClientAIGenerator {
  private onProgress?: (progress: ClientGenerationProgress) => void

  constructor(onProgress?: (progress: ClientGenerationProgress) => void) {
    this.onProgress = onProgress
  }

  // Step 1: Get generation plan from server (fast, no AI calls)
  async getPlan(prompt: string): Promise<GenerationPlan> {
    this.onProgress?.({
      type: 'log',
      message: '🧠 Getting generation plan from server...'
    })

    const response = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.details || 'Failed to get generation plan')
    }

    const data = await response.json()
    
    this.onProgress?.({
      type: 'log',
      message: `✅ Plan ready: ${data.plan.chunks.length} chunks, estimated ${data.plan.metadata.estimatedTime}`
    })

    return data.plan
  }

  // Step 2: Execute plan using secure proxy (no API key exposure!)
  async executePlan(plan: GenerationPlan): Promise<V0StyleResponse> {
    this.onProgress?.({
      type: 'log',
      message: '🚀 Starting secure AI generation via proxy...'
    })

    const allFiles: { [key: string]: string } = {}
    
    // Add pre-generated package.json
    allFiles['package.json'] = JSON.stringify(plan.smartPackageJson, null, 2)
    this.onProgress?.({
      type: 'log',
      message: '✅ Added smart package.json with auto-detected dependencies'
    })

    for (let i = 0; i < plan.chunks.length; i++) {
      const chunk = plan.chunks[i]
      
      this.onProgress?.({
        type: 'log',
        message: `📦 Chunk ${i + 1}/${plan.chunks.length}: ${chunk.name}`,
        progress: {
          current: i + 1,
          total: plan.chunks.length,
          percentage: Math.round(((i + 1) / plan.chunks.length) * 100)
        }
      })

      try {
        // Use secure proxy instead of direct API call
        const response = await fetch('/api/ai-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: plan.systemPrompt
              },
              {
                role: 'user',
                content: chunk.prompt
              }
            ],
            maxTokens: chunk.maxTokens,
            temperature: 0.1
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.details || 'AI proxy error')
        }

        const data = await response.json()
        const content = data.content

        if (!content || typeof content !== 'string' || content.length < 10) {
          throw new Error(`Invalid AI response: ${content?.length || 0} characters`)
        }

        // Parse the chunk response
        const chunkFiles = this.parseV0Response(content)
        
        // Merge files
        Object.entries(chunkFiles).forEach(([path, fileContent]) => {
          if (fileContent && fileContent.length > 10) {
            allFiles[path] = fileContent
            this.onProgress?.({ 
              type: 'file_complete',
              message: `✅ Generated ${path} (${fileContent.length} chars)`,
              file: {
                path,
                content: fileContent,
                isComplete: true
              }
            })
          }
        })
        
        this.onProgress?.({
          type: 'log',
          message: `✅ Chunk ${i + 1} complete: ${Object.keys(chunkFiles).length} files`
        })
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        this.onProgress?.({
          type: 'log',
          message: `❌ Chunk ${i + 1} failed: ${errorMessage}`
        })
        this.onProgress?.({
          type: 'log',
          message: `🔄 Continuing with remaining chunks...`
        })
      }
      
      // Rate limiting: Respect Mistral's 1 RPS limit
      if (i < plan.chunks.length - 1) {
        const waitTime = plan.metadata.rateLimitGap + Math.random() * 500
        this.onProgress?.({
          type: 'log',
          message: `⏳ Rate limiting: waiting ${Math.round(waitTime/100)/10}s...`
        })
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
    
    this.onProgress?.({
      type: 'complete',
      message: `🎉 Secure generation complete! ${Object.keys(allFiles).length} files total`
    })
    
    // Create V0 response
    const v0Response: V0StyleResponse = {
      files: allFiles,
      metadata: {
        totalFiles: Object.keys(allFiles).length,
        appType: plan.analysis.appType,
        features: plan.analysis.features,
        nativeFeatures: plan.analysis.nativeFeatures,
        detectedModules: plan.analysis.detectedModules,
        generatedAt: new Date().toISOString(),
        dependencies: plan.smartPackageJson.dependencies,
        permissions: plan.analysis.detectedModules.flatMap(m => m.permissions || [])
      }
    }
    
    return v0Response
  }

  // Parse V0 response (copied from generator)
  private parseV0Response(response: string): { [key: string]: string } {
    const files: { [key: string]: string } = {}
    
    try {
      // First, try to extract JSON from the response
      let jsonStart = response.indexOf('{')
      let jsonEnd = response.lastIndexOf('}') + 1
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No JSON structure found in response')
      }
      
      const jsonString = response.slice(jsonStart, jsonEnd)
      const parsed = JSON.parse(jsonString)
      
      if (parsed.files && typeof parsed.files === 'object') {
        // V0.dev style: files object
        Object.entries(parsed.files).forEach(([path, content]) => {
          if (typeof content === 'string' && content.length > 10) {
            files[path] = content
          }
        })
      } else {
        throw new Error('Invalid JSON structure - missing files object')
      }
    } catch (jsonError) {
      // Fallback: Try file pattern parsing
      const filePattern = /===FILE:\s*([^\r\n]+)===\r?\n([\s\S]*?)(?====END===|===FILE:|$)/g
      let match
      
      while ((match = filePattern.exec(response)) !== null) {
        const filePath = match[1].trim()
        const content = match[2].trim()
        
        if (filePath && content && content.length > 10) {
          files[filePath] = content
        }
      }
      
      // If still no files, try code block parsing
      if (Object.keys(files).length === 0) {
        const codeBlockPattern = /```(?:\w+)?\s*(?:\/\/\s*)?([^\n]+)\n([\s\S]*?)```/g
        let codeMatch
        
        while ((codeMatch = codeBlockPattern.exec(response)) !== null) {
          const fileName = codeMatch[1]?.trim()
          const content = codeMatch[2]?.trim()
          
          if (fileName && content) {
            files[fileName] = content
          }
        }
      }
    }
    
    return files
  }

  // Combined method: Get plan + Execute (full flow)
  async generateApp(prompt: string): Promise<V0StyleResponse> {
    try {
      // Step 1: Get plan from server (fast)
      const plan = await this.getPlan(prompt)
      
      // Step 2: Execute plan via secure proxy (no API key exposure)
      const result = await this.executePlan(plan)
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.onProgress?.({
        type: 'error',
        message: `❌ Full generation failed: ${errorMessage}`
      })
      throw error
    }
  }
}

// Export for easy use
export default ClientAIGenerator 