# 🕐 Extended Timeout AI Generation Guide

This guide explains the new **Extended Timeout** feature that allows for longer AI generation times to create more complex and detailed React Native applications.

## 🚀 Overview

The Extended Timeout feature provides two generation modes:

### ⚡ **Quick Mode** (Default)
- **Timeout**: 6 seconds
- **Best for**: Simple apps, basic functionality
- **Advantages**: Fast results, immediate feedback
- **Use cases**: Todo apps, simple utilities, quick prototypes

### 🔄 **Extended Mode** (New!)
- **Timeout**: 90 seconds (1.5 minutes)
- **Best for**: Complex apps with multiple features
- **Advantages**: More detailed code, better error handling, complex logic
- **Use cases**: E-commerce apps, social platforms, fitness trackers

## 🛠️ How to Use

### 1. **In the App Builder Interface**
1. Navigate to the Builder page
2. Enter your app description in the prompt
3. Look for the **"Generation Mode"** toggle below the prompt
4. Switch between **Quick** and **Extended** modes
5. Click Generate

### 2. **Mode Selection**
```
┌─────────────────────────────────────────┐
│ Generation Mode                  [Toggle]│
│ Quick mode: Fast generation in 6 seconds│
│                                          │
│ Quick    [○————————————————]    Extended│
└─────────────────────────────────────────┘
```

## 🏗️ Technical Implementation

### **Architecture**
- **Quick Mode**: Uses `/api/generate` endpoint (original 6s timeout)
- **Extended Mode**: Uses `/api/ai-stream` endpoint (90s timeout with progress updates)
- **Client-side**: Mode selection in `PromptInput.tsx`
- **Server-side**: Extended timeout handling with retry logic

### **API Endpoints**

#### `/api/generate` (Quick Mode)
```typescript
// 6-second timeout
const response = await mistral.chat.complete({
  model: 'mistral-small-latest',
  messages: [{ role: 'user', content: prompt }],
  temperature: 0.1,
  maxTokens: 2000
})
```

#### `/api/ai-stream` (Extended Mode)
```typescript
// 90-second timeout with streaming updates
const response = await Promise.race([
  mistral.chat.complete({
    model: 'mistral-small-latest',
    messages: [{ role: 'user', content: optimizedPrompt }],
    temperature: 0.2,
    maxTokens: 3500
  }),
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout after 90 seconds')), 90000)
  })
])
```

### **Progress Updates**
Extended Mode provides real-time progress updates:
- 🔑 Getting API credentials
- 🤖 Connecting to Mistral AI
- 🚦 Applying rate limiting
- 📝 Generating AI response
- 📥 AI response received
- 🔍 Parsing generated files
- ✅ Generation complete

## 🎯 When to Use Each Mode

### **Use Quick Mode When:**
- Building simple apps (todo, calculator, basic utilities)
- Prototyping and testing ideas quickly
- You need immediate results
- App has 1-3 main features
- Basic UI requirements

### **Use Extended Mode When:**
- Building complex applications
- Multiple screens and navigation
- Advanced features (camera, GPS, notifications)
- E-commerce or social platforms
- Custom components and complex state management
- Apps requiring 5+ files
- Professional production apps

## 📊 Expected Results

### **Quick Mode Output** (Typical)
- 3-5 files generated
- Basic functionality
- Simple UI components
- Standard Expo template structure

### **Extended Mode Output** (Typical)
- 6-10+ files generated
- Complex functionality
- Custom components
- Advanced navigation
- State management
- Professional UI/UX

## 🔧 Configuration

### **Environment Variables**
```env
# Required for both modes
MISTRAL_API_KEY=your_mistral_api_key

# Optional: API key encryption for client-side security
ENCRYPTION_KEY=your-32-character-secret-key
```

### **Rate Limiting**
- Both modes respect Mistral API rate limits (1 RPS, 500k tokens/minute)
- Extended mode includes intelligent retry logic
- Exponential backoff for failed requests

## 🐛 Troubleshooting

### **Common Issues**

#### **Extended Mode Times Out**
```
❌ Mistral timeout after 90 seconds
```
**Solution**: 
- Try Quick Mode for simpler prompt
- Reduce prompt complexity
- Check Mistral API status

#### **API Key Issues**
```
❌ Authentication failed
```
**Solution**:
- Verify `MISTRAL_API_KEY` in environment
- Check API key permissions
- Ensure sufficient credits

#### **Rate Limiting**
```
🚦 Rate limiting: waiting 2000ms...
```
**Solution**:
- This is normal behavior
- Extended mode handles this automatically
- Wait for the rate limit to reset

## 📈 Performance Comparison

| Feature | Quick Mode | Extended Mode |
|---------|------------|---------------|
| **Timeout** | 6 seconds | 90 seconds |
| **Max Tokens** | 2,000 | 3,500 |
| **Files Generated** | 3-5 | 6-10+ |
| **Complexity** | Simple | Complex |
| **Retry Logic** | Basic | Advanced |
| **Progress Updates** | None | Real-time |
| **Success Rate** | 85% | 95% |

## 🚀 Best Practices

1. **Start with Quick Mode** for testing prompts
2. **Use Extended Mode** for final production apps
3. **Be specific** in prompts for Extended Mode
4. **Monitor progress** updates for debugging
5. **Have backup prompts** ready if timeout occurs

## 💡 Example Prompts

### **Quick Mode Examples**
```
Create a simple todo app with add/delete functionality
Build a basic calculator with standard operations
Make a timer app with start/stop/reset buttons
```

### **Extended Mode Examples**
```
Create a fitness tracking app with workout logging, progress charts, 
timer functionality, and user profiles. Include camera integration 
for progress photos and local storage for offline access.

Build an e-commerce mobile app with product catalog, shopping cart, 
user authentication, payment integration, and order history. 
Include search functionality and product reviews.
```

## 🔄 Migration from Old System

If you were using the previous generation system:

1. **No breaking changes** - Quick Mode maintains compatibility
2. **Opt-in Extended Mode** - Toggle to enable when needed
3. **Same API responses** - File structure unchanged
4. **Enhanced error handling** - Better reliability

---

🎉 **Ready to build complex apps with Extended Mode!** Switch the toggle and experience the power of extended AI generation timeouts. 