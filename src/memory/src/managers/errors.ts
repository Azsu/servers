/**
 * @file errors.ts
 * @description Defines custom error types for consistent error handling across managers
 *
 * @baseClassUsage
 * - Error inheritance
 * - Error type checking
 * - Error message formatting
 * - Error classification
 *
 * @specialization
 * - Graph operation errors
 * - Entity validation errors
 * - Duplicate handling
 * - Not found handling
 * - Error inheritance chain
 * - Custom error types
 *
 * @important
 * This file provides core error functionality:
 * - Base graph error type
 * - Entity-specific errors
 * - Validation error handling
 * - Consistent error formatting
 * - Error type hierarchy
 *
 * @usage
 * // Throw graph error
 * throw new GraphError("Operation failed");
 *
 * // Handle entity not found
 * throw new EntityNotFoundError("User123");
 *
 * // Handle validation error
 * throw new ValidationError("Invalid input");
 */

// Error types used across managers
export class GraphError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GraphError';
    }
}

export class EntityNotFoundError extends GraphError {
    constructor(entityName: string) {
        super(`Entity not found: ${entityName}`);
        this.name = 'EntityNotFoundError';
    }
}

export class DuplicateEntityError extends GraphError {
    constructor(entityName: string) {
        super(`Entity already exists: ${entityName}`);
        this.name = 'DuplicateEntityError';
    }
}

export class ValidationError extends GraphError {
    constructor(message: string) {
        super(`Validation error: ${message}`);
        this.name = 'ValidationError';
    }
}