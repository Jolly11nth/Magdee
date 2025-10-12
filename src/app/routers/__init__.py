"""
Magdee API Routers
"""

from app.routers import pdf_router
from app.routers import audio_router
from app.routers import analytics_router

__all__ = [
    'pdf_router',
    'audio_router',
    'analytics_router'
]
