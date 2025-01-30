/**
 * @file WorkExperienceManager.ts
 * @description Manager for work experience entities
 *
 * @baseClassUsage
 * - CRUD operations (create/read/update/delete)
 * - Relation management (createEntityRelation)
 * - Graph operations (loadGraph/saveGraph)
 * - Tool registration
 *
 * @specialization
 * - Work experience tracking
 * - Employment history management
 * - Company relationship tracking
 * - Role and responsibility management
 *
 * @important
 * This manager extends BaseEntityManager directly, using its relation system to implement:
 * - Temporal aspects (from TimelineEntityManager patterns)
 * - Location aspects (from LocationBasedEntityManager patterns)
 * - Skill aspects (from SkillableEntityManager patterns)
 *
 * @inheritance
 * Extends BaseEntityManager directly because:
 * - Multiple inheritance isn't available/desirable
 * - Need flexible combination of multiple aspects
 * - Base relation system already supports all needed features
 * - Specialized managers serve as implementation patterns
 *
 * @usage
 * // Use base class methods for standard operations
 * await manager.addEntities([experience]);     // Creating
 * await manager.updateEntity(id, experience);  // Updating
 * await manager.deleteEntities([id]);         // Deleting
 *
 * // Implement specialized queries combining aspects
 * await manager.getCurrentExperiences();      // Timeline aspect
 * await manager.getExperiencesByLocation();   // Location aspect
 * await manager.getExperiencesBySkills();     // Skill aspect
 */

import { z } from 'zod';
import { BaseEntityManager } from './BaseEntityManager.js';
import { RELATION_TYPES, RelationManager } from './RelationManager.js';

export interface WorkExperience {
    title: string;
    employmentType: string;
    companyName: string;
    startDate: string;
    endDate?: string;
    location: string;
    locationType: string;
    description: string;
    profileHeadline: string;
    jobSource?: string;
    skills?: string[];
    media?: string[];
}

export const WorkExperienceSchema = z.object({
    title: z.string(),
    employmentType: z.string(),
    companyName: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    location: z.string(),
    locationType: z.string(),
    description: z.string(),
    profileHeadline: z.string(),
    jobSource: z.string().optional(),
    skills: z.array(z.string()).optional(),
    media: z.array(z.string()).optional()
});

export class WorkExperienceManager extends BaseEntityManager<WorkExperience> {
    constructor(relationManager: RelationManager) {
        super(relationManager, "WorkExperience", {
            schema: WorkExperienceSchema,
            toEntity: (exp) => ({
                name: exp.title,
                entityType: "WorkExperience",
                observations: [exp.description],
                metadata: { description: exp.description }
            }),
            fromEntity: (entity) => ({
                title: entity.name,
                description: entity.observations[0],
                employmentType: "", // Fetched from relations
                companyName: "", // Fetched from relations
                startDate: "", // Fetched from relations
                endDate: undefined, // Fetched from relations
                location: "", // Fetched from relations
                locationType: "", // Fetched from relations
                profileHeadline: entity.metadata?.description || "",
                jobSource: undefined,
                skills: [], // Fetched from relations
                media: []
            })
        });
    }

    async addExperience(exp: WorkExperience): Promise<void> {
        // Create the base entity
        const [entity] = await this.addEntities([exp]);
        const id = this.generateId(exp.title);

        // Add temporal relations
        await this.createEntityRelation(
            id,
            exp.startDate,
            RELATION_TYPES.HAS_TYPE,
            {
                startDate: exp.startDate,
                endDate: exp.endDate
            }
        );

        // Add location relations
        await this.createEntityRelation(
            id,
            exp.location,
            RELATION_TYPES.LOCATED_AT,
            {
                locationType: exp.locationType
            }
        );

        // Add company relation
        await this.createEntityRelation(id, exp.companyName, RELATION_TYPES.WORKS_AT);

        // Add employment type
        await this.createEntityRelation(id, exp.employmentType, RELATION_TYPES.HAS_TYPE);

        // Add skills
        if (exp.skills?.length)
        {
            for (const skill of exp.skills)
            {
                await this.createEntityRelation(id, skill, RELATION_TYPES.SKILL_USAGE);
            }
        }
    }

