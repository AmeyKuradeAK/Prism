'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Zap, 
  Code, 
  Smartphone, 
  Target,
  Search,
  Copy,
  Check,
  Play,
  Cpu,
  Database,
  Star,
  ArrowRight,
  ExternalLink,
  Settings,
  Shield,
  Users,
  Layers,
  GitBranch,
  Download,
  Cloud,
  Terminal,
  FileText,
  Puzzle,
  Workflow,
  X,
  Package,
  Wrench,
  Monitor,
  Globe,
  Lock,
  Lightbulb,
  TrendingUp,
  Award,
  Coffee
} from 'lucide-react'

interface DocSection {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  content: React.ReactNode
}

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('getting-started')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const CodeBlock = ({ code, language = 'typescript', id }: { code: string, language?: string, id: string }) => (
    <div className="glass-dark rounded-professional overflow-hidden border border-glass my-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-glass">
        <span className="text-muted text-sm font-medium">{language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="flex items-center space-x-2 text-light hover:text-white transition-professional"
        >
          {copiedCode === id ? (
            <>
              <Check className="w-4 h-4" />
              <span className="text-sm">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span className="text-sm">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-white">
        <code>{code}</code>
      </pre>
    </div>
  )

  const docSections: DocSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Play className="w-5 h-5" />,
      description: 'Start building React Native apps with AI in minutes',
      content: (
        <div className="space-y-8">
          <div>
            <h3 className="text-3xl font-bold text-white mb-4">Welcome to Prism</h3>
            <p className="text-light text-lg mb-6">
              Prism is an AI-powered React Native app builder that transforms your ideas into 
              production-ready mobile applications. Build native iOS and Android apps using just 
              natural language descriptions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-glass p-6">
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Quick Start (5 minutes)
              </h4>
              <ol className="space-y-3 text-light">
                <li className="flex items-start">
                  <span className="bg-gradient-glossy text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                  <span>Create your free account</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-gradient-glossy text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                  <span>Choose your subscription plan</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-gradient-glossy text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                  <span>Describe your app idea</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-gradient-glossy text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">4</span>
                  <span>Generate and download your app</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-gradient-glossy text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">5</span>
                  <span>Deploy to app stores</span>
                </li>
              </ol>
            </div>

            <div className="card-glass p-6">
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Key Features
              </h4>
              <ul className="space-y-3 text-light">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  <span>AI-powered code generation</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  <span>Multiple AI provider support</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  <span>Expo & React Native compatible</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  <span>TypeScript & JavaScript support</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  <span>Real-time preview & testing</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  <span>One-click deployment</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="card-glass p-8">
            <h4 className="text-white font-semibold mb-6 text-xl">Try Your First Prompt</h4>
            <p className="text-light mb-6">
              Start with this example to create a todo list app with modern features:
            </p>
            <CodeBlock 
              id="first-prompt"
              code={`Create a todo list app with these features:

Core Functionality:
- Add new tasks with titles and descriptions
- Mark tasks as complete/incomplete
- Delete tasks with confirmation
- Edit existing tasks inline
- Drag and drop to reorder tasks

UI/UX:
- Modern, clean interface with dark theme
- Smooth animations for all interactions
- Tab navigation between "All", "Pending", "Completed"
- Search functionality to filter tasks
- Empty state with illustration

Technical:
- Use TypeScript for type safety
- Implement local storage for persistence
- Add haptic feedback for interactions
- Support both iOS and Android
- Responsive design for tablets`}
              language="prompt"
            />
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <button className="btn-glossy px-6 py-3 flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Generate This App</span>
              </button>
              <button className="text-light hover:text-white flex items-center space-x-2 transition-professional">
                <ExternalLink className="w-4 h-4" />
                <span>Open in Builder</span>
              </button>
              <button className="text-light hover:text-white flex items-center space-x-2 transition-professional">
                <Copy className="w-4 h-4" />
                <span>Copy Prompt</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-glass p-6 text-center">
              <div className="w-12 h-12 bg-gradient-glossy rounded-professional flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <h5 className="text-white font-semibold mb-2">Native Performance</h5>
              <p className="text-light text-sm">
                Generate truly native React Native apps that run smoothly on both iOS and Android
              </p>
            </div>
            <div className="card-glass p-6 text-center">
              <div className="w-12 h-12 bg-gradient-glossy rounded-professional flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h5 className="text-white font-semibold mb-2">Lightning Fast</h5>
              <p className="text-light text-sm">
                From idea to working app in under 2 minutes. No coding knowledge required
              </p>
            </div>
            <div className="card-glass p-6 text-center">
              <div className="w-12 h-12 bg-gradient-glossy rounded-professional flex items-center justify-center mx-auto mb-4">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h5 className="text-white font-semibold mb-2">Full Source Code</h5>
              <p className="text-light text-sm">
                Download complete, readable source code that you can modify and extend
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'prompting-guide',
      title: 'Writing Effective Prompts',
      icon: <FileText className="w-5 h-5" />,
      description: 'Learn how to write prompts that generate amazing apps',
      content: (
        <div className="space-y-8">
          <div>
            <h3 className="text-3xl font-bold text-white mb-4">The Art of Prompt Engineering</h3>
            <p className="text-light text-lg mb-6">
              Writing effective prompts is key to generating high-quality apps. Follow these guidelines 
              to get the best results from Prism's AI.
            </p>
          </div>

          <div className="card-glass p-8">
            <h4 className="text-white font-semibold mb-6 text-xl">Prompt Structure Template</h4>
            <CodeBlock 
              id="prompt-template"
              code={`[APP TYPE]: Brief description of your app

CORE FEATURES:
- Feature 1: Detailed description
- Feature 2: What it should do
- Feature 3: How users interact with it

UI/UX REQUIREMENTS:
- Design style (modern, minimal, colorful, etc.)
- Navigation type (tabs, stack, drawer)
- Theme preferences (dark, light, system)
- Animations and interactions

TECHNICAL SPECIFICATIONS:
- TypeScript or JavaScript
- State management needs
- Data persistence requirements
- Platform-specific features
- Performance considerations

OPTIONAL INTEGRATIONS:
- APIs to connect with
- Third-party services
- Device features (camera, location, etc.)`}
              language="template"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4 text-lg flex items-center">
                <Check className="w-5 h-5 mr-2 text-green-400" />
                Best Practices
              </h4>
              <div className="space-y-4">
                <div className="card-glass p-4">
                  <h5 className="text-white font-medium mb-2">Be Specific</h5>
                  <p className="text-light text-sm">
                    Instead of "social app", say "Instagram-like photo sharing app with filters, stories, and direct messaging"
                  </p>
                </div>
                <div className="card-glass p-4">
                  <h5 className="text-white font-medium mb-2">Include User Flows</h5>
                  <p className="text-light text-sm">
                    Describe how users navigate: "Users can tap '+' to add items, swipe to delete, long-press to edit"
                  </p>
                </div>
                <div className="card-glass p-4">
                  <h5 className="text-white font-medium mb-2">Mention Edge Cases</h5>
                  <p className="text-light text-sm">
                    Consider empty states, loading states, error handling, and offline functionality
                  </p>
                </div>
                <div className="card-glass p-4">
                  <h5 className="text-white font-medium mb-2">Reference Examples</h5>
                  <p className="text-light text-sm">
                    "Like Spotify's player interface" or "Similar to iOS Settings app navigation"
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4 text-lg flex items-center">
                <ExternalLink className="w-5 h-5 mr-2 text-red-400" />
                Common Mistakes
              </h4>
              <div className="space-y-4">
                <div className="card-glass p-4 border-l-4 border-red-500">
                  <h5 className="text-white font-medium mb-2">Too Vague</h5>
                  <p className="text-light text-sm">
                    Avoid: "Make a good app for productivity"
                  </p>
                </div>
                <div className="card-glass p-4 border-l-4 border-red-500">
                  <h5 className="text-white font-medium mb-2">Overly Complex</h5>
                  <p className="text-light text-sm">
                    Don't describe 20+ features in one prompt. Start simple, then iterate
                  </p>
                </div>
                <div className="card-glass p-4 border-l-4 border-red-500">
                  <h5 className="text-white font-medium mb-2">Missing Context</h5>
                  <p className="text-light text-sm">
                    Always specify the target audience and primary use case
                  </p>
                </div>
                <div className="card-glass p-4 border-l-4 border-red-500">
                  <h5 className="text-white font-medium mb-2">No Visual Details</h5>
                  <p className="text-light text-sm">
                    Describe colors, layout, typography preferences for better results
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-glass p-8">
            <h4 className="text-white font-semibold mb-6 text-xl">Example Prompts by Category</h4>
            
            <div className="space-y-6">
              <div>
                <h5 className="text-white font-medium mb-3 flex items-center">
                  <Smartphone className="w-4 h-4 mr-2" />
                  E-commerce App
                </h5>
                <CodeBlock 
                  id="ecommerce-prompt"
                  code={`E-commerce marketplace app for handmade crafts

CORE FEATURES:
- Product browsing with categories and search
- Shopping cart with quantity adjustments
- User accounts with order history
- Seller profiles and ratings
- Payment integration placeholder
- Wishlist functionality

UI/UX:
- Clean, Pinterest-inspired grid layout
- Bottom tab navigation (Home, Search, Cart, Profile)
- Swipeable product image galleries
- Smooth add-to-cart animations
- Pull-to-refresh on listings

TECHNICAL:
- TypeScript for type safety
- Redux for state management
- AsyncStorage for cart persistence
- Image caching and optimization
- Search with debouncing`}
                  language="prompt"
                />
              </div>

              <div>
                <h5 className="text-white font-medium mb-3 flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  Fitness Tracking App
                </h5>
                <CodeBlock 
                  id="fitness-prompt"
                  code={`Personal fitness tracker with workout logging

CORE FEATURES:
- Exercise library with instructions and videos
- Workout timer with rest periods
- Progress tracking with charts
- Custom workout builder
- Body measurements logging
- Achievement badges system

UI/UX:
- Dark theme with accent colors
- Card-based layout for workouts
- Circular progress indicators
- Haptic feedback for timer
- Gesture-based workout navigation

TECHNICAL:
- Offline-first architecture
- Local SQLite database
- Chart.js for progress visualization
- Background timer functionality
- Export data to CSV`}
                  language="prompt"
                />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'pricing-plans',
      title: 'Pricing & Plans',
      icon: <Star className="w-5 h-5" />,
      description: 'Understand our prompt-based billing system',
      content: (
        <div className="space-y-8">
          <div>
            <h3 className="text-3xl font-bold text-white mb-4">Simple, Transparent Pricing</h3>
            <p className="text-light text-lg mb-6">
              We use a revolutionary prompt-based billing system. No confusing token calculations - 
              just simple, predictable pricing based on complete app generation requests.
            </p>
          </div>

          <div className="card-glass p-8 mb-8">
            <h4 className="text-white font-semibold mb-6 text-xl">How Prompt-Based Billing Works</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-glossy rounded-professional flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h5 className="text-white font-medium mb-2">1 Prompt = 1 App</h5>
                <p className="text-light text-sm">
                  Each prompt generates a complete, functional mobile app with all requested features
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-glossy rounded-professional flex items-center justify-center mx-auto mb-4">
                  <Cpu className="w-8 h-8 text-white" />
                </div>
                <h5 className="text-white font-medium mb-2">400,000 Tokens</h5>
                <p className="text-light text-sm">
                  Every prompt includes 400k tokens - enough for complex apps with multiple features
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-glossy rounded-professional flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h5 className="text-white font-medium mb-2">Predictable Costs</h5>
                <p className="text-light text-sm">
                  No surprise bills - you know exactly how many apps you can build each month
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: '⚡ Spark',
                price: 'Free',
                prompts: '15 prompts',
                projects: '3 projects',
                period: 'per month',
                features: [
                  'Basic templates',
                  'Community support',
                  'Code export',
                  'iOS & Android compatible',
                  'Expo SDK latest'
                ],
                popular: false,
                cta: 'Start Free'
              },
              {
                name: '🚀 Plus',
                price: '$19',
                prompts: '200 prompts',
                projects: 'Unlimited projects',
                period: 'per month',
                features: [
                  'Everything in Spark',
                  'Custom API keys',
                  'Priority support',
                  'Analytics dashboard',
                  'Advanced templates',
                  'Email support'
                ],
                popular: true,
                cta: 'Start Plus'
              },
              {
                name: '💎 Pro',
                price: '$49',
                prompts: '500 prompts',
                projects: 'Unlimited projects',
                period: 'per month',
                features: [
                  'Everything in Plus',
                  'All AI models access',
                  'Custom branding',
                  'API access',
                  'White-label options',
                  'Advanced integrations'
                ],
                popular: false,
                cta: 'Start Pro'
              },
              {
                name: '👥 Team',
                price: '$99',
                prompts: '1,000-1,800 prompts',
                projects: 'Unlimited projects',
                period: 'per month',
                features: [
                  'Everything in Pro',
                  'Team collaboration',
                  'Shared workspaces',
                  'Team analytics',
                  'Centralized billing',
                  'Role permissions'
                ],
                popular: false,
                cta: 'Start Team'
              }
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card-glass p-6 ${plan.popular ? 'ring-2 ring-white/30' : ''} relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-glossy text-white px-3 py-1 rounded-professional text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h4 className="text-white font-bold text-xl mb-2">{plan.name}</h4>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.price !== 'Free' && <span className="text-light">/{plan.period.split(' ')[1]}</span>}
                  </div>
                  <div className="text-light text-sm mb-1">{plan.prompts}</div>
                  <div className="text-muted text-xs">{plan.projects}</div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-light">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 rounded-professional font-medium transition-professional ${
                  plan.popular 
                    ? 'btn-glossy' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}>
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>

          <div className="card-glass p-8">
            <h4 className="text-white font-semibold mb-6 text-xl">Token Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">~50k</div>
                <div className="text-light font-medium mb-2">Input Tokens</div>
                <p className="text-muted text-sm">Your prompt description and requirements</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">~350k</div>
                <div className="text-light font-medium mb-2">Output Tokens</div>
                <p className="text-muted text-sm">Generated code, components, and configuration</p>
              </div>
              <div className="text-center border-l border-glass pl-6">
                <div className="text-4xl font-bold text-white mb-2">400k</div>
                <div className="text-light font-medium mb-2">Total per Prompt</div>
                <p className="text-muted text-sm">Complete app generation allocation</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-glass p-6">
              <h5 className="text-white font-semibold mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Why Prompt-Based?
              </h5>
              <ul className="space-y-3 text-light text-sm">
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5" />
                  <span>Predictable costs - no surprise bills</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5" />
                  <span>Easy to understand and budget for</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5" />
                  <span>Each prompt creates a complete app</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5" />
                  <span>No need to calculate token usage</span>
                </li>
              </ul>
            </div>
            
            <div className="card-glass p-6">
              <h5 className="text-white font-semibold mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                Best Value Tips
              </h5>
              <ul className="space-y-3 text-light text-sm">
                <li className="flex items-start">
                  <Star className="w-4 h-4 text-yellow-400 mr-2 mt-0.5" />
                  <span>Start simple, then iterate with new prompts</span>
                </li>
                <li className="flex items-start">
                  <Star className="w-4 h-4 text-yellow-400 mr-2 mt-0.5" />
                  <span>Use detailed prompts for better first results</span>
                </li>
                <li className="flex items-start">
                  <Star className="w-4 h-4 text-yellow-400 mr-2 mt-0.5" />
                  <span>Bring your own API keys for unlimited usage</span>
                </li>
                <li className="flex items-start">
                  <Star className="w-4 h-4 text-yellow-400 mr-2 mt-0.5" />
                  <span>Annual plans save up to 20%</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai-providers',
      title: 'AI Providers',
      icon: <Cpu className="w-5 h-5" />,
      description: 'Configure and use different AI models',
      content: (
        <div className="space-y-8">
          <div>
            <h3 className="text-3xl font-bold text-white mb-4">AI Provider Integration</h3>
            <p className="text-light text-lg mb-6">
              Prism supports multiple AI providers, giving you flexibility and control. Use our managed 
              service for simplicity, or bring your own API keys for unlimited usage and better cost control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-glass p-6">
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <Cloud className="w-5 h-5 mr-2" />
                Managed Service
              </h4>
              <ul className="space-y-3 text-light text-sm mb-4">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  <span>Ready to use immediately</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  <span>No API key management needed</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  <span>Automatic model optimization</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  <span>Included in all plans</span>
                </li>
              </ul>
              <p className="text-muted text-sm">
                Perfect for getting started quickly without any setup.
              </p>
            </div>

            <div className="card-glass p-6">
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Bring Your Own Keys
              </h4>
              <ul className="space-y-3 text-light text-sm mb-4">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  <span>Unlimited usage (pay provider directly)</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  <span>Choose specific models</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  <span>Better cost control</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  <span>Higher rate limits</span>
                </li>
              </ul>
              <p className="text-muted text-sm">
                Ideal for heavy usage and maximum control.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: 'Claude',
                provider: 'Anthropic',
                logo: '🧠',
                models: ['Claude 3.5 Sonnet', 'Claude 3 Haiku', 'Claude 3 Opus'],
                strengths: [
                  'Exceptional code generation',
                  'Long context understanding',
                  'Complex reasoning',
                  'Safe and harmless outputs'
                ],
                bestFor: 'Complex apps with detailed logic',
                setup: {
                  url: 'console.anthropic.com',
                  steps: [
                    'Create an Anthropic account',
                    'Navigate to API Keys section',
                    'Generate a new API key',
                    'Copy and paste into Prism settings'
                  ]
                },
                pricing: '$3-15 per million tokens'
              },
              {
                name: 'OpenAI',
                provider: 'OpenAI',
                logo: '🤖',
                models: ['GPT-4', 'GPT-4 Turbo', 'GPT-3.5 Turbo'],
                strengths: [
                  'General purpose excellence',
                  'Fast response times',
                  'Broad knowledge base',
                  'Consistent performance'
                ],
                bestFor: 'Most app types and general use',
                setup: {
                  url: 'platform.openai.com',
                  steps: [
                    'Sign up for OpenAI account',
                    'Go to API Keys dashboard',
                    'Create new secret key',
                    'Add key to Prism AI settings'
                  ]
                },
                pricing: '$0.50-30 per million tokens'
              },
              {
                name: 'Mistral',
                provider: 'Mistral AI',
                logo: '🇪🇺',
                models: ['Mistral Large', 'Mistral Medium', 'Mistral Small'],
                strengths: [
                  'European AI solution',
                  'Privacy focused',
                  'Efficient processing',
                  'Competitive pricing'
                ],
                bestFor: 'Privacy-conscious projects',
                setup: {
                  url: 'console.mistral.ai',
                  steps: [
                    'Register at Mistral AI',
                    'Access API section',
                    'Generate API token',
                    'Configure in Prism'
                  ]
                },
                pricing: '$0.25-8 per million tokens'
              },
              {
                name: 'DeepSeek',
                provider: 'DeepSeek',
                logo: '🚀',
                models: ['DeepSeek Coder', 'DeepSeek Chat'],
                strengths: [
                  'Code specialization',
                  'Very cost effective',
                  'Fast inference',
                  'Programming optimized'
                ],
                bestFor: 'Budget-conscious development',
                setup: {
                  url: 'platform.deepseek.com',
                  steps: [
                    'Create DeepSeek account',
                    'Navigate to API keys',
                    'Generate new key',
                    'Input into Prism settings'
                  ]
                },
                pricing: '$0.14-2 per million tokens'
              }
            ].map((provider, index) => (
              <motion.div
                key={provider.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-glass p-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="text-3xl">{provider.logo}</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{provider.name}</h4>
                    <p className="text-muted text-sm">{provider.provider}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="text-light font-medium text-sm mb-2">Available Models</h5>
                    <div className="flex flex-wrap gap-2">
                      {provider.models.map((model, i) => (
                        <span key={i} className="bg-white/10 text-light text-xs px-2 py-1 rounded">
                          {model}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-light font-medium text-sm mb-2">Key Strengths</h5>
                    <ul className="space-y-1">
                      {provider.strengths.map((strength, i) => (
                        <li key={i} className="text-muted text-sm flex items-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full mr-2"></div>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-light font-medium text-sm mb-2">Best For</h5>
                    <p className="text-muted text-sm">{provider.bestFor}</p>
                  </div>
                  
                  <div>
                    <h5 className="text-light font-medium text-sm mb-2">Pricing</h5>
                    <p className="text-white text-sm font-mono">{provider.pricing}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-glass">
                    <h5 className="text-light font-medium text-sm mb-2">Quick Setup</h5>
                    <p className="text-muted text-xs mb-2">Get your API key from {provider.setup.url}</p>
                    <ol className="space-y-1">
                      {provider.setup.steps.map((step, i) => (
                        <li key={i} className="text-muted text-xs flex">
                          <span className="text-white mr-2">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="card-glass p-8">
            <h4 className="text-white font-semibold mb-6 text-xl">Setting Up Your API Keys</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h5 className="text-white font-medium mb-4">Step-by-Step Process</h5>
                <ol className="space-y-3">
                  <li className="flex items-start">
                    <span className="bg-gradient-glossy text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                    <div>
                      <div className="text-light font-medium">Navigate to Settings</div>
                      <div className="text-muted text-sm">Go to Settings → AI Providers in your dashboard</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-gradient-glossy text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                    <div>
                      <div className="text-light font-medium">Select Provider</div>
                      <div className="text-muted text-sm">Choose your preferred AI provider from the list</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-gradient-glossy text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                    <div>
                      <div className="text-light font-medium">Enter API Key</div>
                      <div className="text-muted text-sm">Paste your API key and select the model</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-gradient-glossy text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">4</span>
                    <div>
                      <div className="text-light font-medium">Test Connection</div>
                      <div className="text-muted text-sm">Verify the connection works properly</div>
                    </div>
                  </li>
                </ol>
              </div>
              
              <div>
                <h5 className="text-white font-medium mb-4">Security & Privacy</h5>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Lock className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-light font-medium text-sm">End-to-End Encryption</div>
                      <div className="text-muted text-xs">Your API keys are encrypted before storage</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-light font-medium text-sm">Zero Access</div>
                      <div className="text-muted text-xs">We cannot see or access your API keys</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Database className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-light font-medium text-sm">Local Storage</div>
                      <div className="text-muted text-xs">Keys stored locally in your browser</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-light font-medium text-sm">Your Control</div>
                      <div className="text-muted text-xs">You can remove keys anytime</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'app-architecture',
      title: 'App Architecture',
      icon: <Layers className="w-5 h-5" />,
      description: 'Understanding the generated app structure',
      content: (
        <div className="space-y-8">
          <div>
            <h3 className="text-3xl font-bold text-white mb-4">App Architecture & Structure</h3>
            <p className="text-light text-lg mb-6">
              Every app generated by Prism follows modern React Native best practices and includes 
              a well-organized, scalable architecture that's production-ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-glass p-6">
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Core Technologies
              </h4>
              <ul className="space-y-3 text-light text-sm">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>React Native 0.75+ (Latest)</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>Expo SDK 52+ (New Architecture)</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>TypeScript for type safety</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>React Navigation 6.x</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>NativeWind (Tailwind CSS)</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>Async Storage</span>
                </li>
              </ul>
            </div>

            <div className="card-glass p-6">
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <Wrench className="w-5 h-5 mr-2" />
                Development Features
              </h4>
              <ul className="space-y-3 text-light text-sm">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>Hot reload & fast refresh</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>ESLint & Prettier configured</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>Metro bundler optimization</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>Debug-friendly console logs</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>Component storybook ready</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>Testing utilities included</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="card-glass p-8">
            <h4 className="text-white font-semibold mb-6 text-xl">Project Structure</h4>
            <CodeBlock 
              id="project-structure"
              code={`your-app/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation group
│   │   ├── _layout.tsx    # Tab layout configuration
│   │   ├── index.tsx      # Home screen
│   │   └── profile.tsx    # Profile screen
│   ├── (auth)/            # Authentication group
│   │   ├── login.tsx      # Login screen
│   │   └── register.tsx   # Registration screen
│   ├── _layout.tsx        # Root layout
│   └── +not-found.tsx     # 404 screen
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   │   ├── Button.tsx    # Custom button component
│   │   ├── Input.tsx     # Form input component
│   │   └── Card.tsx      # Card container component
│   ├── forms/            # Form-specific components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Authentication hook
│   ├── useStorage.ts     # Local storage hook
│   └── useTheme.ts       # Theme management hook
├── services/             # API and external services
│   ├── api.ts           # API client configuration
│   ├── auth.ts          # Authentication service
│   └── storage.ts       # Local storage service
├── utils/                # Utility functions
│   ├── validation.ts     # Form validation helpers
│   ├── formatting.ts     # Data formatting utilities
│   └── constants.ts      # App constants
├── types/                # TypeScript type definitions
│   ├── auth.ts          # Authentication types
│   ├── api.ts           # API response types
│   └── navigation.ts    # Navigation types
├── assets/               # Static assets
│   ├── images/          # Image files
│   ├── fonts/           # Custom fonts
│   └── icons/           # Icon sets
├── app.json             # Expo configuration
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── tailwind.config.js   # Tailwind CSS config
└── metro.config.js      # Metro bundler config`}
              language="text"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-glass p-6">
              <h5 className="text-white font-semibold mb-4 flex items-center">
                <Monitor className="w-4 h-4 mr-2" />
                Navigation
              </h5>
              <p className="text-light text-sm mb-4">
                Uses Expo Router for file-based routing with support for:
              </p>
              <ul className="space-y-2 text-muted text-sm">
                <li>• Tab navigation</li>
                <li>• Stack navigation</li>
                <li>• Modal presentations</li>
                <li>• Deep linking</li>
                <li>• Route groups</li>
              </ul>
            </div>

            <div className="card-glass p-6">
              <h5 className="text-white font-semibold mb-4 flex items-center">
                <Database className="w-4 h-4 mr-2" />
                State Management
              </h5>
              <p className="text-light text-sm mb-4">
                Smart state management approach based on app complexity:
              </p>
              <ul className="space-y-2 text-muted text-sm">
                <li>• React Context for simple state</li>
                <li>• Zustand for complex state</li>
                <li>• TanStack Query for server state</li>
                <li>• Async Storage for persistence</li>
                <li>• Secure Store for sensitive data</li>
              </ul>
            </div>

            <div className="card-glass p-6">
              <h5 className="text-white font-semibold mb-4 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Security
              </h5>
              <p className="text-light text-sm mb-4">
                Built-in security best practices:
              </p>
              <ul className="space-y-2 text-muted text-sm">
                <li>• Input validation & sanitization</li>
                <li>• Secure storage for tokens</li>
                <li>• HTTPS enforcement</li>
                <li>• XSS protection</li>
                <li>• Biometric authentication ready</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'deployment',
      title: 'Deployment Guide',
      icon: <Cloud className="w-5 h-5" />,
      description: 'Deploy your app to app stores',
      content: (
        <div className="space-y-8">
          <div>
            <h3 className="text-3xl font-bold text-white mb-4">Deployment & Distribution</h3>
            <p className="text-light text-lg mb-6">
              Get your Prism-generated app into the hands of users. From development to production, 
              we'll guide you through every step of the deployment process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-glass p-6">
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <Terminal className="w-5 h-5 mr-2" />
                Development Preview
              </h4>
              <p className="text-light text-sm mb-4">
                Test your app instantly on physical devices during development.
              </p>
              <CodeBlock 
                id="dev-preview"
                code={`# Install Expo CLI globally
npm install -g @expo/cli

# Start development server
npx expo start

# Scan QR code with Expo Go app
# Available on iOS App Store & Google Play`}
                language="bash"
              />
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                <p className="text-blue-300 text-sm">
                  💡 Tip: Use Expo Go for instant testing without builds
                </p>
              </div>
            </div>

            <div className="card-glass p-6">
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Production Builds
              </h4>
              <p className="text-light text-sm mb-4">
                Create production-ready builds for app store submission.
              </p>
              <CodeBlock 
                id="production-build"
                code={`# Create production build
eas build --platform all

# Build for specific platform
eas build --platform ios
eas build --platform android

# Submit to app stores
eas submit --platform all`}
                language="bash"
              />
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded">
                <p className="text-green-300 text-sm">
                  ✅ Automatic code signing & store optimization
                </p>
              </div>
            </div>
          </div>

          <div className="card-glass p-8">
            <h4 className="text-white font-semibold mb-6 text-xl">Deployment Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-glossy rounded-professional flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h5 className="text-white font-semibold mb-2">App Stores</h5>
                <p className="text-light text-sm mb-4">
                  Submit to Apple App Store and Google Play Store for maximum reach
                </p>
                <ul className="text-muted text-xs space-y-1">
                  <li>• Automated store submission</li>
                  <li>• App Store Connect integration</li>
                  <li>• Google Play Console sync</li>
                  <li>• Compliance checking</li>
                </ul>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-glossy rounded-professional flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h5 className="text-white font-semibold mb-2">Web Deployment</h5>
                <p className="text-light text-sm mb-4">
                  Deploy as a progressive web app for instant access
                </p>
                <ul className="text-muted text-xs space-y-1">
                  <li>• Vercel integration</li>
                  <li>• Netlify deployment</li>
                  <li>• Custom domain support</li>
                  <li>• PWA features</li>
                </ul>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-glossy rounded-professional flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h5 className="text-white font-semibold mb-2">Internal Distribution</h5>
                <p className="text-light text-sm mb-4">
                  Share with team members and testers before public release
                </p>
                <ul className="text-muted text-xs space-y-1">
                  <li>• TestFlight integration</li>
                  <li>• Internal app sharing</li>
                  <li>• QR code distribution</li>
                  <li>• Version management</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-glass p-6">
              <h5 className="text-white font-semibold mb-4 flex items-center">
                <Coffee className="w-5 h-5 mr-2 text-orange-400" />
                iOS App Store
              </h5>
              <div className="space-y-4">
                <div>
                  <h6 className="text-light font-medium text-sm mb-2">Prerequisites</h6>
                  <ul className="text-muted text-sm space-y-1">
                    <li>• Apple Developer Account ($99/year)</li>
                    <li>• App Store Connect access</li>
                    <li>• App icons & screenshots</li>
                    <li>• Privacy policy & terms</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-light font-medium text-sm mb-2">Review Process</h6>
                  <ul className="text-muted text-sm space-y-1">
                    <li>• 1-3 days typical review time</li>
                    <li>• Automated compliance checking</li>
                    <li>• Human review for content</li>
                    <li>• Expedited review available</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card-glass p-6">
              <h5 className="text-white font-semibold mb-4 flex items-center">
                <Puzzle className="w-5 h-5 mr-2 text-green-400" />
                Google Play Store
              </h5>
              <div className="space-y-4">
                <div>
                  <h6 className="text-light font-medium text-sm mb-2">Prerequisites</h6>
                  <ul className="text-muted text-sm space-y-1">
                    <li>• Google Play Console account ($25 one-time)</li>
                    <li>• App signing key</li>
                    <li>• Store listing assets</li>
                    <li>• Content rating questionnaire</li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-light font-medium text-sm mb-2">Review Process</h6>
                  <ul className="text-muted text-sm space-y-1">
                    <li>• 1-3 hours for most apps</li>
                    <li>• Automated security scanning</li>
                    <li>• Policy compliance check</li>
                    <li>• Staged rollout options</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="card-glass p-8">
            <h4 className="text-white font-semibold mb-6 text-xl">EAS Build Configuration</h4>
            <p className="text-light mb-4">
              Every Prism app comes with pre-configured EAS Build settings for optimal performance:
            </p>
            <CodeBlock 
              id="eas-config"
              code={`{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "NODE_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      },
      "android": {
        "serviceAccountKeyPath": "./pc-api-key.json",
        "track": "internal"
      }
    }
  }
}`}
              language="json"
            />
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <Wrench className="w-5 h-5" />,
      description: 'Common issues and solutions',
      content: (
        <div className="space-y-8">
          <div>
            <h3 className="text-3xl font-bold text-white mb-4">Troubleshooting Guide</h3>
            <p className="text-light text-lg mb-6">
              Quick solutions to common issues you might encounter when building with Prism. 
              Most problems can be resolved in just a few steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                category: 'Generation Issues',
                icon: <Code className="w-5 h-5" />,
                problems: [
                  {
                    issue: 'Generation fails or times out',
                    solutions: [
                      'Check your internet connection',
                      'Verify you have remaining prompts',
                      'Try simplifying your prompt',
                      'Refresh the page and try again'
                    ]
                  },
                  {
                    issue: 'Generated code has syntax errors',
                    solutions: [
                      'Re-generate with more specific requirements',
                      'Check if TypeScript is properly configured',
                      'Verify all imports are included in prompt',
                      'Try a different AI provider'
                    ]
                  },
                  {
                    issue: 'App missing requested features',
                    solutions: [
                      'Be more specific in your prompt',
                      'Break complex features into steps',
                      'Include user flows in description',
                      'Reference similar apps for clarity'
                    ]
                  }
                ]
              },
              {
                category: 'Development Issues',
                icon: <Terminal className="w-5 h-5" />,
                problems: [
                  {
                    issue: 'Metro bundler fails to start',
                    solutions: [
                      'Clear Metro cache: npx expo start -c',
                      'Delete node_modules and reinstall',
                      'Check for conflicting packages',
                      'Restart your development server'
                    ]
                  },
                  {
                    issue: 'TypeScript errors in generated code',
                    solutions: [
                      'Run npm install to ensure types are installed',
                      'Check tsconfig.json configuration',
                      'Verify all @types packages are present',
                      'Restart TypeScript language server'
                    ]
                  },
                  {
                    issue: 'Component styling not working',
                    solutions: [
                      'Verify NativeWind is properly configured',
                      'Check if Tailwind classes are valid',
                      'Ensure metro.config.js includes CSS',
                      'Clear Metro cache and restart'
                    ]
                  }
                ]
              },
              {
                category: 'API & Authentication',
                icon: <Lock className="w-5 h-5" />,
                problems: [
                  {
                    issue: 'API key not working',
                    solutions: [
                      'Verify API key is correctly entered',
                      'Check key permissions and limits',
                      'Ensure key is for correct provider',
                      'Try generating a new API key'
                    ]
                  },
                  {
                    issue: 'Rate limit exceeded',
                    solutions: [
                      'Wait for rate limit to reset',
                      'Upgrade your AI provider plan',
                      'Switch to a different provider',
                      'Use your own API keys'
                    ]
                  },
                  {
                    issue: 'Authentication not working',
                    solutions: [
                      'Clear browser cache and cookies',
                      'Check if popup blockers are disabled',
                      'Try incognito/private browsing mode',
                      'Contact support if issue persists'
                    ]
                  }
                ]
              },
              {
                category: 'Build & Deployment',
                icon: <Cloud className="w-5 h-5" />,
                problems: [
                  {
                    issue: 'EAS build fails',
                    solutions: [
                      'Check eas.json configuration',
                      'Verify all dependencies are compatible',
                      'Ensure app.json has required fields',
                      'Check build logs for specific errors'
                    ]
                  },
                  {
                    issue: 'App crashes on device',
                    solutions: [
                      'Test in development mode first',
                      'Check device logs for crash reports',
                      'Verify all native modules are linked',
                      'Test on different devices/OS versions'
                    ]
                  },
                  {
                    issue: 'Store submission rejected',
                    solutions: [
                      'Review store guidelines carefully',
                      'Update app description and metadata',
                      'Ensure privacy policy is included',
                      'Address specific rejection reasons'
                    ]
                  }
                ]
              }
            ].map((section, index) => (
              <motion.div
                key={section.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-glass p-6"
              >
                <h4 className="text-white font-semibold mb-6 flex items-center">
                  {section.icon}
                  <span className="ml-2">{section.category}</span>
                </h4>
                
                <div className="space-y-6">
                  {section.problems.map((problem, i) => (
                    <div key={i} className="border-b border-glass last:border-b-0 pb-4 last:pb-0">
                      <h5 className="text-light font-medium mb-3 text-sm">
                        ❌ {problem.issue}
                      </h5>
                      <ul className="space-y-2">
                        {problem.solutions.map((solution, j) => (
                          <li key={j} className="flex items-start text-muted text-sm">
                            <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="card-glass p-8">
            <h4 className="text-white font-semibold mb-6 text-xl flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Getting Help
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-glossy rounded-professional flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h5 className="text-white font-semibold mb-2">Documentation</h5>
                <p className="text-muted text-sm mb-4">
                  Search our comprehensive docs for detailed guides and tutorials
                </p>
                <button className="text-light hover:text-white text-sm transition-professional">
                  Browse Docs →
                </button>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-glossy rounded-professional flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h5 className="text-white font-semibold mb-2">Community</h5>
                <p className="text-muted text-sm mb-4">
                  Join our Discord community for peer support and discussions
                </p>
                <button className="text-light hover:text-white text-sm transition-professional">
                  Join Discord →
                </button>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-glossy rounded-professional flex items-center justify-center mx-auto mb-4">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
                <h5 className="text-white font-semibold mb-2">Support</h5>
                <p className="text-muted text-sm mb-4">
                  Contact our support team for account and technical issues
                </p>
                <button className="text-light hover:text-white text-sm transition-professional">
                  Contact Support →
                </button>
              </div>
            </div>
          </div>

          <div className="card-glass p-8">
            <h4 className="text-white font-semibold mb-6 text-xl">Quick Diagnostic Commands</h4>
            <p className="text-light mb-4">
              Run these commands to diagnose common issues:
            </p>
            <CodeBlock 
              id="diagnostic-commands"
              code={`# Check Expo CLI version
expo --version

# Clear all caches
npx expo start -c --tunnel

# Check project dependencies
npm list --depth=0

# Verify EAS CLI is installed
eas --version

# Check build status
eas build:list

# View detailed Metro logs
npx expo start --dev-client --clear`}
              language="bash"
            />
          </div>
        </div>
      )
    }
  ]

  const filteredSections = docSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black">
      <div className="border-b border-glass bg-nav-dark backdrop-blur-xl sticky top-0 z-50">
        <div className="container-professional py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-professional flex items-center justify-center shadow-professional">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Documentation</h1>
                <p className="text-muted">Everything you need to build with Prism</p>
              </div>
            </div>
            
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-dark pl-10 w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container-professional py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <nav className="space-y-2">
                {filteredSections.map((section) => (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 rounded-professional transition-professional flex items-center space-x-3 ${
                      activeSection === section.id
                        ? 'bg-gradient-glossy text-white shadow-glossy'
                        : 'text-light hover:text-white hover:bg-white/5'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {section.icon}
                    <div className="flex-1">
                      <div className="font-medium">{section.title}</div>
                      <div className="text-xs text-muted">{section.description}</div>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {filteredSections.map((section) => (
                activeSection === section.id && (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="card-glass p-8"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-primary rounded-professional flex items-center justify-center shadow-professional">
                        {section.icon}
                      </div>
                      <h2 className="text-3xl font-bold text-white">{section.title}</h2>
                    </div>
                    {section.content}
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
} 