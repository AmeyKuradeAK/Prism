// Subscription Plans Configuration for Clerk Billing
// These plan IDs MUST match exactly with the plan IDs created in Clerk Dashboard

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
    promptsPerMonth: number
    customApiKeys: boolean
    prioritySupport: boolean
    exportCode: boolean
    teamCollaboration: boolean
    customBranding: boolean
    apiAccess: boolean
  }
  popular?: boolean
  clerkPlanId: string // Must match Clerk Dashboard plan ID
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'spark',
    name: '⚡ Spark',
    tagline: 'Perfect for hobbyists and learners',
    price: { monthly: 0, yearly: 0 },
    features: [
      '15 prompts per month (400k tokens each)',
      '3 projects per month',
      'Basic templates',
      'Community support',
      'Expo SDK latest',
      'Code export'
    ],
    limits: {
      projectsPerMonth: 3,
      promptsPerMonth: 15,
      customApiKeys: false,
      prioritySupport: false,
      exportCode: true,
      teamCollaboration: false,
      customBranding: false,
      apiAccess: false
    },
    clerkPlanId: 'free' // Free plan in Clerk
  },
  {
    id: 'pro',
    name: '🚀 Plus',
    tagline: 'For serious individual developers',
    price: { monthly: 19, yearly: 190 },
    features: [
      '200 prompts per month (400k tokens each)',
      'Unlimited projects',
      'Custom API keys (bring your own)',
      'Premium templates',
      'Priority email support',
      'Advanced components',
      'Analytics dashboard'
    ],
    limits: {
      projectsPerMonth: -1, // unlimited
      promptsPerMonth: 200,
      customApiKeys: true,
      prioritySupport: true,
      exportCode: true,
      teamCollaboration: false,
      customBranding: false,
      apiAccess: false
    },
    popular: true,
    clerkPlanId: 'plus' // Plus plan in Clerk
  },
  {
    id: 'premium',
    name: '💎 Pro',
    tagline: 'Maximum power for professionals',
    price: { monthly: 49, yearly: 490 },
    features: [
      '500 prompts per month (400k tokens each)',
      'Everything in Plus',
      'All AI models (GPT-4, Claude, etc.)',
      'Custom branding',
      'API access',
      'Advanced integrations',
      'White-label options'
    ],
    limits: {
      projectsPerMonth: -1,
      promptsPerMonth: 500,
      customApiKeys: true,
      prioritySupport: true,
      exportCode: true,
      teamCollaboration: false,
      customBranding: true,
      apiAccess: true
    },
    clerkPlanId: 'pro' // Pro plan in Clerk
  },
  {
    id: 'team',
    name: '👥 Team',
    tagline: 'Collaboration for teams and agencies',
    price: { monthly: 99, yearly: 990 },
    features: [
      '1,000-1,800 prompts per month (400k tokens each)',
      'Everything in Pro',
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
      promptsPerMonth: 1400, // Average between 1k-1.8k
      customApiKeys: true,
      prioritySupport: true,
      exportCode: true,
      teamCollaboration: true,
      customBranding: true,
      apiAccess: true
    },
    clerkPlanId: 'team' // Team plan in Clerk
  },
  {
    id: 'enterprise',
    name: '🏢 Enterprise',
    tagline: 'Large organizations with custom needs',
    price: { monthly: 299, yearly: 2990 },
    features: [
      'Unlimited prompts',
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
      promptsPerMonth: -1, // unlimited
      customApiKeys: true,
      prioritySupport: true,
      exportCode: true,
      teamCollaboration: true,
      customBranding: true,
      apiAccess: true
    },
    clerkPlanId: 'enterprise' // Enterprise plan in Clerk
  }
]

// Helper functions
export function getPlanById(planId: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || null
}

export function getPlanByClerkId(clerkPlanId: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find(plan => plan.clerkPlanId === clerkPlanId) || null
}

export function getFreePlan(): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[0] // Spark
}

export function getPlanLimits(planId: string) {
  const plan = getPlanById(planId)
  return plan?.limits || getFreePlan().limits
}

export function formatPrice(amount: number): string {
  if (amount === 0) return 'Free'
  return `$${amount}`
}

export function calculateYearlySavings(monthlyPrice: number, yearlyPrice: number): number {
  return (monthlyPrice * 12) - yearlyPrice
}

// Map Clerk plan ID to our internal plan ID
export function mapClerkPlanToInternal(clerkPlanId: string): string {
  const plan = getPlanByClerkId(clerkPlanId)
  return plan?.id || 'spark'
}

// Map our internal plan ID to Clerk plan ID
export function mapInternalPlanToClerk(internalPlanId: string): string {
  const plan = getPlanById(internalPlanId)
  return plan?.clerkPlanId || 'free'
} 