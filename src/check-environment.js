#!/usr/bin/env node
/**
 * Environment Configuration Checker for Magdee
 * Verifies that environment variables are properly configured
 */

const fs = require('fs');
const path = require('path');

function checkEnvironmentFile() {
  console.log('🔍 Checking Environment Configuration...\n');
  
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found');
    
    if (fs.existsSync(envExamplePath)) {
      console.log('✅ .env.example found');
      console.log('\n🔧 To fix this:');
      console.log('   1. Copy .env.example to .env:');
      console.log('      cp .env.example .env');
      console.log('   2. Edit .env with your Supabase credentials');
      console.log('   3. Restart your development server');
    } else {
      console.log('❌ .env.example also not found');
    }
    
    return false;
  }
  
  console.log('✅ .env file found');
  
  // Read and parse .env file
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    console.log(`📄 Found ${Object.keys(envVars).length} environment variables\n`);
    
    // Check required variables
    const requiredVars = [
      'REACT_APP_SUPABASE_URL',
      'REACT_APP_SUPABASE_ANON_KEY',
      'REACT_APP_SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    let allValid = true;
    
    console.log('🔍 Checking Required Variables:');
    
    for (const varName of requiredVars) {
      const value = envVars[varName];
      
      if (!value) {
        console.log(`   ❌ ${varName}: Not set`);
        allValid = false;
      } else if (value.includes('your_') || value.includes('your-project')) {
        console.log(`   ⚠️  ${varName}: Contains placeholder value`);
        console.log(`       Current: ${value.substring(0, 50)}...`);
        allValid = false;
      } else {
        console.log(`   ✅ ${varName}: Configured`);
        // Show partial value for verification
        if (varName.includes('URL')) {
          console.log(`       Value: ${value}`);
        } else {
          console.log(`       Value: ${value.substring(0, 20)}...`);
        }
      }
    }
    
    console.log('\n🔍 Checking Optional Variables:');
    
    const optionalVars = [
      'REACT_APP_SUPABASE_DB_URL',
      'REACT_APP_DEBUG_MODE',
      'REACT_APP_PYTHON_BACKEND_URL'
    ];
    
    for (const varName of optionalVars) {
      const value = envVars[varName];
      
      if (value) {
        console.log(`   ✅ ${varName}: ${value}`);
      } else {
        console.log(`   ⚪ ${varName}: Not set (optional)`);
      }
    }
    
    // Validation
    if (allValid) {
      console.log('\n🎉 Environment Configuration Complete!');
      console.log('Your app should work with your Supabase project.');
      console.log('\n📝 Next steps:');
      console.log('   1. Run: npm start');
      console.log('   2. Check for any remaining warnings in the console');
      console.log('   3. Set up your database tables (see DATABASE_SETUP_GUIDE.md)');
    } else {
      console.log('\n⚠️  Configuration Issues Found');
      console.log('\n🔧 To fix:');
      console.log('   1. Go to https://app.supabase.com');
      console.log('   2. Select your project');
      console.log('   3. Go to Settings → API');
      console.log('   4. Copy your Project URL and anon key');
      console.log('   5. Update your .env file with the actual values');
      console.log('   6. Restart your development server');
      console.log('\n📚 For detailed help: ENVIRONMENT_SETUP_GUIDE.md');
    }
    
    return allValid;
    
  } catch (error) {
    console.log(`❌ Error reading .env file: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🚀 MAGDEE ENVIRONMENT CHECKER');
  console.log('='.repeat(50));
  
  const isValid = checkEnvironmentFile();
  
  console.log('\n' + '='.repeat(50));
  
  if (isValid) {
    console.log('✅ All checks passed!');
  } else {
    console.log('❌ Please fix the issues above');
  }
  
  process.exit(isValid ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { checkEnvironmentFile };