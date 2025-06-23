const { MongoClient } = require('mongodb');

// MongoDB connection details (update these to match your setup)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/v0-flutter';

async function fixUsageAnalytics() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const users = db.collection('users');
    const projects = db.collection('projects');
    
    // Get all users
    const allUsers = await users.find({}).toArray();
    console.log(`Found ${allUsers.length} users to process`);
    
    for (const user of allUsers) {
      console.log(`\nProcessing user: ${user.clerkId}`);
      
      // Count actual projects for this user
      const actualProjectCount = await projects.countDocuments({ userId: user.clerkId });
      console.log(`  - Actual projects in DB: ${actualProjectCount}`);
      console.log(`  - User.usage.projectsThisMonth: ${user.usage?.projectsThisMonth || 0}`);
      console.log(`  - User.analytics.totalProjects: ${user.analytics?.totalProjects || 0}`);
      
      // Check if we need to update
      const needsUpdate = 
        (user.usage?.projectsThisMonth || 0) !== actualProjectCount ||
        (user.analytics?.totalProjects || 0) !== actualProjectCount;
      
      if (needsUpdate) {
        console.log(`  - 🔄 Updating user usage stats...`);
        
        const updateResult = await users.updateOne(
          { _id: user._id },
          {
            $set: {
              'usage.projectsThisMonth': actualProjectCount,
              'analytics.totalProjects': actualProjectCount,
              'analytics.lastActiveAt': new Date()
            }
          }
        );
        
        console.log(`  - ✅ Updated: ${updateResult.modifiedCount} document(s)`);
      } else {
        console.log(`  - ✓ Already in sync`);
      }
    }
    
    console.log('\n🎉 Usage analytics fix completed!');
    
  } catch (error) {
    console.error('Error fixing usage analytics:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Check if MongoDB URI is available
if (!process.env.MONGODB_URI) {
  console.log('\n⚠️  MONGODB_URI environment variable not set.');
  console.log('Please set it in your .env file or run:');
  console.log('MONGODB_URI="your_mongodb_connection_string" node scripts/fix-usage-analytics.js');
  process.exit(1);
}

fixUsageAnalytics(); 