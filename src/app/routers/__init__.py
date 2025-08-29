from fastapi import APIRouter

from .pdf_router import router as pdf_router
from .audio_router import router as audio_router
from .ai_router import router as ai_router
from .analytics_router import router as analytics_router
from .user_router import router as user_router

# Create main API router
api_router = APIRouter()

# Include all sub-routers
api_router.include_router(pdf_router, prefix="/pdf", tags=["PDF Processing"])
api_router.include_router(audio_router, prefix="/audio", tags=["Audio Processing"])
api_router.include_router(ai_router, prefix="/ai", tags=["AI Features"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(user_router, prefix="/users", tags=["User Management"])

@api_router.get("/")
async def api_root():
    """API root endpoint"""
    return {
        "message": "Magdee Python Backend API",
        "version": "1.0.0",
        "endpoints": {
            "pdf": "/api/v1/pdf - PDF processing and conversion",
            "audio": "/api/v1/audio - Audio generation and processing", 
            "ai": "/api/v1/ai - AI features (chat, mood tracking)",
            "analytics": "/api/v1/analytics - Analytics and insights",
            "users": "/api/v1/users - User management and preferences"
        }
    }