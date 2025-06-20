export const APP_NAME = 'NativeForge'
export const APP_DESCRIPTION = 'AI-Powered React Native App Builder'

export const MISTRAL_MODEL = 'mistral-large-latest'
export const MAX_TOKENS = 8000
export const GENERATION_TEMPERATURE = 0.1

export const SUPPORTED_FILE_TYPES = ['tsx', 'ts', 'js', 'json', 'md', 'txt'] as const

export const EXPO_FEATURES = {
  CAMERA: 'expo-camera',
  LOCATION: 'expo-location', 
  NOTIFICATIONS: 'expo-notifications',
  STORAGE: '@react-native-async-storage/async-storage',
  SENSORS: 'expo-sensors',
  FILE_SYSTEM: 'expo-file-system',
  MAPS: 'react-native-maps'
} as const

export const BUILD_PLATFORMS = ['android', 'ios'] as const

export const DEFAULT_EXPO_VERSION = '~50.0.0'
export const DEFAULT_REACT_VERSION = '18.2.0'
export const DEFAULT_RN_VERSION = '0.73.0' 