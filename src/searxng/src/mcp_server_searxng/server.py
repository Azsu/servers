"""MCP server implementation for SearXNG search integration."""

from typing import Annotated, Optional

from mcp.shared.exceptions import McpError
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    GetPromptResult,
    Prompt,
    PromptArgument,
    PromptMessage,
    TextContent,
    Tool,
    INVALID_PARAMS,
)
from pydantic import BaseModel, Field

from .config import ServerConfig
from .errors import RateLimitError, SearchError
from .rate_limiter import RateLimiter
from .search import perform_search, format_results


class SearchQuery(BaseModel):
    """Parameters for performing a web search."""
    
    query: Annotated[str, Field(description="Search query string")]
    max_results: Annotated[
        int,
        Field(
            default=10,
            description="Maximum number of results to return",
            gt=0,
            lt=50,
        ),
    ]


async def serve() -> None:
    """Run the SearXNG MCP search server."""
    server = Server("mcp-searxng")
    
    # Initialize configuration
    try:
        config = ServerConfig()
    except ValueError as e:
        print(f"Configuration error: {e}")
        return
    
    # Initialize rate limiter
    rate_limiter = RateLimiter(config.rate_limits)

    @server.list_tools()
    async def list_tools() -> list[Tool]:
        """List available tools."""
        return [
            Tool(
                name="search",
                description="Performs a web search using SearXNG and returns the results",
                inputSchema=SearchQuery.model_json_schema(),
            )
        ]

    @server.list_prompts()
    async def list_prompts() -> list[Prompt]:
        """List available prompts."""
        return [
            Prompt(
                name="search",
                description="Perform a web search",
                arguments=[
                    PromptArgument(
                        name="query",
                        description="Search query string",
                        required=True,
                    )
                ],
            )
        ]

    @server.call_tool()
    async def call_tool(name: str, arguments: dict) -> list[TextContent]:
        """Handle tool calls."""
        try:
            args = SearchQuery(**arguments)
        except ValueError as e:
            raise McpError(INVALID_PARAMS, str(e))
            
        try:
            # Check rate limits
            rate_limiter.check_and_increment()
            
            # Perform search
            results, stats = await perform_search(
                args.query,
                config,
                args.max_results
            )
            
            # Format results
            formatted_results = format_results(results, stats)
            
            return [TextContent(
                type="text",
                text=formatted_results
            )]
            
        except RateLimitError as e:
            # Special handling for rate limit errors
            return [TextContent(
                type="text",
                text=f"Rate limit exceeded: {str(e)}\nPlease try again later."
            )]
        except SearchError as e:
            # Handle other search-related errors
            return [TextContent(
                type="text",
                text=f"Search error: {str(e)}"
            )]

    @server.get_prompt()
    async def get_prompt(name: str, arguments: dict | None) -> GetPromptResult:
        """Handle prompt requests."""
        if not arguments or "query" not in arguments:
            raise McpError(INVALID_PARAMS, "Search query is required")

        try:
            # Check rate limits
            rate_limiter.check_and_increment()
            
            # Perform search
            results, stats = await perform_search(
                arguments["query"],
                config,
                max_results=10
            )
            
            # Format results
            formatted_results = format_results(results, stats)
            
            return GetPromptResult(
                description=f"Search results for: {arguments['query']}",
                messages=[
                    PromptMessage(
                        role="user",
                        content=TextContent(
                            type="text",
                            text=formatted_results
                        ),
                    )
                ],
            )
            
        except RateLimitError as e:
            return GetPromptResult(
                description="Rate limit exceeded",
                messages=[
                    PromptMessage(
                        role="user",
                        content=TextContent(
                            type="text",
                            text=f"Rate limit exceeded: {str(e)}\nPlease try again later."
                        ),
                    )
                ],
            )
        except SearchError as e:
            return GetPromptResult(
                description="Search error",
                messages=[
                    PromptMessage(
                        role="user",
                        content=TextContent(
                            type="text",
                            text=f"Search error: {str(e)}"
                        ),
                    )
                ],
            )

    options = server.create_initialization_options()
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, options, raise_exceptions=True)