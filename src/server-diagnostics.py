#!/usr/bin/env python3
"""
Comprehensive Server Diagnostics for Magdee App
Checks all aspects of server configuration, API keys, and connectivity
"""

import requests
import os
import sys
import json
from datetime import datetime
from urllib.parse import urlparse

def print_header(title):
    """Print a formatted header"""
    print("\n" + "="*60)
    print(f"🔍 {title}")
    print("="*60)

def print_subheader(title):
    """Print a formatted subheader"""
    print(f"\n📋 {title}")
    print("-" * 40)

def check_environment_variables():
    """Check all environment variables"""
    print_subheader("Environment Variables Check")
    
    # Required variables
    required_env_vars = {
        'SUPABASE_URL': os.getenv('SUPABASE_URL'),
        'SUPABASE_ANON_KEY': os.getenv('SUPABASE_ANON_KEY'),
        'SUPABASE_SERVICE_ROLE_KEY': os.getenv('SUPABASE_SERVICE_ROLE_KEY'),
    }
    
    # Optional variables
    optional_env_vars = {
        'SUPABASE_DB_URL': os.getenv('SUPABASE_DB_URL'),
        'PYTHON_ENV': os.getenv('PYTHON_ENV'),
        'DEBUG': os.getenv('DEBUG'),
        'HOST': os.getenv('HOST'),
        'PORT': os.getenv('PORT'),
    }
    
    missing_required = []
    all_vars_status = True
    
    print("Required Environment Variables:")
    for var, value in required_env_vars.items():
        if value:
            # Show partial value for security
            display_value = value[:20] + "..." if len(value) > 20 else value
            print(f"  ✅ {var}: {display_value}")
        else:
            print(f"  ❌ {var}: NOT SET")
            missing_required.append(var)
            all_vars_status = False
    
    print("\nOptional Environment Variables:")
    for var, value in optional_env_vars.items():
        if value:
            print(f"  ✅ {var}: {value}")
        else:
            print(f"  ⚠️  {var}: NOT SET (optional)")
    
    return all_vars_status, missing_required

def validate_supabase_credentials():
    """Validate Supabase credentials format"""
    print_subheader("Supabase Credentials Validation")
    
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_anon_key = os.getenv('SUPABASE_ANON_KEY')
    
    issues = []
    
    if supabase_url:
        # Check URL format
        try:
            parsed = urlparse(supabase_url)
            if not parsed.scheme or not parsed.netloc:
                issues.append("SUPABASE_URL format is invalid")
                print(f"  ❌ URL Format: Invalid - {supabase_url}")
            elif not supabase_url.endswith('.supabase.co'):
                issues.append("SUPABASE_URL doesn't end with .supabase.co")
                print(f"  ⚠️  URL Format: Unusual - {supabase_url}")
            else:
                print(f"  ✅ URL Format: Valid - {supabase_url}")
                
                # Extract project ID
                hostname = parsed.netloc
                if hostname.endswith('.supabase.co'):
                    project_id = hostname.replace('.supabase.co', '')
                    print(f"  📝 Project ID: {project_id}")
        except Exception as e:
            issues.append(f"SUPABASE_URL parsing error: {e}")
            print(f"  ❌ URL Parsing: Error - {e}")
    else:
        issues.append("SUPABASE_URL is not set")
        print("  ❌ URL: NOT SET")
    
    if supabase_anon_key:
        # Check JWT format (basic validation)
        if supabase_anon_key.startswith('eyJ') and supabase_anon_key.count('.') == 2:
            print("  ✅ Anon Key Format: Valid JWT")
            
            # Try to decode the header to get more info
            try:
                import base64
                header_part = supabase_anon_key.split('.')[0]
                # Add padding if needed
                padding = 4 - len(header_part) % 4
                if padding != 4:
                    header_part += '=' * padding
                
                header_decoded = base64.b64decode(header_part)
                header_json = json.loads(header_decoded)
                print(f"  📝 JWT Algorithm: {header_json.get('alg', 'Unknown')}")
                print(f"  📝 JWT Type: {header_json.get('typ', 'Unknown')}")
            except Exception as e:
                print(f"  ⚠️  JWT Header Decode: Failed - {e}")
        else:
            issues.append("SUPABASE_ANON_KEY doesn't look like a valid JWT")
            print(f"  ❌ Anon Key Format: Invalid JWT - {supabase_anon_key[:20]}...")
    else:
        issues.append("SUPABASE_ANON_KEY is not set")
        print("  ❌ Anon Key: NOT SET")
    
    return len(issues) == 0, issues

