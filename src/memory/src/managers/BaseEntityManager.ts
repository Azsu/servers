/**
 * @file BaseEntityManager.ts
 * @description Base class for all entity managers providing core CRUD and graph operations
 *
 * @baseClassUsage
 * - CRUD operations (create/read/update/delete)
 * - Relation management (createEntityRelation)
 * - Graph operations (loadGraph/saveGraph)
 * - Tool registration
 *
 * @scope
 * - Manages entities and relations in knowledge graph structure
 * - Provides metadata support in both entities and relations
 * - Handles validation and persistence
 * - Implements core search and filtering capabilities
 *
 * @specialization
 * - Entity type management
 * - Graph persistence
 * - Relation tracking
 * - Tool registration
 * - Search and filtering
 * - Observation management
 *
 * @important
 * This manager serves as the foundation for all specialized managers:
 * - Provides core CRUD operations
 * - Implements graph persistence
 * - Handles tool registration
 * - Manages entity relationships
 * - Supports metadata on both entities and relations
 *
 * @usage
 * // Basic CRUD operations
 * await manager.addEntities([entity]);       // Creating
 * await manager.getEntityById(id);           // Reading
 * await manager.updateEntity(id, entity);    // Updating
 * await manager.deleteEntities([id]);        // Deleting
 *
 * // Graph operations
 * const graph = await manager.loadGraph();   // Load graph
 * await manager.saveGraph(graph);            // Save graph
 *
 * // Relation management
 * await manager.createEntityRelation(*fromId,*toId, *RELATION_TYPES.CUSTOM, *metadata);
 *
 * @instructions
 * DO:
 * - Use createEntityRelation for ALL relation creation (includes metadata support)
 * - Override registerTools for custom operations
 * - Use createCommonRelationships for standard relations
 * DON'T:
 * - Create custom relation storage/handling
 * - Modify core CRUD operations
 * - Change graph structure
 *
 * @refactoring
 * - All specialized managers should use base createEntityRelation
 * - Relation metadata belongs in relations, not separate storage
 * - Use RelationSchema for validation
 * - Common patterns available in createCommonRelationships
 */

import { z } from 'zod';
import { EntityNotFoundError, ValidationError } from './errors.js';
import { RELATION_TYPES, RelationManager } from './RelationManager.js';
import { StorageManager } from './StorageManager.js';
import { ToolRegistry } from './ToolRegistry.js';
import {
    Entity,
    EntitySchema,
    KnowledgeGraph,
    KnowledgeGraphSchema,
    Relation,
    RelationSchema,
    RelationType
} from './types.js';

export interface EntityMapping<T> {
    toEntity(item: T): Omit<Entity, 'name'> & { name: string };
    fromEntity(entity: Entity): T;
    schema: z.ZodObject<any>;
}

/**
 * Base manager class that handles common entity management patterns
 */
export abstract class BaseEntityManager<T> {
    protected registry: ToolRegistry;
    protected storage: StorageManager;

    constructor(
        protected relationManager: RelationManager,
        protected entityType: string,
        protected mapping: EntityMapping<T>
    ) {
        this.registry = ToolRegistry.getInstance();
        this.storage = StorageManager.getInstance();
        this.registerTools();
    }

    /**
     * Loads the graph from storage
     */
    protected async loadGraph(): Promise<KnowledgeGraph> {
        const data = await this.storage.readFile();
        const lines = data.split("\n").filter(line => line.trim() !== "");

        return lines.reduce((graph: KnowledgeGraph, line) => {
            try
            {
                const item = JSON.parse(line);
                if (item.type === "entity")
                {
                    const entity = item as Entity;
                    if (!graph.entities.some(e => e.name === entity.name))
                    {
                        graph.entities.push(entity);
                    }
                }
                if (item.type === "relation")
                {
                    const relation = item;
                    if (!graph.relations.some(r =>
                        r.from === relation.from &&
                        r.to === relation.to &&
                        r.relationType === relation.relationType
                    ))
                    {
                        graph.relations.push(relation);
                    }
                }
                return graph;
            } catch (parseError)
            {
                console.error('Failed to parse line:', line, parseError);
                return graph;
            }
        }, { entities: [], relations: [] });
    }

    /**
     * Saves the graph to storage
     */
    protected async saveGraph(graph: KnowledgeGraph): Promise<void> {
        // Validate the entire graph before saving
        KnowledgeGraphSchema.parse(graph);

        const lines = [
            ...graph.entities.map(e => JSON.stringify({ type: "entity", ...e })),
            ...graph.relations.map(r => JSON.stringify({ type: "relation", ...r })),
        ];

        await this.storage.writeFile(lines.join("\n"));
    }

