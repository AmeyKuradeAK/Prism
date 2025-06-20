# EAS Build Setup Guide

This guide will help you set up real APK and iOS app builds using Expo Application Services (EAS).

## Prerequisites

1. **Expo Account**: Create a free account at [expo.dev](https://expo.dev)
2. **EAS CLI**: Install globally with `npm install -g eas-cli`
3. **Node.js**: Version 16 or higher

## Step 1: Create Expo Account and Get Access Token

1. Go to [expo.dev](https://expo.dev) and create an account
2. Install EAS CLI: `npm install -g eas-cli`
3. Login to your account: `eas login`
4. Get your access token: `eas whoami --json`
5. Copy the `accessToken` value

## Step 2: Configure Environment Variables

Add these to your `.env` file:

```env
# Required for EAS builds
EXPO_TOKEN=your_expo_access_token_here

# Optional but recommended
EAS_PROJECT_ID=your_project_id_here
EAS_ORGANIZATION=your_organization_here
```

## Step 3: Install Required Dependencies

The following packages are already included in package.json:

```bash
npm install @expo/cli eas-cli @expo/config @expo/prebuild-config
```

## Step 4: Build Types Available

### Android APK (Free)
- **Profile**: `preview`
- **Output**: APK file for direct installation
- **Requirements**: None (uses Expo's free build minutes)
- **Time**: 5-15 minutes

### iOS IPA (Requires Apple Developer Account)
- **Profile**: `preview` or `production`
- **Output**: IPA file for TestFlight or App Store
- **Requirements**: Apple Developer Program ($99/year)
- **Time**: 10-20 minutes

### Production Builds
- **Android**: App Bundle (AAB) for Google Play Store
- **iOS**: Optimized IPA for App Store submission

## Step 5: Understanding Build Profiles

The system uses these EAS build profiles:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

## Step 6: How It Works

1. **Generate App**: Use the AI to create your React Native app
2. **Click Build**: Choose Android, iOS, or both platforms
3. **EAS Processing**: 
   - Creates temporary Expo project
   - Uploads to EAS Build servers
   - Compiles native apps in the cloud
   - Provides download links

## Step 7: Build Process Flow

```
User clicks "Build" → Platform selection → EAS Build starts
    ↓
Temporary project creation → File upload → Cloud compilation
    ↓
Native app generation → Quality checks → Download ready
```

## Step 8: Troubleshooting

### Common Issues:

1. **"EAS CLI not installed"**
   ```bash
   npm install -g eas-cli
   ```

2. **"EXPO_TOKEN required"**
   - Add your token to `.env` file
   - Restart the development server

3. **"Failed to authenticate"**
   - Check if token is valid: `eas whoami`
   - Generate new token if expired

4. **iOS build fails**
   - Ensure you have Apple Developer account
   - Check bundle identifier conflicts

## Step 9: Free vs Paid Features

### Free Tier (Expo)
- ✅ Android APK builds
- ✅ 30 builds per month
- ✅ Basic build logs
- ❌ iOS builds (requires Apple Developer)

### Paid Tier (Apple Developer + Expo Pro)
- ✅ Unlimited Android builds
- ✅ iOS IPA builds
- ✅ App Store submission
- ✅ Advanced build features

## Step 10: Production Deployment

For production apps:

1. **Google Play Store**:
   - Use `production` profile
   - Generates AAB file
   - Upload to Play Console

2. **Apple App Store**:
   - Use `production` profile
   - Generates IPA file
   - Upload to App Store Connect

## Security Notes

- Never commit your `EXPO_TOKEN` to version control
- Use environment variables in production
- Rotate tokens regularly
- Use organization accounts for team projects

## Build Monitoring

The app provides real-time build monitoring:
- Live logs from EAS Build
- Progress indicators
- Download links when complete
- Error handling and retry options

## Next Steps

1. Set up your Expo account
2. Add the token to `.env`
3. Generate your first app
4. Click "Build" and select a platform
5. Monitor the build progress
6. Download your APK/IPA when ready!

## Support

For EAS Build issues:
- [Expo Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Build Troubleshooting](https://docs.expo.dev/build/troubleshooting/)
- [Expo Discord](https://discord.gg/expo)

For Prism app issues:
- Check the console logs
- Ensure all environment variables are set
- Verify your Expo token is valid 