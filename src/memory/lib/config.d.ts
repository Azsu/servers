export declare const CONFIG: {
    readonly MEMORY: {
        readonly ENV_VAR: "MCP_MEMORY_PATH";
        readonly DEFAULT_PATHS: {
            readonly WIN32: string;
            readonly DARWIN: string;
            readonly LINUX: string;
        };
        readonly TEMP_SUFFIX: ".tmp";
    };
    readonly SERVER: {
        readonly NAME: "memory-server";
        readonly VERSION: "1.0.0";
    };
    readonly LOGGING: {
        readonly LEVELS: {
            readonly ERROR: "error";
            readonly WARN: "warn";
            readonly INFO: "info";
            readonly DEBUG: "debug";
        };
    };
};
/**
 * Gets the appropriate memory file path based on platform and environment variables.
 *
 * @returns The full path to the memory file
 */
export declare function getMemoryPath(): string;
