"""
Database integration for Magdee Python Backend
Provides KV store access and Supabase authentication
"""

from typing import Optional, Dict, Any, List
import logging
from datetime import datetime
import httpx

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Supabase Edge Functions KV Store Integration
SUPABASE_FUNCTION_URL = f"https://{settings.supabase_url.replace('https://', '').split('.')[0]}.supabase.co/functions/v1/make-server-989ff5a9"

class KVStore:
    """Simple KV store interface using Supabase Edge Functions"""
    
    def __init__(self):
        self.base_url = SUPABASE_FUNCTION_URL
        self.client = httpx.AsyncClient(timeout=10.0)
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from KV store"""
        try:
            # Use Supabase Edge Function KV store
            # This would integrate with your existing kv_store.tsx
            logger.debug(f"KV GET: {key}")
            # Placeholder - implement actual KV store access
            return None
        except Exception as e:
            logger.error(f"KV GET error for {key}: {e}")
            return None
    
    async def set(self, key: str, value: Any) -> bool:
        """Set value in KV store"""
        try:
            logger.debug(f"KV SET: {key}")
            # Placeholder - implement actual KV store access
            return True
        except Exception as e:
            logger.error(f"KV SET error for {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from KV store"""
        try:
            logger.debug(f"KV DELETE: {key}")
            # Placeholder - implement actual KV store access
            return True
        except Exception as e:
            logger.error(f"KV DELETE error for {key}: {e}")
            return False
    
    async def mget(self, keys: List[str]) -> Dict[str, Any]:
        """Get multiple values"""
        result = {}
        for key in keys:
            result[key] = await self.get(key)
        return result
    
    async def mset(self, items: Dict[str, Any]) -> bool:
        """Set multiple values"""
        try:
            for key, value in items.items():
                await self.set(key, value)
            return True
        except Exception as e:
            logger.error(f"KV MSET error: {e}")
            return False

# Global KV store instance
kv_store = KVStore()

async def verify_user_auth(user_id: str, access_token: str) -> Optional[Dict[str, Any]]:
    """
    Verify user authentication via Supabase
    Returns user info if valid, None otherwise
    """
    try:
        # Create Supabase client with access token
        headers = {
            'Authorization': f'Bearer {access_token}',
            'apikey': settings.supabase_anon_key
        }
        
        async with httpx.AsyncClient() as client:
            # Verify with Supabase auth
            response = await client.get(
                f"{settings.supabase_url}/auth/v1/user",
                headers=headers
            )
            
            if response.status_code == 200:
                user_data = response.json()
                
                # Verify user ID matches
                if user_data.get('id') == user_id:
                    logger.info(f"✅ User authenticated: {user_id}")
                    return user_data
                else:
                    logger.warning(f"⚠️ User ID mismatch: {user_id}")
                    return None
            else:
                logger.warning(f"⚠️ Auth failed for user {user_id}: {response.status_code}")
                return None
                
    except Exception as e:
        logger.error(f"❌ Auth verification error: {e}")
        return None

async def update_user_activity(
    user_id: str,
    activity_type: str,
    metadata: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Log user activity to analytics
    """
    try:
        # Get existing activity log
        activity_log = await kv_store.get(f"user:{user_id}:activity_log") or []
        
        # Create activity entry
        activity_entry = {
            "type": activity_type,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": metadata or {}
        }
        
        # Append and save
        activity_log.append(activity_entry)
        
        # Keep only last 1000 activities
        if len(activity_log) > 1000:
            activity_log = activity_log[-1000:]
        
        await kv_store.set(f"user:{user_id}:activity_log", activity_log)
        
        logger.debug(f"📊 Activity logged for {user_id}: {activity_type}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to log activity: {e}")
        return False

async def get_user_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user profile from database"""
    try:
        profile = await kv_store.get(f"user:{user_id}:profile")
        return profile
    except Exception as e:
        logger.error(f"Failed to get user profile: {e}")
        return None

async def update_user_profile(user_id: str, updates: Dict[str, Any]) -> bool:
    """Update user profile"""
    try:
        profile = await kv_store.get(f"user:{user_id}:profile") or {}
        profile.update(updates)
        profile['updated_at'] = datetime.utcnow().isoformat()
        
        await kv_store.set(f"user:{user_id}:profile", profile)
        return True
    except Exception as e:
        logger.error(f"Failed to update user profile: {e}")
        return False

# Export commonly used functions
__all__ = [
    'kv_store',
    'verify_user_auth',
    'update_user_activity',
    'get_user_profile',
    'update_user_profile'
]