    /**
     * Register the basic CRUD tools for this entity type
     */
    protected registerTools(): void {
        // Add entity
        this.registry.registerTool({
            name: `add_${this.entityType.toLowerCase()}`,
            description: `Add a new ${this.entityType}`,
            schema: this.mapping.schema,
            handler: (params: T) => this.addEntities([params])
        });

        // Search entities
        this.registry.registerTool({
            name: `search_${this.entityType.toLowerCase()}`,
            description: `Search for ${this.entityType} entries`,
            schema: z.object({
                query: z.string()
            }),
            handler: (params) => this.searchEntities(params.query)
        });

        // Get entity by ID
        this.registry.registerTool({
            name: `get_${this.entityType.toLowerCase()}`,
            description: `Get a ${this.entityType} by ID`,
            schema: z.object({
                id: z.string()
            }),
            handler: (params) => this.getEntityById(params.id)
        });

        // Update entity
        this.registry.registerTool({
            name: `update_${this.entityType.toLowerCase()}`,
            description: `Update an existing ${this.entityType}`,
            schema: z.object({
                id: z.string(),
                data: this.mapping.schema
            }),
            handler: (params) => this.updateEntity(params.id, params.data)
        });

        // Delete entity
        this.registry.registerTool({
            name: `delete_${this.entityType.toLowerCase()}`,
            description: `Delete a ${this.entityType}`,
            schema: z.object({
                id: z.string()
            }),
            handler: (params) => this.deleteEntities([params.id])
        });

        // Filter by date range if entity has dates
        this.registry.registerTool({
            name: `filter_${this.entityType.toLowerCase()}_by_date`,
            description: `Filter ${this.entityType} entries by date range`,
            schema: z.object({
                startDate: z.string(),
                endDate: z.string()
            }),
            handler: (params) => this.filterByDateRange(params.startDate, params.endDate)
        });
    }

    /**
     * Add entities to the graph
     */
    public async addEntities(items: T[]): Promise<T[]> {
        const entities = items.map(item => this.mapping.toEntity(item));
        await this.createEntities(entities);
        return items;
    }

    /**
     * Delete entities from the graph
     */
    public async deleteEntities(ids: string[]): Promise<void> {
        await this.deleteEntities(ids);
    }

    /**
     * Update an entity in the graph
     */
    public async updateEntity(id: string, item: T): Promise<void> {
        // First delete the old entity
        await this.deleteEntities([id]);
        // Then add the updated one
        await this.addEntities([item]);
    }

    /**
     * Get an entity by ID
     */
    public async getEntityById(id: string): Promise<T | undefined> {
        const graph = await this.loadGraph();
        const entity = graph.entities.find(e =>
            e.entityType === this.entityType &&
            this.generateId(e.name) === id
        );

        if (!entity) return undefined;
        return this.mapping.fromEntity(entity);
    }

    /**
     * Search for entities
     */
    public async searchEntities(query: string): Promise<T[]> {
        const searchTerms = query.toLowerCase().split(' ');
        const graph = await this.loadGraph();

        return graph.entities
            .filter(e =>
                e.entityType === this.entityType &&
                this.matchesSearchTerms(e, searchTerms)
            )
            .map(e => this.mapping.fromEntity(e));
    }

    /**
     * Create a relationship between entities
     */
    public async createEntityRelation(
        fromId: string,
        toId: string,
        type: RelationType,
        metadata?: Relation['metadata']
    ): Promise<void> {
        const relation: Relation = {
            from: fromId,
            to: toId,
            relationType: type,
            ...(metadata && { metadata })
        };
        await this.createRelations([relation]);
    }

    /**
     * Create common relationships for an entity
     */
    protected async createCommonRelationships(
        entityId: string,
        impact?: string,
        type?: string,
        skills?: string[]
    ): Promise<void> {
        if (impact)
        {
            await this.createEntityRelation(entityId, impact, RELATION_TYPES.HAS_IMPACT);
        }
        if (type)
        {
            await this.createEntityRelation(entityId, type, RELATION_TYPES.HAS_TYPE);
        }
        if (skills?.length)
        {
            for (const skill of skills)
            {
                await this.createEntityRelation(entityId, skill, RELATION_TYPES.SKILL_USAGE);
            }
        }
    }

    /**
     * Create an entity of a specific type with basic metadata
     */
    protected async createEntityOfType(
        name: string,
        description: string = "",
        metadata: Record<string, any> = {}
    ): Promise<Entity> {
        const entity: Entity = {
            name,
            entityType: this.entityType,
            observations: [description],
            metadata: {
                description,
                ...metadata
            }
        };

        const [createdEntity] = await this.createEntities([entity]);
        return createdEntity;
    }

    /**
     * Search for entities by type with optional field matching
     */
    protected async searchEntitiesByType<K extends keyof Entity['metadata']>(
        query: string,
        fields?: Record<K, Entity['metadata'][K]>
    ): Promise<Entity[]> {
        const graph = await this.loadGraph();
        const searchTerms = query.toLowerCase().split(' ');

        return graph.entities.filter(e => {
            if (e.entityType !== this.entityType) return false;
            if (!this.matchesSearchTerms(e, searchTerms)) return false;
            if (fields && e.metadata)
            {
                return (Object.keys(fields) as K[]).every(key =>
                    e.metadata && e.metadata[key] === fields[key]
                );
            }
            return true;
        });
    }

