# 🔐 **Finding Your Clerk Webhook Secret**

The webhook secret location has changed in recent Clerk dashboard updates. Here's exactly where to find it:

---

## 📋 **Step-by-Step Guide**

### **Step 1: Create Webhook Endpoint**
1. Go to **Clerk Dashboard** → **"Webhooks"**
2. Click **"Add Endpoint"**
3. Enter your endpoint URL:
   - Production: `https://yourdomain.com/api/webhooks/clerk`
   - Local dev: `https://abc123.ngrok.io/api/webhooks/clerk`
4. Select events: `user.created`, `user.updated`, `user.deleted`
5. Click **"Create"**

### **Step 2: Find the Signing Secret** 
**🚨 IMPORTANT:** The secret is NOT shown during creation!

1. After creating the endpoint, you'll see it in the webhooks list
2. **Click on the endpoint** you just created
3. Look for the **"Signing Secret"** section
4. Copy the secret (starts with `whsec_`)

---

## 🔍 **Visual Guide**

### **What You'll See:**
```
Webhooks Page
├── Add Endpoint (button)
├── Your Endpoints List
│   ├── https://yourdomain.com/api/webhooks/clerk ← Click this!
│   └── Status: Active
└── Event Catalog (tab)

After Clicking Endpoint:
├── Endpoint Details
├── Signing Secret: whsec_abc123... ← Copy this!
├── Message Attempts
└── Testing (tab)
```

---

## ⚙️ **Environment Setup**

Add to your `.env` file:
```env
CLERK_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

**Example:**
```env
CLERK_WEBHOOK_SECRET=whsec_et3R4L6X9mPp7N2kQ8vH1sY6tF0wE5zI
```

---

## 🧪 **Test Your Setup**

### **1. Test Database Health**
```bash
curl http://localhost:3000/api/test-db
```

### **2. Test Webhook Endpoint**
```bash
curl -X POST http://localhost:3000/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### **3. Test Real Webhook**
1. Go to Clerk Dashboard → Webhooks → Your Endpoint
2. Click **"Testing"** tab
3. Select `user.created` event
4. Click **"Send Example"**
5. Check your server logs for the webhook

---

## 🚨 **Common Issues**

### **"Cannot find webhook secret"**
- ✅ Make sure you created the endpoint first
- ✅ Click on the endpoint (don't just look at the list)
- ✅ Look for "Signing Secret" section in endpoint details

### **"Missing svix headers"**
- ✅ Verify the webhook secret is correctly set in `.env`
- ✅ Restart your development server after adding the secret
- ✅ Check the environment variable is loaded: `console.log(process.env.CLERK_WEBHOOK_SECRET)`

### **"Invalid signature"**
- ✅ Make sure you copied the full secret (starts with `whsec_`)
- ✅ No extra spaces or characters in the environment variable
- ✅ Verify the endpoint URL is exactly the same in Clerk and your app

---

## 🎯 **Quick Test Commands**

### **Check Environment Variable**
```javascript
// Add this to your webhook endpoint temporarily
console.log('Webhook secret:', process.env.CLERK_WEBHOOK_SECRET ? 'Set' : 'Missing')
```

### **Test Webhook Reception**
```javascript
// Add this to log all incoming webhook requests
export async function POST(request: NextRequest) {
  console.log('📨 Webhook received!')
  console.log('Headers:', Object.fromEntries(request.headers.entries()))
  
  // ... rest of your webhook code
}
```

---

## ✅ **Success Checklist**

- [ ] Webhook endpoint created in Clerk Dashboard
- [ ] Clicked on the endpoint to view details
- [ ] Found and copied the "Signing Secret"
- [ ] Added `CLERK_WEBHOOK_SECRET` to environment variables
- [ ] Restarted development server
- [ ] Test webhook fires successfully
- [ ] No "invalid signature" errors in logs
- [ ] Users sync to MongoDB automatically

---

## 📞 **Still Having Issues?**

If you're still having trouble:

1. **Check Clerk Dashboard Logs:**
   - Go to Webhooks → Your Endpoint → Message Attempts
   - Look for failed delivery attempts and error messages

2. **Test Manually:**
   - Use the "Testing" tab in Clerk dashboard
   - Send example events and check your server logs

3. **Verify ngrok (Local Development):**
   ```bash
   # Make sure ngrok is running and tunnel is active
   ngrok http 3000
   ```

4. **Check Server Logs:**
   ```bash
   # Look for these messages in your console
   ✅ Successfully connected to MongoDB
   📨 Received Clerk webhook: user.created
   ✅ Created user in MongoDB: user_xxx
   ```

Your webhook integration should now work perfectly! 🎉 