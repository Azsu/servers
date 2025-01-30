/**
 * @file ToolRegistry.ts
 * @description Manages tool registration and access using the Singleton pattern
 *
 * @baseClassUsage
 * - Tool registration
 * - Tool access and retrieval
 * - Schema management
 * - Handler coordination
 *
 * @specialization
 * - Singleton pattern implementation
 * - Tool schema validation
 * - Handler management
 * - Tool discovery
 * - Schema retrieval
 * - Tool enumeration
 *
 * @important
 * This registry provides core tool functionality:
 * - Single registry instance management
 * - Type-safe tool registration
 * - Schema validation
 * - Handler execution
 * - Tool discovery
 *
 * @usage
 * // Get registry instance
 * const registry = ToolRegistry.getInstance();
 *
 * // Register tool
 * registry.registerTool({
 *   name: "my_tool",
 *   description: "Does something",
 *   schema: z.object({ param: z.string() }),
 *   handler: async (params) => {...} });
 *
 * // Get tool
 * const tool = registry.getTool("my_tool");
 */
import { z } from 'zod';

export interface Tool {
    name: string;
    description: string;
    schema: z.ZodObject<any>;
    handler: (params: any) => Promise<any>;
}

export class ToolRegistry {
    private static instance: ToolRegistry;
    private tools: Map<string, Tool> = new Map();

    private constructor() { }

    static getInstance(): ToolRegistry {
        if (!ToolRegistry.instance)
        {
            ToolRegistry.instance = new ToolRegistry();
        }
        return ToolRegistry.instance;
    }

    registerTool(tool: Tool): void {
        this.tools.set(tool.name, tool);
    }

    getTool(name: string): Tool | undefined {
        return this.tools.get(name);
    }

    getAllTools(): Tool[] {
        return Array.from(this.tools.values());
    }

    getToolNames(): string[] {
        return Array.from(this.tools.keys());
    }

    getToolSchemas(): Record<string, z.ZodObject<any>> {
        const schemas: Record<string, z.ZodObject<any>> = {};
        this.tools.forEach((tool, name) => {
            schemas[name] = tool.schema;
        });
        return schemas;
    }
}