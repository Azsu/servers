import { promises as fs } from 'fs';
import path from 'path';
import { CONFIG, getMemoryPath } from './config.js';
import { EntityNotFoundError, EntitySchema, GraphError, KnowledgeGraphSchema, RelationSchema, ValidationError } from './types.js';
const MEMORY_FILE_PATH = getMemoryPath();
/**
 * Manages core graph operations including loading, saving, and basic CRUD operations.
 */
export class GraphOperations {
    /**
     * Ensures the memory directory exists
     * @throws {GraphError} If directory creation fails
     */
    async ensureMemoryDirectory() {
        const dir = path.dirname(MEMORY_FILE_PATH);
        try {
            await fs.mkdir(dir, { recursive: true });
        }
        catch (error) {
            if (error instanceof Error) {
                throw new GraphError(`Failed to create memory directory: ${error.message}`);
            }
            throw error;
        }
    }
    /**
     * Loads the graph from storage
     * @returns Promise<KnowledgeGraph> The loaded graph data
     * @throws {GraphError} If loading or parsing fails
     */
    async loadGraph() {
        try {
            await this.ensureMemoryDirectory();
            const data = await fs.readFile(MEMORY_FILE_PATH, "utf-8");
            const lines = data.split("\n").filter(line => line.trim() !== "");
            return lines.reduce((graph, line) => {
                try {
                    const item = JSON.parse(line);
                    // Validate the item based on its type
                    if (item.type === "entity") {
                        const entity = EntitySchema.parse(item);
                        if (!graph.entities.some(e => e.name === entity.name)) {
                            graph.entities.push(entity);
                        }
                    }
                    if (item.type === "relation") {
                        const relation = RelationSchema.parse(item);
                        if (!graph.relations.some(r => r.from === relation.from &&
                            r.to === relation.to &&
                            r.relationType === relation.relationType)) {
                            graph.relations.push(relation);
                        }
                    }
                    return graph;
                }
                catch (parseError) {
                    console.error('Failed to parse line:', line, parseError);
                    return graph;
                }
            }, { entities: [], relations: [] });
        }
        catch (error) {
            if (error instanceof Error && 'code' in error && error.code === "ENOENT") {
                return { entities: [], relations: [] };
            }
            if (error instanceof Error) {
                throw new GraphError(`Failed to load graph: ${error.message}`);
            }
            throw error;
        }
    }
    /**
     * Saves the graph to storage
     * @param graph The graph to save
     * @throws {GraphError} If saving fails
     */
    async saveGraph(graph) {
        try {
            // Validate the entire graph before saving
            KnowledgeGraphSchema.parse(graph);
            await this.ensureMemoryDirectory();
            const lines = [
                ...graph.entities.map(e => JSON.stringify({ type: "entity", ...e })),
                ...graph.relations.map(r => JSON.stringify({ type: "relation", ...r })),
            ];
            // Write to temporary file first
            const tempPath = `${MEMORY_FILE_PATH}${CONFIG.MEMORY.TEMP_SUFFIX}`;
            await fs.writeFile(tempPath, lines.join("\n"));
            // Add cleanup in case of failure
            try {
                await fs.rename(tempPath, MEMORY_FILE_PATH);
            }
            catch (error) {
                await fs.unlink(tempPath).catch(() => { }); // Clean up temp file
                throw error;
            }
        }
        catch (error) {
            if (error instanceof Error) {
                throw new GraphError(`Failed to save graph: ${error.message}`);
            }
            throw error;
        }
    }
    /**
     * Creates multiple new entities
     * @param entities Array of entities to create
     * @returns Promise<Entity[]> The newly created entities
     * @throws {ValidationError} If entity validation fails
     */
    async createEntities(entities) {
        const graph = await this.loadGraph();
        const newEntities = entities.filter(e => !graph.entities.some(existingEntity => existingEntity.name === e.name));
        // Validate all new entities
        for (const entity of newEntities) {
            try {
                EntitySchema.parse(entity);
            }
            catch (error) {
                throw new ValidationError(`Invalid entity: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        graph.entities.push(...newEntities);
        await this.saveGraph(graph);
        return newEntities;
    }
    /**
     * Creates multiple new relations
     * @param relations Array of relations to create
     * @returns Promise<Relation[]> The newly created relations
     * @throws {ValidationError} If relation validation fails
     * @throws {EntityNotFoundError} If referenced entities don't exist
     */
    async createRelations(relations) {
        const graph = await this.loadGraph();
        // Validate each relation
        for (const relation of relations) {
            try {
                RelationSchema.parse(relation);
            }
            catch (error) {
                throw new ValidationError(`Invalid relation: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
            // Verify referenced entities exist
            if (!graph.entities.some(e => e.name === relation.from)) {
                throw new EntityNotFoundError(relation.from);
            }
            if (!graph.entities.some(e => e.name === relation.to)) {
                throw new EntityNotFoundError(relation.to);
            }
        }
        const newRelations = relations.filter(r => !graph.relations.some(existingRelation => existingRelation.from === r.from &&
            existingRelation.to === r.to &&
            existingRelation.relationType === r.relationType));
        graph.relations.push(...newRelations);
        await this.saveGraph(graph);
        return newRelations;
    }
    /**
     * Adds observations to entities
     * @param observations Observations to add
     * @returns Promise<Array<{entityName: string; addedObservations: string[]}>>
     * @throws {EntityNotFoundError} If an entity is not found
     */
    async addObservations(observations) {
        const graph = await this.loadGraph();
        const results = observations.map(o => {
            const entity = graph.entities.find(e => e.name === o.entityName);
            if (!entity) {
                throw new EntityNotFoundError(o.entityName);
            }
            const newObservations = o.contents.filter(content => !entity.observations.includes(content));
            entity.observations.push(...newObservations);
            return { entityName: o.entityName, addedObservations: newObservations };
        });
        await this.saveGraph(graph);
        return results;
    }
    /**
     * Deletes observations from entities
     * @param deletions Observations to delete
     */
    async deleteObservations(deletions) {
        const graph = await this.loadGraph();
        deletions.forEach(d => {
            const entity = graph.entities.find(e => e.name === d.entityName);
            if (entity) {
                entity.observations = entity.observations.filter(o => !d.observations.includes(o));
            }
        });
        await this.saveGraph(graph);
    }
    /**
     * Deletes multiple entities and their relations
     * @param entityNames Names of entities to delete
     */
    async deleteEntities(entityNames) {
        const graph = await this.loadGraph();
        graph.entities = graph.entities.filter(e => !entityNames.includes(e.name));
        graph.relations = graph.relations.filter(r => !entityNames.includes(r.from) && !entityNames.includes(r.to));
        await this.saveGraph(graph);
    }
    /**
     * Deletes multiple relations
     * @param relations Relations to delete
     */
    async deleteRelations(relations) {
        const graph = await this.loadGraph();
        graph.relations = graph.relations.filter(r => !relations.some(delRelation => r.from === delRelation.from &&
            r.to === delRelation.to &&
            r.relationType === delRelation.relationType));
        await this.saveGraph(graph);
    }
    /**
     * Reads the entire graph
     * @returns Promise<KnowledgeGraph> The complete graph
     */
    async readGraph() {
        return this.loadGraph();
    }
    /**
     * Searches for nodes in the graph based on a query
     * @param query Search query string
     * @returns Promise<KnowledgeGraph> Filtered graph containing matching nodes
     */
    async searchNodes(query) {
        const graph = await this.loadGraph();
        const lowerQuery = query.toLowerCase();
        const filteredEntities = graph.entities.filter(e => e.name.toLowerCase().includes(lowerQuery) ||
            e.entityType.toLowerCase().includes(lowerQuery) ||
            e.observations.some(o => o.toLowerCase().includes(lowerQuery)));
        const filteredEntityNames = new Set(filteredEntities.map(e => e.name));
        const filteredRelations = graph.relations.filter(r => filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to));
        return {
            entities: filteredEntities,
            relations: filteredRelations,
        };
    }
    /**
     * Opens specific nodes by their names
     * @param names Array of entity names to retrieve
     * @returns Promise<KnowledgeGraph> Graph containing only the specified nodes
     */
    async openNodes(names) {
        const graph = await this.loadGraph();
        const filteredEntities = graph.entities.filter(e => names.includes(e.name));
        const filteredEntityNames = new Set(filteredEntities.map(e => e.name));
        const filteredRelations = graph.relations.filter(r => filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to));
        return {
            entities: filteredEntities,
            relations: filteredRelations,
        };
    }
}
