import os
import uuid
import asyncio
from typing import Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request, BackgroundTasks
from fastapi.responses import JSONResponse
from datetime import datetime
import aiofiles

from app.config import get_settings
from app.database import kv_store, update_user_activity
from app.middleware import get_client_ip

settings = get_settings()
router = APIRouter()

@router.post("/upload/{user_id}")
async def upload_pdf(
    user_id: str,
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: Optional[str] = None,
    author: Optional[str] = None
):
    """Upload and process a PDF file for audio conversion"""
    
    # Verify user authentication (handled by middleware)
    if not hasattr(request.state, "user"):
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if request.state.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    # Validate file
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    if file.size > settings.max_pdf_size:
        raise HTTPException(
            status_code=400, 
            detail=f"File too large. Maximum size is {settings.max_pdf_size // (1024*1024)}MB"
        )
    
    try:
        # Generate unique book ID
        book_id = f"book_{uuid.uuid4()}"
        timestamp = datetime.utcnow().isoformat()
        
        # Create file path
        file_path = os.path.join(settings.upload_path, f"{book_id}_{file.filename}")
        
        # Save uploaded file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Create book metadata
        book_metadata = {
            "id": book_id,
            "user_id": user_id,
            "title": title or file.filename.replace('.pdf', ''),
            "author": author or "Unknown",
            "file_path": file_path,
            "original_filename": file.filename,
            "file_size": len(content),
            "conversion_status": "pending",
            "upload_timestamp": timestamp,
            "created_at": timestamp,
            "updated_at": timestamp,
            "progress": 0,
            "metadata": {
                "file_size": len(content),
                "uploaded_from": get_client_ip(request),
                "user_agent": request.headers.get("User-Agent", "unknown")
            }
        }
        
        # Store book metadata
        await kv_store.set(f"book:{book_id}", book_metadata)
        
        # Add to user's books list
        user_books = await kv_store.get(f"user:{user_id}:books") or []
        user_books.append(book_id)
        await kv_store.set(f"user:{user_id}:books", user_books)
        
        # Queue for processing in background
        background_tasks.add_task(process_pdf_to_audio, book_id, user_id)
        
        # Log user activity
        await update_user_activity(
            user_id,
            "pdf_upload",
            {
                "book_id": book_id,
                "filename": file.filename,
                "file_size": len(content),
                "title": book_metadata["title"]
            }
        )
        
        return {
            "success": True,
            "book_id": book_id,
            "title": book_metadata["title"],
            "status": "uploaded",
            "message": "PDF uploaded successfully. Processing will begin shortly.",
            "estimated_processing_time": "5-15 minutes"  # Rough estimate
        }
        
    except Exception as e:
        # Clean up file if it was created
        if 'file_path' in locals() and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass
        
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/status/{book_id}")
async def get_processing_status(book_id: str, request: Request):
    """Get PDF processing status"""
    
    # Get book metadata
    book_data = await kv_store.get(f"book:{book_id}")
    
    if not book_data:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Verify user has access to this book
    if hasattr(request.state, "user_id"):
        if book_data["user_id"] != request.state.user_id:
            raise HTTPException(status_code=403, detail="Unauthorized access")
    
    return {
        "book_id": book_id,
        "title": book_data["title"],
        "status": book_data["conversion_status"],
        "progress": book_data.get("progress", 0),
        "created_at": book_data["created_at"],
        "updated_at": book_data["updated_at"],
        "audio_url": book_data.get("audio_url"),
        "duration": book_data.get("duration"),
        "error_message": book_data.get("error_message")
    }

@router.delete("/{book_id}")
async def delete_pdf(book_id: str, request: Request):
    """Delete a PDF and its associated data"""
    
    # Verify user authentication
    if not hasattr(request.state, "user"):
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Get book data
    book_data = await kv_store.get(f"book:{book_id}")
    
    if not book_data:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Verify ownership
    if book_data["user_id"] != request.state.user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    try:
        # Remove files
        if book_data.get("file_path") and os.path.exists(book_data["file_path"]):
            os.remove(book_data["file_path"])
        
        if book_data.get("audio_url"):
            audio_path = book_data["audio_url"].replace("/api/v1/audio/stream/", settings.output_path + "/")
            if os.path.exists(audio_path):
                os.remove(audio_path)
        
        # Remove from user's books list
        user_books = await kv_store.get(f"user:{request.state.user_id}:books") or []
        if book_id in user_books:
            user_books.remove(book_id)
            await kv_store.set(f"user:{request.state.user_id}:books", user_books)
        
        # Remove book metadata
        await kv_store.delete(f"book:{book_id}")
        
        # Log activity
        await update_user_activity(
            request.state.user_id,
            "pdf_delete",
            {"book_id": book_id, "title": book_data["title"]}
        )
        
        return {"success": True, "message": "Book deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

async def process_pdf_to_audio(book_id: str, user_id: str):
    """Background task to process PDF to audio"""
    
    try:
        # Update status to processing
        book_data = await kv_store.get(f"book:{book_id}")
        if not book_data:
            return
        
        book_data["conversion_status"] = "processing"
        book_data["updated_at"] = datetime.utcnow().isoformat()
        await kv_store.set(f"book:{book_id}", book_data)
        
        # TODO: Implement actual PDF to audio conversion
        # This is where you would integrate with:
        # - PDF text extraction (PyPDF2, pdfplumber, etc.)
        # - Text-to-speech service (ElevenLabs, Azure, Google, etc.)
        # - Audio file generation and optimization
        
        # Simulate processing with progress updates
        for progress in [10, 25, 50, 75, 90]:
            await asyncio.sleep(5)  # Simulate work
            book_data["progress"] = progress
            book_data["updated_at"] = datetime.utcnow().isoformat()
            await kv_store.set(f"book:{book_id}", book_data)
        
        # Mark as completed
        book_data["conversion_status"] = "completed"
        book_data["progress"] = 100
        book_data["converted_at"] = datetime.utcnow().isoformat()
        book_data["audio_url"] = f"/api/v1/audio/stream/{book_id}"
        book_data["duration"] = 3600  # Example: 1 hour
        await kv_store.set(f"book:{book_id}", book_data)
        
        # TODO: Send notification to user about completion
        # This would integrate with your notification system
        
        # Log completion
        await update_user_activity(
            user_id,
            "pdf_processed",
            {
                "book_id": book_id,
                "title": book_data["title"],
                "processing_time": "simulated"
            }
        )
        
    except Exception as e:
        # Mark as failed
        book_data = await kv_store.get(f"book:{book_id}")
        if book_data:
            book_data["conversion_status"] = "failed"
            book_data["error_message"] = str(e)
            book_data["updated_at"] = datetime.utcnow().isoformat()
            await kv_store.set(f"book:{book_id}", book_data)
        
        # Log error
        await update_user_activity(
            user_id,
            "pdf_processing_error",
            {
                "book_id": book_id,
                "error": str(e)
            }
        )