#!/usr/bin/env python3
"""
Server Issues Fixer for Magdee App
Automatically detects and helps fix common server configuration issues
"""

import os
import sys
import json
import requests
from datetime import datetime
from pathlib import Path

def print_step(step_num, title, description=""):
    """Print a formatted step"""
    print(f"\n🔧 Step {step_num}: {title}")
    if description:
        print(f"   {description}")
    print("-" * 50)

def check_and_create_env_file():
    """Check if .env file exists and create it if needed"""
    print_step(1, "Environment File Check", "Checking for .env file and configuration")
    
    env_file = Path('.env')
    env_example = Path('.env.example')
    
    if not env_file.exists():
        print("❌ .env file not found")
        
        if env_example.exists():
            print("✅ .env.example found - creating .env file")
            
            # Copy .env.example to .env
            with open(env_example, 'r') as example:
                content = example.read()
            
            with open(env_file, 'w') as env:
                env.write(content)
            
            print("✅ Created .env file from .env.example")
            print("⚠️  Please edit .env file with your actual Supabase credentials")
            print("\n📝 Required values:")
            print("   - SUPABASE_URL=https://your-project-id.supabase.co")
            print("   - SUPABASE_ANON_KEY=your_anon_key")
            print("   - SUPABASE_SERVICE_ROLE_KEY=your_service_role_key")
            
            return False  # Needs manual configuration
        else:
            print("❌ .env.example also not found")
            print("Creating basic .env file...")
            
            basic_env = """# Supabase Configuration
# Get these from your Supabase project settings: https://app.supabase.com
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Python Backend Configuration
PYTHON_ENV=development
HOST=0.0.0.0
PORT=8000
DEBUG=true
"""
            
            with open(env_file, 'w') as env:
                env.write(basic_env)
            
            print("✅ Created basic .env file")
            print("⚠️  Please edit .env file with your actual Supabase credentials")
            
            return False  # Needs manual configuration
    else:
        print("✅ .env file exists")
        return True

def load_environment_variables():
    """Load environment variables from .env file"""
    print_step(2, "Environment Variables", "Loading and validating environment variables")
    
    env_file = Path('.env')
    if not env_file.exists():
        print("❌ No .env file found")
        return False
    
    # Load .env file manually (simple parsing)
    env_vars = {}
    try:
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
                    # Set in current environment
                    os.environ[key.strip()] = value.strip()
        
        print(f"✅ Loaded {len(env_vars)} environment variables")
        
        # Check required variables
        required_vars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']
        missing_vars = []
        
        for var in required_vars:
            value = env_vars.get(var, '').strip()
            if not value or value.startswith('your_') or value == 'your-project-id.supabase.co':
                missing_vars.append(var)
                print(f"❌ {var}: Not configured properly")
            else:
                # Show partial value for security
                display_value = value[:20] + "..." if len(value) > 20 else value
                print(f"✅ {var}: {display_value}")
        
        if missing_vars:
            print(f"\n⚠️  {len(missing_vars)} variables need configuration:")
            for var in missing_vars:
                print(f"   - {var}")
            print("\n📝 To get your Supabase credentials:")
            print("   1. Go to https://app.supabase.com")
            print("   2. Select your project")
            print("   3. Go to Settings > API")
            print("   4. Copy the URL and anon key")
            print("   5. Go to Settings > Database")
            print("   6. Copy the service role key")
            
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading .env file: {e}")
        return False

