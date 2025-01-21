"""Search functionality implementation for the SearXNG MCP server."""

import json
from typing import Dict, List, Tuple
from urllib.parse import quote

import httpx
from mcp.types import INTERNAL_ERROR

from .config import ServerConfig
from .errors import ParseError, SearchRequestError
from .types import RawSearchResult, SearchResult, SearchStats


async def perform_search(
    query: str,
    config: ServerConfig,
    max_results: int = 10
) -> Tuple[List[SearchResult], SearchStats]:
    """Perform a web search using SearXNG.
    
    Args:
        query: Search query string
        config: Server configuration
        max_results: Maximum number of results to return
        
    Returns:
        Tuple of processed search results and search statistics
        
    Raises:
        SearchRequestError: If the search request fails
        ParseError: If parsing the response fails
    """
    search_url = f"{config.searxng_url}/search?q={quote(query)}&format=json"
    
    headers = {
        "User-Agent": config.user_agent,
        "Accept": "application/json"
    }
    
    if config.api_key:
        headers["Authorization"] = f"Bearer {config.api_key}"
    
    async with httpx.AsyncClient(verify=config.verify_ssl) as client:
        try:
            response = await client.get(
                search_url,
                headers=headers,
                timeout=config.timeout
            )
            
            if response.status_code == 429:
                raise SearchRequestError("SearXNG rate limit exceeded", response.status_code)
            response.raise_for_status()
            
            try:
                data = response.json()
            except json.JSONDecodeError as e:
                raise ParseError(f"Invalid JSON response: {str(e)}")
            
            return process_results(data, max_results)
            
        except httpx.TimeoutError:
            raise SearchRequestError(f"Request timed out after {config.timeout} seconds")
        except httpx.HTTPError as e:
            raise SearchRequestError(str(e), getattr(e, "response", None))
        except Exception as e:
            raise SearchRequestError(f"Unexpected error: {str(e)}")


def process_results(
    data: Dict,
    max_results: int
) -> Tuple[List[SearchResult], SearchStats]:
    """Process raw SearXNG response into structured results.
    
    Args:
        data: Raw JSON response from SearXNG
        max_results: Maximum number of results to process
        
    Returns:
        Tuple of processed results and search statistics
        
    Raises:
        ParseError: If required fields are missing or invalid
    """
    try:
        raw_results = data.get("results", [])[:max_results]
        
        processed_results = []
        for raw in raw_results:
            result = RawSearchResult(**raw)
            processed_results.append(
                SearchResult(
                    title=result["title"],
                    url=result["url"],
                    content=result["content"],
                    result_type=result.get("category", "web"),
                    published_date=result.get("published_date"),
                    source=result.get("engine"),
                    score=result.get("score"),
                    engines=result.get("engines", [])
                )
            )
        
        stats = SearchStats(
            total_results=data.get("number_of_results", len(processed_results)),
            search_time=data.get("search_time", 0.0),
            engines_used=data.get("engines", [])
        )
        
        return processed_results, stats
        
    except (KeyError, TypeError, ValueError) as e:
        raise ParseError(f"Failed to process results: {str(e)}")


def format_results(results: List[SearchResult], stats: SearchStats) -> str:
    """Format search results and stats into a readable string.
    
    Args:
        results: List of processed search results
        stats: Search statistics
        
    Returns:
        Formatted string representation of results
    """
    lines = [
        f"Found {stats.total_results} results in {stats.search_time:.2f} seconds",
        f"Using engines: {', '.join(stats.engines_used)}\n"
    ]
    
    for i, result in enumerate(results, 1):
        lines.extend([
            f"{i}. {result.title}",
            f"   URL: {result.url}",
            f"   {result.content}"
        ])
        
        if result.published_date:
            lines.append(f"   Published: {result.published_date}")
        if result.source:
            lines.append(f"   Source: {result.source}")
        if result.score:
            lines.append(f"   Score: {result.score:.2f}")
            
        lines.append("")  # Empty line between results
    
    return "\n".join(lines)