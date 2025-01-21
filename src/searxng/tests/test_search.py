"""Test search functionality."""

import json
import pytest
from unittest.mock import patch, AsyncMock

import httpx

from mcp_server_searxng.errors import SearchRequestError, ParseError
from mcp_server_searxng.search import perform_search, process_results
from mcp_server_searxng.types import SearchResult, SearchStats


SAMPLE_RESPONSE = {
    "query": "test",
    "number_of_results": 2,
    "search_time": 0.5,
    "results": [
        {
            "title": "Test Result 1",
            "url": "http://example.com/1",
            "content": "Test content 1",
            "score": 1.0,
            "category": "web",
            "engine": "test_engine"
        },
        {
            "title": "Test Result 2",
            "url": "http://example.com/2",
            "content": "Test content 2",
            "score": 0.5,
            "category": "web",
            "engine": "test_engine"
        }
    ],
    "engines": ["test_engine"]
}


@pytest.mark.asyncio
async def test_perform_search_success(mock_config):
    """Test successful search execution."""
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.json.return_value = SAMPLE_RESPONSE
    
    mock_client = AsyncMock()
    mock_client.get.return_value = mock_response
    
    with patch("httpx.AsyncClient", return_value=mock_client):
        results, stats = await perform_search("test query", mock_config)
        
        assert len(results) == 2
        assert isinstance(results[0], SearchResult)
        assert isinstance(stats, SearchStats)
        assert stats.total_results == 2


@pytest.mark.asyncio
async def test_perform_search_rate_limit(mock_config):
    """Test handling of rate limit responses."""
    mock_response = AsyncMock()
    mock_response.status_code = 429
    
    mock_client = AsyncMock()
    mock_client.get.return_value = mock_response
    
    with patch("httpx.AsyncClient", return_value=mock_client):
        with pytest.raises(SearchRequestError) as exc_info:
            await perform_search("test query", mock_config)
        
        assert "rate limit exceeded" in str(exc_info.value).lower()


def test_process_results_success():
    """Test successful processing of search results."""
    results, stats = process_results(SAMPLE_RESPONSE, max_results=10)
    
    assert len(results) == 2
    assert isinstance(results[0], SearchResult)
    assert results[0].title == "Test Result 1"
    assert results[0].score == 1.0
    
    assert isinstance(stats, SearchStats)
    assert stats.total_results == 2
    assert stats.search_time == 0.5
    assert "test_engine" in stats.engines_used


def test_process_results_invalid():
    """Test handling of invalid result data."""
    invalid_data = {
        "results": [
            {
                "title": "Test",
                # Missing required 'url' field
                "content": "Test content"
            }
        ]
    }
    
    with pytest.raises(ParseError):
        process_results(invalid_data, max_results=10)