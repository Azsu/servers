#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { z } from 'zod';
import { KnowledgeGraphManager } from './managers/KnowledgeGraphManager';
import { RelationManager } from './relation-manager';
import { BusinessValueSchema, ImpactLevelSchema, ProficiencyLevelSchema, SearchFilterSchema } from './types';
// Define paths for memory storage
const getMemoryPath = () => {
    // Try environment variable first
    if (process.env.MCP_MEMORY_PATH) {
        return process.env.MCP_MEMORY_PATH;
    }
    // Default paths by platform
    switch (process.platform) {
        case 'win32':
            return path.join(process.env.APPDATA || '', 'claude-memory', 'memory.jsonl');
        case 'darwin':
            return path.join(os.homedir(), 'Library', 'Application Support', 'claude-memory', 'memory.jsonl');
        default: // linux and others
            return path.join(os.homedir(), '.local', 'share', 'claude-memory', 'memory.jsonl');
    }
};
const MEMORY_FILE_PATH = getMemoryPath();
// Ensure memory directory exists
async function ensureMemoryDirectory() {
    const dir = path.dirname(MEMORY_FILE_PATH);
    try {
        await fs.mkdir(dir, { recursive: true });
    }
    catch (error) {
        console.error('Failed to create memory directory:', error);
        throw error;
    }
}
const knowledgeGraphManager = new KnowledgeGraphManager();
const relationManager = new RelationManager();
const server = new Server({
    name: "memory-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {
            search: {
                name: 'search',
                description: 'Search the knowledge graph',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            enum: ['knowledge_graph', 'technology', 'impact', 'domain_expertise']
                        },
                        query: {
                            type: 'string',
                            description: 'Search query for knowledge graph search'
                        },
                        filters: {
                            type: 'object',
                            properties: {
                                excludeTypes: {
                                    type: 'array',
                                    items: { type: 'string' }
                                },
                                minScore: {
                                    type: 'number',
                                    minimum: 0,
                                    maximum: 1
                                },
                                timeframe: {
                                    type: 'object',
                                    properties: {
                                        start: { type: 'string' },
                                        end: { type: 'string' }
                                    }
                                },
                                technologies: {
                                    type: 'array',
                                    items: { type: 'string' }
                                },
                                impactLevel: {
                                    type: 'string',
                                    enum: ['Individual', 'Team', 'Department', 'Organization', 'Industry']
                                }
                            }
                        }
                    }
                }
            }
        }
    }
});
// Request validation schemas
const BaseRequestSchema = z.object({
    method: z.literal('search'),
    params: z.object({
        arguments: z.object({
            type: z.enum(['knowledge_graph', 'technology', 'impact', 'domain_expertise']),
            query: z.string().optional(),
            filters: SearchFilterSchema.optional(),
            technology: z.string().optional(),
            impactLevel: ImpactLevelSchema.optional(),
            businessValue: z.array(BusinessValueSchema).optional(),
            domain: z.string().optional(),
            category: z.string().optional(),
            expertiseLevel: ProficiencyLevelSchema.optional()
        })
    })
});
// Request handler
server.setRequestHandler(BaseRequestSchema, async (request) => {
    const knowledgeGraphManager = new KnowledgeGraphManager();
    try {
        const { type, query, filters, technology, impactLevel, businessValue, domain, category, expertiseLevel } = request.params.arguments;
        switch (type) {
            case 'knowledge_graph': {
                if (!query)
                    throw new Error('Query is required for knowledge graph search');
                const results = await knowledgeGraphManager.search(query, filters);
                return formatResponse(results);
            }
            case 'technology': {
                if (!technology)
                    throw new Error('Technology is required for technology search');
                const results = await knowledgeGraphManager.searchByTechnology(technology, filters);
                return formatResponse(results);
            }
            case 'impact': {
                if (!impactLevel)
                    throw new Error('Impact level is required for impact search');
                const results = await knowledgeGraphManager.searchByImpactLevel(impactLevel, businessValue);
                return formatResponse(results);
            }
            case 'domain_expertise': {
                if (!domain)
                    throw new Error('Domain is required for domain expertise search');
                const results = await knowledgeGraphManager.searchDomainExpertise(domain, category, expertiseLevel);
                return formatResponse(results);
            }
            default: {
                throw new Error(`Unknown search type: ${type}`);
            }
        }
    }
    catch (error) {
        return formatError(error);
    }
});
// Helper functions
function formatResponse(results) {
    return {
        _meta: {},
        tools: [{
                name: 'search',
                description: 'Search the knowledge graph',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            enum: ['knowledge_graph', 'technology', 'impact', 'domain_expertise']
                        }
                    }
                }
            }],
        content: [{
                type: "text",
                text: JSON.stringify(results, null, 2)
            }]
    };
}
function formatError(error) {
    const response = {
        _meta: {},
        tools: [{
                name: 'search',
                description: 'Search the knowledge graph',
                inputSchema: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            enum: ['knowledge_graph', 'technology', 'impact', 'domain_expertise']
                        }
                    }
                }
            }],
        content: [{
                type: "text",
                text: error instanceof Error ? error.message : "Unknown error"
            }]
    };
    if (error instanceof z.ZodError) {
        response.content[0].text = JSON.stringify({
            error: "Invalid parameters",
            details: error.errors
        }, null, 2);
    }
    else {
        response.content[0].text = JSON.stringify({
            error: "Operation failed",
            message: error instanceof Error ? error.message : "Unknown error"
        }, null, 2);
    }
    return response;
}
async function main() {
    try {
        await ensureMemoryDirectory();
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error("Knowledge Graph MCP Server running on stdio");
        console.error("Using memory file:", MEMORY_FILE_PATH);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Fatal error during startup:", error.message);
            if (error.stack)
                console.error(error.stack);
        }
        else {
            console.error("Fatal error during startup:", error);
        }
        process.exit(1);
    }
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
