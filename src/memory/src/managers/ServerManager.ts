/**
 * @file ServerManager.ts
 * @description Manages server setup, configuration, and request handling using the Singleton pattern
 *
 * @baseClassUsage
 * - Server instance management
 * - Request/response handling
 * - Transport configuration
 * - Tool registration
 *
 * @specialization
 * - Singleton pattern implementation
 * - Request handler setup
 * - Tool listing and execution
 * - Response formatting
 * - Transport configuration
 * - Server lifecycle management
 *
 * @important
 * This manager provides core server functionality:
 * - Single server instance management
 * - Request/response coordination
 * - Tool registration and execution
 * - Transport layer configuration
 * - Server lifecycle control
 *
 * @usage
 * // Get server instance
 * const server = ServerManager.getInstance();
 *
 * // Start server
 * server.start();
 *
 * // Server automatically handles:
 * // - Tool listing requests
 * // - Tool execution requests
 * // - Response formatting
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { CONFIG } from '../config.js';
import { RequestManager } from './RequestManager.js';
import { ResponseManager } from './ResponseManager.js';

/**
 * Manages server setup and configuration
 */
export class ServerManager {
    private static instance: ServerManager;
    private server: Server;
    private requestManager: RequestManager;
    private responseManager: ResponseManager;

    private constructor() {
        this.requestManager = RequestManager.getInstance();
        this.responseManager = ResponseManager.getInstance();

        // Server setup
        this.server = new Server(
            {
                name: CONFIG.SERVER.NAME,
                version: CONFIG.SERVER.VERSION,
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupRequestHandlers();
    }

    public static getInstance(): ServerManager {
        if (!ServerManager.instance)
        {
            ServerManager.instance = new ServerManager();
        }
        return ServerManager.instance;
    }

    private setupRequestHandlers(): void {
        // Request handlers
        this.server.setRequestHandler(ListToolsRequestSchema, async (request) => ({
            tools: await this.requestManager.handleRequest({ type: 'list_tools' })
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => ({
            result: await this.requestManager.handleRequest(request),
            _meta: request.params._meta
        }));
    }

    /**
     * Start the server
     */
    public start(): void {
        const transport = new StdioServerTransport();
        (this.server as any).listen(transport); // TODO: Update SDK types to include listen method
    }
}
