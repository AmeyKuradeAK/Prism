import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, mkdir, rm } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const execAsync = promisify(exec)

export interface BuildRequest {
  projectName: string
  files: { [key: string]: string }
  platform: 'android' | 'ios' | 'all'
  buildProfile: 'development' | 'preview' | 'production'
  userId: string
}

export interface BuildResult {
  buildId: string
  status: 'queued' | 'in-progress' | 'completed' | 'failed'
  platform: string
  downloadUrl?: string
  qrCodeUrl?: string
  logs: string[]
  createdAt: Date
  completedAt?: Date
}

class EASBuildService {
  private buildsDir: string
  private activeBuilds: Map<string, BuildResult> = new Map()

  constructor() {
    this.buildsDir = path.join(process.cwd(), 'temp-builds')
  }

  async initializeBuild(request: BuildRequest): Promise<BuildResult> {
    const buildId = uuidv4()
    const build: BuildResult = {
      buildId,
      status: 'queued',
      platform: request.platform,
      logs: [],
      createdAt: new Date()
    }

    this.activeBuilds.set(buildId, build)
    
    // Start the build process asynchronously
    this.startBuild(buildId, request).catch(error => {
      console.error(`Build ${buildId} failed:`, error)
      this.updateBuildStatus(buildId, 'failed', [`Build failed: ${error.message}`])
    })

    return build
  }

  private async startBuild(buildId: string, request: BuildRequest) {
    const projectDir = path.join(this.buildsDir, buildId)
    
    try {
      // Update status to in-progress
      this.updateBuildStatus(buildId, 'in-progress', ['📦 Initializing build environment...'])

      // Create temporary project directory
      await mkdir(projectDir, { recursive: true })
      
      // Generate project files
      await this.generateProjectFiles(projectDir, request)
      
      // Initialize Expo project
      await this.initializeExpoProject(buildId, projectDir, request)
      
      // Configure EAS
      await this.configureEAS(buildId, projectDir, request)
      
      // Start EAS build
      await this.executeEASBuild(buildId, projectDir, request)
      
    } catch (error) {
      console.error(`Build ${buildId} failed:`, error)
      this.updateBuildStatus(buildId, 'failed', [`❌ Build failed: ${error instanceof Error ? error.message : 'Unknown error'}`])
      
      // Cleanup
      await this.cleanup(projectDir)
    }
  }

  private async generateProjectFiles(projectDir: string, request: BuildRequest) {
    // Write all the generated files
    for (const [filePath, content] of Object.entries(request.files)) {
      const fullPath = path.join(projectDir, filePath)
      const dir = path.dirname(fullPath)
      
      await mkdir(dir, { recursive: true })
      await writeFile(fullPath, content, 'utf-8')
    }
  }

  private async initializeExpoProject(buildId: string, projectDir: string, request: BuildRequest) {
    this.addBuildLog(buildId, '🔧 Initializing Expo project...')
    
    // Initialize package.json if not exists
    const packageJsonPath = path.join(projectDir, 'package.json')
    try {
      await writeFile(packageJsonPath, JSON.stringify({
        name: request.projectName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        version: '1.0.0',
        main: 'expo/AppEntry.js',
        scripts: {
          start: 'expo start',
          android: 'expo start --android',
          ios: 'expo start --ios',
          web: 'expo start --web'
        },
        dependencies: {
          expo: '~50.0.0',
          react: '18.2.0',
          'react-native': '0.73.0',
          'react-native-screens': '~3.29.0',
          'react-native-safe-area-context': '4.8.2',
          '@expo/vector-icons': '^13.0.0',
          'expo-status-bar': '~1.11.1'
        },
        devDependencies: {
          '@babel/core': '^7.20.0'
        }
      }, null, 2))
    } catch (error) {
      // If package.json already exists, that's fine
    }

    // Create app.json
    const appJsonPath = path.join(projectDir, 'app.json')
    await writeFile(appJsonPath, JSON.stringify({
      expo: {
        name: request.projectName,
        slug: request.projectName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/icon.png',
        userInterfaceStyle: 'light',
        splash: {
          image: './assets/splash.png',
          resizeMode: 'contain',
          backgroundColor: '#ffffff'
        },
        assetBundlePatterns: ['**/*'],
        ios: {
          supportsTablet: true,
          bundleIdentifier: `com.prism.${request.projectName.toLowerCase().replace(/[^a-z0-9]/g, '')}`
        },
        android: {
          adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#FFFFFF'
          },
          package: `com.prism.${request.projectName.toLowerCase().replace(/[^a-z0-9]/g, '')}`
        },
        web: {
          favicon: './assets/favicon.png'
        }
      }
    }, null, 2))

    // Create basic assets directory structure
    const assetsDir = path.join(projectDir, 'assets')
    await mkdir(assetsDir, { recursive: true })
    
