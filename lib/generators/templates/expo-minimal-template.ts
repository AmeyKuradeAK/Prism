export function generateMinimalExpoTemplate(appName: string = 'MyExpoApp'): { [key: string]: string } {
  const files: { [key: string]: string } = {}
  const slug = appName.toLowerCase().replace(/[^a-z0-9-]/g, '-')

  // Only essential configuration files - let AI create everything else
  files['package.json'] = JSON.stringify({
    "name": slug,
    "main": "expo-router/entry",
    "version": "1.0.0",
    "scripts": {
      "start": "expo start",
      "reset-project": "node ./scripts/reset-project.js",
      "android": "expo start --android",
      "ios": "expo start --ios",
      "web": "expo start --web",
      "lint": "expo lint"
    },
    "dependencies": {
      "@expo/vector-icons": "^14.1.0",
      "@react-navigation/bottom-tabs": "^7.3.10",
      "@react-navigation/elements": "^2.3.8",
      "@react-navigation/native": "^7.1.6",
      "expo": "~53.0.12",
      "expo-blur": "~14.1.5",
      "expo-constants": "~17.1.6",
      "expo-font": "~13.3.1",
      "expo-haptics": "~14.1.4",
      "expo-image": "~2.3.0",
      "expo-linking": "~7.1.5",
      "expo-router": "~5.1.0",
      "expo-splash-screen": "~0.30.9",
      "expo-status-bar": "~2.2.3",
      "expo-symbols": "~0.4.5",
      "expo-system-ui": "~5.0.9",
      "expo-web-browser": "~14.2.0",
      "react": "19.0.0",
      "react-dom": "19.0.0",
      "react-native": "0.79.4",
      "react-native-gesture-handler": "~2.24.0",
      "react-native-reanimated": "~3.17.4",
      "react-native-safe-area-context": "5.4.0",
      "react-native-screens": "~4.11.1",
      "react-native-web": "~0.20.0",
      "react-native-webview": "13.13.5"
    },
    "devDependencies": {
      "@babel/core": "^7.25.2",
      "@types/react": "~19.0.10",
      "typescript": "~5.8.3",
      "eslint": "^9.25.0",
      "eslint-config-expo": "~9.2.0"
    },
    "private": true
  }, null, 2)

  // Expo configuration
  files['app.json'] = JSON.stringify({
    "expo": {
      "name": appName,
      "slug": slug,
      "version": "1.0.0",
      "orientation": "portrait",
      "icon": "./assets/images/icon.png",
      "scheme": slug.replace(/-/g, ''),
      "userInterfaceStyle": "automatic",
      "newArchEnabled": true,
      "ios": {
        "supportsTablet": true
      },
      "android": {
        "adaptiveIcon": {
          "foregroundImage": "./assets/images/adaptive-icon.png",
          "backgroundColor": "#ffffff"
        },
        "edgeToEdgeEnabled": true
      },
      "web": {
        "bundler": "metro",
        "output": "static",
        "favicon": "./assets/images/favicon.png"
      },
      "plugins": [
        "expo-router",
        [
          "expo-splash-screen",
          {
            "image": "./assets/images/splash-icon.png",
            "imageWidth": 200,
            "resizeMode": "contain",
            "backgroundColor": "#ffffff"
          }
        ]
      ],
      "experiments": {
        "typedRoutes": true
      }
    }
  }, null, 2)

  // TypeScript configuration
  files['tsconfig.json'] = JSON.stringify({
    "extends": "expo/tsconfig.base",
    "compilerOptions": {
      "strict": true,
      "baseUrl": ".",
      "paths": {
        "@/*": ["./*"]
      }
    }
  }, null, 2)

  // ESLint configuration
  files['eslint.config.js'] = `// https://docs.expo.dev/guides/using-eslint/
module.exports = require('expo/eslint-config/node');`

  // Git ignore
  files['.gitignore'] = `# Learn more https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files

# dependencies
node_modules/

# Expo
.expo/
dist/
web-build/

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local

# typescript
*.tsbuildinfo`

  return files
} 