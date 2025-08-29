#!/usr/bin/env python3
"""
Magdee Backend Startup Script

This script provides various ways to run the Magdee Python backend:
- Development mode with auto-reload
- Production mode
- Docker mode
- Testing mode
"""

import os
import sys
import argparse
import uvicorn
from app.config import get_settings

def main():
    """Main startup function"""
    parser = argparse.ArgumentParser(description="Start Magdee Backend")
    parser.add_argument(
        "--mode", 
        choices=["dev", "prod", "test"], 
        default="dev",
        help="Run mode (dev/prod/test)"
    )
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind to")
    parser.add_argument("--port", type=int, help="Port to bind to")
    parser.add_argument("--workers", type=int, default=1, help="Number of worker processes")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload")
    
    args = parser.parse_args()
    settings = get_settings()
    
    # Determine configuration based on mode
    config = {
        "app": "main:app",
        "host": args.host,
        "port": args.port or int(os.getenv("PORT", 8000)),
        "log_level": "info",
        "access_log": True,
    }
    
    if args.mode == "dev":
        print("🔥 Starting Magdee Backend in DEVELOPMENT mode")
        config.update({
            "reload": True,
            "reload_dirs": ["app"],
            "log_level": "debug",
            "workers": 1  # Force single worker for development
        })
        
    elif args.mode == "prod":
        print("🚀 Starting Magdee Backend in PRODUCTION mode")
        config.update({
            "workers": args.workers if args.workers > 1 else 4,
            "log_level": "warning",
            "reload": False
        })
        
    elif args.mode == "test":
        print("🧪 Starting Magdee Backend in TEST mode")
        config.update({
            "log_level": "critical",
            "access_log": False,
            "workers": 1
        })
    
    # Override reload if explicitly set
    if args.reload:
        config["reload"] = True
        config["workers"] = 1  # Can't use workers with reload
    
    # Validate environment
    if not settings.supabase_url:
        print("❌ Error: SUPABASE_URL environment variable is required")
        sys.exit(1)
        
    if not settings.supabase_service_role_key:
        print("❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required")
        sys.exit(1)
    
    # Print startup info
    print(f"🌐 Server will start on http://{config['host']}:{config['port']}")
    print(f"📋 API docs available at http://{config['host']}:{config['port']}/docs")
    print(f"🔧 Environment: {settings.environment}")
    print(f"⚡ Workers: {config.get('workers', 1)}")
    print(f"🔄 Auto-reload: {config.get('reload', False)}")
    
    # Start server
    try:
        uvicorn.run(**config)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server startup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()