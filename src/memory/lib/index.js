#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

// Define paths for memory storage
const getMemoryPath = () => {
    if (process.env.MCP_MEMORY_PATH) {
        return process.env.MCP_MEMORY_PATH;
    }
    switch (process.platform) {
        case 'win32':
            return path.join(process.env.APPDATA || '', 'claude-memory', 'memory.jsonl');
        case 'darwin':
            return path.join(os.homedir(), 'Library', 'Application Support', 'claude-memory', 'memory.jsonl');
        default:
            return path.join(os.homedir(), '.local', 'share', 'claude-memory', 'memory.jsonl');
    }
};
const MEMORY_FILE_PATH = getMemoryPath();

// Ensure memory directory exists
async function ensureMemoryDirectory() {
    const dir = path.dirname(MEMORY_FILE_PATH);
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch (error) {
        console.error('Failed to create memory directory:', error);
        throw error;
    }
}

// Advanced Interfaces
class Technology {
    constructor(name, scope, experience) {
        this.type = "technology";
        this.name = name;
        this.scope = scope;
        this.experience = experience;
    }
}

class WorkExperience {
    constructor(companyName, title, startDate, endDate, responsibilities, achievements, technologiesUsed) {
        this.type = "workExperience";
        this.companyName = companyName;
        this.title = title;
        this.startDate = startDate;
        this.endDate = endDate;
        this.responsibilities = responsibilities || [];
        this.achievements = achievements || [];
        this.technologiesUsed = technologiesUsed || [];
    }
}

class Relation {
    constructor(from, to, relationType, metadata = {}) {
        this.type = "relation";
        this.from = from;
        this.to = to;
        this.relationType = relationType;
        this.metadata = metadata;
    }
}

// The KnowledgeGraphManager class contains all operations to interact with the knowledge graph
class KnowledgeGraphManager {
    async loadGraph() {
        try {
            await ensureMemoryDirectory();
            const data = await fs.readFile(MEMORY_FILE_PATH, "utf-8");
            const lines = data.split("\n").filter(line => line.trim() !== "");
            return lines.reduce((graph, line) => {
                try {
                    const item = JSON.parse(line);
                    if (item.type === "entity" || item.type === "technology" || item.type === "workExperience") {
                        if (!graph.entities.some(e => e.name === item.name)) {
                            graph.entities.push(item);
                        }
                    }
                    if (item.type === "relation") {
                        if (!graph.relations.some(r => r.from === item.from &&
                            r.to === item.to &&
                            r.relationType === item.relationType)) {
                            graph.relations.push(item);
                        }
                    }
                    return graph;
                } catch (parseError) {
                    console.error('Failed to parse line:', line, parseError);
                    return graph;
                }
            }, { entities: [], relations: [] });
        } catch (error) {
            if (error.code === "ENOENT") {
                return { entities: [], relations: [] };
            }
            console.error('Failed to load graph:', error);
            throw error;
        }
    }

    async saveGraph(graph) {
        try {
            await ensureMemoryDirectory();
            const lines = [
                ...graph.entities.map(e => JSON.stringify(e)),
                ...graph.relations.map(r => JSON.stringify(r)),
            ];
            const tempPath = `${MEMORY_FILE_PATH}.tmp`;
            await fs.writeFile(tempPath, lines.join("\n"));
            await fs.rename(tempPath, MEMORY_FILE_PATH);
        } catch (error) {
            console.error('Failed to save graph:', error);
            throw error;
        }
    }

    async calculateTotalExperience(technology) {
        const graph = await this.loadGraph();
        return graph.relations
            .filter(relation => relation.type === "UsedIn" && relation.from === technology)
            .reduce((total, relation) => total + (relation.metadata.duration || 0), 0);
    }

    async queryTechnologiesUsedBy(companyName) {
        const graph = await this.loadGraph();
        return graph.relations
            .filter(relation => relation.type === "UsedIn" && relation.to === companyName)
            .map(relation => relation.from);
    }

    async createEntities(entities) {
        const graph = await this.loadGraph();
        const newEntities = entities.filter(e => !graph.entities.some(existingEntity => existingEntity.name === e.name));
        graph.entities.push(...newEntities);
        await this.saveGraph(graph);
        return newEntities;
    }

    async createRelations(relations) {
        const graph = await this.loadGraph();
        const newRelations = relations.filter(r => !graph.relations.some(existingRelation => existingRelation.from === r.from &&
            existingRelation.to === r.to &&
            existingRelation.relationType === r.relationType));
        graph.relations.push(...newRelations);
        await this.saveGraph(graph);
        return newRelations;
    }

    async readGraph() {
        return this.loadGraph();
    }

    async addTechnologyRelation(technologyName, companyName, duration, description) {
        const newRelation = new Relation(technologyName, companyName, "UsedIn", { duration, description });
        return this.createRelations([newRelation]);
    }

    async addWorkExperienceRelation(personName, companyName, title, startDate, endDate) {
        const newRelation = new Relation(personName, companyName, "WorkedAt", { title, startDate, endDate });
        return this.createRelations([newRelation]);
    }

    async queryWorkExperience(personName) {
        const graph = await this.loadGraph();
        return graph.relations
            .filter(relation => relation.type === "WorkedAt" && relation.from === personName)
            .map(relation => ({
                companyName: relation.to,
                title: relation.metadata.title,
                startDate: relation.metadata.startDate,
                endDate: relation.metadata.endDate
            }));
    }

