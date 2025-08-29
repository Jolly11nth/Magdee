import time
import logging
from typing import Optional, Dict, Any
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from datetime import datetime

from app.database import verify_user_auth, update_user_activity

logger = logging.getLogger(__name__)

async def auth_middleware(request: Request, call_next):
    """Authentication middleware for protected routes"""
    
    # Skip auth for public endpoints
    public_paths = [
        "/",
        "/health", 
        "/docs",
        "/redoc",
        "/openapi.json",
        "/api/v1/status",
        "/api/v1/webhook"  # Webhooks might not need auth depending on implementation
    ]
    
    # Check if this is a public path
    if any(request.url.path.startswith(path) for path in public_paths):
        response = await call_next(request)
        return response
    
    # Check for Authorization header
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        # For API routes, require authentication
        if request.url.path.startswith("/api/v1/"):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"error": "Authorization token required", "code": "AUTH_REQUIRED"}
            )
    
    # Extract token and user info if present
    if auth_header and auth_header.startswith("Bearer "):
        try:
            access_token = auth_header.split(" ")[1]
            
            # Get user ID from path or query params
            user_id = None
            path_parts = request.url.path.split("/")
            
            # Look for user ID in path (e.g., /api/v1/users/{user_id}/...)
            if "users" in path_parts:
                try:
                    user_idx = path_parts.index("users")
                    if user_idx + 1 < len(path_parts):
                        user_id = path_parts[user_idx + 1]
                except (ValueError, IndexError):
                    pass
            
            # Verify authentication if we have user ID
            if user_id:
                user_info = await verify_user_auth(user_id, access_token)
                if not user_info:
                    return JSONResponse(
                        status_code=status.HTTP_403_FORBIDDEN,
                        content={"error": "Invalid or expired token", "code": "AUTH_INVALID"}
                    )
                
                # Add user info to request state
                request.state.user = user_info
                request.state.user_id = user_id
                request.state.access_token = access_token
        
        except Exception as e:
            logger.error(f"Auth middleware error: {e}")
            if request.url.path.startswith("/api/v1/"):
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"error": "Authentication failed", "code": "AUTH_ERROR"}
                )
    
    # Add request timing
    start_time = time.time()
    request.state.start_time = start_time
    
    # Process request
    response = await call_next(request)
    
    # Log request completion
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    # Log user activity if authenticated
    if hasattr(request.state, "user_id"):
        try:
            await update_user_activity(
                request.state.user_id,
                "api_request",
                {
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "process_time": process_time
                }
            )
        except Exception as e:
            logger.warning(f"Failed to log user activity: {e}")
    
    return response

async def error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global error handler"""
    
    # Log the error
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    # Get process time if available
    process_time = 0
    if hasattr(request.state, "start_time"):
        process_time = time.time() - request.state.start_time
    
    # Determine error response based on exception type
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail,
                "code": "HTTP_ERROR",
                "timestamp": datetime.utcnow().isoformat(),
                "process_time": process_time
            }
        )
    
    # Handle specific exception types
    error_mappings = {
        ValueError: (400, "INVALID_VALUE"),
        FileNotFoundError: (404, "FILE_NOT_FOUND"),
        PermissionError: (403, "PERMISSION_DENIED"),
        ConnectionError: (503, "CONNECTION_ERROR"),
        TimeoutError: (504, "TIMEOUT_ERROR")
    }
    
    for exc_type, (status_code, error_code) in error_mappings.items():
        if isinstance(exc, exc_type):
            return JSONResponse(
                status_code=status_code,
                content={
                    "error": str(exc),
                    "code": error_code,
                    "timestamp": datetime.utcnow().isoformat(),
                    "process_time": process_time
                }
            )
    
    # Generic server error
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "code": "INTERNAL_ERROR",
            "timestamp": datetime.utcnow().isoformat(),
            "process_time": process_time
        }
    )

class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        self.requests = {}
    
    def is_allowed(self, key: str, limit: int, window: int) -> bool:
        """Check if request is allowed under rate limit"""
        now = time.time()
        
        # Clean old entries
        self.requests = {
            k: v for k, v in self.requests.items() 
            if now - v["start"] < window
        }
        
        # Check current requests for this key
        if key not in self.requests:
            self.requests[key] = {"count": 1, "start": now}
            return True
        
        if now - self.requests[key]["start"] >= window:
            # Reset window
            self.requests[key] = {"count": 1, "start": now}
            return True
        
        if self.requests[key]["count"] >= limit:
            return False
        
        self.requests[key]["count"] += 1
        return True

# Global rate limiter instance
rate_limiter = RateLimiter()

def get_client_ip(request: Request) -> str:
    """Get client IP address"""
    # Check for forwarded headers first (for proxy/load balancer setups)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fallback to direct client IP
    return request.client.host if request.client else "unknown"