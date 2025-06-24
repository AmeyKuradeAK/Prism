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
    id: 'free',
    name: 'Free',
    tagline: 'Perfect for getting started',
    price: { monthly: 0, yearly: 0 },
    features: [
      '30 prompts per month',
      '3 projects per month',
      'Basic templates',
      'Community support',
      'Code export'
    ],
    limits: {
      projectsPerMonth: 3,
      promptsPerMonth: 30,
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
    id: 'plus',
    name: 'Plus',
    tagline: 'For serious individual developers',
    price: { monthly: 19, yearly: 190 },
    features: [
      '500 prompts per month',
      'Unlimited projects',
      'Custom API keys (bring your own)',
      'Premium templates',
      'Priority email support',
      'Advanced components',
      'Analytics dashboard'
    ],
    limits: {
      projectsPerMonth: -1, // unlimited
      promptsPerMonth: 500,
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
    id: 'pro',
    name: 'Pro',
    tagline: 'Maximum power for professionals',
    price: { monthly: 49, yearly: 490 },
    features: [
      '2000 prompts per month',
      'Everything in Plus',
      'All AI models (GPT-4, Claude, etc.)',
      'Custom branding',
      'API access',
      'Advanced integrations',
      'White-label options'
    ],
    limits: {
      projectsPerMonth: -1,
      promptsPerMonth: 2000,
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
    name: 'Team',
    tagline: 'Collaboration for teams and agencies',
    price: { monthly: 99, yearly: 990 },
    features: [
      '1,000-1,800 prompts per month',
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
    name: 'Enterprise',
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

/**
 * Get plan by internal ID
 */
export function getPlanById(planId: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || null
}

/**
 * Get plan by Clerk plan ID
 */
export function getPlanByClerkId(clerkPlanId: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find(plan => plan.clerkPlanId === clerkPlanId) || null
}

/**
 * Get monthly limit for a specific feature (numeric limits only)
 */
export function getMonthlyLimit(planId: string, feature: 'projectsPerMonth' | 'promptsPerMonth'): number {
  const plan = getPlanById(planId)
  return plan ? plan.limits[feature] : 0
}

/**
 * Check if user has access to a specific feature (boolean features)
 */
export function hasFeature(planId: string, feature: 'customApiKeys' | 'prioritySupport' | 'exportCode' | 'teamCollaboration' | 'customBranding' | 'apiAccess'): boolean {
  const plan = getPlanById(planId)
  if (!plan) return false
  return plan.limits[feature]
}

/**
 * Get plan limits object
 */
export function getPlanLimits(planId: string) {
  const plan = getPlanById(planId)
  return plan?.limits || getFreePlan().limits
}

/**
 * Map Clerk plan ID to our internal plan ID
 */
export function mapClerkPlanToInternal(clerkPlanId: string): string {
  const plan = getPlanByClerkId(clerkPlanId)
  return plan?.id || 'free'
}

/**
 * Map our internal plan ID to Clerk plan ID
 */
export function mapInternalPlanToClerk(internalPlanId: string): string {
  const plan = getPlanById(internalPlanId)
  return plan?.clerkPlanId || 'free'
}

/**
 * Get all available plans
 */
export function getAllPlans(): SubscriptionPlan[] {
  return SUBSCRIPTION_PLANS
}

/**
 * Get free plan
 */
export function getFreePlan(): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[0]
}

/**
 * Get popular plan
 */
export function getPopularPlan(): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find(plan => plan.popular) || null
}

// Helper functions
export function formatPrice(amount: number): string {
  if (amount === 0) return 'Free'
  return `$${amount}`
}

export function calculateYearlySavings(monthlyPrice: number, yearlyPrice: number): number {
  return (monthlyPrice * 12) - yearlyPrice
} 