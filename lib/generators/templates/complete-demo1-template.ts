// COMPLETE Auto-generated from demo-1 directory
// This template matches the EXACT working structure of demo-1 with ALL components

export function generateCompleteDemo1Template(appName: string = 'MyExpoApp'): { [key: string]: string } {
  const files: { [key: string]: string } = {}
  const slug = appName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  
  // ✅ MAIN ENTRY POINT - App.tsx (ROOT LEVEL - CRITICAL!)
  files['/App.tsx'] = `import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded] = useFonts({
    SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
`

  // ✅ PACKAGE.JSON - Latest Expo SDK 53
  files['/package.json'] = JSON.stringify({
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

  // ✅ APP.JSON - Complete Expo configuration
  files['/app.json'] = JSON.stringify({
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

  // ✅ Configuration Files
  files['/tsconfig.json'] = JSON.stringify({
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
      "baseUrl": ".",
    "paths": {
        "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
  }, null, 2)

  files['/babel.config.js'] = `module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin'
    ]
  };
};`

  files['/metro.config.js'] = `const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable New Architecture
config.resolver.unstable_enablePackageExports = true;

module.exports = config;`

  files['/eslint.config.js'] = `// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);`

  // ✅ ASSETS FOLDER STRUCTURE
  files['/assets/index.ts'] = `// Asset exports for better organization
export { default as PlaceholderImage } from './placeholder.jpg';
export { default as PlaceholderLogo } from './placeholder-logo.png';
export { default as PlaceholderUser } from './placeholder-user.jpg';

// Image assets
export const images = {
  placeholder: require('./placeholder.jpg'),
  placeholderLogo: require('./placeholder-logo.png'),
  placeholderUser: require('./placeholder-user.jpg'),
  icon: require('./images/icon.png'),
  adaptiveIcon: require('./images/adaptive-icon.png'),
  favicon: require('./images/favicon.png'),
  splashIcon: require('./images/splash-icon.png'),
  reactLogo: require('./images/react-logo.png'),
};`

  files['/assets/README.md'] = `# Assets

This directory contains all the static assets for your Expo app.

## Structure

- \`images/\` - App icons, splash screens, and other images
- \`fonts/\` - Custom fonts (TTF, OTF files)
- \`placeholder.*\` - Development placeholder assets

## Usage

Import assets using:

\`\`\`typescript
import { images } from '@/assets';
// or
const logo = require('@/assets/images/icon.png');
\`\`\`

## Image Guidelines

- **App Icon**: 1024x1024px PNG
- **Adaptive Icon**: 1024x1024px PNG (Android)
- **Splash Screen**: Match your app icon design
- **Favicon**: 32x32px PNG (Web)
`

  // Placeholder assets (base64 encoded minimal images)
  files['/assets/placeholder.svg'] = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f0f0f0"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">
    Placeholder Image
  </text>
</svg>`

  files['/assets/placeholder-logo.svg'] = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="#007AFF"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="white">
    ${appName.charAt(0).toUpperCase()}
  </text>
</svg>`

  // Image assets - minimal placeholders
  files['/assets/images/icon.png'] = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
  files['/assets/images/adaptive-icon.png'] = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
  files['/assets/images/favicon.png'] = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
  files['/assets/images/splash-icon.png'] = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
  files['/assets/images/react-logo.png'] = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
  files['/assets/images/react-logo@2x.png'] = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
  files['/assets/images/react-logo@3x.png'] = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
  files['/assets/images/partial-react-logo.png'] = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`

  // Font assets
  files['/assets/fonts/SpaceMono-Regular.ttf'] = `# SpaceMono Font
# This would be the actual TTF file in a real project
# For this template, we'll use a placeholder comment`

  // ✅ SCRIPTS FOLDER
  files['/scripts/reset-project.js'] = `const fs = require('fs');
const path = require('path');

const root = process.cwd();
const oldDirPath = path.join(root, 'app');
const newDirPath = path.join(root, 'app-example');
const newAppDirPath = path.join(root, 'app');

const indexContent = \`import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
\`;

async function resetProject() {
  try {
    // Check if app directory exists
    if (fs.existsSync(oldDirPath)) {
      // Rename existing app directory to app-example
      fs.renameSync(oldDirPath, newDirPath);
      console.log('Renamed existing "app" directory to "app-example".');
    }

    // Create new app directory
    fs.mkdirSync(newAppDirPath, { recursive: true });

    // Create index.tsx
    fs.writeFileSync(path.join(newAppDirPath, 'index.tsx'), indexContent);

    console.log('Project has been reset successfully!');
    console.log('You can now start building your app in the "app" directory.');
    console.log('The previous app has been saved in "app-example".');
  } catch (error) {
    console.error('Error resetting project:', error);
  }
}

resetProject();`

  // ✅ ENHANCED CONFIGURATION FILES (Essential for Production)
  
  // Enhanced .gitignore - Complete and comprehensive
  files['/.gitignore'] = `# Learn more https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files

# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Expo
.expo/
dist/
web-build/
expo-env.d.ts

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.hprof

# Metro
.metro-health-check*

# Debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# Local env files
.env*.local
.env

# TypeScript
*.tsbuildinfo

# VS Code
.vscode/

# Temporary folders
tmp/
temp/

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?`

  // expo-env.d.ts - TypeScript environment declarations
  files['/expo-env.d.ts'] = `/// <reference types="expo/types" />

// NOTE: This file should not be edited and should be in your .gitignore`

  // Enhanced metro.config.js with better configuration
  files['/metro.config.js'] = `const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable New Architecture support
config.resolver.unstable_enablePackageExports = true;

// Add support for additional file extensions
config.resolver.assetExts.push(
  // Add asset extensions
  'bin',
  'txt',
  'jpg',
  'png',
  'json',
  'svg'
);

config.resolver.sourceExts.push(
  // Add source extensions
  'jsx',
  'js',
  'ts',
  'tsx',
  'json'
);

// Configure transformer for better performance
config.transformer.minifierConfig = {
  // Configure minification
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Enable symlinks for better monorepo support
config.resolver.unstable_enableSymlinks = true;

module.exports = config;`

  // Enhanced babel.config.js with additional plugins
  files['/babel.config.js'] = `module.exports = function(api) {
  api.cache(true);
  
  return {
    presets: [
      ['babel-preset-expo', { 
        // Enable New Architecture
        unstable_transformProfile: 'hermes-stable',
      }]
    ],
    plugins: [
      // React Native Reanimated plugin (must be last)
      'react-native-reanimated/plugin',
    ],
    env: {
      production: {
        plugins: [
          // Add production-specific optimizations
          ['transform-remove-console', { exclude: ['error', 'warn'] }],
        ],
      },
    },
  };
};`

  // Enhanced TypeScript configuration
  files['/tsconfig.json'] = JSON.stringify({
    "extends": "expo/tsconfig.base",
    "compilerOptions": {
      "strict": true,
      "baseUrl": ".",
      "paths": {
        "@/*": ["./*"],
        "@/components/*": ["./components/*"],
        "@/hooks/*": ["./hooks/*"],
        "@/constants/*": ["./constants/*"],
        "@/assets/*": ["./assets/*"]
      },
      "types": ["expo/types", "react", "react-native"],
      "allowSyntheticDefaultImports": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "resolveJsonModule": true,
      "noEmit": true,
      "jsx": "react-jsx"
    },
    "include": [
      "**/*.ts",
      "**/*.tsx",
      ".expo/types/**/*.ts",
      "expo-env.d.ts"
    ],
    "exclude": [
      "node_modules",
      ".expo",
      "dist",
      "web-build"
    ]
  }, null, 2)

  // Enhanced ESLint configuration with more rules
  files['/eslint.config.js'] = `// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/*',
      '.expo/*',
      'web-build/*',
      'node_modules/*',
      '*.config.js',
    ],
    rules: {
      // Add custom rules for better code quality
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
]);`

  // Prettier configuration for consistent code formatting
  files['/.prettierrc'] = JSON.stringify({
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 100,
    "tabWidth": 2,
    "useTabs": false,
    "bracketSpacing": true,
    "bracketSameLine": false,
    "arrowParens": "avoid"
  }, null, 2)

  // Environment variables template
  files['/.env.example'] = `# Expo
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_APP_NAME=${appName}

# Development
EXPO_USE_FAST_RESOLVER=1

# Add your environment variables here
# Remember to add them to .env.local for development`

  // Enhanced Package.json with additional useful scripts
  const packageJsonWithScripts = JSON.parse(files['/package.json'])
  packageJsonWithScripts.scripts = {
    ...packageJsonWithScripts.scripts,
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "clean": "npx expo install --fix",
    "prebuild": "npx expo prebuild --clean",
    "prebuild:clean": "npx expo prebuild --clean --clear-cache"
  }
  files['/package.json'] = JSON.stringify(packageJsonWithScripts, null, 2)

  // ✅ APP DIRECTORY STRUCTURE (Expo Router v5)
  
  // app/_layout.tsx - Root layout
  files['/app/_layout.tsx'] = `import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}`

  // app/+not-found.tsx
  files['/app/+not-found.tsx'] = `import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">This screen doesn't exist.</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});`

  // app/(tabs)/_layout.tsx - Tabs layout
  files['/app/(tabs)/_layout.tsx'] = `import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}`

  // app/(tabs)/index.tsx - Home screen
  files['/app/(tabs)/index.tsx'] = `import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to ${appName}!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Ready for Development</ThemedText>
        <ThemedText>
          This is a clean Expo Router v5 template with latest Expo SDK 53. Start building your app by editing the files in the <ThemedText type="defaultSemiBold">app/</ThemedText> directory.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">What's Included</ThemedText>
        <ThemedText>
          • Latest Expo SDK 53{'\n'}
          • Expo Router v5 with file-based routing{'\n'}
          • TypeScript configuration{'\n'}
          • Themed components with light/dark mode{'\n'}
          • Asset management system{'\n'}
          • Custom fonts and animations
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});`

  // app/(tabs)/explore.tsx - Explore screen  
  files['/app/(tabs)/explore.tsx'] = `import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>
      <ThemedText>This template includes everything you need to get started with Expo Router v5.</ThemedText>
      
      <Collapsible title="Expo Router v5 Features">
        <ThemedText>
          • <ThemedText type="defaultSemiBold">File-based routing</ThemedText> - Create screens by adding files{'\n'}
          • <ThemedText type="defaultSemiBold">Typed routes</ThemedText> - Full TypeScript support{'\n'}
          • <ThemedText type="defaultSemiBold">Universal</ThemedText> - Works on iOS, Android, and web{'\n'}
          • <ThemedText type="defaultSemiBold">Deep linking</ThemedText> - Built-in URL handling
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more about Expo Router</ThemedText>
        </ExternalLink>
      </Collapsible>
      
      <Collapsible title="Latest Expo SDK 53">
        <ThemedText>
          This template uses the latest Expo SDK 53 with all the newest features and improvements for React Native development.
        </ThemedText>
        <ExternalLink href="https://expo.dev/changelog/2024/12-03-sdk-53">
          <ThemedText type="link">View Expo SDK 53 changelog</ThemedText>
        </ExternalLink>
      </Collapsible>
      
      <Collapsible title="Development Ready">
        <ThemedText>
          Start developing immediately with pre-configured TypeScript, ESLint, and modern React Native patterns. All assets and components are ready to use.
          </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});`

  // ✅ COMPONENTS FOLDER

  // components/Collapsible.tsx
  files['/components/Collapsible.tsx'] = `import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});`

  // components/ExternalLink.tsx
  files['/components/ExternalLink.tsx'] = `import { Href, Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform } from 'react-native';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (event) => {
        if (Platform.OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await openBrowserAsync(href);
        }
      }}
    />
  );
}`

  // components/HapticTab.tsx
  files['/components/HapticTab.tsx'] = `import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}`

  // components/HelloWave.tsx
  files['/components/HelloWave.tsx'] = `import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';

export function HelloWave() {
  const rotationAnimation = useSharedValue(0);

  useEffect(() => {
    rotationAnimation.value = withRepeat(
      withSequence(withTiming(25, { duration: 150 }), withTiming(0, { duration: 150 })),
      4 // Run the animation 4 times
    );
  }, [rotationAnimation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: \`\${rotationAnimation.value}deg\` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={styles.text}>👋</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
});`

  // components/ParallaxScrollView.tsx
  files['/components/ParallaxScrollView.tsx'] = `import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}>
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor[colorScheme] },
            headerAnimatedStyle,
          ]}>
          {headerImage}
        </Animated.View>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});`

  // components/ThemedText.tsx
  files['/components/ThemedText.tsx'] = `import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});`

  // components/ThemedView.tsx
  files['/components/ThemedView.tsx'] = `import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}`

  // ✅ UI COMPONENTS

  // components/ui/IconSymbol.tsx
  files['/components/ui/IconSymbol.tsx'] = `// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon \`name\`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}`

  // components/ui/IconSymbol.ios.tsx
  files['/components/ui/IconSymbol.ios.tsx'] = `import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}`

  // components/ui/TabBarBackground.tsx
  files['/components/ui/TabBarBackground.tsx'] = `// This is a shim for web and Android where the tab bar is generally opaque.
export default undefined;

export function useBottomTabOverflow() {
  return 0;
}`

  // components/ui/TabBarBackground.ios.tsx
  files['/components/ui/TabBarBackground.ios.tsx'] = `import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

export default function BlurTabBarBackground() {
  return (
    <BlurView
      // System chrome material automatically adapts to the system's theme
      // and matches the native tab bar appearance on iOS.
      tint="systemChromeMaterial"
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}`

  // ✅ HOOKS FOLDER

  // hooks/useColorScheme.ts
  files['/hooks/useColorScheme.ts'] = `export { useColorScheme } from 'react-native';`

  // hooks/useColorScheme.web.ts
  files['/hooks/useColorScheme.web.ts'] = `import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}`

  // hooks/useThemeColor.ts
  files['/hooks/useThemeColor.ts'] = `/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}`

  // ✅ CONSTANTS FOLDER

  // constants/Colors.ts
  files['/constants/Colors.ts'] = `/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};`

  // ✅ ADDITIONAL FILES
  
  // .gitignore - Complete and comprehensive
  files['/.gitignore'] = `# Learn more https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files

# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Expo
.expo/
dist/
web-build/
expo-env.d.ts

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.hprof

# Metro
.metro-health-check*

# Debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# Local env files
.env*.local
.env

# TypeScript
*.tsbuildinfo

# VS Code
.vscode/

# Temporary folders
tmp/
temp/

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?`

  // expo-env.d.ts - TypeScript environment declarations
  files['/expo-env.d.ts'] = `/// <reference types="expo/types" />

// NOTE: This file should not be edited and should be in your .gitignore`

  // app.config.ts - Advanced Expo configuration (alternative to app.json)
  files['/app.config.ts'] = `import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: '${appName}',
  slug: '${slug}',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: '${slug.replace(/-/g, '')}',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.${slug.replace(/-/g, '')}.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    edgeToEdgeEnabled: true,
    package: 'com.${slug.replace(/-/g, '')}.app',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png'
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff'
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    // Add any extra configuration here
    eas: {
      projectId: 'your-project-id-here'
    }
  }
});`

  // Enhanced metro.config.js with better configuration
  files['/metro.config.js'] = `const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Enable New Architecture support
config.resolver.unstable_enablePackageExports = true;

// Add support for additional file extensions
config.resolver.assetExts.push(
  // Add asset extensions
  'bin',
  'txt',
  'jpg',
  'png',
  'json',
  'svg'
);

config.resolver.sourceExts.push(
  // Add source extensions
  'jsx',
  'js',
  'ts',
  'tsx',
  'json',
  'svg'
);

// Configure transformer for better performance
config.transformer.minifierConfig = {
  // Configure minification
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Enable symlinks for better monorepo support
config.resolver.unstable_enableSymlinks = true;

// Configure cache for better performance
config.resetCache = false;

module.exports = config;`

  // Enhanced babel.config.js with additional plugins
  files['/babel.config.js'] = `module.exports = function(api) {
  api.cache(true);
  
  return {
    presets: [
      ['babel-preset-expo', { 
        // Enable New Architecture
        unstable_transformProfile: 'hermes-stable',
      }]
    ],
    plugins: [
      // React Native Reanimated plugin (must be last)
      'react-native-reanimated/plugin',
      
      // Add additional plugins for better development experience
      [
        'module-resolver',
        {
          alias: {
            '@': './',
            '@/components': './components',
            '@/hooks': './hooks',
            '@/constants': './constants',
            '@/assets': './assets',
          },
        },
      ],
    ],
    env: {
      production: {
        plugins: [
          // Add production-specific plugins
          'transform-remove-console',
        ],
      },
    },
  };
};`

  // Enhanced TypeScript configuration
  files['/tsconfig.json'] = JSON.stringify({
    "extends": "expo/tsconfig.base",
    "compilerOptions": {
      "strict": true,
      "baseUrl": ".",
      "paths": {
        "@/*": ["./*"],
        "@/components/*": ["./components/*"],
        "@/hooks/*": ["./hooks/*"],
        "@/constants/*": ["./constants/*"],
        "@/assets/*": ["./assets/*"],
        "@/types/*": ["./types/*"]
      },
      "types": ["expo/types", "react", "react-native"],
      "allowSyntheticDefaultImports": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "resolveJsonModule": true,
      "noEmit": true,
      "jsx": "react-jsx"
    },
    "include": [
      "**/*.ts",
      "**/*.tsx",
      ".expo/types/**/*.ts",
      "expo-env.d.ts"
    ],
    "exclude": [
      "node_modules",
      ".expo",
      "dist",
      "web-build"
    ]
  }, null, 2)

  // Enhanced ESLint configuration with more rules
  files['/eslint.config.js'] = `// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/*',
      '.expo/*',
      'web-build/*',
      'node_modules/*',
      '*.config.js',
    ],
    rules: {
      // Add custom rules for better code quality
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
    },
  },
]);`

  // Prettier configuration for consistent code formatting
  files['/.prettierrc'] = JSON.stringify({
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 100,
    "tabWidth": 2,
    "useTabs": false,
    "bracketSpacing": true,
    "bracketSameLine": false,
    "arrowParens": "avoid"
  }, null, 2)

  // .prettierignore
  files['/.prettierignore'] = `# Dependencies
node_modules

# Build outputs
dist
.expo
web-build

# Generated files
*.generated.*
expo-env.d.ts

# Logs
*.log

# OS generated files
.DS_Store
Thumbs.db`

  // .editorconfig for consistent editor settings
  files['/.editorconfig'] = `# EditorConfig is awesome: https://EditorConfig.org

# top-most EditorConfig file
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[*.{json,yml,yaml}]
indent_size = 2`

  // VS Code settings for better development experience
  files['/.vscode/settings.json'] = JSON.stringify({
    "typescript.preferences.includePackageJsonAutoImports": "auto",
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    },
    "files.associations": {
      "*.css": "tailwindcss"
    },
    "emmet.includeLanguages": {
      "typescript": "html",
      "typescriptreact": "html"
    },
    "search.exclude": {
      "**/node_modules": true,
      "**/.expo": true,
      "**/dist": true,
      "**/web-build": true
    }
  }, null, 2)

  // VS Code extensions recommendations
  files['/.vscode/extensions.json'] = JSON.stringify({
    "recommendations": [
      "expo.vscode-expo-tools",
      "ms-vscode.vscode-typescript-next", 
      "esbenp.prettier-vscode",
      "ms-vscode.vscode-eslint",
      "bradlc.vscode-tailwindcss",
      "ms-vscode.vscode-json"
    ]
  }, null, 2)

  // Environment variables template
  files['/.env.example'] = `# Expo
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_APP_NAME=${appName}

# Development
EXPO_USE_FAST_RESOLVER=1

# Add your environment variables here
# Remember to add them to .env.local for development`

  // GitHub Actions workflow for CI/CD
  files['/.github/workflows/build.yml'] = `name: Build and Deploy

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Lint code
        run: npm run lint
        
      - name: Type check
        run: npx tsc --noEmit
        
      - name: Build for web
        run: npx expo export:web
        
      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist`

  // Package.json scripts enhancement
  const enhancedPackageJson = JSON.parse(files['/package.json'])
  enhancedPackageJson.scripts = {
    ...enhancedPackageJson.scripts,
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "clean": "npx expo install --fix",
    "prebuild": "npx expo prebuild --clean",
    "prebuild:clean": "npx expo prebuild --clean --clear-cache"
  }
  files['/package.json'] = JSON.stringify(enhancedPackageJson, null, 2)

  console.log(`✅ Complete Expo template generated: ${Object.keys(files).length} files`)
  console.log('📋 Template includes:')
  console.log('  - App.tsx entry point (ROOT LEVEL)')
  console.log('  - Latest Expo SDK 53 dependencies') 
  console.log('  - Complete app/ directory with routing')
  console.log('  - All components, hooks, constants')
  console.log('  - Assets folder with images and fonts')
  console.log('  - Scripts folder with reset-project.js')
  console.log('  - Configuration files (babel, metro, eslint, tsconfig)')

  return files
}

// Export for compatibility
export { generateCompleteDemo1Template as generateDemo1BaseTemplate }
