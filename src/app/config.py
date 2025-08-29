import os
from typing import List
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings and configuration"""
    
    # Environment
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # Supabase Configuration
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # CORS Configuration
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    
    @property
    def cors_origins(self) -> List[str]:
        """Get CORS origins based on environment"""
        if self.environment == "production":
            return [
                self.frontend_origin,
                "https://your-production-domain.com",  # Replace with your actual domain
                "https://magdee.app"  # Replace with your actual domain
            ]
        else:
            return [
                "http://localhost:3000",
                "http://localhost:3001", 
                "http://localhost:8080",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3001",
                "http://127.0.0.1:8080"
            ]
    
    @property
    def allowed_hosts(self) -> List[str]:
        """Get allowed hosts based on environment"""
        if self.environment == "production":
            return [
                "your-backend-domain.com",  # Replace with your actual backend domain
                "api.magdee.app"  # Replace with your actual backend domain
            ]
        else:
            return ["*"]  # Allow all hosts in development
    
    # API Configuration
    api_version: str = "v1"
    max_request_size: int = 50 * 1024 * 1024  # 50MB for PDF uploads
    
    # PDF Processing Configuration
    max_pdf_size: int = 25 * 1024 * 1024  # 25MB max PDF size
    supported_pdf_types: List[str] = ["application/pdf"]
    
    # Audio Processing Configuration
    audio_output_format: str = "mp3"
    audio_quality: str = "high"
    max_audio_duration: int = 10 * 60 * 60  # 10 hours max
    
    # AI/ML Configuration
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    elevenlabs_api_key: str = os.getenv("ELEVENLABS_API_KEY", "")
    
    # Storage Configuration
    upload_path: str = os.getenv("UPLOAD_PATH", "/tmp/uploads")
    output_path: str = os.getenv("OUTPUT_PATH", "/tmp/outputs")
    
    # Rate Limiting
    rate_limit_per_minute: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    rate_limit_per_hour: int = int(os.getenv("RATE_LIMIT_PER_HOUR", "1000"))
    
    # Security
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # Logging Configuration
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

# Validate critical settings on import
settings = get_settings()

# Validate Supabase configuration
if not settings.supabase_url:
    print("⚠️  Warning: SUPABASE_URL not configured")

if not settings.supabase_service_role_key:
    print("⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY not configured")

# Create required directories
os.makedirs(settings.upload_path, exist_ok=True)
os.makedirs(settings.output_path, exist_ok=True)

print(f"🔧 Configuration loaded for environment: {settings.environment}")