from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Request
from datetime import datetime, timedelta
from collections import defaultdict, Counter

from app.database import kv_store, update_user_activity

router = APIRouter()

@router.get("/overview/{user_id}")
async def get_analytics_overview(user_id: str, request: Request):
    """Get comprehensive analytics overview for a user"""
    
    # Verify authentication
    if not hasattr(request.state, "user") or request.state.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    try:
        # Get all user data
        activity_log = await kv_store.get(f"user:{user_id}:activity_log") or []
        user_books = await kv_store.get(f"user:{user_id}:books") or []
        mood_log = await kv_store.get(f"user:{user_id}:mood_log") or []
        chat_history = await kv_store.get(f"user:{user_id}:chat_history") or []
        
        # Calculate various metrics
        analytics = {
            "summary": {
                "total_books": len(user_books),
                "total_activities": len(activity_log),
                "mood_entries": len(mood_log),
                "chat_messages": len(chat_history),
                "account_age_days": await calculate_account_age(user_id)
            },
            "usage_patterns": await analyze_usage_patterns(activity_log),
            "book_analytics": await analyze_books(user_books),
            "mood_analytics": await analyze_mood_trends(mood_log),
            "engagement_metrics": await calculate_engagement_metrics(activity_log, mood_log, chat_history)
        }
        
        # Log analytics access
        await update_user_activity(
            user_id,
            "analytics_access",
            {"type": "overview"}
        )
        
        return {
            "success": True,
            "analytics": analytics,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics generation failed: {str(e)}")

@router.get("/usage/{user_id}")
async def get_usage_analytics(
    user_id: str, 
    request: Request,
    period: str = "week"  # week, month, year
):
    """Get detailed usage analytics"""
    
    # Verify authentication
    if not hasattr(request.state, "user") or request.state.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    try:
        activity_log = await kv_store.get(f"user:{user_id}:activity_log") or []
        
        # Filter activities by period
        now = datetime.utcnow()
        if period == "week":
            start_date = now - timedelta(days=7)
        elif period == "month":
            start_date = now - timedelta(days=30)
        elif period == "year":
            start_date = now - timedelta(days=365)
        else:
            start_date = now - timedelta(days=7)  # Default to week
        
        filtered_activities = []
        for activity in activity_log:
            try:
                activity_date = datetime.fromisoformat(activity["timestamp"].replace("Z", "+00:00"))
                if activity_date >= start_date:
                    filtered_activities.append(activity)
            except:
                continue
        
        # Analyze usage patterns
        daily_usage = defaultdict(int)
        activity_types = Counter()
        hourly_distribution = defaultdict(int)
        
        for activity in filtered_activities:
            try:
                activity_date = datetime.fromisoformat(activity["timestamp"].replace("Z", "+00:00"))
                date_str = activity_date.date().isoformat()
                hour = activity_date.hour
                
                daily_usage[date_str] += 1
                activity_types[activity["type"]] += 1
                hourly_distribution[hour] += 1
            except:
                continue
        
        usage_analytics = {
            "period": period,
            "total_activities": len(filtered_activities),
            "daily_usage": dict(daily_usage),
            "activity_breakdown": dict(activity_types),
            "hourly_distribution": dict(hourly_distribution),
            "most_active_day": max(daily_usage, key=daily_usage.get) if daily_usage else None,
            "most_active_hour": max(hourly_distribution, key=hourly_distribution.get) if hourly_distribution else None,
            "average_daily_activities": sum(daily_usage.values()) / len(daily_usage) if daily_usage else 0
        }
        
        return {
            "success": True,
            "usage_analytics": usage_analytics
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Usage analytics failed: {str(e)}")

@router.get("/books/{user_id}")
async def get_book_analytics(user_id: str, request: Request):
    """Get book-specific analytics"""
    
    # Verify authentication
    if not hasattr(request.state, "user") or request.state.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    try:
        user_books = await kv_store.get(f"user:{user_id}:books") or []
        
        # Get detailed book data
        books_data = []
        for book_id in user_books:
            book_data = await kv_store.get(f"book:{book_id}")
            if book_data:
                books_data.append(book_data)
        
        # Analyze books
        status_breakdown = Counter()
        authors = Counter()
        upload_timeline = []
        processing_times = []
        
        for book in books_data:
            status_breakdown[book.get("conversion_status", "unknown")] += 1
            authors[book.get("author", "Unknown")] += 1
            
            # Upload timeline
            upload_timeline.append({
                "date": book.get("created_at", "")[:10],
                "title": book.get("title"),
                "status": book.get("conversion_status")
            })
            
            # Processing time calculation
            if book.get("converted_at") and book.get("created_at"):
                try:
                    created = datetime.fromisoformat(book["created_at"].replace("Z", "+00:00"))
                    converted = datetime.fromisoformat(book["converted_at"].replace("Z", "+00:00"))
                    processing_time = (converted - created).total_seconds() / 60  # minutes
                    processing_times.append(processing_time)
                except:
                    pass
        
        book_analytics = {
            "total_books": len(books_data),
            "status_breakdown": dict(status_breakdown),
            "favorite_authors": dict(authors.most_common(5)),
            "upload_timeline": sorted(upload_timeline, key=lambda x: x["date"]),
            "processing_stats": {
                "average_processing_time_minutes": sum(processing_times) / len(processing_times) if processing_times else 0,
                "fastest_processing_minutes": min(processing_times) if processing_times else 0,
                "slowest_processing_minutes": max(processing_times) if processing_times else 0
            },
            "completion_rate": (status_breakdown.get("completed", 0) / len(books_data) * 100) if books_data else 0
        }
        
        return {
            "success": True,
            "book_analytics": book_analytics
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Book analytics failed: {str(e)}")

@router.get("/mood/{user_id}")
async def get_mood_analytics(user_id: str, request: Request):
    """Get mood tracking analytics"""
    
    # Verify authentication
    if not hasattr(request.state, "user") or request.state.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")
    
    try:
        mood_log = await kv_store.get(f"user:{user_id}:mood_log") or []
        
        if not mood_log:
            return {
                "success": True,
                "mood_analytics": {
                    "message": "No mood data available for analysis",
                    "suggestions": ["Start tracking your mood to see analytics"]
                }
            }
        
        # Analyze mood patterns
        mood_distribution = Counter()
        intensity_over_time = []
        daily_moods = defaultdict(list)
        trigger_analysis = Counter()
        
        for entry in mood_log:
            mood_distribution[entry["mood"]] += 1
            intensity_over_time.append({
                "date": entry["date"],
                "intensity": entry["intensity"],
                "mood": entry["mood"]
            })
            daily_moods[entry["date"]].append(entry["intensity"])
            
            for trigger in entry.get("triggers", []):
                trigger_analysis[trigger] += 1
        
        # Calculate trends
        recent_moods = mood_log[-7:] if len(mood_log) >= 7 else mood_log
        recent_avg_intensity = sum(m["intensity"] for m in recent_moods) / len(recent_moods) if recent_moods else 0
        
        overall_avg_intensity = sum(m["intensity"] for m in mood_log) / len(mood_log)
        
        mood_analytics = {
            "total_entries": len(mood_log),
            "mood_distribution": dict(mood_distribution),
            "intensity_stats": {
                "overall_average": round(overall_avg_intensity, 1),
                "recent_average": round(recent_avg_intensity, 1),
                "trend": "improving" if recent_avg_intensity > overall_avg_intensity else "declining" if recent_avg_intensity < overall_avg_intensity else "stable"
            },
            "intensity_timeline": intensity_over_time[-30:],  # Last 30 entries
            "top_triggers": dict(trigger_analysis.most_common(10)),
            "tracking_consistency": {
                "days_tracked": len(set(entry["date"] for entry in mood_log)),
                "longest_streak": await calculate_mood_streak(mood_log)
            }
        }
        
        return {
            "success": True,
            "mood_analytics": mood_analytics
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mood analytics failed: {str(e)}")

# Helper functions
async def calculate_account_age(user_id: str) -> int:
    """Calculate account age in days"""
    try:
        profile = await kv_store.get(f"user:{user_id}:profile")
        if profile and profile.get("created_at"):
            created_date = datetime.fromisoformat(profile["created_at"].replace("Z", "+00:00"))
            return (datetime.utcnow() - created_date).days
    except:
        pass
    return 0

async def analyze_usage_patterns(activity_log: List[Dict]) -> Dict:
    """Analyze user usage patterns"""
    if not activity_log:
        return {"message": "No activity data available"}
    
    # Peak usage hours
    hourly_activity = defaultdict(int)
    daily_activity = defaultdict(int)
    
    for activity in activity_log[-100:]:  # Last 100 activities
        try:
            timestamp = datetime.fromisoformat(activity["timestamp"].replace("Z", "+00:00"))
            hourly_activity[timestamp.hour] += 1
            daily_activity[timestamp.strftime("%A")] += 1
        except:
            continue
    
    peak_hour = max(hourly_activity, key=hourly_activity.get) if hourly_activity else None
    peak_day = max(daily_activity, key=daily_activity.get) if daily_activity else None
    
    return {
        "peak_usage_hour": peak_hour,
        "peak_usage_day": peak_day,
        "hourly_distribution": dict(hourly_activity),
        "daily_distribution": dict(daily_activity)
    }

async def analyze_books(user_books: List[str]) -> Dict:
    """Analyze book-related metrics"""
    if not user_books:
        return {"message": "No books available for analysis"}
    
    # Get book statuses
    status_counts = defaultdict(int)
    for book_id in user_books:
        book_data = await kv_store.get(f"book:{book_id}")
        if book_data:
            status_counts[book_data.get("conversion_status", "unknown")] += 1
    
    return {
        "total_books": len(user_books),
        "status_distribution": dict(status_counts),
        "completion_rate": status_counts.get("completed", 0) / len(user_books) * 100 if user_books else 0
    }

async def analyze_mood_trends(mood_log: List[Dict]) -> Dict:
    """Analyze mood trends"""
    if not mood_log:
        return {"message": "No mood data available"}
    
    recent_moods = mood_log[-10:] if len(mood_log) >= 10 else mood_log
    
    mood_counts = Counter(entry["mood"] for entry in recent_moods)
    avg_intensity = sum(entry["intensity"] for entry in recent_moods) / len(recent_moods)
    
    return {
        "recent_mood_distribution": dict(mood_counts),
        "average_intensity": round(avg_intensity, 1),
        "total_entries": len(mood_log)
    }

async def calculate_engagement_metrics(activity_log: List[Dict], mood_log: List[Dict], chat_history: List[Dict]) -> Dict:
    """Calculate user engagement metrics"""
    
    # Calculate weekly engagement
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    
    weekly_activities = len([
        a for a in activity_log 
        if datetime.fromisoformat(a["timestamp"].replace("Z", "+00:00")) >= week_ago
    ])
    
    weekly_moods = len([
        m for m in mood_log 
        if datetime.fromisoformat(m["timestamp"].replace("Z", "+00:00")) >= week_ago
    ])
    
    weekly_chats = len([
        c for c in chat_history 
        if datetime.fromisoformat(c["timestamp"].replace("Z", "+00:00")) >= week_ago
    ])
    
    return {
        "weekly_activity_count": weekly_activities,
        "weekly_mood_entries": weekly_moods,
        "weekly_chat_messages": weekly_chats,
        "engagement_score": min(100, (weekly_activities + weekly_moods * 2 + weekly_chats) * 5)
    }

async def calculate_mood_streak(mood_log: List[Dict]) -> int:
    """Calculate longest consecutive days of mood tracking"""
    if not mood_log:
        return 0
    
    dates = sorted(set(entry["date"] for entry in mood_log))
    
    max_streak = 1
    current_streak = 1
    
    for i in range(1, len(dates)):
        try:
            prev_date = datetime.fromisoformat(dates[i-1])
            curr_date = datetime.fromisoformat(dates[i])
            
            if (curr_date - prev_date).days == 1:
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 1
        except:
            current_streak = 1
    
    return max_streak