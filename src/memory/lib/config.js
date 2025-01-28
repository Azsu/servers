import os from 'os';
import path from 'path';
export const CONFIG = {
    MEMORY: {
        ENV_VAR: 'MCP_MEMORY_PATH',
        DEFAULT_PATHS: {
            WIN32: path.join(process.env.APPDATA || os.homedir(), 'claude-memory', 'memory.jsonl'),
            DARWIN: path.join(os.homedir(), 'Library', 'Application Support', 'claude-memory', 'memory.jsonl'),
            LINUX: path.join(os.homedir(), '.local', 'share', 'claude-memory', 'memory.jsonl'),
        },
        TEMP_SUFFIX: '.tmp',
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
};
/**
 * Gets the appropriate memory file path based on platform and environment variables.
 *
 * @returns The full path to the memory file
 */
export function getMemoryPath() {
    // Try environment variable first
    if (process.env[CONFIG.MEMORY.ENV_VAR]) {
        return process.env[CONFIG.MEMORY.ENV_VAR];
    }
    // Default paths by platform
    switch (process.platform) {
        case 'win32':
            return CONFIG.MEMORY.DEFAULT_PATHS.WIN32;
        case 'darwin':
            return CONFIG.MEMORY.DEFAULT_PATHS.DARWIN;
        default: // linux and others
            return CONFIG.MEMORY.DEFAULT_PATHS.LINUX;
    }
}
