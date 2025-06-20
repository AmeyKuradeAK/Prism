# Professional MongoDB & Clerk Setup Guide

## 🎯 **Complete Integration Overview**

This guide will set up a professional-grade authentication system where:
- ✅ Users are automatically created in MongoDB when they sign up with Clerk
- ✅ User profiles sync automatically between Clerk and MongoDB  
- ✅ Real-time user data synchronization via webhooks
- ✅ Proper error handling and reconnection logic
- ✅ Production-ready MongoDB connection pooling

---

## 📋 **Prerequisites**

1. **MongoDB Atlas Account** (free tier works)
2. **Clerk Account** (free tier works)
3. **Domain/ngrok for webhooks** (for local development)

---

## 🔧 **Step 1: MongoDB Atlas Setup**

### 1.1 Create MongoDB Atlas Cluster
```bash
1. Go to https://cloud.mongodb.com/
2. Create new project: "v0-flutter-prod"
3. Create cluster (M0 Free tier is fine)
4. Choose AWS/closest region to your users
```

### 1.2 Configure Network Access
```bash
1. Go to "Network Access" in Atlas
2. Click "Add IP Address"
3. Select "Allow access from anywhere" (0.0.0.0/0)
4. Or add specific IPs for production security
```

### 1.3 Create Database User
```bash
1. Go to "Database Access"
2. Click "Add New Database User"
3. Username: "v0-flutter-user"
4. Password: Generate strong password
5. Role: "Atlas admin" (or custom with readWrite to your database)
```

### 1.4 Get Connection String
```bash
1. Go to "Databases" → "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace <password> with your actual password
```

Example connection string:
```
mongodb+srv://v0-flutter-user:YOUR_PASSWORD@cluster0.abc123.mongodb.net/v0-flutter?retryWrites=true&w=majority
```

---

## 🔐 **Step 2: Clerk Setup**

### 2.1 Create Clerk Application
```bash
1. Go to https://clerk.com/
2. Create new application: "V0 Flutter Builder"
3. Choose authentication providers (Email, Google, GitHub, etc.)
4. Get API keys from the dashboard
```

### 2.2 Configure Webhooks
```bash
1. Go to Clerk Dashboard → "Webhooks"
2. Click "Add Endpoint"
3. Endpoint URL: https://yourdomain.com/api/webhooks/clerk
   (For local dev: https://abc123.ngrok.io/api/webhooks/clerk)
4. Subscribe to events:
   - user.created
   - user.updated  
   - user.deleted
5. Click "Create"
6. After creation, click on your newly created endpoint
7. Copy the "Signing Secret" (starts with "whsec_")
```

**Note:** The webhook signing secret is only visible AFTER you create the endpoint. You'll find it when you click on the endpoint you just created.

### 2.3 Environment Variables
Add these to your `.env` file:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://v0-flutter-user:YOUR_PASSWORD@cluster0.abc123.mongodb.net/v0-flutter?retryWrites=true&w=majority

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

## 🚀 **Step 3: Test the Integration**

### 3.1 Start Development Server
```bash
npm run dev
```

### 3.2 Test User Creation
```bash
1. Go to http://localhost:3000/sign-up
2. Create a new account
3. Check MongoDB Atlas → "Browse Collections"
4. Verify user was created in "users" collection
```

