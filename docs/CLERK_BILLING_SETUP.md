# 💳 **Clerk Billing Setup Guide**

Complete step-by-step guide to set up Clerk billing for your React Native AI app builder.

---

## 🎯 **Step 1: Enable Billing in Clerk Dashboard**

### 1.1 Navigate to Billing
1. Go to **[Clerk Dashboard](https://dashboard.clerk.com)**
2. Select your project
3. Click **"Billing"** in the left sidebar
4. Click **"Enable Billing"**

### 1.2 Connect Stripe
1. You'll be prompted to connect your Stripe account
2. If you don't have Stripe: **[Create Stripe Account](https://dashboard.stripe.com/register)**
3. Complete the Stripe onboarding process
4. Return to Clerk and complete the connection

---

## 📦 **Step 2: Create Subscription Plans**

### 2.1 Plan Structure
Create these 4 plans in Clerk Dashboard:

#### **🚀 Plus Plan**
- **Name**: `Plus`
- **Monthly Price**: `$19/month`
- **Yearly Price**: `$16/month` (billed annually at $190/year)
- **Plan ID**: `pro` *(important for code integration)*

#### **💎 Pro Plan**
- **Name**: `Pro`
- **Monthly Price**: `$49/month`
- **Yearly Price**: `$41/month` (billed annually at $490/year)
- **Plan ID**: `premium`

#### **👥 Team Plan**
- **Name**: `Team`
- **Monthly Price**: `$99/month`
- **Yearly Price**: `$83/month` (billed annually at $990/year)
- **Plan ID**: `team`

#### **🏢 Enterprise Plan**
- **Name**: `Enterprise`
- **Price**: `$299/month` (or set a high placeholder price)
- **Plan ID**: `enterprise`
- **Note**: For true custom pricing, handle enterprise customers through direct sales

### 2.2 Create Plans in Clerk
1. In Clerk Dashboard → **"Billing"** → **"Plans"**
2. Click **"Create Plan"**
3. For each plan above:
   - Enter the name and pricing
   - Set the **Plan ID** exactly as shown
   - Configure billing intervals (monthly/yearly)
   - **Important**: For yearly plans, enter the **monthly equivalent price** (e.g., $16/month for Plus yearly)
   - Clerk will automatically handle the annual billing cycle
   - Add plan descriptions and features

### 2.3 Clerk Pricing Configuration
**Important**: When setting up plans in Clerk Dashboard:

**For Monthly Plans**: Enter the regular monthly price
- Plus: `$19/month`
- Pro: `$49/month`
- Team: `$99/month`
- Enterprise: `$299/month` (placeholder - handle custom pricing separately)

**For Yearly Plans**: Enter the **discounted monthly equivalent**
- Plus: `$16/month` (saves $3/month = $36/year)
- Pro: `$41/month` (saves $8/month = $96/year)
- Team: `$83/month` (saves $16/month = $192/year)
- Enterprise: `$249/month` (placeholder for yearly)

This way, Clerk will display the correct monthly pricing while billing annually.

### 2.4 Enterprise Plan Handling
Since Clerk doesn't support true "custom pricing", here are your options for Enterprise:

**Option 1: Placeholder Pricing**
- Set Enterprise at `$299/month` in Clerk
- Use "Contact Sales" button instead of direct signup
- Handle enterprise deals through direct sales process

**Option 2: Skip Enterprise in Clerk**
- Only create Plus, Pro, and Team plans in Clerk
- Remove Enterprise from the PricingTable component
- Handle enterprise customers outside of Clerk billing

**Option 3: High-Tier Pricing**
- Set Enterprise at a high but fixed price (e.g., `$499/month`)
- Allow direct signup for enterprises willing to pay that rate
- Use custom contracts for larger deals

---

## 🔧 **Step 3: Update Subscription Plans Configuration**

Your subscription plans are already defined, but we need to add the Clerk Plan IDs:

### 3.1 Get Plan IDs from Clerk
1. In Clerk Dashboard → **"Billing"** → **"Plans"**
2. Copy the **Plan ID** for each plan you created
3. These should match: `pro` (Plus), `premium` (Pro), `team`, `enterprise`

### 3.2 Update Plan Configuration
The plans are already configured in your code with placeholder `clerkPlanId` fields.

---

## 🛡️ **Step 4: Implement Plan Protection**

### 4.1 Using Clerk's `has()` method
```typescript
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const { has } = await auth()
  
  // Check if user has a specific plan
  if (has({ plan: 'pro' })) {
    // User has Plus plan or higher
  }
  
  if (has({ plan: 'premium' })) {
    // User has Pro plan or higher
  }
}
```

### 4.2 Using Clerk's `<Protect>` component
```tsx
import { Protect } from '@clerk/nextjs'

export default function PremiumFeature() {
  return (
    <Protect 
      plan="premium"
      fallback={<div>Upgrade to Pro to access this feature</div>}
    >
      <ProContent />
    </Protect>
  )
}
```

---

## 🎨 **Step 5: Update Pricing Page**

Your pricing page already has the `PricingTable` component imported. Update it:

### 5.1 Configure PricingTable
```tsx
<PricingTable 
  plans={[
    { 
      id: 'pro',
      name: '🚀 Plus',
      features: ['Unlimited projects', '200 AI generations/month', 'Custom API keys']
    },
    { 
      id: 'premium',
      name: '💎 Pro', 
      features: ['Everything in Plus', 'Unlimited generations', 'All AI models']
    },
    { 
      id: 'team',
      name: '👥 Team',
      features: ['Everything in Pro', 'Team collaboration', '10 seats']
    }
  ]}
/>
```

---

## 🔐 **Step 6: Environment Variables**

Add these to your `.env` file:

```env
# Clerk Billing (automatically configured when you enable billing)
CLERK_BILLING_WEBHOOK_SECRET=whsec_billing_...

# These are automatically set by Clerk when billing is enabled:
# NEXT_PUBLIC_CLERK_BILLING_ENABLED=true
```

---

## 📊 **Step 7: Usage Tracking**

### 7.1 Track Generation Usage
```typescript
// In your AI generation API
import { auth } from '@clerk/nextjs/server'
import { getPlanLimits } from '@/lib/utils/subscription-plans'

export async function POST() {
  const { userId, has } = await auth()
  
  // Check plan limits
  const isPro = has({ plan: 'pro' })
  const isPremium = has({ plan: 'premium' })
  
  if (!isPremium && userGenerationsThisMonth >= 200) {
    return NextResponse.json({ 
      error: 'Generation limit reached. Upgrade to Pro for unlimited generations.' 
    }, { status: 402 })
  }
  
  // Continue with generation...
}
```

### 7.2 Update User Model
```typescript
// In your webhook handler, sync Clerk subscription status
async function handleSubscriptionUpdated(data: any) {
  await User.findOneAndUpdate(
    { clerkId: data.user_id },
    { 
      plan: data.plan_id,
      'subscription.status': data.status,
      'subscription.currentPeriodEnd': new Date(data.current_period_end * 1000)
    }
  )
}
```

---

## 🧪 **Step 8: Testing**

### 8.1 Test Subscription Flow
1. **Development**: Use Stripe test cards
   - `4242 4242 4242 4242` (Visa)
   - `4000 0000 0000 0002` (Declined card)

### 8.2 Test Plan Protection
```bash
# Test API with different plan levels
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/premium-feature
```

---

## 🚀 **Step 9: Go Live**

### 9.1 Production Checklist
- [ ] Stripe account activated for live payments
- [ ] Clerk billing enabled in production environment
- [ ] Plan IDs match between Clerk and your code
- [ ] Webhook endpoints configured for production URLs
- [ ] Test the full subscription flow

### 9.2 Monitoring
- Monitor subscription events in Clerk Dashboard
- Set up Stripe webhooks for additional payment events
- Track usage metrics in your analytics

---

## 🔗 **Useful Links**

- **[Clerk Billing Documentation](https://clerk.com/docs/billing/overview)**
- **[Stripe Test Cards](https://stripe.com/docs/testing#cards)**
- **[Clerk `has()` Method](https://clerk.com/docs/billing/has-method)**
- **[Clerk `<Protect>` Component](https://clerk.com/docs/billing/protect-component)**

---

## 🆘 **Troubleshooting**

### Common Issues:
1. **PricingTable not showing**: Ensure billing is enabled in Clerk Dashboard
2. **Plan protection not working**: Check that Plan IDs match exactly
3. **Webhook errors**: Verify webhook secret and endpoint URL
4. **Stripe connection issues**: Complete Stripe KYC process

### Debug Commands:
```bash
# Check if billing is properly configured
curl http://localhost:3000/api/user/subscription-status

# Test plan protection
curl http://localhost:3000/api/test-protection
``` 