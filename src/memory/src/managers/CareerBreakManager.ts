/**
 * @file CareerBreakManager.ts
 * @description Manager for career break entities
 *
 * @baseClassUsage
 * - CRUD operations (create/read/update/delete)
 * - Relation management (createEntityRelation)
 * - Graph operations (loadGraph/saveGraph)
 * - Tool registration
 *
 * @specialization
 * - Break period tracking
 * - Break type categorization
 * - Activity documentation
 * - Return planning
 * - Location tracking
 * - Media documentation
 * - Profile headline management
 *
 * @important
 * This manager extends BaseEntityManager directly, using its relation system to implement:
 * - Temporal aspects (from TimelineEntityManager patterns)
 * - Location aspects (from LocationBasedEntityManager patterns)
 * - Break type classification
 * - Activity documentation
 * - Return to work planning
 *
 * @inheritance
 * Extends BaseEntityManager directly because:
 * - Multiple inheritance isn't available/desirable
 * - Need flexible combination of multiple aspects
 * - Base relation system already supports all needed features
 * - Specialized managers serve as implementation patterns
 *
 * @usage
 * // Create new career break
 * await manager.addCareerBreak({
 *   type: "Sabbatical",
 *   startDate: "2023-01-01",
 *   endDate: "2023-12-31",
 *   isCurrent: false,
 *   location: "Remote",
 *   description: "Personal development sabbatical",
 *   profileHeadline: "Exploring new technologies"
 * });
 *
 * // Update career break details
 * await manager.updateCareerBreak(id, updatedBreak);
 *
 * // Search and filter
 * const results = await manager.filterCareerBreaks({
 *   type: "Sabbatical",
 *   currentOnly: true,
 *   dateRange: {
 *     startDate: "2023-01-01",
 *     endDate: "2023-12-31"
 *   }
 * });
 *
 * // Get current breaks
 * const currentBreaks = await manager.getCurrentBreaks();
 */

import { z } from 'zod';
import { BaseEntityManager, EntityMapping } from './BaseEntityManager.js';
import { RELATION_TYPES, RelationManager } from './RelationManager.js';
import { Entity } from './types.js';

// Define the schema
const CareerBreakSchema = z.object({
    type: z.string(),
    location: z.string().optional(),
    isCurrent: z.boolean(),
    startDate: z.string(),
    endDate: z.string().optional(),
    description: z.string().optional(),
    profileHeadline: z.string().optional(),
    media: z.array(z.string()).optional()
});

// Define the mapping
const CareerBreakMapping: EntityMapping<z.infer<typeof CareerBreakSchema>> = {
    schema: CareerBreakSchema,
    toEntity: (careerBreak) => ({
        name: careerBreak.type,
        entityType: "CareerBreak",
        observations: [
            careerBreak.description || "",
            careerBreak.profileHeadline || "",
            careerBreak.location || "",
            ...(careerBreak.media || [])
        ],
        metadata: {
            startDate: careerBreak.startDate,
            endDate: careerBreak.endDate,
            description: careerBreak.description,
            location: careerBreak.location
        }
    }),
    fromEntity: (entity: Entity) => ({
        type: entity.name,
        description: entity.observations[0] || undefined,
        profileHeadline: entity.observations[1] || undefined,
        location: entity.observations[2] || undefined,
        media: entity.observations.slice(3) || [],
        isCurrent: !entity.metadata?.endDate,
        startDate: entity.metadata?.startDate || '',
        endDate: entity.metadata?.endDate
    })
};

export class CareerBreakManager extends BaseEntityManager<z.infer<typeof CareerBreakSchema>> {
    constructor(relationManager: RelationManager) {
        super(relationManager, "CareerBreak", CareerBreakMapping);
    }

    protected override registerTools(): void {
        super.registerTools();

        // Register specialized tools
        this.registry.registerTool({
            name: 'get_current_breaks',
            description: 'Get current career breaks',
            schema: z.object({}),
            handler: async () => {
                const results = await this.searchEntities('');
                return results.filter(r => r.isCurrent);
            }
        });

        this.registry.registerTool({
            name: 'filter_by_type',
            description: 'Filter career breaks by type',
            schema: z.object({
                type: z.string()
            }),
            handler: async (params) => {
                const results = await this.searchEntities('');
                return results.filter(r => r.type.toLowerCase() === params.type.toLowerCase());
            }
        });
    }

    async addEntities(items: z.infer<typeof CareerBreakSchema>[]): Promise<z.infer<typeof CareerBreakSchema>[]> {
        const result = await super.addEntities(items);

        // Create relationships for each career break
        for (const careerBreak of items)
        {
            const id = this.generateId(careerBreak.type);
            await this.createCommonRelationships(id, undefined, careerBreak.type);
            if (careerBreak.location)
            {
                await this.createEntityRelation(id, careerBreak.location, RELATION_TYPES.LOCATED_AT);
            }
        }

        return result;
    }

    async addCareerBreak(careerBreak: z.infer<typeof CareerBreakSchema>): Promise<void> {
        await this.addEntities([careerBreak]);
    }

    async updateCareerBreak(id: string, careerBreak: z.infer<typeof CareerBreakSchema>): Promise<void> {
        await this.updateEntity(id, careerBreak);
    }

    async deleteCareerBreak(id: string): Promise<void> {
        await this.deleteEntities([id]);
    }

    async getCareerBreakById(id: string): Promise<z.infer<typeof CareerBreakSchema> | undefined> {
        return this.getEntityById(id);
    }

    async searchCareerBreaks(query: string): Promise<z.infer<typeof CareerBreakSchema>[]> {
        return this.searchEntities(query);
    }

    async filterCareerBreaks(options: {
        dateRange?: { startDate: string; endDate: string };
        type?: string;
        currentOnly?: boolean;
    }): Promise<z.infer<typeof CareerBreakSchema>[]> {
        let results = await this.searchEntities('');

        if (options.dateRange)
        {
            results = await this.filterByDateRange(options.dateRange.startDate, options.dateRange.endDate);
        }

        if (options.type)
        {
            results = results.filter(r => r.type.toLowerCase() === options.type?.toLowerCase());
        }

        if (options.currentOnly)
        {
            results = results.filter(r => r.isCurrent);
        }

        return results;
    }

    protected generateId(type: string): string {
        return type.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
}