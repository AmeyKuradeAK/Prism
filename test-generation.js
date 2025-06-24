const { runV0Pipeline } = require('./lib/generators/v0-pipeline.ts');

async function testGeneration() {
  try {
    console.log('🧪 Testing generation pipeline...');
    
    const files = await runV0Pipeline('Create a simple todo app');
    
    console.log('✅ Generation successful!');
    console.log('📁 Generated files:', Object.keys(files));
    
    // Check if App.tsx exists and doesn't contain expo-router
    if (files['App.tsx']) {
      const appContent = files['App.tsx'];
      console.log('\n📱 App.tsx preview:');
      console.log(appContent.substring(0, 300) + '...');
      
      if (appContent.includes('expo-router')) {
        console.log('❌ ERROR: App.tsx still contains expo-router!');
      } else {
        console.log('✅ SUCCESS: App.tsx uses standard React Native!');
      }
    }
    
    // Check package.json
    if (files['package.json']) {
      const packageJson = JSON.parse(files['package.json']);
      console.log('\n📦 Package.json dependencies:');
      console.log('Dependencies:', Object.keys(packageJson.dependencies || {}));
      
      if (packageJson.dependencies['expo-router']) {
        console.log('❌ ERROR: package.json still includes expo-router!');
      } else {
        console.log('✅ SUCCESS: package.json uses standard React Native dependencies!');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testGeneration(); 