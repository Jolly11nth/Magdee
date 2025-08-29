#!/usr/bin/env node

/**
 * Python Backend Setup Script
 * Helps configure environment variables and verify setup
 */

const fs = require('fs');
const path = require('path');

console.log('🐍 Python Backend Setup for Magdee');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ .env file not found. Please create one with your environment variables.');
  console.log('📋 Copy the .env.example file to .env and fill in your values:\n');
  console.log('cp .env.example .env\n');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');

// Check for required variables
const requiredVars = [
  'REACT_APP_SUPABASE_URL',
  'REACT_APP_SUPABASE_ANON_KEY'
];

const optionalVars = [
  'REACT_APP_PYTHON_BACKEND_URL'
];

console.log('🔍 Checking environment variables...\n');

let allRequired = true;
let warnings = [];

// Check required variables
requiredVars.forEach(varName => {
  if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your_`)) {
    console.log(`✅ ${varName}: Configured`);
  } else {
    console.log(`❌ ${varName}: Missing or not configured`);
    allRequired = false;
  }
});

// Check optional variables
optionalVars.forEach(varName => {
  if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=http://localhost:8000`)) {
    console.log(`✅ ${varName}: Custom URL configured`);
  } else if (envContent.includes(`${varName}=http://localhost:8000`)) {
    console.log(`⚠️  ${varName}: Using default localhost:8000`);
    warnings.push(`${varName} is using default localhost. Update if your backend runs on a different port.`);
  } else {
    console.log(`⚠️  ${varName}: Not configured, will use localhost:8000`);
    warnings.push(`${varName} not set. Add REACT_APP_PYTHON_BACKEND_URL=http://localhost:8000 to your .env file.`);
  }
});

console.log('\n📋 Setup Summary:');
console.log('==================');

if (!allRequired) {
  console.log('❌ Setup incomplete. Please configure missing required variables.');
  console.log('\n🔧 Required actions:');
  console.log('1. Add your Supabase URL and Anon Key to .env');
  console.log('2. Get these values from your Supabase project dashboard');
  process.exit(1);
}

if (warnings.length > 0) {
  console.log('⚠️  Setup warnings:');
  warnings.forEach(warning => console.log(`   - ${warning}`));
  console.log('');
}

console.log('✅ Environment configuration looks good!');
console.log('\n🚀 Next Steps:');
console.log('==============');
console.log('1. Start the Python backend:');
console.log('   pip install -r requirements.txt');
console.log('   python start.py --mode dev');
console.log('');
console.log('2. Start your React app:');
console.log('   npm start');
console.log('');
console.log('3. Check the Python Backend Status indicator in your app');
console.log('   (Look for the indicator in the top-right corner)');
console.log('');
console.log('4. Test the integration:');
console.log('   Visit the Python Backend Test screen in your app');
console.log('');

// Check if Python backend files exist
const pythonFiles = [
  'main.py',
  'requirements.txt',
  'app/config.py',
  'app/database.py'
];

const missingPythonFiles = pythonFiles.filter(file => !fs.existsSync(path.join(process.cwd(), file)));

if (missingPythonFiles.length > 0) {
  console.log('⚠️  Some Python backend files are missing:');
  missingPythonFiles.forEach(file => console.log(`   - ${file}`));
  console.log('   Make sure all Python backend files are properly created.');
  console.log('');
}

console.log('📚 Helpful Links:');
console.log('==================');
console.log('- API Documentation: http://localhost:8000/docs (after starting Python backend)');
console.log('- Backend Health Check: http://localhost:8000/health');
console.log('- Integration Guide: ./integration-guide.md');
console.log('');
console.log('Happy coding! 🎉');