import os from 'os';
import path from 'path';

export const CONFIG = {
  MEMORY: {
    TEMP_SUFFIX: '.tmp'
  },
  SERVER: {
    NAME: 'memory-server',
    VERSION: '1.0.0',
  },
  LOGGING: {
    LEVELS: {
      ERROR: 'error',
      WARN: 'warn',
      INFO: 'info',
      DEBUG: 'debug',
    },
  },
} as const;

/**
 * Gets the path for memory storage based on platform and environment
 */
export function getMemoryPath(): string {
  // Try environment variable first
  if (process.env.MCP_MEMORY_PATH)
  {
    return process.env.MCP_MEMORY_PATH;
  }

  // Default paths by platform
  switch (process.platform)
  {
    case 'win32':
      return path.join(process.env.APPDATA || '', 'claude-memory', 'memory.jsonl');
    case 'darwin':
      return path.join(os.homedir(), 'Library', 'Application Support', 'claude-memory', 'memory.jsonl');
    default: // linux and others
      return path.join(os.homedir(), '.local', 'share', 'claude-memory', 'memory.jsonl');
  }
}