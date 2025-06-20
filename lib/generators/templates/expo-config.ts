import { GeneratedFile } from '@/types'

export function generateExpoConfig(prompt: string): GeneratedFile {
  // Extract app name from prompt or use default
  const appName = extractAppName(prompt) || 'My Expo App'
  const promptLower = prompt.toLowerCase()
  
  // Determine required permissions based on prompt
  const permissions = getRequiredPermissions(promptLower)
  
  const expoConfig = {
    expo: {
      name: appName,
      slug: appName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/icon.png",
      userInterfaceStyle: "light",
      splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      },
      assetBundlePatterns: [
        "**/*"
      ],
      ios: {
        supportsTablet: true,
        bundleIdentifier: `com.yourcompany.${appName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        ...(permissions.ios && { infoPlist: permissions.ios })
      },
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/adaptive-icon.png",
          backgroundColor: "#FFFFFF"
        },
        package: `com.yourcompany.${appName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        ...(permissions.android && { permissions: permissions.android })
      },
      web: {
        favicon: "./assets/favicon.png"
      },
      plugins: getRequiredPlugins(promptLower),
      extra: {
        eas: {
          projectId: "your-project-id-here"
        }
      }
    }
  }

  return {
    path: 'app.json',
    content: JSON.stringify(expoConfig, null, 2),
    type: 'json'
  }
}

function extractAppName(prompt: string): string | null {
  // Try to extract app name from prompt
  const patterns = [
    /(?:create|build|make).*?(?:app|application).*?(?:called|named)\s+["']?([^"'\s.,:;!?]+)/i,
    /(?:app|application)\s+(?:called|named)\s+["']?([^"'\s.,:;!?]+)/i,
    /["']([^"']+)["']\s+(?:app|application)/i,
  ]
  
  for (const pattern of patterns) {
    const match = prompt.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  
  return null
}

function getRequiredPermissions(promptLower: string) {
  const permissions: { ios?: any; android?: string[] } = {}
  
  // iOS permissions
  const iosPermissions: any = {}
  
  // Android permissions
  const androidPermissions: string[] = []
  
  // Camera permissions
  if (promptLower.includes('camera') || promptLower.includes('photo')) {
    iosPermissions.NSCameraUsageDescription = "This app uses the camera to take photos."
    iosPermissions.NSPhotoLibraryUsageDescription = "This app accesses the photo library to select images."
    androidPermissions.push("android.permission.CAMERA")
    androidPermissions.push("android.permission.READ_EXTERNAL_STORAGE")
    androidPermissions.push("android.permission.WRITE_EXTERNAL_STORAGE")
  }
  
  // Location permissions
  if (promptLower.includes('location') || promptLower.includes('gps') || promptLower.includes('map')) {
    iosPermissions.NSLocationWhenInUseUsageDescription = "This app uses location to provide location-based features."
    iosPermissions.NSLocationAlwaysAndWhenInUseUsageDescription = "This app uses location to provide location-based features."
    androidPermissions.push("android.permission.ACCESS_FINE_LOCATION")
    androidPermissions.push("android.permission.ACCESS_COARSE_LOCATION")
  }
  
  // Notification permissions
  if (promptLower.includes('notification') || promptLower.includes('push')) {
    androidPermissions.push("android.permission.RECEIVE_BOOT_COMPLETED")
    androidPermissions.push("android.permission.VIBRATE")
  }
  
  // Microphone permissions
  if (promptLower.includes('audio') || promptLower.includes('microphone') || promptLower.includes('record')) {
    iosPermissions.NSMicrophoneUsageDescription = "This app uses the microphone to record audio."
    androidPermissions.push("android.permission.RECORD_AUDIO")
  }
  
  // Contacts permissions
  if (promptLower.includes('contact')) {
    iosPermissions.NSContactsUsageDescription = "This app accesses contacts to provide contact-related features."
    androidPermissions.push("android.permission.READ_CONTACTS")
  }
  
  // Calendar permissions
  if (promptLower.includes('calendar')) {
    iosPermissions.NSCalendarsUsageDescription = "This app accesses the calendar to manage events."
    androidPermissions.push("android.permission.READ_CALENDAR")
    androidPermissions.push("android.permission.WRITE_CALENDAR")
  }
  
  if (Object.keys(iosPermissions).length > 0) {
    permissions.ios = iosPermissions
  }
  
  if (androidPermissions.length > 0) {
    permissions.android = androidPermissions
  }
  
  return permissions
}

function getRequiredPlugins(promptLower: string): string[] {
  const plugins: string[] = []
  
  // Camera functionality
  if (promptLower.includes('camera') || promptLower.includes('photo')) {
    plugins.push("expo-camera")
    plugins.push("expo-image-picker")
  }
  
  // Location functionality
  if (promptLower.includes('location') || promptLower.includes('gps')) {
    plugins.push("expo-location")
  }
  
  // Notifications
  if (promptLower.includes('notification') || promptLower.includes('push')) {
    plugins.push("expo-notifications")
  }
  
  // Audio/Video
  if (promptLower.includes('audio') || promptLower.includes('video') || promptLower.includes('media')) {
    plugins.push("expo-av")
  }
  
  // Sensors
  if (promptLower.includes('sensor') || promptLower.includes('accelerometer') || promptLower.includes('fitness')) {
    plugins.push("expo-sensors")
  }
  
  // File system
  if (promptLower.includes('file') || promptLower.includes('document')) {
    plugins.push("expo-document-picker")
    plugins.push("expo-file-system")
  }
  
  // Biometric authentication
  if (promptLower.includes('biometric') || promptLower.includes('fingerprint')) {
    plugins.push("expo-local-authentication")
  }
  
  // Contacts
  if (promptLower.includes('contact')) {
    plugins.push("expo-contacts")
  }
  
  // Calendar
  if (promptLower.includes('calendar')) {
    plugins.push("expo-calendar")
  }
  
  // Barcode scanner
  if (promptLower.includes('barcode') || promptLower.includes('qr')) {
    plugins.push("expo-barcode-scanner")
  }
  
  return plugins
} 