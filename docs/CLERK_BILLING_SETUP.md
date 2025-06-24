# 💳 **Clerk Billing Setup Guide**

Complete step-by-step guide to set up Clerk billing for your React Native AI app builder.

## 🚨 **IMPORTANT: Current Issues & Fixes**

### Issue 1: "Cannot change header: headers are immutable"
**Fixed in this update:**
- Updated middleware to use proper `NextResponse.redirect()` with explicit headers
- Fixed API routes to use `redirect()` from `next/navigation` instead of `NextResponse.redirect()`
- Converted pricing page to client-side component to handle onClick events properly

### Issue 2: Plans not syncing with Clerk subscription
**Fixed in this update:**
- Updated plan protection system to use Clerk's `has()` method correctly
- Fixed subscription status API to properly check Clerk billing
- Added proper billing portal integration

---

## 🎯 **Step 1: Enable Billing in Clerk Dashboard**

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

⚠️ **Note:** Billing must be enabled for the `PricingTable` component to work properly.

---

## 📦 **Step 2: Create Subscription Plans**

Create these plans in your Clerk Dashboard exactly as shown:

### Plan Configuration:

#### **🚀 Plus Plan**
- **Plan ID**: `pro` *(must match exactly)*
- **Name**: `Plus`
- **Monthly Price**: `$19/month`
- **Yearly Price**: `$190/year` (or $16/month billed annually)

#### **💎 Pro Plan**
- **Plan ID**: `premium` *(must match exactly)*
- **Name**: `Pro`
- **Monthly Price**: `$49/month`
- **Yearly Price**: `$490/year` (or $41/month billed annually)

#### **👥 Team Plan**
- **Plan ID**: `team` *(must match exactly)*
- **Name**: `Team`
- **Monthly Price**: `$99/month`
- **Yearly Price**: `$990/year` (or $83/month billed annually)

#### **🏢 Enterprise Plan**
- **Plan ID**: `enterprise` *(must match exactly)*
- **Name**: `Enterprise`
- **Price**: `$299/month` (placeholder - handle custom pricing separately)

### 2.1 Creating Plans in Clerk Dashboard
1. In Clerk Dashboard → **"Billing"** → **"Plans"**
2. Click **"Create Plan"**
3. For each plan:
   - Set the **Plan ID** exactly as shown above
   - Configure pricing for both monthly and yearly intervals
   - Add features and descriptions

---

## 🔧 **Step 3: Environment Variables**

Add these to your `.env.local` file:

```env
# Clerk Configuration (should already exist)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk Webhook Secret
CLERK_WEBHOOK_SECRET=whsec_...

# Other required variables
MISTRAL_API_KEY=your_mistral_api_key
MONGODB_URI=your_mongodb_connection_string
ENCRYPTION_KEY=your_32_character_encryption_key
```

---

## 🛡️ **Step 4: Test Plan Protection**

The updated plan protection system now works with Clerk's billing API:

```typescript
// Example usage in API routes
import { auth } from '@clerk/nextjs/server'

export async function POST() {
  const { userId, has } = await auth()
  
  // Check if user has Pro plan or higher
  if (!has({ plan: 'pro' })) {
    return NextResponse.json({ 
      error: 'Upgrade required',
      message: 'This feature requires Plus plan or higher'
    }, { status: 402 })
  }
  
  // Continue with protected functionality...
}
```

---

## 🎨 **Step 5: Billing Portal Integration**

The billing portal is now properly integrated:

1. **In Dashboard Header:** Click user menu → billing options
2. **In Settings Page:** Billing & Plans tab → "Open Billing Portal"
3. **In Pricing Page:** "Manage Your Subscription" section

---

## 🧪 **Step 6: Testing**

### Test with Stripe Test Cards:
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires 3D Secure**: `4000 0000 0000 3220`

### Test Plan Flow:
1. Sign up for an account
2. Go to `/pricing`
3. Select a plan in the PricingTable
4. Complete Stripe checkout
5. Verify plan access in `/settings`

---

## 🚀 **Step 7: Going Live**

### Production Checklist:
- [ ] Stripe account activated for live payments
- [ ] Clerk billing enabled in production environment
- [ ] Plan IDs match exactly between Clerk and code
- [ ] Webhook endpoints configured for production URLs
- [ ] Environment variables set in production
- [ ] Test complete subscription flow

---

## 🆘 **Troubleshooting**

### Common Issues:

1. **PricingTable not showing plans**
   - **Fix**: Ensure billing is enabled in Clerk Dashboard
   - **Fix**: Verify Plan IDs match exactly

2. **"Headers are immutable" errors**
   - **Fixed**: Updated middleware and API routes
   - **Fixed**: Converted pricing page to client-side

3. **Plan protection not working**
   - **Fix**: Check Plan IDs match exactly in Clerk Dashboard
   - **Fix**: Ensure webhook is receiving subscription events

4. **Billing portal not opening**
   - **Fix**: Ensure billing is enabled in Clerk
   - **Fix**: Check browser console for JavaScript errors

### Debug Commands:
```bash
# Check subscription status
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/user/subscription-status

# Test plan protection
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/generate
```

---

## 📊 **Step 8: Monitoring**

Monitor these in production:
- Clerk Dashboard → Billing section
- Stripe Dashboard → Subscriptions
- Your app's usage analytics
- Webhook delivery status

---

## 🔗 **Useful Links**

- **[Clerk Billing Docs](https://clerk.com/docs/billing/overview)**
- **[Stripe Test Cards](https://stripe.com/docs/testing#cards)**
- **[Clerk PricingTable Component](https://clerk.com/docs/billing/pricing-table)**
- **[Stripe Webhooks](https://stripe.com/docs/webhooks)**

---

## ✅ **Quick Setup Checklist**

- [ ] Clerk billing enabled in dashboard
- [ ] Stripe account connected to Clerk
- [ ] Plans created with correct Plan IDs (`pro`, `premium`, `team`, `enterprise`)
- [ ] Environment variables configured
- [ ] Webhook endpoint set up (`/api/webhooks/clerk`)
- [ ] Test subscription flow with Stripe test cards
- [ ] Verify plan protection works in API routes
- [ ] Test billing portal opens correctly

If you've followed this guide and still have issues, the problem is likely:
1. Plan IDs don't match exactly
2. Billing not enabled in Clerk Dashboard
3. Webhook secret misconfigured
4. Missing environment variables

The recent code updates should resolve the "headers are immutable" and plan sync issues you mentioned. 