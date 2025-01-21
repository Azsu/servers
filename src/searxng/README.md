# MCP SearXNG Server

A Model Context Protocol server providing tools to perform web searches via SearXNG.

## Overview

This MCP server enables AI agents to perform web searches through a SearXNG instance. It provides a simple interface for submitting search queries and receiving structured results.

## Prerequisites

- Python 3.10 or higher
- A running SearXNG instance accessible via HTTP/HTTPS

## Installation

### From Source

1. Clone the repository:
```bash
git clone <repository_url>
cd servers/src/searxng
```

2. Install the package:
```bash
pip install .
```

### Using Docker

1. Build the image:
```bash
docker build -t mcp-server-searxng .
```

## Configuration

The server can be configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| SEARXNG_URL | Base URL of the SearXNG instance | http://mini.local:8080 |
| SEARXNG_TIMEOUT | Timeout for HTTP requests in seconds | 30 |
| SEARXNG_USER_AGENT | User-Agent string for HTTP requests | ModelContextProtocol/1.0 |

### Example Configuration

```bash
# Configure for a remote SearXNG instance
export SEARXNG_URL="https://your-searxng-instance.com"
export SEARXNG_TIMEOUT=60
```

## Usage with Claude Desktop

To integrate with Claude Desktop, add one of these configurations to your `claude_desktop_config.json`:

### Using Docker

```json
{
  "mcpServers": {
    "searxng": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "SEARXNG_URL",
        "mcp-server-searxng"
      ],
      "env": {
        "SEARXNG_URL": "http://your-searxng-instance:8080"
      }
    }
  }
}
```

### Using Python Package

```json
{
  "mcpServers": {
    "searxng": {
      "command": "mcp-server-searxng",
      "env": {
        "SEARXNG_URL": "http://your-searxng-instance:8080"
      }
    }
  }
}
```

## Running the Server

### Running Locally

Start the server:
```bash
mcp-server-searxng
```

### Running with Docker

```bash
docker run -e SEARXNG_URL="https://your-searxng-instance.com" mcp-server-searxng
```

## API

### Tools

#### search
Performs a web search using SearXNG and returns the results.

Parameters:
- `query` (string): Search query string
- `max_results` (integer, optional): Maximum number of results to return (default: 10, max: 50)

Example:
```python
result = await mcp_client.call_tool("search", {
    "query": "python programming",
    "max_results": 5
})
```

### Prompts

#### search
Same functionality as the search tool, but formatted for prompt-based interactions.

Arguments:
- `query` (string): Search query string

Example:
```python
prompt = await mcp_client.get_prompt("search", {
    "query": "python programming"
})
```

## Development

### Running Tests
```bash
pip install ".[dev]"
python -m pytest tests/
```

### Code Style
This project uses ruff for linting and formatting:
```bash
ruff check .
ruff format .
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.