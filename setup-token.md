# 🔑 Get Your Expo Access Token

## Step-by-Step Instructions

### 1. **Open Expo Dashboard**
Visit: https://expo.dev/accounts/ameykuradeak/settings/access-tokens

### 2. **Create New Token**
- Click **"Create Token"** button
- **Name**: `Prism App Builder`
- **Expiration**: Choose your preference (recommend 90 days or No expiration)
- **Permissions**: Select **"All permissions"** 

### 3. **Copy Token**
- Click **"Create"**
- **IMPORTANT**: Copy the token immediately (it won't be shown again)
- It should look like: `expo_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 4. **Add to Environment**
- Open your `.env` file
- Add this line: `EXPO_TOKEN=your_copied_token_here`
- Save the file

### 5. **Restart Development Server**
```bash
npm run dev
```

### 6. **Test Build**
1. Generate an app in Prism
2. Click "Build" 
3. Select "Android APK"
4. Monitor real-time build progress!

## Alternative: Use Environment Variable Directly

If you prefer, you can also set the token as a system environment variable:

**Windows:**
```bash
setx EXPO_TOKEN "your_token_here"
```

**macOS/Linux:**
```bash
export EXPO_TOKEN="your_token_here"
```

## Troubleshooting

### "EXPO_TOKEN required" Error
- Ensure token is correctly added to `.env`
- Restart the development server
- Check for typos in variable name

### "Failed to authenticate" Error  
- Token may be expired - create a new one
- Ensure token has correct permissions
- Try logging out and back in: `eas logout && eas login`

### Token Not Working
- Verify the token on Expo dashboard
- Make sure it has "Build" permissions
- Check if it's expired

## What Happens Next?

Once your token is set up:
- ✅ Real Android APK builds (5-15 minutes)
- ✅ Real iOS IPA builds (10-20 minutes, requires Apple Developer)
- ✅ Live build monitoring with logs
- ✅ Direct download links for compiled apps
- ✅ Production-ready mobile applications

Your apps will be built on Expo's cloud infrastructure and you'll get real, installable APK and IPA files! 