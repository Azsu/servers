/**
 * @file StorageManager.ts
 * @description Manages persistent storage operations for the graph database using atomic operations
 *
 * @baseClassUsage
 * - Singleton instance management
 * - File system operations
 * - Directory management
 * - Error handling
 *
 * @specialization
 * - Atomic write operations
 * - Directory existence checks
 * - Temporary file handling
 * - Error recovery
 * - File system edge cases
 * - Data persistence
 *
 * @important
 * This manager provides core storage functionality:
 * - Single storage instance management
 * - Atomic write operations with rollback
 * - Safe directory creation
 * - Graceful error handling
 * - Temporary file cleanup
 *
 * @usage
 * // Get storage instance
 * const storage = StorageManager.getInstance();
 *
 * // Write data atomically
 * await storage.writeFile(JSON.stringify(data));
 *
 * // Read data safely
 * const content = await storage.readFile();
 */

import { promises as fs } from 'fs';
import path from 'path';
import { CONFIG, getMemoryPath } from '../config.js';
import { GraphError } from '../errors.js';

const MEMORY_FILE_PATH = getMemoryPath();

/**
 * Manages storage operations for the graph database
 * @description Provides a singleton interface for handling persistent storage operations
 * with atomic guarantees and proper error handling
 */
export class StorageManager {
    private static instance: StorageManager;

    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor() { }

    /**
     * Gets the singleton instance of StorageManager
     * @returns {StorageManager} The singleton instance
     */
    public static getInstance(): StorageManager {
        if (!StorageManager.instance)
        {
            StorageManager.instance = new StorageManager();
        }
        return StorageManager.instance;
    }

    /**
     * Ensures the memory directory exists
     * @description Creates the directory structure for storing graph data if it doesn't exist
     * @throws {GraphError} If directory creation fails
     */
    public async ensureMemoryDirectory(): Promise<void> {
        const dir = path.dirname(MEMORY_FILE_PATH);
        try
        {
            await fs.mkdir(dir, { recursive: true });
        } catch (error)
        {
            if (error instanceof Error)
            {
                throw new GraphError(`Failed to create memory directory: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Writes data to a file with atomic operation guarantees
     * @description Performs an atomic write operation using a temporary file
     * to prevent data corruption in case of failure
     *
     * @param data - Data to write to the file
     * @throws {GraphError} If writing fails at any stage
     */
    public async writeFile(data: string): Promise<void> {
        try
        {
            await this.ensureMemoryDirectory();

            // Write to temporary file first
            const tempPath = `${MEMORY_FILE_PATH}${CONFIG.MEMORY.TEMP_SUFFIX}`;
            await fs.writeFile(tempPath, data);

            // Add cleanup in case of failure
            try
            {
                await fs.rename(tempPath, MEMORY_FILE_PATH);
            } catch (error)
            {
                await fs.unlink(tempPath).catch(() => { }); // Clean up temp file
                throw error;
            }
        } catch (error)
        {
            if (error instanceof Error)
            {
                throw new GraphError(`Failed to write file: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Reads data from a file
     * @description Reads the contents of the graph data file
     *
     * @returns Promise<string> File contents or empty string if file doesn't exist
     * @throws {GraphError} If reading fails for any reason other than missing file
     */
    public async readFile(): Promise<string> {
        try
        {
            await this.ensureMemoryDirectory();
            return await fs.readFile(MEMORY_FILE_PATH, "utf-8");
        } catch (error)
        {
            if (error instanceof Error && 'code' in error && (error as any).code === "ENOENT")
            {
                return "";
            }
            if (error instanceof Error)
            {
                throw new GraphError(`Failed to read file: ${error.message}`);
            }
            throw error;
        }
    }
}