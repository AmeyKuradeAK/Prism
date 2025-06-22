# 🌟 Prism - AI-Powered React Native App Builder

**Build production-ready React Native apps with AI in minutes!**

Transform your ideas into real, downloadable mobile apps using advanced AI. Prism generates complete React Native Expo projects with **actual APK and iOS builds** - not just code!

## ✨ What Makes Prism Special?

### 🚀 **Real App Builds** (Not Just Code!)
- **🤖 Android APK** - Download and install directly on devices
- **🍎 iOS IPA** - Deploy to TestFlight and App Store  
- **⚡ EAS Build Integration** - Powered by Expo's cloud infrastructure
- **📱 Both Platforms** - Build for Android and iOS simultaneously

### 🧠 **AI-Powered Generation**
- **Smart Code Generation** - Mistral AI creates production-ready code
- **Dual Generation Modes** - Quick Mode (6s) or Extended Mode (90s) for complex apps
- **Native Features** - Camera, GPS, notifications, storage integration
- **Intelligent Templates** - Fallback system ensures reliable output
- **Context-Aware** - Understands complex app requirements

### 💎 **Professional Developer Experience**
- **v0.dev-Style Interface** - Collapsible sidebar, file explorer, live preview
- **Real-time Build Logs** - Watch your app compile in the cloud
- **Project Management** - Save, version, and share your projects
- **Modern Dark UI** - Beautiful glassmorphism effects and animations

## 🏗️ **Real Build Process**

1. **Generate App** → AI creates complete React Native project
2. **Click Build** → Choose Android, iOS, or both platforms  
3. **Cloud Compilation** → EAS Build servers compile your app
4. **Download & Install** → Get real APK/IPA files ready for deployment

```
User Input → AI Generation → EAS Build → Real Mobile App
    ↓              ↓             ↓              ↓
  Prompt      React Native    Cloud Build    APK/IPA
```

## 🛠️ **Technical Features**

### **Mobile App Generation**
- React Native with Expo SDK 50
- TypeScript support with proper typing
- Native device features (camera, GPS, storage)
- Responsive UI components
- Production-ready architecture

### **Real Build System**
- **EAS Build Integration** - Official Expo cloud builds
- **Platform Selection** - Android APK, iOS IPA, or both
- **Build Profiles** - Development, preview, and production
- **Live Monitoring** - Real-time build logs and progress
- **Download Management** - Direct links to compiled apps

### **Developer Tools**
- File explorer with syntax highlighting
- Live code preview and editing
- Project save/load functionality
- Build history and management
- Error handling and retry logic

## 🚀 **Quick Start**

### 1. **Clone & Install**
```bash
git clone https://github.com/your-username/prism
cd prism
npm install
```

### 2. **Configure Environment**
```bash
cp env.example .env
```

Add your credentials to `.env`:
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication  
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# AI Generation
MISTRAL_API_KEY=your_mistral_api_key

# Real Builds (Required for APK/iOS)
EXPO_TOKEN=your_expo_access_token
```

### 3. **Get Expo Token (For Real Builds)**
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Get your access token
eas whoami --json
```

### 4. **Start Building**
```bash
npm run dev
# → http://localhost:3000
```

## 📱 **Build Your First App**

1. **Open Prism** → Navigate to `/builder`
2. **Describe Your App** → Enter detailed requirements in the sidebar
3. **Generate Code** → AI creates complete React Native project
4. **Build App** → Select platform (Android/iOS) and start build
5. **Download** → Get real APK/IPA files when build completes
6. **Install & Test** → Deploy to devices or app stores

### **Example Apps You Can Build:**
- **Expense Tracker** - Categories, charts, local storage
- **Todo App** - CRUD operations, dark mode, persistence  
- **Social Feed** - Posts, likes, comments, user profiles
- **E-commerce** - Products, cart, checkout, payments
- **Fitness Tracker** - Workouts, progress, charts
- **Chat App** - Real-time messaging, users, groups

## 🏗️ **Build Types Available**

### **Android APK (Free)**
- Direct device installation
- No developer account required
- Uses Expo's free build minutes
- Build time: 5-15 minutes

### **iOS IPA (Requires Apple Developer)**
- TestFlight deployment
- App Store submission ready
- Requires Apple Developer Program ($99/year)
- Build time: 10-20 minutes

### **Production Builds**
- **Android**: App Bundle (AAB) for Play Store
- **iOS**: Optimized IPA for App Store
- Advanced build configurations
- Code signing and optimization

## 🎯 **Architecture**

### **Frontend (Next.js 15)**
- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion animations
- Three.js for 3D elements

### **Backend (Node.js)**
- MongoDB with Mongoose
- Clerk authentication
- Server-Sent Events (SSE)
- RESTful API design

### **AI Integration**
- Mistral AI for code generation
- Smart feature detection
- Fallback template system
- Context-aware prompting

### **Build System**
- EAS Build (Expo Application Services)
- Real cloud compilation
- Multi-platform support
- Live build monitoring

## 🔧 **Development**

### **Project Structure**
```
v0-flutter/
├── app/                    # Next.js app router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API endpoints
│   └── builder/           # App builder page
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   └── AppBuilder.tsx     # Main builder interface
├── lib/                   # Utilities and services
│   ├── database/          # MongoDB models
│   ├── generators/        # AI code generation
│   └── eas-build/         # EAS build service
└── docs/                  # Documentation
```

### **Key Components**
- **AppBuilder.tsx** - Main builder interface with sidebar
- **eas-service.ts** - Real build system integration
- **expo-generator.ts** - AI-powered code generation
- **Dashboard.tsx** - Project management interface

## 📚 **Documentation**

- **[EAS Build Setup](docs/EAS_BUILD_SETUP.md)** - Complete guide for real builds
- **[API Documentation](docs/API.md)** - Backend API reference
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment

## 🌟 **Features Roadmap**

### **Current (v1.0)**
- ✅ AI app generation
- ✅ Real APK/iOS builds
- ✅ Modern UI/UX
- ✅ Project management
- ✅ File explorer

### **Coming Soon (v1.1)**
- 🔄 Live app preview
- 🔄 Git integration
- 🔄 Team collaboration
- 🔄 Custom templates
- 🔄 Build history

### **Future (v2.0)**
- 🚀 Multi-language support
- 🚀 Advanced AI models
- 🚀 Plugin system
- 🚀 White-label solution

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 **License**

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🎉 **Get Started Today!**

Transform your app ideas into reality with Prism. Generate production-ready React Native apps with real APK and iOS builds in minutes!

**[🚀 Start Building](http://localhost:3000/builder)**

---

**Made with ❤️ by the Prism Team**

*Turning ideas into apps, one prompt at a time.*
