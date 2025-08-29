#!/usr/bin/env python3
"""
Server Status Checker for Magdee App
Run this script to check the status of all your backends
"""

import requests
import os
import sys
from datetime import datetime

def check_python_backend():
    """Check if Python FastAPI backend is running"""
    try:
        response = requests.get('http://localhost:8000/health', timeout=5)
        if response.status_code == 200:
            print("✅ Python Backend: ONLINE (http://localhost:8000)")
            return True
        else:
            print(f"❌ Python Backend: ERROR (Status: {response.status_code})")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Python Backend: OFFLINE (Connection refused)")
        return False
    except requests.exceptions.Timeout:
        print("❌ Python Backend: TIMEOUT (Server not responding)")
        return False
    except Exception as e:
        print(f"❌ Python Backend: ERROR ({str(e)})")
        return False

def check_supabase():
    """Check if Supabase backend is accessible"""
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_anon_key = os.getenv('SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_anon_key:
        print("❌ Supabase: MISSING ENVIRONMENT VARIABLES")
        print("   Please set SUPABASE_URL and SUPABASE_ANON_KEY")
        return False
    
    try:
        headers = {
            'apikey': supabase_anon_key,
            'Authorization': f'Bearer {supabase_anon_key}'
        }
        response = requests.get(f'{supabase_url}/rest/v1/', headers=headers, timeout=10)
        
        if response.status_code in [200, 404]:  # 404 is OK for base endpoint
            print(f"✅ Supabase: ONLINE ({supabase_url})")
            return True
        else:
            print(f"❌ Supabase: ERROR (Status: {response.status_code})")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Supabase: OFFLINE (Connection refused)")
        return False
    except requests.exceptions.Timeout:
        print("❌ Supabase: TIMEOUT (Server not responding)")
        return False
    except Exception as e:
        print(f"❌ Supabase: ERROR ({str(e)})")
        return False

def check_environment_variables():
    """Check if required environment variables are set"""
    required_vars = [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Environment Variables: MISSING")
        for var in missing_vars:
            print(f"   - {var}")
        return False
    else:
        print("✅ Environment Variables: ALL SET")
        return True

def main():
    print("=" * 50)
    print("🔍 MAGDEE SERVER STATUS CHECK")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)
    
    # Check environment variables
    env_ok = check_environment_variables()
    print()
    
    # Check Python backend
    python_ok = check_python_backend()
    print()
    
    # Check Supabase
    supabase_ok = check_supabase()
    print()
    
    # Summary
    print("=" * 50)
    print("📊 SUMMARY")
    print("=" * 50)
    
    if python_ok and supabase_ok and env_ok:
        print("🎉 ALL SYSTEMS ONLINE!")
        print("Your Magdee app should be working properly.")
    else:
        print("⚠️  ISSUES DETECTED:")
        if not env_ok:
            print("   - Environment variables need to be configured")
        if not python_ok:
            print("   - Python backend needs to be started")
        if not supabase_ok:
            print("   - Supabase connection issues")
        
        print("\n🔧 QUICK FIXES:")
        if not python_ok:
            print("   - Run: python main.py")
        if not env_ok:
            print("   - Create .env file with your Supabase credentials")
        if not supabase_ok:
            print("   - Check your Supabase project status at app.supabase.com")

if __name__ == "__main__":
    main()