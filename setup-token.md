# 🔑 Expo Token Setup Guide

## Real EAS Build Integration

This project now uses **REAL EAS Build** instead of mock simulations. To enable building actual APK/IPA files, you need to configure your Expo access token.

## 📋 Quick Setup

1. **Get Your Expo Token**
   - Visit: https://expo.dev/accounts/[your-account]/settings/access-tokens
   - Click "Create Token"
   - Give it a name like "React Native Builder"
   - Copy the token (starts with `expo_`)

2. **Add to Environment Variables**
   ```bash
   # Add to .env.local
   EXPO_TOKEN=expo_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Restart Your Development Server**
   ```bash
   npm run dev
   ```

## 🎯 What This Enables

- **Real APK/IPA Generation**: Actual build files you can install on devices
- **Expo Cloud Infrastructure**: Builds run on Expo's managed build servers
- **Real Build Monitoring**: Live status updates from actual build processes
- **Production Ready**: Same build system used by production React Native apps

## 📱 Build Process

When you click "Build" in the app:

1. **Project Creation**: Your generated files are written to a temporary project
2. **EAS Configuration**: Proper `eas.json` is generated with build profiles
3. **Real EAS Build**: `eas build` command is executed with your token
4. **Live Monitoring**: Real-time status updates from Expo's build servers
5. **Download Links**: Direct links to APK/IPA files when complete

## 🔧 EAS CLI Commands Used

```bash
# Start a build
npx eas-cli build --platform android --profile preview --non-interactive --no-wait --json

# Check build status
npx eas-cli build:view [BUILD_ID] --json
```

## ⚡ Build Profiles

- **Preview**: Fast builds for testing (APK format for Android)
- **Development**: Development client builds
- **Production**: Production-ready builds

## 🚨 Requirements

- **Expo Account**: Free Expo account required
- **EXPO_TOKEN**: Valid access token in environment variables
- **Build Credits**: Expo provides free build credits, then paid plans

## 🆘 Troubleshooting

### "EXPO_TOKEN not configured"
- Make sure you added the token to `.env.local`
- Restart your development server
- Check the token starts with `expo_`

### "Authentication failed"
- Your token might be expired or invalid
- Generate a new token from Expo dashboard
- Ensure the token has the correct permissions

### "Build not found"
- Build might have been canceled or failed
- Check the Expo dashboard for build details
- Build IDs are only valid for active builds

### "EAS CLI not found"
- The system will automatically install EAS CLI
- Make sure you have Node.js and npm installed
- Check your network connection

## 📖 Additional Resources

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Access Token Management](https://docs.expo.dev/accounts/programmatic-access/)
- [Build Configuration](https://docs.expo.dev/build-reference/eas-json/)
- [Expo Status Page](https://status.expo.dev/)

## 🎉 Ready to Build!

Once your token is configured, the "Build" tab will create real Android APK and iOS IPA files that you can download and install on devices. This is the same professional build system used by thousands of production React Native apps!

---

**Note**: The first build might take longer as dependencies are cached. Subsequent builds will be faster. 