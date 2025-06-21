import { v4 as uuidv4 } from 'uuid'

export interface BuildRequest {
  projectName: string
  files: { [key: string]: string }
  platform: 'android' | 'ios' | 'all'
  buildProfile: 'development' | 'preview' | 'production'
  userId: string
}

export interface BuildResult {
  buildId: string
  status: 'pending' | 'building' | 'success' | 'error'
  platform: string
  downloadUrl?: string
  qrCodeUrl?: string
  logs: string[]
  createdAt: Date
  completedAt?: Date
  progress?: number
}

class EASBuildService {
  private activeBuilds: Map<string, BuildResult> = new Map()

  async initializeBuild(request: BuildRequest): Promise<BuildResult> {
    const buildId = uuidv4()
    const build: BuildResult = {
      buildId,
      status: 'pending',
      platform: request.platform,
      logs: ['🚀 Build queued successfully'],
      createdAt: new Date(),
      progress: 0
    }

    this.activeBuilds.set(buildId, build)
    
    // Start the mock build process
    this.startMockBuild(buildId, request)

    return build
  }

  private async startMockBuild(buildId: string, request: BuildRequest) {
    const build = this.activeBuilds.get(buildId)
    if (!build) return

    try {
      // Simulate build steps with realistic timing
      const steps = [
        { message: '📦 Initializing build environment...', duration: 2000, progress: 10 },
        { message: '🔍 Validating project files...', duration: 1500, progress: 20 },
        { message: '📱 Setting up Expo configuration...', duration: 2000, progress: 30 },
        { message: '⚙️ Installing dependencies...', duration: 3000, progress: 50 },
        { message: '🏗️ Building JavaScript bundle...', duration: 4000, progress: 70 },
        { message: '📱 Compiling native code...', duration: 5000, progress: 85 },
        { message: '📦 Packaging application...', duration: 3000, progress: 95 },
        { message: '✅ Build completed successfully!', duration: 1000, progress: 100 }
      ]

      // Update to building
      build.status = 'building'
      build.progress = 0

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, step.duration))
        
        build.logs.push(step.message)
        build.progress = step.progress
        
        // Update the build in the map
        this.activeBuilds.set(buildId, { ...build })
      }

      // Complete the build
      build.status = 'success'
      build.completedAt = new Date()
      build.progress = 100
      
      // Generate mock download URLs
      const platformExt = request.platform === 'android' ? 'apk' : 'ipa'
      build.downloadUrl = `https://mock-build-service.com/builds/${buildId}/app.${platformExt}`
      build.qrCodeUrl = `https://qr.expo.dev/eas-update?slug=${request.projectName}&projectId=${buildId}`
      
      build.logs.push('🎉 Build ready for download!')
      build.logs.push(`📱 ${request.platform.charAt(0).toUpperCase() + request.platform.slice(1)} build completed`)
      
      this.activeBuilds.set(buildId, { ...build })

    } catch (error) {
      console.error(`Mock build ${buildId} failed:`, error)
      build.status = 'error'
      build.logs.push(`❌ Build failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        build.completedAt = new Date()
      this.activeBuilds.set(buildId, { ...build })
    }
  }

  getBuildStatus(buildId: string): BuildResult | null {
    return this.activeBuilds.get(buildId) || null
  }

  getAllBuilds(userId: string): BuildResult[] {
    // In a real implementation, you'd filter by userId
    return Array.from(this.activeBuilds.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // Clean up old builds (optional)
  cleanupOldBuilds() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    for (const [buildId, build] of this.activeBuilds.entries()) {
      if (build.createdAt < oneHourAgo && build.status === 'success') {
        this.activeBuilds.delete(buildId)
      }
    }
  }
}

export const easBuildService = new EASBuildService()

// Clean up old builds every hour
setInterval(() => {
  easBuildService.cleanupOldBuilds()
}, 60 * 60 * 1000)
