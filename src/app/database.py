import asyncio
from typing import Optional, Dict, Any, List
from supabase import create_client, Client
from supabase.client import AsyncClient
import logging
from datetime import datetime

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Global Supabase client instances
_supabase_client: Optional[Client] = None
_supabase_async_client: Optional[AsyncClient] = None

def get_supabase_client() -> Client:
    """Get or create Supabase client instance"""
    global _supabase_client
    
    if _supabase_client is None:
        if not settings.supabase_url or not settings.supabase_service_role_key:
            raise ValueError(
                "Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
            )
        
        _supabase_client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
        logger.info("✅ Supabase client initialized")
    
    return _supabase_client

async def get_supabase_async_client() -> AsyncClient:
    """Get or create async Supabase client instance"""
    global _supabase_async_client
    
    if _supabase_async_client is None:
        if not settings.supabase_url or not settings.supabase_service_role_key:
            raise ValueError(
                "Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
            )
        
        _supabase_async_client = AsyncClient(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
        logger.info("✅ Async Supabase client initialized")
    
    return _supabase_async_client

# KV Store Operations (matching your existing KV store pattern)
class KVStore:
    """KV Store operations for the Magdee backend"""
    
    def __init__(self):
        self.table_name = "kv_store_989ff5a9"
    
    async def get(self, key: str) -> Optional[Any]:
        """Get a value by key"""
        try:
            supabase = get_supabase_client()
            result = supabase.table(self.table_name).select("value").eq("key", key).maybe_single().execute()
            return result.data.get("value") if result.data else None
        except Exception as e:
            logger.error(f"Error getting key {key}: {e}")
            return None
    
    async def set(self, key: str, value: Any) -> bool:
        """Set a key-value pair"""
        try:
            supabase = get_supabase_client()
            supabase.table(self.table_name).upsert({
                "key": key,
                "value": value
            }).execute()
            return True
        except Exception as e:
            logger.error(f"Error setting key {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete a key"""
        try:
            supabase = get_supabase_client()
            supabase.table(self.table_name).delete().eq("key", key).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting key {key}: {e}")
            return False
    
    async def get_by_prefix(self, prefix: str) -> List[Dict[str, Any]]:
        """Get all keys with a specific prefix"""
        try:
            supabase = get_supabase_client()
            result = supabase.table(self.table_name).select("key, value").like("key", f"{prefix}%").execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Error getting keys with prefix {prefix}: {e}")
            return []
    
    async def mget(self, keys: List[str]) -> List[Any]:
        """Get multiple values by keys"""
        try:
            supabase = get_supabase_client()
            result = supabase.table(self.table_name).select("value").in_("key", keys).execute()
            return [item["value"] for item in result.data] if result.data else []
        except Exception as e:
            logger.error(f"Error getting multiple keys: {e}")
            return []
    
    async def mset(self, items: List[Dict[str, Any]]) -> bool:
        """Set multiple key-value pairs"""
        try:
            supabase = get_supabase_client()
            data = [{"key": item["key"], "value": item["value"]} for item in items]
            supabase.table(self.table_name).upsert(data).execute()
            return True
        except Exception as e:
            logger.error(f"Error setting multiple keys: {e}")
            return False

# Global KV store instance
kv_store = KVStore()

# Database initialization
async def init_db():
    """Initialize database connections and verify setup"""
    try:
        # Test Supabase connection
        supabase = get_supabase_client()
        
        # Test KV store table access
        result = supabase.table("kv_store_989ff5a9").select("key").limit(1).execute()
        
        logger.info("✅ Database connection verified")
        logger.info("✅ KV store table accessible")
        
        # Store backend initialization timestamp
        await kv_store.set(
            "python_backend:last_startup",
            {
                "timestamp": datetime.utcnow().isoformat(),
                "version": "1.0.0",
                "status": "initialized"
            }
        )
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise e

# Database utility functions
async def verify_user_auth(user_id: str, access_token: str) -> Optional[Dict[str, Any]]:
    """Verify user authentication with Supabase"""
    try:
        supabase = get_supabase_client()
        
        # Verify the token with Supabase Auth
        user_response = supabase.auth.get_user(access_token)
        
        if user_response.user and user_response.user.id == user_id:
            return {
                "id": user_response.user.id,
                "email": user_response.user.email,
                "user_metadata": user_response.user.user_metadata
            }
        
        return None
        
    except Exception as e:
        logger.error(f"Auth verification failed: {e}")
        return None

async def get_user_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user profile from KV store"""
    try:
        profile = await kv_store.get(f"user:{user_id}:profile")
        return profile
    except Exception as e:
        logger.error(f"Error getting user profile for {user_id}: {e}")
        return None

async def update_user_activity(user_id: str, activity_type: str, details: Dict[str, Any] = None):
    """Update user activity log"""
    try:
        activity_log = await kv_store.get(f"user:{user_id}:activity_log") or []
        
        # Add new activity
        activity_log.append({
            "type": activity_type,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details or {},
            "source": "python_backend"
        })
        
        # Keep only last 100 activities
        if len(activity_log) > 100:
            activity_log = activity_log[-100:]
        
        await kv_store.set(f"user:{user_id}:activity_log", activity_log)
        
    except Exception as e:
        logger.error(f"Error updating user activity for {user_id}: {e}")

# Health check function
async def check_database_health() -> Dict[str, Any]:
    """Check database health status"""
    try:
        supabase = get_supabase_client()
        
        # Test basic connection
        start_time = datetime.utcnow()
        result = supabase.table("kv_store_989ff5a9").select("key").limit(1).execute()
        end_time = datetime.utcnow()
        
        response_time = (end_time - start_time).total_seconds() * 1000  # in milliseconds
        
        return {
            "status": "healthy",
            "response_time_ms": response_time,
            "table_accessible": True,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "table_accessible": False,
            "timestamp": datetime.utcnow().isoformat()
        }