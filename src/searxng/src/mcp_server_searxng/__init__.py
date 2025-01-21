"""MCP server for performing web searches via SearXNG."""

from .server import serve

def main():
    """Entry point for the MCP SearXNG server."""
    import asyncio
    asyncio.run(serve())