/**
 * @file RequestManager.ts
 * @description Manages request validation, routing, and processing using the Singleton pattern
 *
 * @baseClassUsage
 * - Request validation
 * - Tool routing
 * - Error handling
 * - Schema enforcement
 *
 * @specialization
 * - Request type validation
 * - Tool handler routing
 * - Operation processing
 * - Error transformation
 * - Schema validation
 * - Request parsing
 *
 * @important
 * This manager provides core request functionality:
 * - Single request manager instance
 * - Type-safe request validation
 * - Tool handler coordination
 * - Error handling and transformation
 * - Operation routing
 *
 * @usage
 * // Get request manager
 * const manager = RequestManager.getInstance();
 *
 * // Handle search request
 * const result = await manager.handleRequest({
 *   type: "search",
 *   query: "search term",
 *   filters: { tags: ["tech"] }
 * });
 *
 * // Handle create request
 * await manager.handleRequest({
 *   type: "create",
 *   entityType: "skill",
 *   data: { name: "TypeScript" }
 * });
 */

import { z } from 'zod';
import { ValidationError } from '../types.js';
import { ToolRegistry } from './ToolRegistry.js';

/**
 * Schema for request validation
 */
export const RequestSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('search'),
        query: z.string(),
        filters: z.object({
            startDate: z.string().optional(),
            endDate: z.string().optional(),
            entityTypes: z.array(z.string()).optional(),
            tags: z.array(z.string()).optional()
        }).optional()
    }),
    z.object({
        type: z.literal('create'),
        entityType: z.string(),
        data: z.any()
    }),
    z.object({
        type: z.literal('update'),
        entityType: z.string(),
        id: z.string(),
        data: z.any()
    }),
    z.object({
        type: z.literal('delete'),
        entityType: z.string(),
        id: z.string()
    })
]);

export type Request = z.infer<typeof RequestSchema>;

/**
 * Manages request validation and routing
 */
export class RequestManager {
    private static instance: RequestManager;
    private registry: ToolRegistry;

    private constructor() {
        this.registry = ToolRegistry.getInstance();
    }

    public static getInstance(): RequestManager {
        if (!RequestManager.instance)
        {
            RequestManager.instance = new RequestManager();
        }
        return RequestManager.instance;
    }

    /**
     * Validates and processes a request
     */
    public async handleRequest(request: unknown): Promise<any> {
        try
        {
            const validatedRequest = RequestSchema.parse(request);
            const tool = this.registry.getTool(`${validatedRequest.type}_${validatedRequest.entityType?.toLowerCase()}`);

            if (!tool)
            {
                throw new ValidationError(`No handler found for ${validatedRequest.type} operation on ${validatedRequest.entityType}`);
            }

            switch (validatedRequest.type)
            {
                case 'search':
                    return tool.handler({ query: validatedRequest.query, ...validatedRequest.filters });
                case 'create':
                    return tool.handler(validatedRequest.data);
                case 'update':
                    return tool.handler({ id: validatedRequest.id, data: validatedRequest.data });
                case 'delete':
                    return tool.handler({ id: validatedRequest.id });
                default:
                    throw new ValidationError(`Unsupported operation type: ${(validatedRequest as any).type}`);
            }
        } catch (error)
        {
            if (error instanceof z.ZodError)
            {
                throw new ValidationError(`Invalid request: ${error.message}`);
            }
            throw error;
        }
    }
}