    /**
     * Filter entities by date range using metadata
     */
    protected async filterByDateRange(startDate: string, endDate: string): Promise<T[]> {
        const graph = await this.loadGraph();
        const startTimestamp = new Date(startDate).getTime();
        const endTimestamp = new Date(endDate).getTime();

        return graph.entities
            .filter(e => {
                if (e.entityType !== this.entityType) return false;
                if (!e.metadata?.startDate) return false;

                const entityDate = new Date(e.metadata.startDate).getTime();
                return entityDate >= startTimestamp && entityDate <= endTimestamp;
            })
            .map(e => this.mapping.fromEntity(e));
    }

    /**
     * Filter entities by a field value
     */
    protected async filterByField<K extends keyof Entity['metadata']>(
        fieldName: K,
        value: Entity['metadata'][K]
    ): Promise<T[]> {
        const graph = await this.loadGraph();
        return graph.entities
            .filter(e => {
                if (e.entityType !== this.entityType) return false;
                if (!e.metadata?.[fieldName]) return false;
                return e.metadata[fieldName] === value;
            })
            .map(e => this.mapping.fromEntity(e));
    }

    /**
     * Check if an entity matches search terms
     */
    public matchesSearchTerms(entity: Entity, searchTerms: string[]): boolean {
        const searchableText = [
            entity.name,
            ...entity.observations,
            entity.metadata?.description || ''
        ].join(' ').toLowerCase();

        return searchTerms.every(term => searchableText.includes(term));
    }

    /**
     * Generate an ID from a title/name
     */
    protected generateId(title: string): string {
        return title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    /**
     * Parse JSON safely from an observation
     */
    protected parseObservation<R>(entity: Entity, index: number, defaultValue: R): R {
        try
        {
            const data = JSON.parse(entity.observations[index] || '{}');
            return { ...defaultValue, ...data };
        } catch (error)
        {
            throw new ValidationError(`Failed to parse data for ${entity.name}`);
        }
    }

    /**
     * Create standard metadata for an entity
     */
    protected createMetadata(
        description: string,
        startDate?: string,
        endDate?: string,
        additionalFields: Record<string, any> = {}
    ): Entity['metadata'] {
        return {
            description,
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
            ...additionalFields
        };
    }

    /**
     * Add observations to entities
     */
    public async addObservations(
        observations: { entityName: string; contents: string[] }[]
    ): Promise<{ entityName: string; addedObservations: string[] }[]> {
        const graph = await this.loadGraph();
        const results = observations.map(o => {
            const entity = graph.entities.find(e => e.name === o.entityName);
            if (!entity)
            {
                throw new ValidationError(`Entity not found: ${o.entityName}`);
            }
            const newObservations = o.contents.filter(content => !entity.observations.includes(content));
            entity.observations.push(...newObservations);
            return { entityName: o.entityName, addedObservations: newObservations };
        });
        await this.saveGraph(graph);
        return results;
    }

    /**
     * Delete observations from entities
     */
    public async deleteObservations(
        deletions: { entityName: string; observations: string[] }[]
    ): Promise<void> {
        const graph = await this.loadGraph();
        deletions.forEach(d => {
            const entity = graph.entities.find(e => e.name === d.entityName);
            if (entity)
            {
                entity.observations = entity.observations.filter(o => !d.observations.includes(o));
            }
        });
        await this.saveGraph(graph);
    }

    /**
     * Creates multiple new entities
     * @param entities Array of entities to create
     * @returns Promise<Entity[]> The newly created entities
     * @throws {ValidationError} If entity validation fails
     */
    protected async createEntities(entities: Entity[]): Promise<Entity[]> {
        const graph = await this.loadGraph();
        const newEntities = entities.filter(e =>
            !graph.entities.some(existingEntity => existingEntity.name === e.name)
        );

        // Validate all new entities
        for (const entity of newEntities)
        {
            try
            {
                EntitySchema.parse(entity);
            } catch (error)
            {
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
    protected async createRelations(relations: Relation[]): Promise<Relation[]> {
        const graph = await this.loadGraph();

        // Validate each relation
        for (const relation of relations)
        {
            try
            {
                RelationSchema.parse(relation);
            } catch (error)
            {
                throw new ValidationError(`Invalid relation: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }

            // Verify referenced entities exist
            if (!graph.entities.some(e => e.name === relation.from))
            {
                throw new EntityNotFoundError(relation.from);
            }
            if (!graph.entities.some(e => e.name === relation.to))
            {
                throw new EntityNotFoundError(relation.to);
            }
        }

        const newRelations = relations.filter(r =>
            !graph.relations.some(existingRelation =>
                existingRelation.from === r.from &&
                existingRelation.to === r.to &&
                existingRelation.relationType === r.relationType
            )
        );

        graph.relations.push(...newRelations);
        await this.saveGraph(graph);
        return newRelations;
    }
}