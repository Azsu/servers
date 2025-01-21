"""Rate limiting implementation for the SearXNG MCP server."""

from datetime import datetime, timedelta
from typing import Dict, Literal

from .types import RateCounter, RateLimits
from .errors import RateLimitError


TimeWindow = Literal["second", "minute", "hour"]


class RateLimiter:
    """Rate limiter implementation with multiple time windows."""
    
    def __init__(self, limits: RateLimits):
        """Initialize the rate limiter.
        
        Args:
            limits: Rate limit configuration
        """
        self.limits = limits
        self.counters: Dict[TimeWindow, RateCounter] = {
            "second": RateCounter(),
            "minute": RateCounter(),
            "hour": RateCounter()
        }
    
    def _should_reset(self, window: TimeWindow, now: datetime) -> bool:
        """Check if a counter should be reset based on its time window.
        
        Args:
            window: Time window to check
            now: Current timestamp
            
        Returns:
            True if counter should be reset
        """
        counter = self.counters[window]
        deltas = {
            "second": timedelta(seconds=1),
            "minute": timedelta(minutes=1),
            "hour": timedelta(hours=1)
        }
        return now - counter.last_reset > deltas[window]
    
    def check_and_increment(self) -> None:
        """Check if operation is allowed by rate limits and increment counters.
        
        Raises:
            RateLimitError: If any rate limit is exceeded
        """
        now = datetime.now()
        
        # Reset expired counters
        for window in self.counters:
            if self._should_reset(window, now):
                self.counters[window] = RateCounter(last_reset=now)
        
        # Check limits
        limits_map = {
            "second": self.limits.per_second,
            "minute": self.limits.per_minute,
            "hour": self.limits.per_hour
        }
        
        for window, limit in limits_map.items():
            if self.counters[window].count >= limit:
                raise RateLimitError(
                    limit_type=window,
                    current=self.counters[window].count,
                    maximum=limit
                )
        
        # Increment all counters
        for counter in self.counters.values():
            counter.count += 1
    
    def get_stats(self) -> Dict[str, Dict[str, int]]:
        """Get current rate limiting statistics.
        
        Returns:
            Dictionary containing current counts and limits for each window
        """
        return {
            "second": {
                "current": self.counters["second"].count,
                "limit": self.limits.per_second
            },
            "minute": {
                "current": self.counters["minute"].count,
                "limit": self.limits.per_minute
            },
            "hour": {
                "current": self.counters["hour"].count,
                "limit": self.limits.per_hour
            }
        }