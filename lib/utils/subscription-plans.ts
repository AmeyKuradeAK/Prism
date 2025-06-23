export interface SubscriptionPlan {
  id: string
  name: string
  tagline: string
  price: {
    monthly: number
    yearly: number
  }
  features: string[]
  limits: {
    projectsPerMonth: number
    aiGenerationsPerMonth: number
    customApiKeys: boolean
    prioritySupport: boolean
    exportCode: boolean
    teamCollaboration: boolean
    customBranding: boolean
    apiAccess: boolean
  }
  popular?: boolean
  clerkPlanId?: string // Will be set after creating in Clerk Dashboard
  stripePriceIds?: {
    monthly: string
    yearly: string
  }
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'spark',
    name: '⚡ Spark',
    tagline: 'Perfect for hobbyists and learners',
    price: { monthly: 0, yearly: 0 },
    features: [
      '3 projects per month',
      '10 AI generations per month',
      'Basic templates',
      'Community support',
      'Expo SDK latest',
      'Code export'
    ],
    limits: {
      projectsPerMonth: 3,
      aiGenerationsPerMonth: 10,
      customApiKeys: false,
      prioritySupport: false,
      exportCode: true,
      teamCollaboration: false,
      customBranding: false,
      apiAccess: false
    }
  },
  {
    id: 'pro',
    name: '🚀 Pro',
    tagline: 'For serious individual developers',
    price: { monthly: 19, yearly: 190 },
    features: [
      'Unlimited projects',
      '200 AI generations per month',
      'Custom API keys (bring your own)',
      'Premium templates',
      'Priority email support',
      'Advanced components',
      'Analytics dashboard'
    ],
    limits: {
      projectsPerMonth: -1, // unlimited
      aiGenerationsPerMonth: 200,
      customApiKeys: true,
      prioritySupport: true,
      exportCode: true,
      teamCollaboration: false,
      customBranding: false,
      apiAccess: false
    },
    popular: true
  },
  {
    id: 'premium',
    name: '💎 Premium',
    tagline: 'Maximum power for professionals',
    price: { monthly: 49, yearly: 490 },
    features: [
      'Everything in Pro',
      'Unlimited AI generations',
      'All AI models (GPT-4, Claude, etc.)',
      'Custom branding',
      'API access',
      'Advanced integrations',
      'White-label options'
    ],
    limits: {
      projectsPerMonth: -1,
      aiGenerationsPerMonth: -1,
      customApiKeys: true,
      prioritySupport: true,
      exportCode: true,
      teamCollaboration: false,
      customBranding: true,
      apiAccess: true
    }
  },
  {
    id: 'team',
    name: '👥 Team',
    tagline: 'Collaboration for teams and agencies',
    price: { monthly: 99, yearly: 990 },
    features: [
      'Everything in Premium',
      'Team collaboration (10 seats)',
      'Shared workspaces',
      'Team management dashboard',
      'Centralized billing',
      'Role-based permissions',
      'Team analytics',
      'Priority support'
    ],
    limits: {
      projectsPerMonth: -1,
      aiGenerationsPerMonth: -1,
      customApiKeys: true,
      prioritySupport: true,
      exportCode: true,
      teamCollaboration: true,
      customBranding: true,
      apiAccess: true
    }
  },
  {
    id: 'enterprise',
    name: '🏢 Enterprise',
    tagline: 'Large organizations with custom needs',
    price: { monthly: 0, yearly: 0 }, // Custom pricing
    features: [
      'Everything in Team',
      'Unlimited team seats',
      'Custom AI models',
      'On-premise deployment',
      'SSO & SAML integration',
      'SLA guarantees',
      'Custom integrations',
      'Dedicated account manager',
      'Training & onboarding'
    ],
    limits: {
      projectsPerMonth: -1,
      aiGenerationsPerMonth: -1,
      customApiKeys: true,
      prioritySupport: true,
      exportCode: true,
      teamCollaboration: true,
      customBranding: true,
      apiAccess: true
    }
  }
]

// Helper functions
export function getPlanById(planId: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || null
}

export function getFreePlan(): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[0] // Spark
}

export function isFeatureAvailable(planId: string, feature: keyof SubscriptionPlan['limits']): boolean {
  const plan = getPlanById(planId)
  return plan ? plan.limits[feature] === true : false
}

export function getMonthlyLimit(planId: string, limit: 'projectsPerMonth' | 'aiGenerationsPerMonth'): number {
  const plan = getPlanById(planId)
  if (!plan) return 0
  return plan.limits[limit] === -1 ? Infinity : plan.limits[limit]
}

export function formatPrice(amount: number): string {
  if (amount === 0) return 'Free'
  return `$${amount}`
}

export function calculateYearlySavings(monthly: number, yearly: number): number {
  if (monthly === 0 || yearly === 0) return 0
  const monthlyTotal = monthly * 12
  return Math.round(((monthlyTotal - yearly) / monthlyTotal) * 100)
} 