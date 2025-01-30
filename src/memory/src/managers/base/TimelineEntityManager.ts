/**
 * @file TimelineEntityManager.ts
 * @description Specialized manager for entities with temporal aspects
 *
 * @baseClassUsage
 * - CRUD operations (create/read/update/delete)
 * - Relation management (createEntityRelation)
 * - Graph operations (loadGraph/saveGraph)
 * - Tool registration
 *
 * @specialization
 * - Temporal querying
 * - Date range filtering
 * - Duration tracking
 * - Timeline operations
 * - Current status tracking
 * - Historical data management
 *
 * @important
 * This manager implements time-based functionality:
 * - Start/end date tracking
 * - Duration calculations
 * - Current status management
 * - Timeline filtering
 * - Historical data queries
 *
 * @inheritance
 * Extends BaseEntityManager to add temporal capabilities:
 * - Used by concrete managers needing time tracking
 * - Often combined with other specialized managers
 * - Provides temporal relation patterns
 *
 * @usage
 * // Get current (active) entities
 * const current = await manager.getCurrentEntities();
 *
 * // Filter by date range
 * const entities = await manager.filterByDateRange(
 *   "2023-01-01",
 *   "2023-12-31"
 * );
 *
 * // Get entities at specific date
 * const active = await manager.getEntitiesAtDate("2023-06-15");
 *
 * // Calculate duration
 * const months = manager.calculateDuration(
 *   "2023-01-01",
 *   "2023-12-31"
 * );
 */

import { z } from 'zod';
import { BaseEntityManager, EntityMapping } from '../BaseEntityManager.js';
import { RelationManager } from '../RelationManager.js';
import { Entity } from '../types.js';

// Base schema for timeline entities
export const TimelineMetadataSchema = z.object({
    startDate: z.string(),
    endDate: z.string().optional(),
    isCurrent: z.boolean().optional(),
    duration: z.number().optional(),
});

export interface TimelineMetadata {
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    duration?: number;
}

export interface TimelineEntity extends Entity {
    metadata: TimelineMetadata;
}

export interface TimelineEntityMapping<T> extends EntityMapping<T> {
    toTimelineEntity(item: T): Omit<TimelineEntity, 'name'> & { name: string };
    fromTimelineEntity(entity: TimelineEntity): T;
}

export abstract class TimelineEntityManager<T> extends BaseEntityManager<T> {
    constructor(
        relationManager: RelationManager,
        entityType: string,
        mapping: TimelineEntityMapping<T>
    ) {
        super(relationManager, entityType, mapping);
    }

    /**
     * Get current entities (where isCurrent is true)
     */
    async getCurrentEntities(): Promise<T[]> {
        const graph = await this.loadGraph();
        return graph.entities
            .filter(e =>
                e.entityType === this.entityType &&
                e.metadata?.isCurrent === true
            )
            .map(e => (this.mapping as TimelineEntityMapping<T>).fromTimelineEntity(e as TimelineEntity));
    }

    /**
     * Filter entities by date range
     */
    async filterByDateRange(startDate: string, endDate: string): Promise<T[]> {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        const graph = await this.loadGraph();
        return graph.entities
            .filter(e => {
                if (e.entityType !== this.entityType) return false;
                if (!e.metadata?.startDate) return false;

                const entityStart = new Date(e.metadata.startDate).getTime();
                const entityEnd = e.metadata.endDate
                    ? new Date(e.metadata.endDate).getTime()
                    : e.metadata.isCurrent
                        ? Date.now()
                        : undefined;

                return entityStart >= start && (!entityEnd || entityEnd <= end);
            })
            .map(e => (this.mapping as TimelineEntityMapping<T>).fromTimelineEntity(e as TimelineEntity));
    }

    /**
     * Get entities overlapping with a specific date
     */
    async getEntitiesAtDate(date: string): Promise<T[]> {
        const targetDate = new Date(date).getTime();

        const graph = await this.loadGraph();
        return graph.entities
            .filter(e => {
                if (e.entityType !== this.entityType) return false;
                if (!e.metadata?.startDate) return false;

                const entityStart = new Date(e.metadata.startDate).getTime();
                const entityEnd = e.metadata.endDate
                    ? new Date(e.metadata.endDate).getTime()
                    : e.metadata.isCurrent
                        ? Date.now()
                        : undefined;

                return entityStart <= targetDate && (!entityEnd || entityEnd >= targetDate);
            })
            .map(e => (this.mapping as TimelineEntityMapping<T>).fromTimelineEntity(e as TimelineEntity));
    }

    /**
     * Calculate duration between dates
     */
    protected calculateDuration(startDate: string, endDate?: string): number {
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date();
        return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)); // Duration in months
    }

    protected override registerTools(): void {
        super.registerTools();

        // Add timeline-specific tools
        this.registry.registerTool({
            name: `get_current_${this.entityType.toLowerCase()}`,
            description: `Get current ${this.entityType} entries`,
            schema: z.object({}),
            handler: () => this.getCurrentEntities()
        });

        this.registry.registerTool({
            name: `filter_${this.entityType.toLowerCase()}_by_date_range`,
            description: `Filter ${this.entityType} entries by date range`,
            schema: z.object({
                startDate: z.string(),
                endDate: z.string()
            }),
            handler: (params) => this.filterByDateRange(params.startDate, params.endDate)
        });

        this.registry.registerTool({
            name: `get_${this.entityType.toLowerCase()}_at_date`,
            description: `Get ${this.entityType} entries active at a specific date`,
            schema: z.object({
                date: z.string()
            }),
            handler: (params) => this.getEntitiesAtDate(params.date)
        });
    }
}
