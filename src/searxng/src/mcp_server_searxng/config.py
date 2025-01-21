"""Configuration management for the SearXNG MCP server."""

import os
from typing import Optional
import httpx
from pydantic import AnyHttpUrl, BaseModel, Field, validator

from .types import RateLimits


class ServerConfig(BaseModel):
    """Server configuration settings."""
    
    searxng_url: AnyHttpUrl = Field(
        default_factory=lambda: os.getenv("SEARXNG_URL", "http://mini.local:8080"),
        description="Base URL of the SearXNG instance"
    )
    
    timeout: int = Field(
        default_factory=lambda: int(os.getenv("SEARXNG_TIMEOUT", "30")),
        description="Timeout for HTTP requests in seconds",
        gt=0
    )
    
    user_agent: str = Field(
        default_factory=lambda: os.getenv(
            "SEARXNG_USER_AGENT",
            "ModelContextProtocol/1.0 (+https://github.com/modelcontextprotocol)"
        ),
        description="User-Agent string for HTTP requests"
    )
    
    rate_limits: RateLimits = Field(
        default_factory=RateLimits,
        description="Rate limiting configuration"
    )
    
    verify_ssl: bool = Field(
        default_factory=lambda: os.getenv("SEARXNG_VERIFY_SSL", "1").lower() in ("1", "true", "yes"),
        description="Whether to verify SSL certificates"
    )
    
    api_key: Optional[str] = Field(
        default_factory=lambda: os.getenv("SEARXNG_API_KEY"),
        description="Optional API key for SearXNG instance"
    )
    
    @validator("searxng_url")
    def validate_searxng_url(cls, v: AnyHttpUrl) -> AnyHttpUrl:
        """Validate that the SearXNG URL is accessible.
        
        Args:
            v: URL to validate
            
        Returns:
            Validated URL
            
        Raises:
            ValueError: If URL is invalid or SearXNG instance is not accessible
        """
        try:
            response = httpx.get(
                str(v),
                verify=bool(os.getenv("SEARXNG_VERIFY_SSL", "1").lower() in ("1", "true", "yes")),
                timeout=10
            )
            response.raise_for_status()
            return v
        except Exception as e:
            raise ValueError(f"Invalid or inaccessible SearXNG URL: {str(e)}")
    
    class Config:
        """Pydantic model configuration."""
        
        env_prefix = "SEARXNG_"