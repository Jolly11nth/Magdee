from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime

from app.database import kv_store, update_user_activity
from app.config import get_settings

settings = get_settings()
router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    context: Optional[str] = None
    session_id: Optional[str] = None

class MoodEntry(BaseModel):
    mood: str  # e.g., "happy", "sad", "anxious", "calm", etc.
    intensity: int  # 1-10 scale
    notes: Optional[str] = None
    triggers: Optional[List[str]] = None

class MoodAnalysisRequest(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    period: Optional[str] = "week"  # week, month, year

@router.post("/chat/{user_id}")
async def chat_with_ai(user_id: str, chat_request: ChatMessage, request: Request):
    """AI chat endpoint for mental health support"""
    
    # Verify authentication
    if not hasattr(request.state, "user") or request.state.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    try:
        # Generate a response (placeholder - integrate with your AI service)
        # TODO: Integrate with OpenAI GPT, Claude, or other AI service
        
        # For now, return a supportive response based on keywords
        message = chat_request.message.lower()
        
        if any(word in message for word in ["anxious", "anxiety", "worried", "stress"]):
            ai_response = {
                "message": "I understand you're feeling anxious. That's completely normal and you're not alone. Try taking a few deep breaths with me - breathe in for 4 counts, hold for 4, and out for 4. Would you like to share what's making you feel this way?",
                "suggestions": [
                    "Try some deep breathing exercises",
                    "Listen to a calming audiobook",
                    "Practice mindfulness meditation"
                ],
                "mood_check": True
            }
        elif any(word in message for word in ["sad", "depressed", "down", "lonely"]):
            ai_response = {
                "message": "I hear that you're going through a tough time. Your feelings are valid, and it's okay to not be okay sometimes. Remember that this feeling is temporary. Is there something specific that's been weighing on your mind?",
                "suggestions": [
                    "Consider reaching out to someone you trust",
                    "Engage in a favorite activity or hobby", 
                    "Listen to an uplifting audiobook"
                ],
                "resources": ["Consider speaking with a mental health professional if these feelings persist"]
            }
        elif any(word in message for word in ["happy", "excited", "good", "great"]):
            ai_response = {
                "message": "That's wonderful to hear! I'm so glad you're feeling positive. What's been going well for you lately? It's important to celebrate these good moments.",
                "suggestions": [
                    "Share your joy with someone special",
                    "Reflect on what's contributing to these positive feelings",
                    "Maybe explore a new audiobook genre while you're feeling adventurous"
                ]
            }
        else:
            ai_response = {
                "message": "Thank you for sharing with me. I'm here to listen and support you. Could you tell me a bit more about how you're feeling today?",
                "suggestions": [
                    "Take a moment to check in with yourself",
                    "Consider what you need right now"
                ]
            }
        
        # Store chat history
        chat_history = await kv_store.get(f"user:{user_id}:chat_history") or []
        
        chat_entry = {
            "id": f"chat_{len(chat_history) + 1}",
            "session_id": chat_request.session_id or "default",
            "timestamp": datetime.utcnow().isoformat(),
            "user_message": chat_request.message,
            "ai_response": ai_response["message"],
            "context": chat_request.context,
            "suggestions": ai_response.get("suggestions", [])
        }
        
        chat_history.append(chat_entry)
        
        # Keep only last 100 messages
        if len(chat_history) > 100:
            chat_history = chat_history[-100:]
        
        await kv_store.set(f"user:{user_id}:chat_history", chat_history)
        
        # Log activity
        await update_user_activity(
            user_id,
            "ai_chat",
            {
                "session_id": chat_request.session_id,
                "message_length": len(chat_request.message),
                "context": chat_request.context
            }
        )
        
        return {
            "success": True,
            "response": ai_response,
            "chat_id": chat_entry["id"],
            "timestamp": chat_entry["timestamp"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@router.get("/chat/{user_id}/history")
async def get_chat_history(
    user_id: str, 
    request: Request,
    session_id: Optional[str] = None,
    limit: int = 50
):
    """Get user's chat history"""
    
    # Verify authentication
    if not hasattr(request.state, "user") or request.state.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    try:
        chat_history = await kv_store.get(f"user:{user_id}:chat_history") or []
        
        # Filter by session if specified
        if session_id:
            chat_history = [chat for chat in chat_history if chat.get("session_id") == session_id]
        
        # Apply limit and return most recent first
        chat_history = chat_history[-limit:] if len(chat_history) > limit else chat_history
        chat_history.reverse()
        
        return {
            "success": True,
            "chat_history": chat_history,
            "total": len(chat_history)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get chat history: {str(e)}")

@router.post("/mood/{user_id}")
async def log_mood(user_id: str, mood_entry: MoodEntry, request: Request):
    """Log user's mood entry"""
    
    # Verify authentication
    if not hasattr(request.state, "user") or request.state.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    try:
        # Validate mood intensity
        if not 1 <= mood_entry.intensity <= 10:
            raise HTTPException(status_code=400, detail="Intensity must be between 1 and 10")
        
        # Get existing mood log
        mood_log = await kv_store.get(f"user:{user_id}:mood_log") or []
        
        # Create mood entry
        mood_data = {
            "id": f"mood_{len(mood_log) + 1}",
            "timestamp": datetime.utcnow().isoformat(),
            "date": datetime.utcnow().date().isoformat(),
            "mood": mood_entry.mood,
            "intensity": mood_entry.intensity,
            "notes": mood_entry.notes,
            "triggers": mood_entry.triggers or []
        }
        
        mood_log.append(mood_data)
        
        # Keep only last 365 entries (1 year)
        if len(mood_log) > 365:
            mood_log = mood_log[-365:]
        
        await kv_store.set(f"user:{user_id}:mood_log", mood_log)
        
        # Log activity
        await update_user_activity(
            user_id,
            "mood_logged",
            {
                "mood": mood_entry.mood,
                "intensity": mood_entry.intensity,
                "has_notes": bool(mood_entry.notes),
                "trigger_count": len(mood_entry.triggers or [])
            }
        )
        
        return {
            "success": True,
            "mood_entry": mood_data,
            "message": "Mood logged successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log mood: {str(e)}")

@router.get("/mood/{user_id}")
async def get_mood_history(
    user_id: str,
    request: Request,
    days: int = 30
):
    """Get user's mood history"""
    
    # Verify authentication
    if not hasattr(request.state, "user") or request.state.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    try:
        mood_log = await kv_store.get(f"user:{user_id}:mood_log") or []
        
        # Get recent entries
        recent_moods = mood_log[-days:] if len(mood_log) > days else mood_log
        recent_moods.reverse()  # Most recent first
        
        return {
            "success": True,
            "mood_history": recent_moods,
            "total": len(recent_moods)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get mood history: {str(e)}")

@router.post("/mood/{user_id}/analysis")
async def analyze_mood(user_id: str, analysis_request: MoodAnalysisRequest, request: Request):
    """Analyze user's mood patterns"""
    
    # Verify authentication
    if not hasattr(request.state, "user") or request.state.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    try:
        mood_log = await kv_store.get(f"user:{user_id}:mood_log") or []
        
        if not mood_log:
            return {
                "success": True,
                "analysis": {
                    "message": "No mood data available for analysis yet. Start logging your moods to see patterns and insights.",
                    "suggestions": ["Begin tracking your daily mood", "Note any triggers you notice"]
                }
            }
        
        # Simple analysis - in production, this would be more sophisticated
        mood_counts = {}
        intensity_sum = 0
        trigger_counts = {}
        
        for entry in mood_log[-30:]:  # Last 30 days
            mood = entry["mood"]
            mood_counts[mood] = mood_counts.get(mood, 0) + 1
            intensity_sum += entry["intensity"]
            
            for trigger in entry.get("triggers", []):
                trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1
        
        # Calculate averages and patterns
        total_entries = len(mood_log[-30:])
        avg_intensity = intensity_sum / total_entries if total_entries > 0 else 0
        most_common_mood = max(mood_counts, key=mood_counts.get) if mood_counts else "unknown"
        common_triggers = sorted(trigger_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        
        # Generate insights
        insights = []
        if avg_intensity > 7:
            insights.append("Your mood intensity has been generally high lately.")
        elif avg_intensity < 4:
            insights.append("You might be experiencing some challenging times lately.")
        else:
            insights.append("Your mood has been relatively balanced.")
        
        if common_triggers:
            insights.append(f"Your most common mood trigger appears to be: {common_triggers[0][0]}")
        
        analysis = {
            "period": "last_30_days",
            "total_entries": total_entries,
            "average_intensity": round(avg_intensity, 1),
            "most_common_mood": most_common_mood,
            "mood_distribution": mood_counts,
            "common_triggers": [{"trigger": t[0], "count": t[1]} for t in common_triggers],
            "insights": insights,
            "suggestions": [
                "Continue tracking your mood daily",
                "Notice patterns between triggers and mood changes",
                "Consider discussing patterns with a mental health professional"
            ]
        }
        
        # Log the analysis request
        await update_user_activity(
            user_id,
            "mood_analysis",
            {
                "period": analysis_request.period,
                "entries_analyzed": total_entries
            }
        )
        
        return {
            "success": True,
            "analysis": analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mood analysis failed: {str(e)}")