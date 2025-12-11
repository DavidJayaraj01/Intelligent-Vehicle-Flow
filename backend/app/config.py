from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/vehicleflow"
    REDIS_URL: str = "redis://localhost:6379/0"
    API_KEY_SECRET: str = "default-secret-key-change-me"
    CORS_ORIGINS: str = "http://localhost:3000"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string into list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()
