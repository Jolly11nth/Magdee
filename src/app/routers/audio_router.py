import os
from typing import Optional
from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import StreamingResponse, FileResponse
from datetime import datetime

from app.config import get_settings
from app.database import kv_store, update_user_activity

settings = get_settings()
router = APIRouter()

@router.get("/stream/{book_id}")
async def stream_audio(book_id: str, request: Request):
    """Stream audio file for a book"""
    
    try:
        # Get book data
        book_data = await kv_store.get(f"book:{book_id}")
        
        if not book_data:
            raise HTTPException(status_code=404, detail="Book not found")
        
        # Verify user has access if authenticated
        if hasattr(request.state, "user_id"):
            if book_data["user_id"] != request.state.user_id:
                raise HTTPException(status_code=403, detail="Unauthorized access")
        
        # Check if audio file exists
        if book_data.get("conversion_status") != "completed":
            raise HTTPException(status_code=404, detail="Audio not ready yet")
        
        # For now, return a placeholder response
        # TODO: Implement actual audio file streaming
        audio_path = os.path.join(settings.output_path, f"{book_id}.mp3")
        
        if not os.path.exists(audio_path):
            # Return placeholder for development
            return {
                "message": "Audio streaming endpoint ready",
                "book_id": book_id,
                "status": "placeholder",
                "note": "Actual audio file streaming will be implemented with TTS integration"
            }
        
        # Log audio access
        if hasattr(request.state, "user_id"):
            await update_user_activity(
                request.state.user_id,
                "audio_stream",
                {"book_id": book_id, "title": book_data.get("title")}
            )
        
        # Stream the actual file
        return FileResponse(
            audio_path,
            media_type="audio/mpeg",
            filename=f"{book_data.get('title', 'audiobook')}.mp3"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Streaming failed: {str(e)}")

@router.get("/metadata/{book_id}")
async def get_audio_metadata(book_id: str, request: Request):
    """Get audio metadata for a book"""
    
    try:
        # Get book data
        book_data = await kv_store.get(f"book:{book_id}")
        
        if not book_data:
            raise HTTPException(status_code=404, detail="Book not found")
        
        # Verify user has access if authenticated
        if hasattr(request.state, "user_id"):
            if book_data["user_id"] != request.state.user_id:
                raise HTTPException(status_code=403, detail="Unauthorized access")
        
        # Return audio metadata
        metadata = {
            "book_id": book_id,
            "title": book_data.get("title"),
            "author": book_data.get("author"),
            "duration": book_data.get("duration", 0),
            "status": book_data.get("conversion_status"),
            "created_at": book_data.get("created_at"),
            "converted_at": book_data.get("converted_at"),
            "file_size": book_data.get("metadata", {}).get("file_size", 0),
            "audio_format": "mp3",
            "sample_rate": 44100,
            "bitrate": 128
        }
        
        return {
            "success": True,
            "metadata": metadata
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get metadata: {str(e)}")

@router.post("/generate/{book_id}")
async def regenerate_audio(book_id: str, request: Request):
    """Regenerate audio with different settings"""
    
    # Verify authentication
    if not hasattr(request.state, "user") or not hasattr(request.state, "user_id"):
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # Get book data
        book_data = await kv_store.get(f"book:{book_id}")
        
        if not book_data:
            raise HTTPException(status_code=404, detail="Book not found")
        
        # Verify ownership
        if book_data["user_id"] != request.state.user_id:
            raise HTTPException(status_code=403, detail="Unauthorized access")
        
        # Reset conversion status
        book_data["conversion_status"] = "pending"
        book_data["progress"] = 0
        book_data["updated_at"] = datetime.utcnow().isoformat()
        book_data["regeneration_requested"] = True
        
        await kv_store.set(f"book:{book_id}", book_data)
        
        # TODO: Queue for regeneration
        # This would restart the PDF to audio conversion process
        
        # Log activity
        await update_user_activity(
            request.state.user_id,
            "audio_regeneration",
            {"book_id": book_id, "title": book_data.get("title")}
        )
        
        return {
            "success": True,
            "message": "Audio regeneration queued",
            "book_id": book_id,
            "status": "pending"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Regeneration failed: {str(e)}")

@router.delete("/{book_id}")
async def delete_audio(book_id: str, request: Request):
    """Delete audio file for a book"""
    
    # Verify authentication
    if not hasattr(request.state, "user") or not hasattr(request.state, "user_id"):
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # Get book data
        book_data = await kv_store.get(f"book:{book_id}")
        
        if not book_data:
            raise HTTPException(status_code=404, detail="Book not found")
        
        # Verify ownership
        if book_data["user_id"] != request.state.user_id:
            raise HTTPException(status_code=403, detail="Unauthorized access")
        
        # Delete audio file
        audio_path = os.path.join(settings.output_path, f"{book_id}.mp3")
        if os.path.exists(audio_path):
            os.remove(audio_path)
        
        # Update book data
        book_data["audio_url"] = None
        book_data["conversion_status"] = "pending"
        book_data["updated_at"] = datetime.utcnow().isoformat()
        
        await kv_store.set(f"book:{book_id}", book_data)
        
        # Log activity
        await update_user_activity(
            request.state.user_id,
            "audio_delete",
            {"book_id": book_id, "title": book_data.get("title")}
        )
        
        return {
            "success": True,
            "message": "Audio deleted successfully",
            "book_id": book_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")