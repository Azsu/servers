/**
 * @file ResponseManager.ts
 * @description Manages response formatting and error handling using the Singleton pattern
 *
 * @baseClassUsage
 * - Response formatting
 * - Error handling
 * - Type safety
 * - Promise wrapping
 *
 * @specialization
 * - Success response formatting
 * - Error response formatting
 * - Error type handling
 * - Promise result formatting
 * - Type preservation
 * - Error code mapping
 *
 * @important
 * This manager provides core response functionality:
 * - Single response manager instance
 * - Consistent response format
 * - Type-safe responses
 * - Error categorization
 * - Promise result handling
 *
 * @usage
 * // Get response manager
 * const manager = ResponseManager.getInstance();
 *
 * // Format success response
 * const success = manager.success({ data: "value" });
 *
 * // Format error response
 * const error = manager.error(new ValidationError("Invalid"));
 *
 * // Format promise result
 * const result = await manager.format(
 *   Promise.resolve({ data: "value" })
 * );
 */

import { GraphError, ValidationError } from '../types.js';

export interface Response<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code: string;
    };
}

/**
 * Manages response formatting and error handling
 */
export class ResponseManager {
    private static instance: ResponseManager;

    private constructor() { }

    public static getInstance(): ResponseManager {
        if (!ResponseManager.instance)
        {
            ResponseManager.instance = new ResponseManager();
        }
        return ResponseManager.instance;
    }

    /**
     * Creates a success response
     */
    public success<T>(data: T): Response<T> {
        return {
            success: true,
            data
        };
    }

    /**
     * Creates an error response
     */
    public error(error: unknown): Response {
        if (error instanceof ValidationError)
        {
            return {
                success: false,
                error: {
                    message: error.message,
                    code: 'VALIDATION_ERROR'
                }
            };
        }

        if (error instanceof GraphError)
        {
            return {
                success: false,
                error: {
                    message: error.message,
                    code: 'GRAPH_ERROR'
                }
            };
        }

        if (error instanceof Error)
        {
            return {
                success: false,
                error: {
                    message: error.message,
                    code: 'UNKNOWN_ERROR'
                }
            };
        }

        return {
            success: false,
            error: {
                message: 'An unknown error occurred',
                code: 'UNKNOWN_ERROR'
            }
        };
    }

    /**
     * Formats a response based on the result
     */
    public format<T>(result: Promise<T>): Promise<Response<T>> {
        return result
            .then(data => this.success(data))
            .catch(error => this.error(error));
    }
}