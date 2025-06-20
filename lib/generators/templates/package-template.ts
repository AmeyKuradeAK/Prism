import { GeneratedFile } from '@/types'

export function generatePackageJson(prompt: string): GeneratedFile {
  // Extract app name from prompt or use default
  const appName = extractAppName(prompt) || 'my-expo-app'
  
  const packageJson = {
    name: appName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    version: "1.0.0",
    main: "node_modules/expo/AppEntry.js",
    scripts: {
      start: "expo start",
      android: "expo start --android",
      ios: "expo start --ios",
      web: "expo start --web",
      build: "expo build",
      "build:android": "expo build:android",
      "build:ios": "expo build:ios",
      eject: "expo eject",
      test: "jest"
    },
    dependencies: {
      "expo": "~53.0.0",
      "expo-status-bar": "~2.0.0",
      "react": "18.3.1",
      "react-native": "0.76.0",
      "expo-router": "~4.0.0",
      "@react-navigation/native": "^7.0.0",
      "@react-navigation/stack": "^7.0.0",
      "react-native-screens": "~4.0.0",
      "react-native-safe-area-context": "4.12.0",
      "react-native-gesture-handler": "~2.20.0",
      "expo-linear-gradient": "~14.0.0",
      "@react-native-async-storage/async-storage": "2.0.0",
      "react-native-reanimated": "~3.16.0",
      "@expo/vector-icons": "^14.0.0",
      ...getConditionalDependencies(prompt)
    },
    devDependencies: {
      "@babel/core": "^7.20.0",
      "@types/react": "~18.2.45",
      "@types/react-native": "~0.73.0",
      "typescript": "^5.1.3",
      "jest": "^29.2.1",
      "@types/jest": "^29.5.5"
    },
    keywords: ["expo", "react-native", "mobile-app"],
    author: "",
    license: "MIT",
    bugs: {
      url: "https://github.com/your-username/your-repo/issues"
    },
    homepage: "https://github.com/your-username/your-repo#readme"
  }

  return {
    path: 'package.json',
    content: JSON.stringify(packageJson, null, 2),
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

function getConditionalDependencies(prompt: string): Record<string, string> {
  const deps: Record<string, string> = {}
  const promptLower = prompt.toLowerCase()
  
  // Camera functionality
  if (promptLower.includes('camera') || promptLower.includes('photo') || promptLower.includes('image')) {
    deps['expo-camera'] = '~16.0.0'
    deps['expo-image-picker'] = '~16.0.0'
    deps['expo-media-library'] = '~17.0.0'
  }
  
  // Location/GPS functionality
  if (promptLower.includes('location') || promptLower.includes('gps') || promptLower.includes('map')) {
    deps['expo-location'] = '~18.0.0'
    deps['react-native-maps'] = '1.18.0'
  }
  
  // Push notifications
  if (promptLower.includes('notification') || promptLower.includes('push') || promptLower.includes('alert')) {
    deps['expo-notifications'] = '~0.29.0'
    deps['expo-device'] = '~7.0.0'
  }
  
  // Sensors (accelerometer, gyroscope, etc.)
  if (promptLower.includes('sensor') || promptLower.includes('accelerometer') || promptLower.includes('step') || promptLower.includes('fitness')) {
    deps['expo-sensors'] = '~12.8.1'
    deps['expo-accelerometer'] = '~12.8.1'
    deps['expo-gyroscope'] = '~12.8.1'
    deps['expo-magnetometer'] = '~12.8.1'
  }
  
  // Audio/Sound
  if (promptLower.includes('audio') || promptLower.includes('sound') || promptLower.includes('music') || promptLower.includes('player')) {
    deps['expo-av'] = '~13.10.6'
  }
  
  // File system operations
  if (promptLower.includes('file') || promptLower.includes('download') || promptLower.includes('upload')) {
    deps['expo-file-system'] = '~16.0.9'
    deps['expo-document-picker'] = '~11.10.1'
  }
  
  // Biometric authentication
  if (promptLower.includes('biometric') || promptLower.includes('fingerprint') || promptLower.includes('face id')) {
    deps['expo-local-authentication'] = '~13.8.0'
  }
  
  // Contacts
  if (promptLower.includes('contact') || promptLower.includes('address book')) {
    deps['expo-contacts'] = '~12.8.1'
  }
  
  // Calendar
  if (promptLower.includes('calendar') || promptLower.includes('event') || promptLower.includes('schedule')) {
    deps['expo-calendar'] = '~12.8.1'
  }
  
  // Barcode/QR scanning
  if (promptLower.includes('barcode') || promptLower.includes('qr') || promptLower.includes('scan')) {
    deps['expo-barcode-scanner'] = '~12.9.3'
  }
  
  // Social sharing
  if (promptLower.includes('share') || promptLower.includes('social')) {
    deps['expo-sharing'] = '~11.10.0'
  }
  
  // Charts/Graphs
  if (promptLower.includes('chart') || promptLower.includes('graph') || promptLower.includes('analytics')) {
    deps['react-native-chart-kit'] = '^6.12.0'
    deps['react-native-svg'] = '14.1.0'
  }
  
  // Animation libraries
  if (promptLower.includes('animation') || promptLower.includes('gesture')) {
    deps['react-native-reanimated'] = '~3.6.2'
  }
  
  // Vector icons
  if (promptLower.includes('icon')) {
    deps['@expo/vector-icons'] = '^14.0.0'
  }
  
  return deps
} 