/**
 * @file LocationBasedEntityManager.ts
 * @description Specialized manager for entities with location attributes
 *
 * @baseClassUsage
 * - CRUD operations (create/read/update/delete)
 * - Relation management (createEntityRelation)
 * - Graph operations (loadGraph/saveGraph)
 * - Tool registration
 *
 * @specialization
 * - Location filtering
 * - Geographic queries
 * - Location type management
 * - Hierarchical location support
 * - Region/country/city tracking
 * - Remote/hybrid/onsite classification
 *
 * @important
 * This manager implements location-based functionality:
 * - Location relationship tracking
 * - Location type classification
 * - Geographic hierarchy support
 * - Location-based filtering
 * - Location metadata management
 *
 * @inheritance
 * Extends BaseEntityManager to add location capabilities:
 * - Used by concrete managers needing location
 * - Often combined with other specialized managers
 * - Provides location relation patterns
 *
 * @usage
 * // Add location to entity
 * await manager.setLocation(entityId, location, {
 *   locationType: "Remote",
 *   region: "North America",
 *   country: "USA",
 *   city: "San Francisco"
 * });
 *
 * // Get location information
 * const location = await manager.getLocation(entityId);
 *
 * // Filter by location attributes
 * const entities = await manager.filterByLocation({
 *   locationType: "Remote",
 *   country: "USA"
 * });
 *
 * // Get entities by location type
 * const remoteEntities = await manager.getEntitiesByLocationType("Remote");
 */

import { z } from 'zod';
import { BaseEntityManager, EntityMapping } from '../BaseEntityManager.js';
import { RELATION_TYPES, RelationManager } from '../RelationManager.js';
import { Entity } from '../types.js';

export interface LocationMetadata {
    locationType: string;  // e.g., "Remote", "On-site", "Hybrid"
    region?: string;
    country?: string;
    city?: string;
}

export interface LocationBasedEntity extends Entity {
    metadata: {
        location: string;
        locationType: string;
    } & Record<string, unknown>;
}

export interface LocationBasedEntityMapping<T> extends EntityMapping<T> {
    toLocationBasedEntity(item: T): Omit<LocationBasedEntity, 'name'> & { name: string };
    fromLocationBasedEntity(entity: LocationBasedEntity): T;
}

export abstract class LocationBasedEntityManager<T> extends BaseEntityManager<T> {
    constructor(
        relationManager: RelationManager,
        entityType: string,
        mapping: LocationBasedEntityMapping<T>
    ) {
        super(relationManager, entityType, mapping);
    }

    /**
     * Add location information to an entity
     */
    async setLocation(entityId: string, location: string, metadata: LocationMetadata): Promise<void> {
        await this.createEntityRelation(
            entityId,
            location,
            RELATION_TYPES.LOCATED_AT,
            metadata
        );
    }

    /**
     * Get location information for an entity
     */
    async getLocation(entityId: string): Promise<{ location: string; metadata: LocationMetadata } | undefined> {
        const graph = await this.loadGraph();
        const locationRelation = graph.relations.find(r =>
            r.from === entityId &&
            r.relationType === RELATION_TYPES.LOCATED_AT
        );

        if (!locationRelation) return undefined;

        return {
            location: locationRelation.to,
            metadata: locationRelation.metadata as LocationMetadata
        };
    }

    /**
     * Filter entities by location
     */
    async filterByLocation(options: {
        location?: string;
        locationType?: string;
        region?: string;
        country?: string;
        city?: string;
    }): Promise<T[]> {
        const graph = await this.loadGraph();
        const locationRelations = graph.relations.filter(r =>
            r.relationType === RELATION_TYPES.LOCATED_AT &&
            (!options.location || r.to === options.location)
        );

        const filteredEntities = graph.entities.filter(e => {
            if (e.entityType !== this.entityType) return false;

            const locationRelation = locationRelations.find(r => r.from === e.name);
            if (!locationRelation) return false;

            const metadata = locationRelation.metadata as LocationMetadata;
            return (
                (!options.locationType || metadata.locationType === options.locationType) &&
                (!options.region || metadata.region === options.region) &&
                (!options.country || metadata.country === options.country) &&
                (!options.city || metadata.city === options.city)
            );
        });

        return filteredEntities.map(e =>
            (this.mapping as LocationBasedEntityMapping<T>).fromLocationBasedEntity(e as LocationBasedEntity)
        );
    }

    /**
     * Get all entities in a specific location type
     */
    async getEntitiesByLocationType(locationType: string): Promise<T[]> {
        return this.filterByLocation({ locationType });
    }

    protected override registerTools(): void {
        super.registerTools();

        // Add location-specific tools
        this.registry.registerTool({
            name: `set_${this.entityType.toLowerCase()}_location`,
            description: `Set location for a ${this.entityType}`,
            schema: z.object({
                entityId: z.string(),
                location: z.string(),
                locationType: z.string(),
                region: z.string().optional(),
                country: z.string().optional(),
                city: z.string().optional()
            }),
            handler: (params) => this.setLocation(params.entityId, params.location, {
                locationType: params.locationType,
                region: params.region,
                country: params.country,
                city: params.city
            })
        });

        this.registry.registerTool({
            name: `get_${this.entityType.toLowerCase()}_location`,
            description: `Get location for a ${this.entityType}`,
            schema: z.object({
                entityId: z.string()
            }),
            handler: (params) => this.getLocation(params.entityId)
        });

        this.registry.registerTool({
            name: `filter_${this.entityType.toLowerCase()}_by_location`,
            description: `Filter ${this.entityType} entries by location`,
            schema: z.object({
                location: z.string().optional(),
                locationType: z.string().optional(),
                region: z.string().optional(),
                country: z.string().optional(),
                city: z.string().optional()
            }),
            handler: (params) => this.filterByLocation(params)
        });

        this.registry.registerTool({
            name: `get_${this.entityType.toLowerCase()}_by_location_type`,
            description: `Get ${this.entityType} entries by location type`,
            schema: z.object({
                locationType: z.string()
            }),
            handler: (params) => this.getEntitiesByLocationType(params.locationType)
        });
    }
}