    // Create placeholder asset files (in real implementation, use proper images)
    await writeFile(path.join(assetsDir, 'icon.png'), 'placeholder-icon')
    await writeFile(path.join(assetsDir, 'splash.png'), 'placeholder-splash')
    await writeFile(path.join(assetsDir, 'adaptive-icon.png'), 'placeholder-adaptive-icon')
    await writeFile(path.join(assetsDir, 'favicon.png'), 'placeholder-favicon')
  }

  private async configureEAS(buildId: string, projectDir: string, request: BuildRequest) {
    this.addBuildLog(buildId, '⚙️ Configuring EAS Build...')
    
    // Create eas.json
    const easJsonPath = path.join(projectDir, 'eas.json')
    await writeFile(easJsonPath, JSON.stringify({
      cli: {
        version: '>= 7.8.0'
      },
      build: {
        development: {
          developmentClient: true,
          distribution: 'internal'
        },
        preview: {
          distribution: 'internal',
          android: {
            buildType: 'apk'
          }
        },
        production: {
          android: {
            buildType: 'app-bundle'
          }
        }
      },
      submit: {
        production: {}
      }
    }, null, 2))
  }

  private async executeEASBuild(buildId: string, projectDir: string, request: BuildRequest) {
    this.addBuildLog(buildId, '🚀 Starting EAS build...')
    
    const buildProfile = request.buildProfile
    const platform = request.platform
    
    try {
      // Check if EAS CLI is available
      await execAsync('eas --version', { cwd: projectDir })
    } catch (error) {
      throw new Error('EAS CLI not installed. Install with: npm install -g eas-cli')
    }

    // Login to EAS (requires token)
    this.addBuildLog(buildId, '🔐 Authenticating with EAS...')
    
    if (!process.env.EXPO_TOKEN) {
      throw new Error('EXPO_TOKEN environment variable required for automated builds')
    }

    try {
      // Set the token
      await execAsync(`eas whoami`, { 
        cwd: projectDir,
        env: { ...process.env, EXPO_TOKEN: process.env.EXPO_TOKEN }
      })
    } catch (error) {
      throw new Error('Failed to authenticate with EAS. Check your EXPO_TOKEN.')
    }

    this.addBuildLog(buildId, '📱 Starting build process...')
    
    // Execute the actual build
    const buildCommand = `eas build --platform ${platform} --profile ${buildProfile} --non-interactive --wait`
    
    const buildProcess = exec(buildCommand, {
      cwd: projectDir,
      env: { ...process.env, EXPO_TOKEN: process.env.EXPO_TOKEN }
    })

    // Stream build logs
    buildProcess.stdout?.on('data', (data) => {
      const log = data.toString().trim()
      if (log) {
        this.addBuildLog(buildId, log)
      }
    })

    buildProcess.stderr?.on('data', (data) => {
      const log = data.toString().trim()
      if (log && !log.includes('warning')) {
        this.addBuildLog(buildId, `⚠️ ${log}`)
      }
    })

    // Wait for build completion
    await new Promise<void>((resolve, reject) => {
      buildProcess.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Build process exited with code ${code}`))
        }
      })

      buildProcess.on('error', (error) => {
        reject(error)
      })
    })

    // Get build artifacts
    await this.getBuildArtifacts(buildId, projectDir, request)
    
    // Mark as completed
    this.updateBuildStatus(buildId, 'completed', ['✅ Build completed successfully!'])
    
    // Cleanup temp directory
    await this.cleanup(projectDir)
  }

  private async getBuildArtifacts(buildId: string, projectDir: string, request: BuildRequest) {
    this.addBuildLog(buildId, '📦 Retrieving build artifacts...')
    
    try {
      // Get the latest build info
      const { stdout } = await execAsync('eas build:list --limit=1 --json', {
        cwd: projectDir,
        env: { ...process.env, EXPO_TOKEN: process.env.EXPO_TOKEN }
      })
      
      const builds = JSON.parse(stdout)
      if (builds.length > 0) {
        const latestBuild = builds[0]
        
        const build = this.activeBuilds.get(buildId)
        if (build) {
          build.downloadUrl = latestBuild.artifacts?.buildUrl
          build.qrCodeUrl = latestBuild.artifacts?.qrCodeUrl
          this.activeBuilds.set(buildId, build)
        }
      }
    } catch (error) {
      console.error('Failed to get build artifacts:', error)
      this.addBuildLog(buildId, '⚠️ Could not retrieve download links')
    }
  }

  private async cleanup(projectDir: string) {
    try {
      await rm(projectDir, { recursive: true, force: true })
    } catch (error) {
      console.error('Cleanup failed:', error)
    }
  }

  private updateBuildStatus(buildId: string, status: BuildResult['status'], newLogs: string[] = []) {
    const build = this.activeBuilds.get(buildId)
    if (build) {
      build.status = status
      build.logs.push(...newLogs)
      if (status === 'completed' || status === 'failed') {
        build.completedAt = new Date()
      }
      this.activeBuilds.set(buildId, build)
    }
  }

  private addBuildLog(buildId: string, log: string) {
    const build = this.activeBuilds.get(buildId)
    if (build) {
      build.logs.push(log)
      this.activeBuilds.set(buildId, build)
    }
  }

  getBuildStatus(buildId: string): BuildResult | null {
    return this.activeBuilds.get(buildId) || null
  }

  getAllBuilds(userId: string): BuildResult[] {
    // In a real implementation, filter by userId and store in database
    return Array.from(this.activeBuilds.values())
  }
}

export const easBuildService = new EASBuildService()
