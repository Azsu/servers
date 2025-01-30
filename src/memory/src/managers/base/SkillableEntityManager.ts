/**
 * @file SkillableEntityManager.ts
 * @description Specialized manager for entities with skill associations
 *
 * @baseClassUsage
 * - CRUD operations (create/read/update/delete)
 * - Relation management (createEntityRelation)
 * - Graph operations (loadGraph/saveGraph)
 * - Tool registration
 *
 * @specialization
 * - Skill proficiency querying
 * - Skill-based filtering
 * - Skill relationship management
 * - Skill endorsement tracking
 * - Skill level classification
 * - Skill context tracking
 *
 * @important
 * This manager implements skill-based functionality:
 * - Skill relationship tracking
 * - Proficiency level management
 * - Skill context handling
 * - Skill-based filtering
 * - Multiple skill support
 *
 * @inheritance
 * Extends BaseEntityManager to add skill capabilities:
 * - Used by concrete managers needing skill tracking
 * - Often combined with other specialized managers
 * - Provides skill relation patterns
 *
 * @usage
 * // Add skills to entity
 * await manager.addSkills(entityId, ["TypeScript", "React"], {
 *   level: "ADVANCED",
 *   context: "Professional"
 * });
 *
 * // Remove skills
 * await manager.removeSkills(entityId, ["React"]);
 *
 * // Get entity skills
 * const skills = await manager.getSkills(entityId);
 *
 * // Filter by skills
 * const entities = await manager.filterBySkills(
 *   ["TypeScript", "React"],
 *   true  // Match all skills
 * );
 */

import { z } from 'zod';
import { BaseEntityManager, EntityMapping } from '../BaseEntityManager.js';
import { RELATION_TYPES, RelationManager } from '../RelationManager.js';
import { Entity, SkillLevel } from '../types.js';

export interface SkillMetadata {
    level?: SkillLevel;
    context?: string;
    relevance?: string;
}

export interface SkillableEntity extends Entity {
    metadata: {
        skills?: string[];
    } & Record<string, unknown>;
}

export interface SkillableEntityMapping<T> extends EntityMapping<T> {
    toSkillableEntity(item: T): Omit<SkillableEntity, 'name'> & { name: string };
    fromSkillableEntity(entity: SkillableEntity): T;
}

export abstract class SkillableEntityManager<T> extends BaseEntityManager<T> {
    constructor(
        relationManager: RelationManager,
        entityType: string,
        mapping: SkillableEntityMapping<T>
    ) {
        super(relationManager, entityType, mapping);
    }

    /**
     * Add skills to an entity
     */
    async addSkills(entityId: string, skills: string[], metadata?: SkillMetadata): Promise<void> {
        for (const skill of skills)
        {
            await this.createEntityRelation(
                entityId,
                skill,
                RELATION_TYPES.SKILL_USAGE,
                metadata
            );
        }
    }

    /**
     * Remove skills from an entity
     */
    async removeSkills(entityId: string, skills: string[]): Promise<void> {
        const graph = await this.loadGraph();
        const skillRelations = graph.relations.filter(r =>
            r.from === entityId &&
            r.relationType === RELATION_TYPES.SKILL_USAGE &&
            skills.includes(r.to)
        );

        // Remove the relations
        graph.relations = graph.relations.filter(r => !skillRelations.includes(r));
        await this.saveGraph(graph);
    }

    /**
     * Get all skills for an entity
     */
    async getSkills(entityId: string): Promise<{ skill: string; metadata?: SkillMetadata }[]> {
        const graph = await this.loadGraph();
        return graph.relations
            .filter(r =>
                r.from === entityId &&
                r.relationType === RELATION_TYPES.SKILL_USAGE
            )
            .map(r => ({
                skill: r.to,
                metadata: r.metadata as SkillMetadata
            }));
    }

    /**
     * Filter entities by skills
     */
    async filterBySkills(skills: string[], matchAll: boolean = false): Promise<T[]> {
        const graph = await this.loadGraph();
        const skillRelations = graph.relations.filter(r =>
            r.relationType === RELATION_TYPES.SKILL_USAGE &&
            skills.includes(r.to)
        );

        const entityIds = new Set(skillRelations.map(r => r.from));
        const filteredEntities = graph.entities.filter(e => {
            if (e.entityType !== this.entityType) return false;

            const entitySkills = skillRelations
                .filter(r => r.from === e.name)
                .map(r => r.to);

            return matchAll
                ? skills.every(s => entitySkills.includes(s))
                : skills.some(s => entitySkills.includes(s));
        });

        return filteredEntities.map(e =>
            (this.mapping as SkillableEntityMapping<T>).fromSkillableEntity(e as SkillableEntity)
        );
    }

    protected override registerTools(): void {
        super.registerTools();

        // Add skill-specific tools
        this.registry.registerTool({
            name: `add_skills_to_${this.entityType.toLowerCase()}`,
            description: `Add skills to a ${this.entityType}`,
            schema: z.object({
                entityId: z.string(),
                skills: z.array(z.string()),
                level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
                context: z.string().optional()
            }),
            handler: (params) => this.addSkills(params.entityId, params.skills, {
                level: params.level,
                context: params.context
            })
        });

        this.registry.registerTool({
            name: `remove_skills_from_${this.entityType.toLowerCase()}`,
            description: `Remove skills from a ${this.entityType}`,
            schema: z.object({
                entityId: z.string(),
                skills: z.array(z.string())
            }),
            handler: (params) => this.removeSkills(params.entityId, params.skills)
        });

        this.registry.registerTool({
            name: `get_skills_for_${this.entityType.toLowerCase()}`,
            description: `Get skills for a ${this.entityType}`,
            schema: z.object({
                entityId: z.string()
            }),
            handler: (params) => this.getSkills(params.entityId)
        });

        this.registry.registerTool({
            name: `filter_${this.entityType.toLowerCase()}_by_skills`,
            description: `Filter ${this.entityType} entries by skills`,
            schema: z.object({
                skills: z.array(z.string()),
                matchAll: z.boolean().optional()
            }),
            handler: (params) => this.filterBySkills(params.skills, params.matchAll)
        });
    }
}
