"""Custom error types for the SearXNG MCP server."""

from typing import Optional
from mcp.shared.exceptions import McpError
from mcp.types import INTERNAL_ERROR, INVALID_PARAMS


class SearchError(McpError):
    """Base class for search-related errors."""
    
    def __init__(self, message: str, error_code: str = INTERNAL_ERROR):
        super().__init__(error_code, message)


class RateLimitError(SearchError):
    """Raised when rate limits are exceeded."""
    
    def __init__(self, limit_type: str, current: int, maximum: int):
        super().__init__(
            f"Rate limit exceeded for {limit_type}: {current}/{maximum}",
            INTERNAL_ERROR
        )
        self.limit_type = limit_type
        self.current = current
        self.maximum = maximum


class SearchConfigError(SearchError):
    """Raised for configuration-related issues."""
    
    def __init__(self, message: str, config_key: Optional[str] = None):
        super().__init__(
            f"Configuration error{f' for {config_key}' if config_key else ''}: {message}",
            INVALID_PARAMS
        )
        self.config_key = config_key


class SearchRequestError(SearchError):
    """Raised for issues with the search request."""
    
    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(
            f"Search request failed{f' with status {status_code}' if status_code else ''}: {message}",
            INTERNAL_ERROR
        )
        self.status_code = status_code


class ParseError(SearchError):
    """Raised when parsing search results fails."""
    
    def __init__(self, message: str):
        super().__init__(f"Failed to parse search results: {message}", INTERNAL_ERROR)