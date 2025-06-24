# 💳 **Complete Clerk Billing Setup Guide**

## 🎯 **Overview**

This guide will help you set up **Clerk's native billing system** for your React Native AI app builder. We've completely rebuilt the subscription system to use Clerk's PricingTable, billing portal, and webhooks.

**What's Included:**
- ✅ Clerk PricingTable component for subscription management
- ✅ Automatic billing portal integration
- ✅ Real-time subscription status via webhooks
- ✅ Plan protection system using Clerk's `has()` method
- ✅ Monthly prompt quotas with automatic reset
- ✅ Usage tracking and analytics

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
- **Plan ID**: `free` *(must match exactly)*
- **Name**: `Free`
- **Price**: Free
- **Features**: 30 prompts/month, 3 projects/month

#### **🚀 Plus Plan**
- **Plan ID**: `plus` *(must match exactly)*
- **Name**: `Plus`
- **Monthly Price**: `$19/month`
- **Yearly Price**: `$190/year`
- **Features**: 500 prompts/month, unlimited projects, custom API keys

#### **💎 Pro Plan**
- **Plan ID**: `pro` *(must match exactly)*
- **Name**: `Pro`
- **Monthly Price**: `$49/month`
- **Yearly Price**: `$490/year`
- **Features**: 2000 prompts/month, all AI models, custom branding

#### **👥 Team Plan**
- **Plan ID**: `team` *(must match exactly)*
- **Name**: `Team`
- **Monthly Price**: `$99/month`
- **Yearly Price**: `$990/year`
- **Features**: 1400 prompts/month, team collaboration, shared workspaces

#### **🏢 Enterprise Plan**
- **Plan ID**: `enterprise` *(must match exactly)*
- **Name**: `Enterprise`
- **Monthly Price**: `$299/month`
- **Yearly Price**: `$2990/year`
- **Features**: Unlimited prompts, unlimited team seats, custom integrations

---

## 🌐 **Step 2: Configure Webhooks**

### 2.1 Set Up Webhook Endpoint
1. In Clerk Dashboard, go to **"Webhooks"**
2. Click **"Add Endpoint"**
3. **Endpoint URL**: `https://yourdomain.com/api/webhooks/clerk`
4. **Events to send**:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
   - ✅ `billing.subscription.created`
   - ✅ `billing.subscription.updated`
   - ✅ `billing.subscription.cancelled`

### 2.2 Get Webhook Secret
1. After creating the webhook, copy the **Signing Secret**
2. Add it to your environment variables as `CLERK_WEBHOOK_SECRET`

---

## 🔧 **Step 3: Environment Variables**

Add these to your `.env.local`:

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# MongoDB (for usage tracking)
MONGODB_URI=mongodb+srv://...

# AI Provider (for app generation)
MISTRAL_API_KEY=your_mistral_api_key_here
```

---

## 🎨 **Step 4: Frontend Integration**

### 4.1 Pricing Page
The pricing page (`/pricing`) now includes:
- Static plan cards for public view
- Clerk PricingTable for signed-in users
- Proper plan limits and features

### 4.2 Billing Portal
Users can access billing management through:
- Settings page (`/settings`)
- Direct link to Clerk billing portal

### 4.3 Plan Protection
The system now uses Clerk's `has()` method for real-time plan checks:

```typescript
// Check if user has a specific plan
if (has({ plan: 'pro' })) {
  // User has Pro plan or higher
}

// Check feature access
if (has({ plan: 'plus' })) {
  // User has Plus plan or higher (custom API keys, etc.)
}
```

---

## 📊 **Step 5: Usage Tracking**

### 5.1 Monthly Quotas
- **Free**: 30 prompts/month
- **Plus**: 500 prompts/month
- **Pro**: 2000 prompts/month
- **Team**: 1400 prompts/month
- **Enterprise**: Unlimited

### 5.2 Automatic Reset
- Usage resets on the 1st of each month
- Automatic detection of new billing periods
- Real-time quota checking

### 5.3 Usage Analytics
- Daily usage tracking
- Monthly usage statistics
- Usage percentage calculations
- Reset date tracking

---

## 🔄 **Step 6: API Integration**

### 6.1 Generate API
The `/api/generate` endpoint now:
- Checks usage limits before generation
- Tracks prompt usage after successful generation
- Returns proper error messages for quota exceeded
- Supports both new and update operations

### 6.2 Subscription Status API
The `/api/user/subscription-status` endpoint provides:
- Current plan information
- Usage statistics
- Plan limits and features
- Reset dates and remaining quotas

### 6.3 Webhook Handlers
The `/api/webhooks/clerk` endpoint handles:
- User creation/updates/deletion
- Subscription changes
- Plan upgrades/downgrades
- Automatic plan synchronization

---

## 🧪 **Step 7: Testing**

### 7.1 Test the Setup
Run the test script:
```bash
node scripts/test-clerk-billing.js
```

### 7.2 Test Scenarios
1. **Free Plan**: Create account, verify 30 prompt limit
2. **Upgrade**: Subscribe to Plus plan, verify 500 prompt limit
3. **Usage**: Generate apps, verify usage tracking
4. **Quota**: Exceed limit, verify proper error messages
5. **Reset**: Test monthly usage reset
6. **Downgrade**: Cancel subscription, verify reversion to free

### 7.3 Test Cards
Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

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
- [ ] Test usage tracking and quotas

### Test Live Flow:
1. Create real Stripe account with live keys
2. Update Clerk to use live Stripe account
3. Test subscription creation/cancellation
4. Verify webhooks are received
5. Test billing portal functionality
6. Verify usage tracking works correctly

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
free → free
plus → plus  
pro → pro
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

**5. Usage tracking issues**
- ✅ Verify MongoDB connection
- ✅ Check user creation in database
- ✅ Verify monthly reset logic

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
- [ ] Monthly quotas are enforced
- [ ] Test cards work in development
- [ ] Monthly reset works properly

**🎉 Congratulations!** Your Clerk billing system is now fully integrated and ready for production use. 