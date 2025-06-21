import { GeneratedFile } from '@/types'

export function generateExpoBaseTemplate(appName: string = 'MyExpoApp'): { [key: string]: string } {
  const files: { [key: string]: string } = {}
  const slug = appName.toLowerCase().replace(/[^a-z0-9-]/g, '-')

  // Package.json - Modern Expo with latest dependencies
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

  // App.json - Expo configuration
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

  // Main app layout
  files['app/_layout.tsx'] = `import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
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

  // Not found screen
  files['app/+not-found.tsx'] = `import { Link, Stack } from 'expo-router';
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

  // Tabs layout
  files['app/(tabs)/_layout.tsx'] = `import { Tabs } from 'expo-router';
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

  // Home screen (index) - CLEAN, NO EXAMPLES
  files['app/(tabs)/index.tsx'] = `import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<ThemedView style={styles.headerImage} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">${appName}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText>Welcome to your React Native app!</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    backgroundColor: '#A1CEDC',
    height: 178,
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
});`

  // Explore screen - CLEAN, NO EXAMPLES  
  files['app/(tabs)/explore.tsx'] = `import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ExploreScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<ThemedView style={styles.headerImage} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>
      <ThemedText>This screen is ready for your content.</ThemedText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    backgroundColor: '#D0D0D0',
    height: 178,
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});`

  // Add all the components from demo-1 structure
  files['components/Collapsible.tsx'] = `import Ionicons from '@expo/vector-icons/Ionicons';
import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
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
        <Ionicons
          name={isOpen ? 'chevron-down' : 'chevron-forward-outline'}
          size={18}
          color={Colors[theme].icon}
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

  files['components/ExternalLink.tsx'] = `import { Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform } from 'react-native';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

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

  files['components/HapticTab.tsx'] = `import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
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

  files['components/HelloWave.tsx'] = `import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';

export function HelloWave() {
  const rotationAnimation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: \`\${rotationAnimation.value}deg\` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText
        style={styles.text}
        onPress={() => {
          rotationAnimation.value = withRepeat(
            withSequence(withTiming(25, { duration: 150 }), withTiming(0, { duration: 150 })),
            4 // Run the animation 4 times
          );
        }}>
        👋
      </ThemedText>
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

  files['components/ParallaxScrollView.tsx'] = `import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';

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
      <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16}>
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

  files['components/ThemedText.tsx'] = `import { Text, type TextProps, StyleSheet } from 'react-native';

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

  files['components/ThemedView.tsx'] = `import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}`

  // UI Components
  files['components/ui/IconSymbol.tsx'] = `import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SFSymbol } from 'expo-symbols';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'paperplane.fill': 'send',
} as Partial<
  Record<
    SFSymbol,
    React.ComponentProps<typeof MaterialIcons>['name']
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms.
 *
 * Icon \`name\`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}`

  files['components/ui/TabBarBackground.tsx'] = `import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

export default function TabBarBackground() {
  return <BlurView tint="systemChromeMaterialLight" intensity={100} style={StyleSheet.absoluteFill} />;
}`

  files['components/ui/IconSymbol.ios.tsx'] = `import { SymbolView, type SymbolViewProps, type SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

export type IconSymbolName = SymbolViewProps['name'];

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: IconSymbolName;
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

  // Constants
  files['constants/Colors.ts'] = `/**
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

  // Hooks
  files['hooks/useColorScheme.ts'] = `import { useColorScheme as _useColorScheme } from 'react-native';

export function useColorScheme() {
  return _useColorScheme();
}`

  files['hooks/useColorScheme.web.ts'] = `// NOTE: The default React Native styling doesn't support server rendering.
// Server rendered styles should not change between the first render of the HTML
// and the first render on the client. Typically, web developers will use CSS media queries
// to render different styles on the client and server, or use a library like Nativewind.
export function useColorScheme() {
  return 'light';
}`

  files['hooks/useThemeColor.ts'] = `/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from './useColorScheme';
import { Colors } from '@/constants/Colors';

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

  // Scripts
  files['scripts/reset-project.js'] = `const fs = require('fs');
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

  // README
  files['README.md'] = `# ${appName}

This is an [Expo](https://expo.dev) project created with [\`create-expo-app\`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   \`\`\`bash
   npm install
   \`\`\`

2. Start the app

   \`\`\`bash
    npx expo start
   \`\`\`

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

\`\`\`bash
npm run reset-project
\`\`\`

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.`

  return files
} 