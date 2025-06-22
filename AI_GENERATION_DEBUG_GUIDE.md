# AI Generation Debug Guide

## 🛠️ Troubleshooting AI Generation Issues

This guide helps you debug and fix the **"Failed to generate with base template"** error and other AI generation issues.

## 🔍 Quick Debug Steps

### 1. Check Console Logs
Open your browser's Developer Tools (F12) and check the Console tab. Look for:
- `🚀 Starting generation...` - AI request initiated
- `📡 Connecting to AI API...` - API connection
- `📥 AI response received...` - Response processing
- `🎉 AI Generation complete:` - Success with file count
- `📂 Loading AI-generated files into memfs...` - memfs loading

### 2. Use Debug Button
After generating an app, click the **🔍 Debug memfs** button to see:
- Total files in memfs
- Essential file checks (package.json, app.json)
- File path formats
- Missing files

### 3. Check for Common Issues

#### ❌ No Visual Feedback During Generation
**Problem**: Button click shows no loading spinner or progress
**Solution**: Check browser console for errors, network connectivity

#### ❌ "Failed to generate with base template"
**Problem**: AI generation fails after 5-10 seconds
**Causes**:
- AI API timeout or rate limits
- Invalid AI response format
- memfs loading failure
- Missing essential files

#### ❌ Files Not Visible After Generation
**Problem**: AI completes but no file tree appears
**Causes**:
- Files not loaded into memfs
- React state not updated
- Path format issues (relative vs absolute)

## 📋 Debug Outputs to Look For

### ✅ Successful AI Generation
```
🚀 Starting generation with extended timeout: Create a todo app
📡 Connecting to AI API...
📥 AI response received, processing...
🎉 AI Generation complete: 15 files in 23456ms
📄 Generated files: ["/package.json", "/app.json", "/app/_layout.tsx", ...]
📂 Loading AI-generated files into memfs...
📋 Input file paths: ["package.json", "app.json", "app/_layout.tsx", ...]
  ✓ package.json → /package.json (1234 chars)
  ✓ app.json → /app.json (567 chars)
📂 Final absolute paths: ["/package.json", "/app.json", "/app/_layout.tsx", ...]
🔄 Calling vol.fromJSON...
✅ memfs loaded: 15 files
📋 package.json: ✅
📋 app.json: ✅
✅ AI-generated files successfully loaded into memfs
📄 Auto-selected first file: /package.json
📁 Total files in UI: 15
```

### ❌ Failed AI Generation (API Error)
```
🚀 Starting generation with extended timeout: Create a todo app
📡 Connecting to AI API...
❌ Generation failed: Error: HTTP error! status: 500
```

### ❌ Failed AI Generation (memfs Error)
```
🎉 AI Generation complete: 15 files in 23456ms
📂 Loading AI-generated files into memfs...
❌ Failed to load AI-generated files into memfs
❌ memfs loading error: Error: ...
```

## 🔧 Manual Testing Steps

### 1. Test Base Template Loading
1. Click **Load Base Template** button
2. Should see immediate file tree with React Native files
3. Check console for memfs success logs

### 2. Test AI Generation (Quick Mode)
1. Enter prompt: "Create a simple hello world app"
2. Click **Generate** (6-second timeout)
3. Watch for progress updates
4. Check console for detailed logs

### 3. Test AI Generation (Extended Mode)
1. Enter complex prompt: "Create a todo app with SQLite"
2. Click **Generate (90s timeout)**
3. Should show more progress steps
4. Check final file count and memfs loading

### 4. Use Debug Button
1. After any generation, click **🔍 Debug memfs**
2. Check console output for:
   - Total files in memfs
   - Essential file presence
   - Path format validation

## 🚨 Common Error Patterns

### Pattern 1: Immediate Failure
```
❌ Generation failed: Error: HTTP error! status: 429
```
**Cause**: API rate limiting
**Solution**: Wait and retry, or check API quota

### Pattern 2: memfs Loading Failure
```
🎉 AI Generation complete: 15 files
❌ Failed to load AI-generated files into memfs
❌ Error details: { name: 'TypeError', message: '...' }
```
**Cause**: File format or path issues
**Solution**: Check generated file paths and content

### Pattern 3: No Files Generated
```
🎉 AI Generation complete: 0 files
⚠️ No files provided!
```
**Cause**: AI didn't generate any files
**Solution**: Try different prompt or check AI service

### Pattern 4: Path Format Issues
```
📋 All paths absolute: ❌
📁 Has relative paths: ⚠️
```
**Cause**: AI generated relative paths instead of absolute
**Solution**: Our code should auto-convert, check logs

## 🛡️ Recovery Steps

### If AI Generation Completely Fails:
1. Try loading base template first
2. Check network connectivity
3. Try simpler prompts
4. Use extended timeout mode

### If Files Generate But Don't Show:
1. Click **🔍 Debug memfs** button
2. Check if files are in memfs but UI not updated
3. Try switching between Code/Preview tabs
4. Refresh page and try again

### If memfs Loading Fails:
1. Check console for detailed error logs
2. Verify generated files have valid content
3. Check if paths are properly formatted
4. Try manual base template loading to verify memfs works

## 📞 Getting Help

When reporting issues, include:
1. **Prompt used**: The exact text you entered
2. **Console logs**: All debug output from Developer Tools
3. **Debug button output**: Results from **🔍 Debug memfs**
4. **Browser/environment**: Chrome version, OS, etc.
5. **Steps to reproduce**: Exact sequence that causes the issue

## 🎯 Key Files Modified

- `components/AppBuilder.tsx`: Added visual feedback and memfs integration
- `lib/utils/simple-memfs.ts`: Bulletproof file loading with detailed logging
- `lib/utils/debug-memfs.ts`: Comprehensive debugging utilities
- `app/api/generate/route.ts`: Extended timeout support
- `lib/generators/templates/complete-demo1-template.ts`: **26-file complete Expo template**
- `app/api/ai-stream/route.ts`: Updated to use complete template
- `lib/generators/v0-pipeline.ts`: Updated to use complete template

## ✅ What Should Work Now

1. **Immediate visual feedback** when AI generation starts
2. **Progress updates** during generation
3. **Automatic memfs loading** of AI-generated files
4. **Detailed console logging** for troubleshooting
5. **Debug button** for manual inspection
6. **Error recovery** with clear error messages
7. **File tree updates** after successful generation
8. **Complete Expo template** with all 26 essential files (components, hooks, constants)
9. **Consistent client/server behavior** using identical templates 