"""Test rate limiting functionality."""

import pytest
from datetime import datetime, timedelta

from mcp_server_searxng.errors import RateLimitError
from mcp_server_searxng.types import RateLimits


def test_rate_limiter_init(rate_limiter):
    """Test rate limiter initialization."""
    assert rate_limiter is not None
    assert rate_limiter.limits is not None
    assert len(rate_limiter.counters) == 3


def test_rate_limiter_increment(rate_limiter):
    """Test basic rate limiting functionality."""
    # Should work without raising
    rate_limiter.check_and_increment()
    
    stats = rate_limiter.get_stats()
    assert stats["second"]["current"] == 1
    assert stats["minute"]["current"] == 1
    assert stats["hour"]["current"] == 1


def test_rate_limiter_exceeds_limit(rate_limiter):
    """Test rate limiter when limits are exceeded."""
    # Set a very low limit
    rate_limiter.limits = RateLimits(per_second=1, per_minute=2, per_hour=3)
    
    # First request should work
    rate_limiter.check_and_increment()
    
    # Second request should fail due to per_second limit
    with pytest.raises(RateLimitError) as exc_info:
        rate_limiter.check_and_increment()
    
    assert "second" in str(exc_info.value)


def test_rate_limiter_reset(rate_limiter):
    """Test counter reset functionality."""
    rate_limiter.limits = RateLimits(per_second=2, per_minute=5, per_hour=10)
    
    # Make a request
    rate_limiter.check_and_increment()
    
    # Manually set last reset time to simulate time passing
    rate_limiter.counters["second"].last_reset = (
        datetime.now() - timedelta(seconds=2)
    )
    
    # Should work after reset
    rate_limiter.check_and_increment()
    
    stats = rate_limiter.get_stats()
    assert stats["second"]["current"] == 1  # Reset to 1 after increment