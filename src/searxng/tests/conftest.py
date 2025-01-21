"""Test configuration and fixtures for the SearXNG MCP server tests."""

import pytest
from urllib.parse import urlparse

from mcp_server_searxng.config import ServerConfig
from mcp_server_searxng.rate_limiter import RateLimiter


@pytest.fixture
def mock_config():
    """Provide a test configuration."""
    return ServerConfig(
        searxng_url="http://test.local:8080",
        timeout=5,
        user_agent="TestAgent/1.0"
    )


@pytest.fixture
def rate_limiter():
    """Provide a test rate limiter."""
    config = ServerConfig()
    return RateLimiter(config.rate_limits)