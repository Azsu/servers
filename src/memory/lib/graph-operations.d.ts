import { Entity, KnowledgeGraph, Relation } from './types.js';
/**
 * Manages core graph operations including loading, saving, and basic CRUD operations.
 */
export declare class GraphOperations {
    /**
     * Ensures the memory directory exists
     * @throws {GraphError} If directory creation fails
     */
    private ensureMemoryDirectory;
    /**
     * Loads the graph from storage
     * @returns Promise<KnowledgeGraph> The loaded graph data
     * @throws {GraphError} If loading or parsing fails
     */
    protected loadGraph(): Promise<KnowledgeGraph>;
    /**
     * Saves the graph to storage
     * @param graph The graph to save
     * @throws {GraphError} If saving fails
     */
    protected saveGraph(graph: KnowledgeGraph): Promise<void>;
    /**
     * Creates multiple new entities
     * @param entities Array of entities to create
     * @returns Promise<Entity[]> The newly created entities
     * @throws {ValidationError} If entity validation fails
     */
    createEntities(entities: Entity[]): Promise<Entity[]>;
    /**
     * Creates multiple new relations
     * @param relations Array of relations to create
     * @returns Promise<Relation[]> The newly created relations
     * @throws {ValidationError} If relation validation fails
     * @throws {EntityNotFoundError} If referenced entities don't exist
     */
    createRelations(relations: Relation[]): Promise<Relation[]>;
    /**
     * Adds observations to entities
     * @param observations Observations to add
     * @returns Promise<Array<{entityName: string; addedObservations: string[]}>>
     * @throws {EntityNotFoundError} If an entity is not found
     */
    addObservations(observations: {
        entityName: string;
        contents: string[];
    }[]): Promise<{
        entityName: string;
        addedObservations: string[];
    }[]>;
    /**
     * Deletes observations from entities
     * @param deletions Observations to delete
     */
    deleteObservations(deletions: {
        entityName: string;
        observations: string[];
    }[]): Promise<void>;
    /**
     * Deletes multiple entities and their relations
     * @param entityNames Names of entities to delete
     */
    deleteEntities(entityNames: string[]): Promise<void>;
    /**
     * Deletes multiple relations
     * @param relations Relations to delete
     */
    deleteRelations(relations: Relation[]): Promise<void>;
    /**
     * Reads the entire graph
     * @returns Promise<KnowledgeGraph> The complete graph
     */
    readGraph(): Promise<KnowledgeGraph>;
    /**
     * Searches for nodes in the graph based on a query
     * @param query Search query string
     * @returns Promise<KnowledgeGraph> Filtered graph containing matching nodes
     */
    searchNodes(query: string): Promise<KnowledgeGraph>;
    /**
     * Opens specific nodes by their names
     * @param names Array of entity names to retrieve
     * @returns Promise<KnowledgeGraph> Graph containing only the specified nodes
     */
    openNodes(names: string[]): Promise<KnowledgeGraph>;
}
