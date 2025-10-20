from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from datetime import datetime

from app.database import kv_store, get_user_profile, update_user_activity

router = APIRouter()

class UserPreferences(BaseModel):
    audio_speed: Optional[float] = None
    voice_type: Optional[str] = None
    language: Optional[str] = None
    auto_play_next: Optional[bool] = None
    theme: Optional[str] = None
    notification_preferences: Optional[Dict[str, bool]] = None

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[UserPreferences] = None

@router.get("/{user_id}/profile")
async def get_user_profile_endpoint(user_id: str, request: Request):
    """Get user profile with Python backend enhancements"""
    
    # Verify authentication (handled by middleware)
    if not hasattr(request.state, "user") or request.state.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    try:
        # Get basic profile from KV store (same as your existing system)
        profile = await get_user_profile(user_id)
        
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # Add Python backend specific data
        activity_log = await kv_store.get(f"user:{user_id}:activity_log") or []
        recent_activity = activity_log[-10:] if activity_log else []  # Last 10 activities
        
        # Get user's books count
        user_books = await kv_store.get(f"user:{user_id}:books") or []
        books_count = len(user_books)
        
        # Calculate some basic analytics
        pdf_uploads = len([a for a in activity_log if a.get("type") == "pdf_upload"])
        total_api_requests = len([a for a in activity_log if a.get("type") == "api_request"])
        
        enhanced_profile = {
            **profile,
            "backend_data": {
                "books_count": books_count,
                "total_pdf_uploads": pdf_uploads,
                "total_api_requests": total_api_requests,
                "recent_activity": recent_activity,
                "last_backend_activity": activity_log[-1]["timestamp"] if activity_log else None
            }
        }
        
        # Log this access
        await update_user_activity(user_id, "profile_access", {"source": "python_backend"})
        
        return {
            "success": True,
            "profile": enhanced_profile
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get profile: {str(e)}")

@router.put("/{user_id}/preferences")
async def update_user_preferences_endpoint(
    user_id: str, 
    preferences: UserPreferences,
    request: Request
):
    """Update user preferences (complementing your existing edge function)"""
    
    # Verify authentication
    if not hasattr(request.state, "user") or request.state.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    try:
        # Get current profile
        current_profile = await get_user_profile(user_id)
        if not current_profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # Update preferences
        current_preferences = current_profile.get("preferences", {})
        
        # Update only provided fields
        updates = {}
        if preferences.audio_speed is not None:
            updates["audio_speed"] = preferences.audio_speed
        if preferences.voice_type is not None:
            updates["voice_type"] = preferences.voice_type
        if preferences.language is not None:
            updates["language"] = preferences.language
        if preferences.auto_play_next is not None:
            updates["auto_play_next"] = preferences.auto_play_next
        if preferences.theme is not None:
            updates["theme"] = preferences.theme
        if preferences.notification_preferences is not None:
            current_notification_prefs = current_preferences.get("notification_preferences", {})
            current_notification_prefs.update(preferences.notification_preferences)
            updates["notification_preferences"] = current_notification_prefs
        
        # Merge updates
        current_preferences.update(updates)
        current_profile["preferences"] = current_preferences
        current_profile["updated_at"] = datetime.utcnow().isoformat()
        
        # Save updated profile
        await kv_store.set(f"user:{user_id}:profile", current_profile)
        
        # Log the update
        await update_user_activity(
            user_id, 
            "preferences_update",
            {
                "updated_fields": list(updates.keys()),
                "source": "python_backend"
            }
        )
        
        return {
            "success": True,
            "message": "Preferences updated successfully",
            "preferences": current_preferences
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update preferences: {str(e)}")

@router.get("/{user_id}/books")
async def get_user_books(user_id: str, request: Request):
    """Get user's books with Python backend processing info"""
    
    # Verify authentication
    if not hasattr(request.state, "user") or request.state.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    try:
        # Get user's book IDs
        user_books = await kv_store.get(f"user:{user_id}:books") or []
        
        # Get detailed book information
        books_details = []
        for book_id in user_books:
            book_data = await kv_store.get(f"book:{book_id}")
            if book_data:
                # Add frontend-compatible fields
                book_data["cover"] = book_data.get("cover_url") or f"https://via.placeholder.com/120x160/4A90E2/ffffff?text={book_data['title'][:2]}"
                book_data["audioUrl"] = book_data.get("audio_url")
                books_details.append(book_data)
        
        # Sort by creation date (newest first)
        books_details.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return {
            "success": True,
            "books": books_details,
            "total": len(books_details)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get books: {str(e)}")

@router.get("/{user_id}/activity")
async def get_user_activity(
    user_id: str, 
    request: Request,
    limit: int = 50,
    activity_type: Optional[str] = None
):
    """Get user activity log"""
    
    # Verify authentication
    if not hasattr(request.state, "user") or request.state.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    try:
        activity_log = await kv_store.get(f"user:{user_id}:activity_log") or []
        
        # Filter by type if specified
        if activity_type:
            activity_log = [a for a in activity_log if a.get("type") == activity_type]
        
        # Apply limit and reverse for newest first
        activity_log = activity_log[-limit:] if len(activity_log) > limit else activity_log
        activity_log.reverse()
        
        return {
            "success": True,
            "activities": activity_log,
            "total": len(activity_log)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get activity: {str(e)}")

@router.get("/{user_id}/analytics")
async def get_user_analytics(user_id: str, request: Request):
    """Get user analytics and insights"""
    
    # Verify authentication
    if not hasattr(request.state, "user") or request.state.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    try:
        # Get activity log
        activity_log = await kv_store.get(f"user:{user_id}:activity_log") or []
        
        # Get user's books
        user_books = await kv_store.get(f"user:{user_id}:books") or []
        
        # Calculate analytics
        analytics = {
            "total_books": len(user_books),
            "total_activities": len(activity_log),
            "pdf_uploads": len([a for a in activity_log if a.get("type") == "pdf_upload"]),
            "api_requests": len([a for a in activity_log if a.get("type") == "api_request"]),
            "profile_views": len([a for a in activity_log if a.get("type") == "profile_access"]),
            "preferences_updates": len([a for a in activity_log if a.get("type") == "preferences_update"])
        }
        
        # Get processing status of books
        processing_status = {"pending": 0, "processing": 0, "completed": 0, "failed": 0}
        for book_id in user_books:
            book_data = await kv_store.get(f"book:{book_id}")
            if book_data:
                status = book_data.get("conversion_status", "unknown")
                if status in processing_status:
                    processing_status[status] += 1
        
        analytics["processing_status"] = processing_status
        
        # Activity by day (last 7 days)
        from collections import defaultdict
        daily_activity = defaultdict(int)
        for activity in activity_log[-168:]:  # Roughly last week assuming some activity
            date = activity.get("timestamp", "")[:10]  # Extract date part
            daily_activity[date] += 1
        
        analytics["daily_activity"] = dict(daily_activity)
        
        return {
            "success": True,
            "analytics": analytics
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")