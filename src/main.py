"""
Magdee Python FastAPI Backend
Main entry point for the PDF-to-audio conversion service
"""

import uvicorn
import os
import sys
from datetime import datetime
from pathlib import Path

# Add the current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

try:
    from app.config import get_settings
    from app.database import init_database
    from app.middleware import setup_middleware
    from fastapi import FastAPI, HTTPException
    from fastapi.responses import JSONResponse
    from fastapi.middleware.cors import CORSMiddleware
    import logging
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please ensure all dependencies are installed: pip install -r requirements.txt")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('magdee_backend.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Magdee API",
    description="PDF-to-Audio conversion service for the Magdee mobile app",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - allow requests from React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React development server
        "http://127.0.0.1:3000",
        "https://localhost:3000",
        "https://127.0.0.1:3000",
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup custom middleware
setup_middleware(app)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint to verify server is running"""
    return {
        "status": "healthy",
        "service": "Magdee API",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to Magdee API",
        "service": "PDF-to-Audio conversion service",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "users": "/api/v1/users",
            "pdf": "/api/v1/pdf",
            "audio": "/api/v1/audio",
            "ai": "/api/v1/ai",
            "analytics": "/api/v1/analytics"
        }
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )

# Import and register routers
try:
    from app.routers import (
        user_router,
        pdf_router,
        audio_router,
        ai_router,
        analytics_router
    )
    
    # Register API routes
    app.include_router(user_router.router, prefix="/api/v1/users", tags=["users"])
    app.include_router(pdf_router.router, prefix="/api/v1/pdf", tags=["pdf"])
    app.include_router(audio_router.router, prefix="/api/v1/audio", tags=["audio"])
    app.include_router(ai_router.router, prefix="/api/v1/ai", tags=["ai"])
    app.include_router(analytics_router.router, prefix="/api/v1/analytics", tags=["analytics"])
    
    logger.info("✅ All routers registered successfully")
    
except ImportError as e:
    logger.error(f"❌ Failed to import routers: {e}")
    # Continue without routers for basic health check

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("🚀 Starting Magdee API server...")
    
    try:
        # Initialize database connection
        await init_database()
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        # Continue without database for basic functionality
    
    logger.info("🎉 Magdee API server started successfully!")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🛑 Shutting down Magdee API server...")

def main():
    """Main function to start the server"""
    # Get settings
    settings = get_settings()
    
    # Print startup information
    print("=" * 60)
    print("🎵 MAGDEE API SERVER")
    print("=" * 60)
    print(f"📅 Starting at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Host: {settings.host}")
    print(f"🔌 Port: {settings.port}")
    print(f"🔄 Reload: {settings.reload}")
    print(f"📊 Log Level: {settings.log_level}")
    print("=" * 60)
    print()
    print("🔗 Access URLs:")
    print(f"   • API Root: http://{settings.host}:{settings.port}/")
    print(f"   • Health Check: http://{settings.host}:{settings.port}/health")
    print(f"   • API Docs: http://{settings.host}:{settings.port}/docs")
    print(f"   • ReDoc: http://{settings.host}:{settings.port}/redoc")
    print()
    print("🛑 Press Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        # Start the server
        uvicorn.run(
            "main:app",
            host=settings.host,
            port=settings.port,
            reload=settings.reload,
            log_level=settings.log_level.lower(),
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        logger.error(f"❌ Server failed to start: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()