#!/usr/bin/env python3
"""
Quick Diagnostics for Magdee App
Runs essential checks to ensure the app can build and run properly
"""

import os
import sys
import requests
from pathlib import Path

def check_critical_files():
    """Check that critical files are in place"""
    print("🔍 Checking Critical Files...")
    
    critical_files = [
        'App.tsx',
        'utils/supabase/info.tsx',
        'utils/supabase/client.tsx',
        'components/EnvironmentValidator.tsx',
        'package.json',
        'LICENSE'
    ]
    
    missing_files = []
    for file_path in critical_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
            print(f"  ❌ {file_path}: MISSING")
        else:
            print(f"  ✅ {file_path}: EXISTS")
    
    return len(missing_files) == 0, missing_files

def check_supabase_config():
    """Quick check of Supabase configuration"""
    print("\n🔍 Checking Supabase Configuration...")
    
    # Check for environment variables
    supabase_url = os.getenv('SUPABASE_URL') or os.getenv('REACT_APP_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY') or os.getenv('REACT_APP_SUPABASE_ANON_KEY')
    
    if supabase_url:
        print(f"  ✅ Supabase URL: {supabase_url[:30]}...")
    else:
        print("  ⚠️  Supabase URL: Not set (will use fallback)")
    
    if supabase_key:
        print(f"  ✅ Supabase Key: {supabase_key[:20]}...")
    else:
        print("  ⚠️  Supabase Key: Not set (will use fallback)")
    
    return True  # Not critical for basic functionality

def check_syntax_errors():
    """Check for basic syntax errors in key files"""
    print("\n🔍 Checking for Syntax Issues...")
    
    # Check the main info.tsx file for duplicate declarations
    info_file = Path('utils/supabase/info.tsx')
    if info_file.exists():
        try:
            content = info_file.read_text()
            
            # Count how many times 'export const supabaseUrl' appears
            export_count = content.count('export const supabaseUrl')
            declare_count = content.count('const supabaseUrl =')
            
            if export_count > 1:
                print(f"  ❌ Multiple 'export const supabaseUrl' declarations found: {export_count}")
                return False
            elif declare_count > 1:
                print(f"  ❌ Multiple 'const supabaseUrl' declarations found: {declare_count}")
                return False
            else:
                print("  ✅ No duplicate variable declarations found")
                
        except Exception as e:
            print(f"  ⚠️  Could not check syntax: {e}")
            return False
    else:
        print("  ❌ utils/supabase/info.tsx not found")
        return False
    
    return True

def test_build_readiness():
    """Test if the app is ready to build"""
    print("\n🔍 Testing Build Readiness...")
    
    # Check package.json
    package_json = Path('package.json')
    if package_json.exists():
        print("  ✅ package.json exists")
        try:
            import json
            with open(package_json) as f:
                data = json.load(f)
                if 'dependencies' in data:
                    print(f"  📦 Dependencies: {len(data['dependencies'])} packages")
                if 'scripts' in data:
                    print(f"  📜 Scripts: {len(data['scripts'])} available")
        except Exception as e:
            print(f"  ⚠️  Could not parse package.json: {e}")
    else:
        print("  ❌ package.json missing")
        return False
    
    # Check main App.tsx
    app_file = Path('App.tsx')
    if app_file.exists():
        try:
            content = app_file.read_text()
            if 'export default' in content:
                print("  ✅ App.tsx has default export")
            else:
                print("  ❌ App.tsx missing default export")
                return False
        except Exception as e:
            print(f"  ⚠️  Could not read App.tsx: {e}")
            return False
    else:
        print("  ❌ App.tsx missing")
        return False
    
    return True

def main():
    """Run all quick diagnostics"""
    print("🚀 MAGDEE QUICK DIAGNOSTICS")
    print("=" * 50)
    
    results = []
    
    # Check critical files
    files_ok, missing = check_critical_files()
    results.append(('Critical Files', files_ok))
    
    # Check Supabase config
    config_ok = check_supabase_config()
    results.append(('Supabase Config', config_ok))
    
    # Check syntax
    syntax_ok = check_syntax_errors()
    results.append(('Syntax Check', syntax_ok))
    
    # Check build readiness
    build_ok = test_build_readiness()
    results.append(('Build Readiness', build_ok))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 DIAGNOSTIC SUMMARY")
    print("=" * 50)
    
    all_passed = True
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {test_name}: {status}")
        if not passed:
            all_passed = False
    
    if all_passed:
        print("\n🎉 ALL CHECKS PASSED!")
        print("Your app should build and run successfully.")
        print("\n📝 Next steps:")
        print("  1. Run: npm start")
        print("  2. Check the app at http://localhost:3000")
        print("  3. If you need backend features, run: python main.py")
    else:
        print("\n⚠️  SOME ISSUES DETECTED")
        print("Please review the failed checks above.")
        
        if not files_ok and missing:
            print(f"\n🔧 Missing files: {', '.join(missing)}")
        
        if not syntax_ok:
            print("\n🔧 Fix syntax errors in utils/supabase/info.tsx")
        
        if not build_ok:
            print("\n🔧 Fix build configuration issues")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)