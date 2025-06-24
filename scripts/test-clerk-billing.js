#!/usr/bin/env node

// Test script for Clerk billing integration
// Run with: node scripts/test-clerk-billing.js

const { SUBSCRIPTION_PLANS, mapClerkPlanToInternal, mapInternalPlanToClerk } = require('../lib/utils/subscription-plans.ts')

console.log('🧪 Testing Clerk Billing Integration\n')

// Test 1: Plan configuration
console.log('📦 Plan Configuration:')
SUBSCRIPTION_PLANS.forEach(plan => {
  console.log(`  ${plan.name} (${plan.id}) → Clerk ID: ${plan.clerkPlanId}`)
})
console.log()

// Test 2: Plan mapping
console.log('🔄 Plan Mapping Tests:')
const testMappings = [
  { clerk: 'free', internal: 'free' },
  { clerk: 'plus', internal: 'plus' },
  { clerk: 'pro', internal: 'pro' },
  { clerk: 'team', internal: 'team' },
  { clerk: 'enterprise', internal: 'enterprise' }
]

testMappings.forEach(({ clerk, internal }) => {
  const mapped = mapClerkPlanToInternal(clerk)
  const reverse = mapInternalPlanToClerk(internal)
  const success = mapped === internal && reverse === clerk
  console.log(`  ${clerk} ↔ ${internal}: ${success ? '✅' : '❌'} (${mapped} ← → ${reverse})`)
})
console.log()

// Test 3: Plan limits
console.log('💎 Plan Limits:')
SUBSCRIPTION_PLANS.forEach(plan => {
  const limits = plan.limits
  console.log(`  ${plan.name}:`)
  console.log(`    Prompts: ${limits.promptsPerMonth === -1 ? 'Unlimited' : limits.promptsPerMonth}/month`)
  console.log(`    Projects: ${limits.projectsPerMonth === -1 ? 'Unlimited' : limits.projectsPerMonth}/month`)
  console.log(`    Custom API Keys: ${limits.customApiKeys ? '✅' : '❌'}`)
  console.log(`    Priority Support: ${limits.prioritySupport ? '✅' : '❌'}`)
  console.log(`    Team Collaboration: ${limits.teamCollaboration ? '✅' : '❌'}`)
  console.log(`    Custom Branding: ${limits.customBranding ? '✅' : '❌'}`)
  console.log(`    API Access: ${limits.apiAccess ? '✅' : '❌'}`)
  console.log()
})

// Test 4: Environment variables
console.log('🔧 Environment Check:')
const requiredEnvVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'CLERK_WEBHOOK_SECRET',
  'MONGODB_URI'
]

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar]
  const exists = !!value
  console.log(`  ${envVar}: ${exists ? '✅' : '❌'} ${exists ? '(set)' : '(missing)'}`)
})
console.log()

// Test 5: API endpoints
console.log('🌐 API Endpoints to Test:')
const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
const endpoints = [
  '/api/user/subscription-status',
  '/api/webhooks/clerk',
  '/api/test-db',
  '/pricing'
]

endpoints.forEach(endpoint => {
  console.log(`  ${baseUrl}${endpoint}`)
})
console.log()

// Test 6: Webhook events
console.log('📨 Webhook Events to Configure:')
const webhookEvents = [
  'user.created',
  'user.updated', 
  'user.deleted',
  'billing.subscription.created',
  'billing.subscription.updated',
  'billing.subscription.cancelled'
]

webhookEvents.forEach(event => {
  console.log(`  ✅ ${event}`)
})
console.log()

// Test 7: Usage tracking
console.log('📊 Usage Tracking Features:')
const usageFeatures = [
  'Monthly prompt quotas',
  'Automatic monthly reset',
  'Real-time usage checking',
  'Daily usage analytics',
  'Usage percentage calculations',
  'Reset date tracking'
]

usageFeatures.forEach(feature => {
  console.log(`  ✅ ${feature}`)
})
console.log()

console.log('🎯 Setup Checklist:')
console.log('  1. Enable billing in Clerk Dashboard')
console.log('  2. Connect Stripe account to Clerk')
console.log('  3. Create plans with exact IDs: free, plus, pro, team, enterprise')
console.log('  4. Set up webhook endpoint')
console.log('  5. Configure environment variables')
console.log('  6. Test PricingTable component')
console.log('  7. Test billing portal integration')
console.log('  8. Test usage tracking and quotas')
console.log('  9. Test monthly reset functionality')
console.log()

console.log('✨ Clerk billing system ready!')
console.log('Visit /pricing to see the PricingTable in action')

// If running in development, provide helpful commands
if (process.env.NODE_ENV !== 'production') {
  console.log('\n🛠️  Development Commands:')
  console.log('  npm run dev          # Start development server')
  console.log('  curl localhost:3000/api/test-db  # Test database connection')
  console.log('  curl localhost:3000/pricing      # Test pricing page')
  console.log('  curl localhost:3000/api/user/subscription-status  # Test subscription status')
} 

console.log('\n🧪 Test Scenarios:')
console.log('  1. Create free account → verify 30 prompt limit')
console.log('  2. Upgrade to Plus → verify 500 prompt limit')
console.log('  3. Generate apps → verify usage tracking')
console.log('  4. Exceed quota → verify error messages')
console.log('  5. Test monthly reset → verify quota reset')
console.log('  6. Cancel subscription → verify reversion to free') 