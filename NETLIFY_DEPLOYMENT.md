# Netlify Deployment Guide for React Native V0 Clone

## Fixed Configuration Issues

✅ **TOML Syntax Fixed**: The `netlify.toml` file has been cleaned and properly formatted
✅ **Node Version Set**: Using Node.js 20 via `.nvmrc` and `netlify.toml`
✅ **Build Process Tested**: Local build works perfectly
✅ **Function Timeouts**: Set to 30 seconds for AI generation
✅ **Memory Allocation**: 1024MB for handling large AI responses

## Required Environment Variables in Netlify

Go to your Netlify site dashboard → Site settings → Environment variables and add:

### 🔑 Essential Variables
```bash
MISTRAL_API_KEY=your_mistral_api_key_here
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/v0-flutter
```

### 🔐 Security Variables
```bash
CLERK_WEBHOOK_SECRET=whsec_...
NEXTAUTH_SECRET=your-strong-secret-here
NEXTAUTH_URL=https://your-site.netlify.app
```

### 📱 Optional (for EAS builds)
```bash
EXPO_TOKEN=your_expo_access_token
EAS_PROJECT_ID=your_project_id
```

## Deployment Steps

1. **Push to GitHub**: Ensure all changes are committed and pushed
2. **Set Environment Variables**: Add all required variables in Netlify dashboard
3. **Deploy**: Netlify will automatically build and deploy

## Build Configuration

The `netlify.toml` is configured with:
- **Build Command**: `npm run build`
- **Publish Directory**: `.next`
- **Node Version**: 20
- **Function Timeout**: 30 seconds
- **Function Memory**: 1024MB
- **Next.js Plugin**: Automatically handles serverless functions

## Common Issues & Solutions

### ❌ "react-scripts" Error
- **Cause**: Misleading error message
- **Solution**: This is a Next.js project, not Create React App. The error is likely from a different part of the build process.

### ❌ TOML Parsing Error
- **Cause**: Syntax errors in `netlify.toml`
- **Solution**: ✅ Fixed - clean TOML format now used

### ❌ Function Timeout
- **Cause**: AI generation takes time
- **Solution**: ✅ Set to 30 seconds in `netlify.toml`

### ❌ Memory Issues
- **Cause**: Large AI responses
- **Solution**: ✅ Increased to 1024MB in `netlify.toml`

## Verification

After deployment, test these endpoints:
- `https://your-site.netlify.app/` - Main app
- `https://your-site.netlify.app/api/diagnose` - API health check
- `https://your-site.netlify.app/api/netlify-status` - Netlify status
- `https://your-site.netlify.app/builder` - React Native generator

## Performance Optimizations

The app includes several Netlify-specific optimizations:
- Reduced AI timeouts (20s production, 30s dev)
- Smaller token limits (6000 instead of 8000)
- Enhanced error handling for serverless environment
- Retry logic with shorter waits
- Fallback templates when AI fails

## Support

If deployment still fails:
1. Check Netlify function logs
2. Verify all environment variables are set
3. Ensure Mistral API key is valid
4. Check MongoDB connection string

The app should now deploy successfully to Netlify! 🚀 