    /**
     * Get a complete work experience entry by ID
     */
    async getExperience(id: string): Promise<WorkExperience | undefined> {
        const graph = await this.loadGraph();

        // Get base entity
        const entity = graph.entities.find(e =>
            e.entityType === this.entityType &&
            this.generateId(e.name) === id
        );
        if (!entity) return undefined;

        // Get temporal data
        const timeRelation = graph.relations.find(r =>
            r.from === id &&
            r.relationType === RELATION_TYPES.HAS_TYPE &&
            r.metadata?.startDate
        );

        // Get location data
        const locationRelation = graph.relations.find(r =>
            r.from === id &&
            r.relationType === RELATION_TYPES.LOCATED_AT
        );

        // Get company data
        const companyRelation = graph.relations.find(r =>
            r.from === id &&
            r.relationType === RELATION_TYPES.WORKS_AT
        );

        // Get employment type
        const typeRelation = graph.relations.find(r =>
            r.from === id &&
            r.relationType === RELATION_TYPES.HAS_TYPE &&
            !r.metadata?.startDate // Not the temporal relation
        );

        // Get skills
        const skillRelations = graph.relations.filter(r =>
            r.from === id &&
            r.relationType === RELATION_TYPES.SKILL_USAGE
        );

        return {
            title: entity.name,
            description: entity.observations[0],
            employmentType: typeRelation?.to || "",
            companyName: companyRelation?.to || "",
            startDate: timeRelation?.metadata?.startDate || "",
            endDate: timeRelation?.metadata?.endDate,
            location: locationRelation?.to || "",
            locationType: locationRelation?.metadata?.locationType || "",
            profileHeadline: entity.metadata?.description || "",
            jobSource: undefined,
            skills: skillRelations.map(r => r.to),
            media: []
        };
    }

    /**
     * Get all work experience entries
     */
    async getAllExperiences(): Promise<WorkExperience[]> {
        const graph = await this.loadGraph();
        const experiences = graph.entities.filter(e => e.entityType === this.entityType);

        return Promise.all(
            experiences.map(e => this.getExperience(this.generateId(e.name)))
        ).then(results => results.filter((exp): exp is WorkExperience => exp !== undefined));
    }

    /**
     * Get current work experiences (no end date)
     */
    async getCurrentExperiences(): Promise<WorkExperience[]> {
        const graph = await this.loadGraph();
        const currentTimeRelations = graph.relations.filter(r =>
            r.relationType === RELATION_TYPES.HAS_TYPE &&
            r.metadata?.startDate &&
            !r.metadata?.endDate
        );

        return Promise.all(
            currentTimeRelations.map(r => this.getExperience(r.from))
        ).then(results => results.filter((exp): exp is WorkExperience => exp !== undefined));
    }

    /**
     * Filter work experiences by company
     */
    async getExperiencesByCompany(companyName: string): Promise<WorkExperience[]> {
        const graph = await this.loadGraph();
        const companyRelations = graph.relations.filter(r =>
            r.relationType === RELATION_TYPES.WORKS_AT &&
            r.to.toLowerCase() === companyName.toLowerCase()
        );

        return Promise.all(
            companyRelations.map(r => this.getExperience(r.from))
        ).then(results => results.filter((exp): exp is WorkExperience => exp !== undefined));
    }

    /**
     * Filter work experiences by skills
     */
    async getExperiencesBySkills(skills: string[], matchAll: boolean = false): Promise<WorkExperience[]> {
        const graph = await this.loadGraph();
        const skillRelations = graph.relations.filter(r =>
            r.relationType === RELATION_TYPES.SKILL_USAGE &&
            skills.includes(r.to)
        );

        // Group skill relations by experience ID
        const experienceSkills = skillRelations.reduce((acc, r) => {
            acc[r.from] = acc[r.from] || [];
            acc[r.from].push(r.to);
            return acc;
        }, {} as Record<string, string[]>);

        // Filter experiences based on skill matching criteria
        const matchingIds = Object.entries(experienceSkills)
            .filter(([_, expSkills]) =>
                matchAll
                    ? skills.every(s => expSkills.includes(s))
                    : skills.some(s => expSkills.includes(s))
            )
            .map(([id]) => id);

        return Promise.all(
            matchingIds.map(id => this.getExperience(id))
        ).then(results => results.filter((exp): exp is WorkExperience => exp !== undefined));
    }

    /**
     * Filter work experiences by date range
     */
    async getExperiencesByDateRange(startDate: string, endDate: string): Promise<WorkExperience[]> {
        const graph = await this.loadGraph();
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        const timeRelations = graph.relations.filter(r => {
            if (r.relationType !== RELATION_TYPES.HAS_TYPE || !r.metadata?.startDate) return false;
            const expStart = new Date(r.metadata.startDate).getTime();
            const expEnd = r.metadata.endDate ? new Date(r.metadata.endDate).getTime() : Date.now();
            return expStart <= end && expEnd >= start;
        });

        return Promise.all(
            timeRelations.map(r => this.getExperience(r.from))
        ).then(results => results.filter((exp): exp is WorkExperience => exp !== undefined));
    }
}