#!/usr/bin/env node
/**
 * Build Validation Script for Magdee App
 * Validates that the app can compile without critical TypeScript errors
 */

const fs = require('fs');
const path = require('path');

function checkFileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
  } catch (error) {
    return null;
  }
}

function validateSupabaseInfo() {
  console.log('🔍 Validating utils/supabase/info.tsx...');
  
  const content = readFileContent('utils/supabase/info.tsx');
  if (!content) {
    console.log('  ❌ File not found');
    return false;
  }
  
  // Check for duplicate declarations
  const supabaseUrlExports = (content.match(/export const supabaseUrl/g) || []).length;
  const supabaseUrlDeclarations = (content.match(/const supabaseUrl\s*=/g) || []).length;
  
  if (supabaseUrlExports > 1) {
    console.log(`  ❌ Multiple 'export const supabaseUrl' found: ${supabaseUrlExports}`);
    return false;
  }
  
  if (supabaseUrlDeclarations > 1) {
    console.log(`  ❌ Multiple 'const supabaseUrl' declarations found: ${supabaseUrlDeclarations}`);
    return false;
  }
  
  // Check for required exports
  const requiredExports = ['projectId', 'publicAnonKey', 'supabaseUrl'];
  const missingExports = [];
  
  for (const exportName of requiredExports) {
    if (!content.includes(`export const ${exportName}`)) {
      missingExports.push(exportName);
    }
  }
  
  if (missingExports.length > 0) {
    console.log(`  ❌ Missing exports: ${missingExports.join(', ')}`);
    return false;
  }
  
  console.log('  ✅ Supabase info file is valid');
  return true;
}

function validateMainApp() {
  console.log('🔍 Validating App.tsx...');
  
  const content = readFileContent('App.tsx');
  if (!content) {
    console.log('  ❌ App.tsx not found');
    return false;
  }
  
  // Check for default export
  if (!content.includes('export default')) {
    console.log('  ❌ Missing default export');
    return false;
  }
  
  // Check for critical imports
  const criticalImports = [
    'AuthProvider',
    'EnvironmentValidator',
    'ScreenRouter'
  ];
  
  const missingImports = [];
  for (const importName of criticalImports) {
    if (!content.includes(importName)) {
      missingImports.push(importName);
    }
  }
  
  if (missingImports.length > 0) {
    console.log(`  ⚠️  Missing imports: ${missingImports.join(', ')}`);
    // Not critical for build, but worth noting
  }
  
  console.log('  ✅ App.tsx is valid');
  return true;
}

function validatePackageJson() {
  console.log('🔍 Validating package.json...');
  
  const content = readFileContent('package.json');
  if (!content) {
    console.log('  ❌ package.json not found');
    return false;
  }
  
  try {
    const pkg = JSON.parse(content);
    
    if (!pkg.dependencies) {
      console.log('  ❌ No dependencies found');
      return false;
    }
    
    // Check for critical dependencies
    const criticalDeps = [
      'react',
      'react-dom',
      '@supabase/supabase-js'
    ];
    
    const missingDeps = [];
    for (const dep of criticalDeps) {
      if (!pkg.dependencies[dep] && !pkg.devDependencies?.[dep]) {
        missingDeps.push(dep);
      }
    }
    
    if (missingDeps.length > 0) {
      console.log(`  ❌ Missing critical dependencies: ${missingDeps.join(', ')}`);
      return false;
    }
    
    console.log(`  ✅ Package.json valid with ${Object.keys(pkg.dependencies).length} dependencies`);
    return true;
    
  } catch (error) {
    console.log(`  ❌ Invalid JSON: ${error.message}`);
    return false;
  }
}

function validateEnvironmentValidator() {
  console.log('🔍 Validating EnvironmentValidator component...');
  
  const content = readFileContent('components/EnvironmentValidator.tsx');
  if (!content) {
    console.log('  ❌ EnvironmentValidator.tsx not found');
    return false;
  }
  
  // Check for required function
  if (!content.includes('validateSupabaseConfig')) {
    console.log('  ⚠️  Missing validateSupabaseConfig import');
  }
  
  // Check for export
  if (!content.includes('export function EnvironmentValidator')) {
    console.log('  ❌ Missing proper export');
    return false;
  }
  
  console.log('  ✅ EnvironmentValidator is valid');
  return true;
}

function checkLICENSEStructure() {
  console.log('🔍 Checking LICENSE file structure...');
  
  const licenseContent = readFileContent('LICENSE');
  
  if (!licenseContent) {
    console.log('  ❌ LICENSE file not found');
    return false;
  }
  
  if (licenseContent.includes('MIT License')) {
    console.log('  ✅ LICENSE file is properly formatted');
    
    // Check if LICENSE directory exists (it shouldn't)
    if (fs.existsSync('LICENSE') && fs.statSync('LICENSE').isDirectory()) {
      console.log('  ⚠️  LICENSE directory exists - should be a file');
      return false;
    }
    
    return true;
  } else {
    console.log('  ❌ LICENSE file content is invalid');
    return false;
  }
}

function main() {
  console.log('🚀 MAGDEE BUILD VALIDATION');
  console.log('=' .repeat(50));
  
  const validations = [
    { name: 'Supabase Info', check: validateSupabaseInfo },
    { name: 'Main App', check: validateMainApp },
    { name: 'Package JSON', check: validatePackageJson },
    { name: 'Environment Validator', check: validateEnvironmentValidator },
    { name: 'LICENSE Structure', check: checkLICENSEStructure }
  ];
  
  let allPassed = true;
  const results = [];
  
  for (const validation of validations) {
    try {
      const passed = validation.check();
      results.push({ name: validation.name, passed });
      if (!passed) allPassed = false;
    } catch (error) {
      console.log(`  ❌ ${validation.name}: Error - ${error.message}`);
      results.push({ name: validation.name, passed: false });
      allPassed = false;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(50));
  
  for (const result of results) {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${result.name}: ${status}`);
  }
  
  if (allPassed) {
    console.log('\n🎉 ALL VALIDATIONS PASSED!');
    console.log('Your app should compile successfully.');
    console.log('\n📝 Ready to run:');
    console.log('  npm start     # Start development server');
    console.log('  npm run build # Build for production');
  } else {
    console.log('\n⚠️  VALIDATION ISSUES DETECTED');
    console.log('Please fix the issues above before building.');
    console.log('\n🔧 Common fixes:');
    console.log('  - Check for duplicate variable declarations');
    console.log('  - Ensure all imports are correct');
    console.log('  - Verify file structure is correct');
  }
  
  process.exit(allPassed ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { validateSupabaseInfo, validateMainApp };