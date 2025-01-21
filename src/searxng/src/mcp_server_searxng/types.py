"""Type definitions for the SearXNG MCP server."""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, TypedDict
from pydantic import BaseModel, AnyHttpUrl, PositiveInt, Field


class ResultType(str, Enum):
    """Types of search results."""
    
    WEB = "web"
    NEWS = "news"
    IMAGES = "images"
    VIDEOS = "videos"
    FILES = "files"


class RawSearchResult(TypedDict, total=False):
    """Raw result structure from SearXNG."""
    
    title: str
    url: str
    content: str
    score: float
    category: str
    pretty_url: str
    published_date: Optional[str]
    img_src: Optional[str]
    engine: str
    engines: List[str]
    positions: List[int]


class SearchResult(BaseModel):
    """Processed search result with enhanced metadata."""
    
    title: str
    url: str
    content: str
    result_type: ResultType = ResultType.WEB
    published_date: Optional[str] = None
    source: Optional[str] = None
    score: Optional[float] = None
    engines: List[str] = Field(default_factory=list)


class RateLimits(BaseModel):
    """Rate limit configuration."""
    
    per_second: PositiveInt = Field(default=10, description="Requests allowed per second")
    per_minute: PositiveInt = Field(default=60, description="Requests allowed per minute")
    per_hour: PositiveInt = Field(default=1000, description="Requests allowed per hour")


class RateCounter(BaseModel):
    """Rate limit counter state."""
    
    count: int = 0
    last_reset: datetime = Field(default_factory=datetime.now)


class SearchStats(BaseModel):
    """Search statistics and metadata."""
    
    total_results: int
    search_time: float
    engines_used: List[str]
    timestamp: datetime = Field(default_factory=datetime.now)