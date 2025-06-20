import { GeneratedFile } from '@/types'

export function generateAppTemplate(prompt: string): GeneratedFile {
  const appContent = `import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import your screens here
import HomeScreen from './screens/HomeScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#2563eb',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: 'My App' }}
          />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});`

  return {
    path: 'App.tsx',
    content: appContent,
    type: 'tsx'
  }
}

export function generateHomeScreen(): GeneratedFile {
  const homeScreenContent = `import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.header}
      >
        <Text style={styles.title}>Welcome to Your App</Text>
        <Text style={styles.subtitle}>
          Generated with NativeForge
        </Text>
      </LinearGradient>
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Features</Text>
        
        <View style={styles.featureGrid}>
          <TouchableOpacity style={styles.featureCard}>
            <Text style={styles.featureTitle}>📱 Native Ready</Text>
            <Text style={styles.featureDescription}>
              Built with Expo for seamless native functionality
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.featureCard}>
            <Text style={styles.featureTitle}>🚀 Fast Development</Text>
            <Text style={styles.featureDescription}>
              AI-generated code with modern React Native patterns
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.featureCard}>
            <Text style={styles.featureTitle}>🎨 Beautiful UI</Text>
            <Text style={styles.featureDescription}>
              Clean, responsive design that works on all devices
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.featureCard}>
            <Text style={styles.featureTitle}>⚡ High Performance</Text>
            <Text style={styles.featureDescription}>
              Optimized for speed and smooth animations
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});`

  return {
    path: 'screens/HomeScreen.tsx',
    content: homeScreenContent,
    type: 'tsx'
  }
} 