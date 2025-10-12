"""
Magdee FastAPI Backend Server
Handles PDF processing, audio conversion, and analytics
"""

import os
import sys
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings
from app.middleware import LoggingMiddleware, RateLimitMiddleware
from app.routers import pdf_router, audio_router, analytics_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Magdee API",
    description="Backend API for Magdee - PDF to Audio conversion platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Custom middleware
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)

# Include routers
app.include_router(pdf_router.router, prefix="/api/v1/pdf", tags=["PDF Processing"])
app.include_router(audio_router.router, prefix="/api/v1/audio", tags=["Audio Conversion"])
app.include_router(analytics_router.router, prefix="/api/v1/analytics", tags=["Analytics"])

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "name": "Magdee API",
        "version": "1.0.0",
        "status": "running",
        "environment": settings.environment,
        "endpoints": {
            "docs": "/api/docs",
            "health": "/api/health",
            "pdf": "/api/v1/pdf",
            "audio": "/api/v1/audio",
            "analytics": "/api/v1/analytics"
        }
    }

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "environment": settings.environment,
        "services": {
            "pdf_processing": "operational",
            "audio_conversion": "operational",
            "analytics": "operational"
        }
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("🚀 Magdee API starting up...")
    logger.info(f"📍 Environment: {settings.environment}")
    logger.info(f"🔧 Debug mode: {settings.debug}")
    logger.info(f"🌐 CORS origins: {settings.cors_origins}")
    logger.info(f"📁 Upload path: {settings.upload_path}")
    logger.info(f"📁 Output path: {settings.output_path}")
    
    # Create required directories
    os.makedirs(settings.upload_path, exist_ok=True)
    os.makedirs(settings.output_path, exist_ok=True)
    
    logger.info("✅ Magdee API startup complete")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🛑 Magdee API shutting down...")
    # Add cleanup logic here if needed
    logger.info("✅ Magdee API shutdown complete")

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.debug else "An unexpected error occurred",
            "path": str(request.url)
        }
    )

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", "8000"))
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
