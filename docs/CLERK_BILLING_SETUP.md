# 💳 **Complete Clerk Billing Setup Guide**

## 🎯 **Overview**

This guide will help you set up **Clerk's native billing system** for your React Native AI app builder. We've completely rebuilt the subscription system to use Clerk's PricingTable, billing portal, and webhooks.

**What's Included:**
- ✅ Clerk PricingTable component for subscription management
- ✅ Automatic billing portal integration
- ✅ Real-time subscription status via webhooks
- ✅ Plan protection system using Clerk's `has()` method
- ✅ Same plan slugs (spark, pro, premium, team, enterprise)

---

## 📦 **Step 1: Create Plans in Clerk Dashboard**

### 1.1 Navigate to Billing
1. Go to **[Clerk Dashboard](https://dashboard.clerk.com)**
2. Select your project
3. Click **"Billing"** in the left sidebar
4. Click **"Enable Billing"** (if not already enabled)

### 1.2 Connect Stripe
1. You'll be prompted to connect your Stripe account
2. If you don't have Stripe: **[Create Stripe Account](https://dashboard.stripe.com/register)**
3. Complete the Stripe onboarding process
4. Return to Clerk and complete the connection

### 1.3 Create Subscription Plans

**⚠️ CRITICAL:** Plan IDs must match exactly for the system to work.

#### **🆓 Free Plan**
- **Plan ID**: `free` 
- **Name**: `Spark`
- **Price**: Free
- **Features**: 15 prompts/month, 3 projects/month

#### **🚀 Plus Plan**
- **Plan ID**: `plus` *(must match exactly)*
- **Name**: `Plus`
- **Monthly Price**: `$19/month`
- **Yearly Price**: `$190/year`
- **Features**: 200 prompts/month, unlimited projects, custom API keys

#### **💎 Pro Plan**
- **Plan ID**: `pro` *(must match exactly)*
- **Name**: `Pro`
- **Monthly Price**: `$49/month`
- **Yearly Price**: `$490/year`
- **Features**: 500 prompts/month, all AI models, custom branding

#### **👥 Team Plan**
- **Plan ID**: `team` *(must match exactly)*
- **Name**: `Team`
- **Monthly Price**: `$99/month`
- **Yearly Price**: `$990/year`
- **Features**: 1,400 prompts/month, team collaboration

#### **🏢 Enterprise Plan**
- **Plan ID**: `enterprise` *(must match exactly)*
- **Name**: `Enterprise`
- **Price**: Custom pricing (handle separately)
- **Features**: Unlimited everything, SSO, dedicated support

---

## 🔧 **Step 2: Environment Variables**

Add these to your `.env.local` file:

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk Webhook Secret (get from webhook endpoint settings)
CLERK_WEBHOOK_SECRET=whsec_...

# MongoDB for usage tracking
MONGODB_URI=your_mongodb_connection_string

# AI API Keys
MISTRAL_API_KEY=your_mistral_api_key

# Encryption for API key storage
ENCRYPTION_KEY=your_32_character_encryption_key
```

---

## 🎛️ **Step 3: Configure Webhooks**

### 3.1 Create Webhook Endpoint
1. In Clerk Dashboard → **"Webhooks"**
2. Click **"Add Endpoint"**
3. Enter your endpoint URL:
   - **Production**: `https://yourdomain.com/api/webhooks/clerk`
   - **Development**: `https://abc123.ngrok.io/api/webhooks/clerk`

### 3.2 Select Events
Select these events:
- `user.created`
- `user.updated`
- `user.deleted`
- `billing.subscription.created`
- `billing.subscription.updated` 
- `billing.subscription.cancelled`

### 3.3 Get Webhook Secret
1. After creating the endpoint, **click on it** in the list
2. Copy the **"Signing Secret"** (starts with `whsec_`)
3. Add it to your `.env.local` as `CLERK_WEBHOOK_SECRET`

---

## 🧪 **Step 4: Test the Integration**

### 4.1 Test Subscription Status API
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/user/subscription-status
```

### 4.2 Test Plan Protection
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/generate
```

### 4.3 Test PricingTable
1. Sign up for an account
2. Go to `/pricing`
3. Verify Clerk's PricingTable loads with your plans
4. Test upgrading with Stripe test cards:
   - **Success**: `4242 4242 4242 4242`
   - **Declined**: `4000 0000 0000 0002`

---

## 🎨 **Step 5: Billing Portal Integration**

The billing portal is automatically integrated in:

1. **Settings Page** → "Billing & Plans" tab → "Open Billing Portal"
2. **Dashboard Header** → User menu → billing options
3. **Pricing Page** → PricingTable handles upgrades/downgrades

**Code Example:**
```typescript
const handleBillingPortal = () => {
  if (typeof window !== 'undefined' && window.Clerk && typeof window.Clerk.openBillingPortal === 'function') {
    window.Clerk.openBillingPortal()
  } else {
    window.location.href = '/pricing'
  }
}
```

---

## 🛡️ **Step 6: Plan Protection**

Plan protection is now handled by Clerk's `has()` method:

```typescript
import { auth } from '@clerk/nextjs/server'

export async function POST() {
  const { userId, has } = await auth()
  
  // Check if user has Pro plan or higher
  if (!has({ plan: 'pro' })) {
    return NextResponse.json({ 
      error: 'Upgrade required',
      message: 'This feature requires Pro plan or higher'
    }, { status: 402 })
  }
  
  // Continue with protected functionality...
}
```

**Plan Hierarchy:**
- `free` → Free plan (spark)
- `plus` → Plus plan (pro in our system)
- `pro` → Pro plan (premium in our system)  
- `team` → Team plan
- `enterprise` → Enterprise plan

---

## 📊 **Step 7: Usage Tracking**

The system automatically tracks usage in MongoDB while Clerk manages billing:

**What's Tracked:**
- Monthly prompt usage
- Monthly project creation
- Usage percentages and limits
- Reset dates based on billing cycles

**Database Schema:**
```typescript
{
  clerkId: string,
  plan: 'spark' | 'pro' | 'premium' | 'team' | 'enterprise',
  usage: {
    promptsThisMonth: number,
    projectsThisMonth: number,
    lastResetAt: Date
  },
  subscription: {
    planId: string,
    status: string,
    currentPeriodEnd: Date
  }
}
```

---

## 🚀 **Step 8: Going Live**

### Production Checklist:
- [ ] Stripe account activated for live payments
- [ ] Clerk billing enabled in production environment
- [ ] Plan IDs match exactly (`free`, `plus`, `pro`, `team`, `enterprise`)
- [ ] Webhook endpoints configured for production URLs
- [ ] Environment variables set in production
- [ ] Test complete subscription flow
- [ ] Verify plan protection works

### Test Live Flow:
1. Create real Stripe account with live keys
2. Update Clerk to use live Stripe account
3. Test subscription creation/cancellation
4. Verify webhooks are received
5. Test billing portal functionality

---

## 🔄 **Migration from Old System**

If you had a previous subscription system:

1. **Remove old Stripe code** ✅ Done
2. **Update plan IDs in Clerk** ✅ Required
3. **Test webhook handlers** ✅ Updated
4. **Verify PricingTable** ✅ Implemented
5. **Update plan protection** ✅ Done

**Plan ID Mapping:**
```
Internal → Clerk
spark → free
pro → plus  
premium → pro
team → team
enterprise → enterprise
```

---

## 🆘 **Troubleshooting**

### Common Issues:

**1. PricingTable not showing plans**
- ✅ Ensure billing is enabled in Clerk Dashboard
- ✅ Verify Plan IDs match exactly (`plus`, `pro`, `team`, `enterprise`)
- ✅ Check browser console for errors

**2. Plan protection not working**
- ✅ Verify Plan IDs in Clerk Dashboard
- ✅ Check webhook events are being received
- ✅ Test `has()` method in API routes

**3. Billing portal not opening**
- ✅ Ensure Clerk billing is enabled
- ✅ Check if `window.Clerk.openBillingPortal` exists
- ✅ Verify user is signed in

**4. Webhooks not working**
- ✅ Check webhook secret is correct
- ✅ Verify endpoint URL is accessible
- ✅ Check webhook delivery logs in Clerk Dashboard

### Debug Commands:
```bash
# Check subscription status
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/user/subscription-status

# Test database connection
curl http://localhost:3000/api/test-db

# Check plan protection
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/generate
```

---

## 🔗 **Useful Links**

- **[Clerk Billing Docs](https://clerk.com/docs/billing/overview)**
- **[Clerk PricingTable](https://clerk.com/docs/billing/pricing-table)**
- **[Stripe Test Cards](https://stripe.com/docs/testing#cards)**
- **[Webhook Events](https://clerk.com/docs/webhooks/overview)**

---

## ✅ **Final Verification**

Your system is ready when:

- [ ] PricingTable displays all plans correctly
- [ ] Users can upgrade/downgrade through PricingTable
- [ ] Billing portal opens from settings
- [ ] Plan protection works in API routes
- [ ] Webhooks update user plans in database
- [ ] Usage tracking works correctly
- [ ] Test cards work in development

**🎉 Congratulations!** Your Clerk billing system is now fully integrated. 