def check_supabase_connectivity():
    """Check Supabase connectivity and API endpoints"""
    print_subheader("Supabase Connectivity Check")
    
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_anon_key = os.getenv('SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_anon_key:
        print("  ❌ Cannot test connectivity - missing credentials")
        return False
    
    headers = {
        'apikey': supabase_anon_key,
        'Authorization': f'Bearer {supabase_anon_key}',
        'Content-Type': 'application/json'
    }
    
    tests = [
        {
            'name': 'Base API',
            'url': f'{supabase_url}/rest/v1/',
            'expected_status': [200, 404],
            'critical': True
        },
        {
            'name': 'Authentication Endpoint',
            'url': f'{supabase_url}/auth/v1/settings',
            'expected_status': [200],
            'critical': False
        },
        {
            'name': 'Functions Health Check',
            'url': f'{supabase_url}/functions/v1/make-server-989ff5a9/health',
            'expected_status': [200, 404],
            'critical': False
        },
        {
            'name': 'Database Schema',
            'url': f'{supabase_url}/rest/v1/',
            'expected_status': [200, 404],
            'critical': True
        }
    ]
    
    connectivity_ok = True
    
    for test in tests:
        try:
            print(f"  Testing {test['name']}...")
            response = requests.get(test['url'], headers=headers, timeout=10)
            
            if response.status_code in test['expected_status']:
                print(f"    ✅ {test['name']}: OK (Status: {response.status_code})")
            else:
                status_msg = f"Unexpected status: {response.status_code}"
                if test['critical']:
                    print(f"    ❌ {test['name']}: {status_msg}")
                    connectivity_ok = False
                else:
                    print(f"    ⚠️  {test['name']}: {status_msg}")
                
                # Try to get error details
                try:
                    error_data = response.json()
                    if 'message' in error_data:
                        print(f"    📝 Error: {error_data['message']}")
                except:
                    pass
        
        except requests.exceptions.ConnectionError:
            print(f"    ❌ {test['name']}: Connection refused")
            if test['critical']:
                connectivity_ok = False
        except requests.exceptions.Timeout:
            print(f"    ❌ {test['name']}: Timeout")
            if test['critical']:
                connectivity_ok = False
        except Exception as e:
            print(f"    ❌ {test['name']}: Error - {e}")
            if test['critical']:
                connectivity_ok = False
    
    return connectivity_ok

def check_python_backend():
    """Check Python FastAPI backend"""
    print_subheader("Python Backend Check")
    
    backend_url = "http://localhost:8000"
    
    try:
        # Test health endpoint
        response = requests.get(f'{backend_url}/health', timeout=5)
        if response.status_code == 200:
            print(f"  ✅ Backend Status: ONLINE ({backend_url})")
            
            # Get more details
            try:
                data = response.json()
                print(f"  📝 Service: {data.get('service', 'Unknown')}")
                print(f"  📝 Version: {data.get('version', 'Unknown')}")
                print(f"  📝 Timestamp: {data.get('timestamp', 'Unknown')}")
            except:
                print("  📝 Health response: Simple OK")
            
            # Test API docs endpoint
            try:
                docs_response = requests.get(f'{backend_url}/docs', timeout=5)
                if docs_response.status_code == 200:
                    print("  ✅ API Docs: Available")
                else:
                    print("  ⚠️  API Docs: Not available")
            except:
                print("  ⚠️  API Docs: Not accessible")
            
            return True
        else:
            print(f"  ❌ Backend Status: ERROR (Status: {response.status_code})")
            return False
    
    except requests.exceptions.ConnectionError:
        print(f"  ❌ Backend Status: OFFLINE (Connection refused)")
        print("  💡 Try running: python main.py")
        return False
    except requests.exceptions.Timeout:
        print(f"  ❌ Backend Status: TIMEOUT")
        return False
    except Exception as e:
        print(f"  ❌ Backend Status: ERROR - {e}")
        return False

def check_database_tables():
    """Check if required database tables exist"""
    print_subheader("Database Tables Check")
    
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_anon_key = os.getenv('SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_anon_key:
        print("  ❌ Cannot check tables - missing credentials")
        return False
    
    headers = {
        'apikey': supabase_anon_key,
        'Authorization': f'Bearer {supabase_anon_key}'
    }
    
    # Expected tables based on the schema
    expected_tables = [
        'kv_store_989ff5a9',  # Key-value store (always present)
        'users_989ff5a9',     # Users table
        'books_989ff5a9',     # Books table
        'book_progress_989ff5a9',  # Book progress
        'notifications_989ff5a9',  # Notifications
        'user_preferences_989ff5a9',  # User preferences
        'user_analytics_989ff5a9'  # User analytics
    ]
    
    tables_ok = True
    
    for table in expected_tables:
        try:
            # Try to query the table with limit 0 to check existence
            response = requests.get(
                f'{supabase_url}/rest/v1/{table}?select=*&limit=0',
                headers=headers,
                timeout=5
            )
            
            if response.status_code == 200:
                print(f"  ✅ Table {table}: EXISTS")
            elif response.status_code == 404:
                print(f"  ❌ Table {table}: NOT FOUND")
                tables_ok = False
            else:
                print(f"  ⚠️  Table {table}: Status {response.status_code}")
        
        except Exception as e:
            print(f"  ❌ Table {table}: Error - {e}")
            tables_ok = False
    
    return tables_ok

def check_file_structure():
    """Check if required files exist"""
    print_subheader("File Structure Check")
    
    required_files = [
        'main.py',
        'requirements.txt',
        'App.tsx',
        'package.json',
        '.env.example',
        'components/AuthContext.tsx',
        'utils/supabase/client.tsx',
        'utils/supabase/info.tsx',
        'services/database.tsx'
    ]
    
    files_ok = True
    
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"  ✅ {file_path}: EXISTS")
        else:
            print(f"  ❌ {file_path}: MISSING")
            files_ok = False
    
    return files_ok

def run_comprehensive_diagnostics():
    """Run all diagnostic tests"""
    print_header("MAGDEE SERVER COMPREHENSIVE DIAGNOSTICS")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {}
    
    # 1. Environment Variables
    env_ok, missing_vars = check_environment_variables()
    results['environment'] = env_ok
    
    # 2. Supabase Credentials Validation
    creds_ok, cred_issues = validate_supabase_credentials()
    results['credentials'] = creds_ok
    
    # 3. File Structure
    files_ok = check_file_structure()
    results['files'] = files_ok
    
    # 4. Python Backend
    python_ok = check_python_backend()
    results['python_backend'] = python_ok
    
    # 5. Supabase Connectivity
    supabase_ok = check_supabase_connectivity()
    results['supabase'] = supabase_ok
    
    # 6. Database Tables
    tables_ok = check_database_tables()
    results['database'] = tables_ok
    
    # Summary
    print_header("DIAGNOSTIC SUMMARY")
    
    all_ok = all(results.values())
    
    if all_ok:
        print("🎉 ALL SYSTEMS OPERATIONAL!")
        print("Your Magdee app should be working properly.")
    else:
        print("⚠️  ISSUES DETECTED:")
        
        if not env_ok:
            print("\n❌ Environment Variables Issues:")
            for var in missing_vars:
                print(f"   - {var} is not set")
        
        if not creds_ok:
            print("\n❌ Credentials Issues:")
            for issue in cred_issues:
                print(f"   - {issue}")
        
        if not files_ok:
            print("\n❌ File Structure Issues:")
            print("   - Some required files are missing")
        
        if not python_ok:
            print("\n❌ Python Backend Issues:")
            print("   - Backend is not running or not accessible")
        
        if not supabase_ok:
            print("\n❌ Supabase Connectivity Issues:")
            print("   - Cannot connect to Supabase services")
        
        if not tables_ok:
            print("\n❌ Database Issues:")
            print("   - Some required tables are missing")
        
        print("\n🔧 RECOMMENDED ACTIONS:")
        
        if not env_ok:
            print("   1. Create .env file with your Supabase credentials")
            print("      cp .env.example .env")
            print("      # Edit .env with your actual values")
        
        if not python_ok:
            print("   2. Start the Python backend:")
            print("      python main.py")
        
        if not supabase_ok or not tables_ok:
            print("   3. Check your Supabase project:")
            print("      - Visit https://app.supabase.com")
            print("      - Ensure your project is not paused")
            print("      - Run the database setup guide")
        
        if not files_ok:
            print("   4. Ensure all required files are present")
            print("      - Check the project structure")
            print("      - Re-clone the repository if needed")
    
    print(f"\n📊 Diagnostic Results: {sum(results.values())}/{len(results)} checks passed")
    
    return all_ok, results

if __name__ == "__main__":
    success, results = run_comprehensive_diagnostics()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)