### 3.3 Test Webhook (Local Development)
If testing locally with ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Use this as your Clerk webhook endpoint
```

---

## 🔍 **Step 4: Verify Everything Works**

### 4.1 Database Connection
Check logs for:
```
✅ Successfully connected to MongoDB
📨 Received Clerk webhook: user.created
✅ Created user in MongoDB: user_xxx
```

### 4.2 User Synchronization Test
1. **Sign up** → User should appear in MongoDB
2. **Update profile** in Clerk → MongoDB should update
3. **Delete user** in Clerk → MongoDB should remove user

### 4.3 MongoDB Data Structure
Your users collection should look like:
```json
{
  "_id": "ObjectId(...)",
  "clerkId": "user_2abc123def456",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "avatar": "https://images.clerk.dev/...",
  "plan": "free",
  "credits": 999999,
  "preferences": {
    "expoVersion": "53.0.0",
    "codeStyle": "typescript",
    "theme": "light"
  },
  "usage": {
    "generationsThisMonth": 0,
    "buildsThisMonth": 0,
    "storageUsed": 0
  },
  "analytics": {
    "totalGenerations": 0,
    "totalBuilds": 0,
    "totalProjects": 0,
    "lastActiveAt": "2024-01-20T10:30:00.000Z"
  },
  "createdAt": "2024-01-20T10:30:00.000Z",
  "updatedAt": "2024-01-20T10:30:00.000Z"
}
```

---

## 🛡️ **Step 5: Production Deployment**

### 5.1 Environment Variables for Production
```env
# Use production MongoDB cluster
MONGODB_URI=mongodb+srv://prod-user:STRONG_PASSWORD@prod-cluster.mongodb.net/v0-flutter-prod?retryWrites=true&w=majority

# Use production Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Production URLs
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 5.2 MongoDB Production Settings
```bash
1. Create separate production cluster
2. Enable MongoDB Atlas backup
3. Set up monitoring and alerts
4. Configure IP whitelist for production servers
5. Use strong passwords and rotate regularly
```

### 5.3 Clerk Production Settings
```bash
1. Configure production domains
2. Set up custom email templates
3. Enable 2FA for admin accounts
4. Configure rate limiting
5. Set up monitoring dashboards
```

---

## 🔧 **Troubleshooting**

### Connection Issues
```bash
# Check MongoDB connection
curl -X POST http://localhost:3000/api/test-db

# Check Clerk webhook
curl -X POST http://localhost:3000/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Common Problems

**1. MongoDB Connection Fails**
- ✅ Check IP whitelist (0.0.0.0/0 for development)
- ✅ Verify username/password in connection string
- ✅ Ensure cluster is running (not paused)

**2. Webhook Not Firing**  
- ✅ Check Clerk webhook URL is correct
- ✅ Verify webhook secret is set in environment variables
- ✅ Check ngrok is running (for local dev)  
- ✅ Look at Clerk webhook logs in dashboard

**3. Cannot Find Webhook Secret**
- ✅ Create the webhook endpoint first in Clerk Dashboard
- ✅ Click on the created endpoint to view details
- ✅ Look for "Signing Secret" section (not during creation)
- ✅ Copy the secret that starts with "whsec_"

**4. User Not Created in MongoDB**
- ✅ Check webhook endpoint is reachable
- ✅ Verify MongoDB connection is working
- ✅ Check server logs for errors
- ✅ Test webhook signature verification

### Debug Commands
```bash
# Check MongoDB health
npm run check-db

# Test webhook manually
npm run test-webhook

# View connection status
npm run db-status
```

---

## 📊 **Monitoring & Maintenance**

### MongoDB Atlas Monitoring
- Set up alerts for connection issues
- Monitor database performance metrics
- Track storage usage and costs
- Regular backup verification

### Clerk Monitoring  
- Monitor webhook delivery rates
- Track authentication metrics
- Set up user growth alerts
- Monitor API usage limits

### Application Monitoring
- Log all database operations
- Track webhook processing times
- Monitor user creation/sync rates
- Set up error alerts

---

## ✅ **Success Checklist**

- [ ] MongoDB Atlas cluster created and configured
- [ ] Network access configured (0.0.0.0/0)
- [ ] Database user created with proper permissions
- [ ] Connection string working
- [ ] Clerk application created and configured
- [ ] Webhook endpoint configured and tested
- [ ] Environment variables set correctly
- [ ] User sign-up creates MongoDB record
- [ ] User updates sync to MongoDB
- [ ] Error handling and logging working
- [ ] Production deployment configured

Your professional-grade MongoDB and Clerk integration is now complete! 🎉

Users will automatically be created and synced between Clerk and MongoDB with full error handling and production-ready architecture. 