    async queryTechnologiesByPerson(personName) {
        const graph = await this.loadGraph();
        return graph.relations
            .filter(relation => relation.type === "WorkedAt" && relation.from === personName)
            .flatMap(relation => graph.relations
                .filter(techRelation => techRelation.type === "UsedIn" && techRelation.to === relation.to)
                .map(techRelation => techRelation.from));
    }
}

const knowledgeGraphManager = new KnowledgeGraphManager();
const server = new Server({
    name: "memory-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "create_entities",
                description: "Create multiple new entities in the knowledge graph",
                inputSchema: {
                    type: "object",
                    properties: {
                        entities: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    entityType: { type: "string" },
                                    observations: { type: "array", items: { type: "string" } },
                                },
                                required: ["name", "entityType", "observations"],
                            },
                        },
                    },
                    required: ["entities"],
                },
            },
            {
                name: "create_relations",
                description: "Create multiple new relations between entities",
                inputSchema: {
                    type: "object",
                    properties: {
                        relations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    from: { type: "string" },
                                    to: { type: "string" },
                                    relationType: { type: "string" },
                                },
                                required: ["from", "to", "relationType"],
                            },
                        },
                    },
                    required: ["relations"],
                },
            },
            {
                name: "calculate_experience",
                description: "Calculate total experience with a specific technology",
                inputSchema: {
                    type: "object",
                    properties: {
                        technology: { type: "string" },
                    },
                    required: ["technology"],
                },
            },
            {
                name: "query_technologies_used_by",
                description: "List all technologies used by a specific company",
                inputSchema: {
                    type: "object",
                    properties: {
                        companyName: { type: "string" },
                    },
                    required: ["companyName"],
                },
            },
            {
                name: "create_work_experience",
                description: "Create a work experience entry",
                inputSchema: {
                    type: "object",
                    properties: {
                        companyName: { type: "string" },
                        title: { type: "string" },
                        startDate: { type: "string" },
                        endDate: { type: "string" },
                        responsibilities: {
                            type: "array",
                            items: { type: "string" },
                        },
                        achievements: {
                            type: "array",
                            items: { type: "string" },
                        },
                        technologiesUsed: {
                            type: "array",
                            items: { type: "string" },
                        },
                    },
                    required: ["companyName", "title", "startDate", "responsibilities"],
                },
            },
            {
                name: "create_technology",
                description: "Create a technology entry",
                inputSchema: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        scope: {
                            type: "array",
                            items: { type: "string" },
                        },
                        experience: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    relation: { type: "string" },
                                    duration: { type: "number" },
                                },
                                required: ["relation", "duration"],
                            },
                        },
                    },
                    required: ["name", "scope", "experience"],
                },
            },
            {
                name: "add_technology_relation",
                description: "Add a relation between a technology and a company",
                inputSchema: {
                    type: "object",
                    properties: {
                        technologyName: { type: "string" },
                        companyName: { type: "string" },
                        duration: { type: "number" },
                        description: { type: "string" },
                    },
                    required: ["technologyName", "companyName", "duration"],
                },
            },
            {
                name: "add_work_experience_relation",
                description: "Add a relation between a person and a company for work experience",
                inputSchema: {
                    type: "object",
                    properties: {
                        personName: { type: "string" },
                        companyName: { type: "string" },
                        title: { type: "string" },
                        startDate: { type: "string" },
                        endDate: { type: "string" },
                    },
                    required: ["personName", "companyName", "title", "startDate"],
                },
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (!args) {
        throw new Error(`No arguments provided for tool: ${name}`);
    }
    switch (name) {
        case "create_entities":
            return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.createEntities(args.entities), null, 2) }] };
        case "create_relations":
            return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.createRelations(args.relations), null, 2) }] };
        case "calculate_experience":
            return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.calculateTotalExperience(args.technology), null, 2) }] };
        case "query_technologies_used_by":
            return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.queryTechnologiesUsedBy(args.companyName), null, 2) }] };
        case "create_work_experience":
            const newWorkExperience = new WorkExperience(
                args.companyName,
                args.title,
                args.startDate,
                args.endDate,
                args.responsibilities,
                args.achievements,
                args.technologiesUsed
            );
            return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.createEntities([newWorkExperience]), null, 2) }] };
        case "create_technology":
            const newTechnology = new Technology(
                args.name,
                args.scope,
                args.experience
            );
            return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.createEntities([newTechnology]), null, 2) }] };
        case "add_technology_relation":
            return {
                content: [{
                    type: "text", text: JSON.stringify(await knowledgeGraphManager.addTechnologyRelation(
                        args.technologyName,
                        args.companyName,
                        args.duration,
                        args.description
                    ), null, 2)
                }]
            };
        case "add_work_experience_relation":
            return {
                content: [{
                    type: "text", text: JSON.stringify(await knowledgeGraphManager.addWorkExperienceRelation(
                        args.personName,
                        args.companyName,
                        args.title,
                        args.startDate,
                        args.endDate
                    ), null, 2)
                }]
            };
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
});

async function main() {
    try {
        await ensureMemoryDirectory();
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error("Knowledge Graph MCP Server running on stdio");
        console.error("Using memory file:", MEMORY_FILE_PATH);
    } catch (error) {
        console.error("Fatal error during startup:", error);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});