def test_supabase_connection():
    """Test connection to Supabase"""
    print_step(3, "Supabase Connection", "Testing connection to Supabase services")
    
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_anon_key = os.getenv('SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_anon_key:
        print("❌ Missing Supabase credentials")
        return False
    
    try:
        headers = {
            'apikey': supabase_anon_key,
            'Authorization': f'Bearer {supabase_anon_key}'
        }
        
        print(f"🔗 Testing connection to {supabase_url}")
        response = requests.get(f'{supabase_url}/rest/v1/', headers=headers, timeout=10)
        
        if response.status_code in [200, 404]:
            print("✅ Supabase connection successful")
            
            # Test the functions endpoint
            try:
                func_response = requests.get(
                    f'{supabase_url}/functions/v1/make-server-989ff5a9/health',
                    headers=headers,
                    timeout=5
                )
                if func_response.status_code == 200:
                    print("✅ Supabase Functions: Available")
                else:
                    print(f"⚠️  Supabase Functions: Status {func_response.status_code}")
            except:
                print("⚠️  Supabase Functions: Not accessible (this is optional)")
            
            return True
        else:
            print(f"❌ Supabase connection failed: Status {response.status_code}")
            
            # Try to get error details
            try:
                error_data = response.json()
                if 'message' in error_data:
                    print(f"   Error: {error_data['message']}")
            except:
                pass
            
            return False
    
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Supabase (connection refused)")
        print("   Check your internet connection and Supabase URL")
        return False
    except requests.exceptions.Timeout:
        print("❌ Supabase connection timeout")
        return False
    except Exception as e:
        print(f"❌ Supabase connection error: {e}")
        return False

def start_python_backend():
    """Try to start the Python backend"""
    print_step(4, "Python Backend", "Checking and starting Python backend")
    
    # Check if main.py exists
    if not Path('main.py').exists():
        print("❌ main.py not found")
        return False
    
    # Check if backend is already running
    try:
        response = requests.get('http://localhost:8000/health', timeout=2)
        if response.status_code == 200:
            print("✅ Python backend is already running")
            try:
                data = response.json()
                print(f"   Service: {data.get('service', 'Unknown')}")
                print(f"   Version: {data.get('version', 'Unknown')}")
            except:
                pass
            return True
    except:
        pass
    
    print("⚠️  Python backend is not running")
    print("💡 To start the backend manually, run:")
    print("   python main.py")
    print("\n📝 The backend will start on http://localhost:8000")
    print("📝 You can check the API docs at http://localhost:8000/docs")
    
    return False

def check_database_setup():
    """Check if database tables are set up"""
    print_step(5, "Database Setup", "Checking if required database tables exist")
    
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_anon_key = os.getenv('SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_anon_key:
        print("❌ Cannot check database - missing credentials")
        return False
    
    headers = {
        'apikey': supabase_anon_key,
        'Authorization': f'Bearer {supabase_anon_key}'
    }
    
    # Check for the key-value store table (minimal requirement)
    try:
        response = requests.get(
            f'{supabase_url}/rest/v1/kv_store_989ff5a9?select=*&limit=0',
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            print("✅ Database tables are accessible")
            return True
        elif response.status_code == 404:
            print("❌ Database tables not found")
            print("📝 You need to set up the database tables:")
            print("   1. Follow the DATABASE_SETUP_GUIDE.md")
            print("   2. Or use the Supabase SQL editor to create tables")
            return False
        else:
            print(f"⚠️  Database check returned status {response.status_code}")
            return False
    
    except Exception as e:
        print(f"❌ Database check error: {e}")
        return False

def provide_solution_summary(issues):
    """Provide a summary of solutions for detected issues"""
    print("\n" + "="*60)
    print("🎯 SOLUTION SUMMARY")
    print("="*60)
    
    if not issues:
        print("🎉 All systems are working properly!")
        print("\n✅ Your Magdee app should be fully functional")
        print("✅ Frontend: Ready to start with 'npm start'")
        print("✅ Backend: Available on http://localhost:8000")
        print("✅ Database: Connected and accessible")
        return
    
    print("⚠️  Issues detected. Here's what you need to do:")
    
    step = 1
    
    if 'env_file' in issues:
        print(f"\n{step}. Configure Environment Variables:")
        print("   - Edit the .env file with your Supabase credentials")
        print("   - Get credentials from https://app.supabase.com")
        step += 1
    
    if 'env_vars' in issues:
        print(f"\n{step}. Update Supabase Credentials:")
        print("   - Replace placeholder values in .env file")
        print("   - Ensure SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are set")
        step += 1
    
    if 'supabase' in issues:
        print(f"\n{step}. Fix Supabase Connection:")
        print("   - Check your Supabase project is active")
        print("   - Verify your API keys are correct")
        print("   - Check your internet connection")
        step += 1
    
    if 'database' in issues:
        print(f"\n{step}. Set Up Database:")
        print("   - Follow DATABASE_SETUP_GUIDE.md")
        print("   - Create the required tables in Supabase")
        step += 1
    
    if 'backend' in issues:
        print(f"\n{step}. Start Python Backend:")
        print("   - Run: python main.py")
        print("   - Check http://localhost:8000/health")
        step += 1
    
    print(f"\n📞 Need Help?")
    print("   - Check the README.md for detailed setup instructions")
    print("   - Run 'python server-diagnostics.py' for detailed diagnostics")
    print("   - Check the GitHub issues for common problems")

def main():
    """Main function to run all fixes"""
    print("🚀 MAGDEE SERVER ISSUES FIXER")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    issues = []
    
    # Step 1: Check/create .env file
    if not check_and_create_env_file():
        issues.append('env_file')
    
    # Step 2: Load environment variables
    if not load_environment_variables():
        issues.append('env_vars')
    
    # Step 3: Test Supabase connection
    if not test_supabase_connection():
        issues.append('supabase')
    
    # Step 4: Check Python backend
    if not start_python_backend():
        issues.append('backend')
    
    # Step 5: Check database setup
    if not check_database_setup():
        issues.append('database')
    
    # Provide solution summary
    provide_solution_summary(issues)
    
    # Exit with appropriate code
    return len(issues) == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)