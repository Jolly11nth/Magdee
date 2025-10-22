"""
Custom middleware for Magdee API
"""

import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from collections import defaultdict
from datetime import datetime, timedelta

logger = logging.getLogger(_name_)

class LoggingMiddleware(BaseHTTPMiddleware):
    """Log all requests and responses"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(f"➡  {request.method} {request.url.path}")
        
        # Process request
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Add custom header
        response.headers["X-Process-Time"] = str(process_time)
        
        # Log response
        logger.info(
            f"⬅  {request.method} {request.url.path} - "
            f"Status: {response.status_code} - "
            f"Time: {process_time:.3f}s"
        )
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple rate limiting middleware"""
    
    def _init_(self, app, max_requests_per_minute: int = 60):
        super()._init_(app)
        self.max_requests_per_minute = max_requests_per_minute
        self.requests = defaultdict(list)
    
    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Get current time
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)
        
        # Clean old requests
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if req_time > minute_ago
        ]
        
        # Check rate limit
        if len(self.requests[client_ip]) >= self.max_requests_per_minute:
            logger.warning(f"🚫 Rate limit exceeded for {client_ip}")
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Maximum {self.max_requests_per_minute} requests per minute allowed"
                }
            )
        
        # Add current request
        self.requests[client_ip].append(now)
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(self.max_requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(
            self.max_requests_per_minute - len(self.requests[client_ip])
        )
        
        return response


class AuthenticationMiddleware(BaseHTTPMiddleware):
    """Verify Supabase access tokens"""
    
    # Paths that don't require authentication
    EXCLUDED_PATHS = [
        "/",
        "/api/health",
        "/api/docs",
        "/api/redoc",
        "/api/openapi.json"
    ]
    
    async def dispatch(self, request: Request, call_next):
        # Skip authentication for excluded paths
        if request.url.path in self.EXCLUDED_PATHS:
            return await call_next(request)
        
        # Get authorization header
        auth_header = request.headers.get("Authorization")
        
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={
                    "error": "Unauthorized",
                    "message": "Authorization header required"
                }
            )
        
        # Extract token
        token = auth_header.split(" ")[1]
        
        # Validate token (simplified - in production, verify with Supabase)
        if not token or len(token) < 20:
            return JSONResponse(
                status_code=401,
                content={
                    "error": "Unauthorized",
                    "message": "Invalid token"
                }
            )
        
        # Add token to request state for use in routes
        request.state.token = token
        
        # Process request
        response = await call_next(request)
        return response


# ==========================================================
# ✅ Added Function: get_client_ip()
# ==========================================================
async def get_client_ip(request: Request) -> str:
    """Extracts the real client IP address, considering reverse proxies."""
    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    elif request.client:
        ip = request.client.host
    else:
        ip = "unknown"
    return ip