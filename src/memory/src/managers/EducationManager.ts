/**
 * @file EducationManager.ts
 * @description Manager for education entities
 *
 * @baseClassUsage
 * - CRUD operations (create/read/update/delete)
 * - Relation management (createEntityRelation)
 * - Graph operations (loadGraph/saveGraph)
 * - Tool registration
 *
 * @specialization
 * - Education history tracking
 * - Academic achievement management
 * - Course and degree tracking
 * - Academic skill development
 * - Grade and performance tracking
 * - Activities and societies management
 *
 * @important
 * This manager extends BaseEntityManager directly, using its relation system to implement:
 * - Temporal aspects (from TimelineEntityManager patterns)
 * - Skill aspects (from SkillableEntityManager patterns)
 * - Academic relationship tracking
 * - Educational achievement tracking
 *
 * @inheritance
 * Extends BaseEntityManager directly because:
 * - Multiple inheritance isn't available/desirable
 * - Need flexible combination of multiple aspects
 * - Base relation system already supports all needed features
 * - Specialized managers serve as implementation patterns
 *
 * @usage
 * // Create new education entry
 * await manager.addEducation({
 *   school: "University Name",
 *   degree: "Bachelor's",
 *   fieldOfStudy: "Computer Science",
 *   startDate: "2020-09-01",
 *   endDate: "2024-06-30",
 *   grade: "3.8 GPA",
 *   skills: ["Programming", "Algorithms"]
 * });
 *
 * // Update education details
 * await manager.updateEducation(id, updatedEducation);
 *
 * // Search and filter
 * const results = await manager.filterEducation({
 *   school: "University Name",
 *   degree: "Bachelor's",
 *   dateRange: {
 *     startDate: "2020-01-01",
 *     endDate: "2024-12-31"
 *   }
 * });
 */

import { z } from 'zod';
import { BaseEntityManager, EntityMapping } from './BaseEntityManager.js';
import { RELATION_TYPES, RelationManager } from './RelationManager.js';
import { Entity } from './types.js';

// Define the schema
const EducationSchema = z.object({
    school: z.string(),
    degree: z.string(),
    fieldOfStudy: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    grade: z.string().optional(),
    activitiesAndSocieties: z.array(z.string()).optional(),
    description: z.string().optional(),
    skills: z.array(z.string()).optional(),
    media: z.array(z.string()).optional()
});

// Define the mapping
const EducationMapping: EntityMapping<z.infer<typeof EducationSchema>> = {
    schema: EducationSchema,
    toEntity: (education) => ({
        name: education.school,
        entityType: "EducationExperience",
        observations: [
            education.description || "",
            education.degree,
            education.fieldOfStudy,
            education.grade || "",
            ...(education.activitiesAndSocieties || []),
            ...(education.skills || []),
            ...(education.media || [])
        ],
        metadata: {
            startDate: education.startDate,
            endDate: education.endDate,
            description: education.description,
            grade: education.grade
        }
    }),
    fromEntity: (entity: Entity) => ({
        school: entity.name,
        description: entity.observations[0],
        degree: entity.observations[1],
        fieldOfStudy: entity.observations[2],
        grade: entity.observations[3] || undefined,
        activitiesAndSocieties: entity.observations.slice(4, -entity.observations.length + (entity.observations.length - 4) / 2) || [],
        skills: entity.observations.slice(-((entity.observations.length - 4) / 2)) || [],
        media: [],
        startDate: entity.metadata?.startDate || '',
        endDate: entity.metadata?.endDate
    })
};

export class EducationManager extends BaseEntityManager<z.infer<typeof EducationSchema>> {
    constructor(relationManager: RelationManager) {
        super(relationManager, "EducationExperience", EducationMapping);
    }

    protected override registerTools(): void {
        super.registerTools();

        // Register specialized tools
        this.registry.registerTool({
            name: 'filter_by_school',
            description: 'Filter education experiences by school',
            schema: z.object({
                school: z.string()
            }),
            handler: async (params) => {
                const results = await this.searchEntities('');
                return results.filter(r => r.school.toLowerCase() === params.school.toLowerCase());
            }
        });

        this.registry.registerTool({
            name: 'filter_by_degree',
            description: 'Filter education experiences by degree',
            schema: z.object({
                degree: z.string()
            }),
            handler: async (params) => {
                const results = await this.searchEntities('');
                return results.filter(r => r.degree.toLowerCase() === params.degree.toLowerCase());
            }
        });
    }

    async addEntities(items: z.infer<typeof EducationSchema>[]): Promise<z.infer<typeof EducationSchema>[]> {
        const result = await super.addEntities(items);

        // Create relationships for each education experience
        for (const education of items)
        {
            const id = this.generateId(education.school);
            await this.createCommonRelationships(id, undefined, education.degree, education.skills);
            if (education.fieldOfStudy)
            {
                await this.createEntityRelation(id, education.fieldOfStudy, RELATION_TYPES.HAS_TYPE);
            }
        }

        return result;
    }

    async addEducation(education: z.infer<typeof EducationSchema>): Promise<void> {
        await this.addEntities([education]);
    }

    async updateEducation(id: string, education: z.infer<typeof EducationSchema>): Promise<void> {
        await this.updateEntity(id, education);
    }

    async deleteEducation(id: string): Promise<void> {
        await this.deleteEntities([id]);
    }

    async getEducationById(id: string): Promise<z.infer<typeof EducationSchema> | undefined> {
        return this.getEntityById(id);
    }

    async searchEducation(query: string): Promise<z.infer<typeof EducationSchema>[]> {
        return this.searchEntities(query);
    }

    async filterEducation(options: {
        dateRange?: { startDate: string; endDate: string };
        school?: string;
        degree?: string;
    }): Promise<z.infer<typeof EducationSchema>[]> {
        let results = await this.searchEntities('');

        if (options.dateRange)
        {
            results = await this.filterByDateRange(options.dateRange.startDate, options.dateRange.endDate);
        }

        if (options.school)
        {
            results = results.filter(r => r.school.toLowerCase() === options.school?.toLowerCase());
        }

        if (options.degree)
        {
            results = results.filter(r => r.degree.toLowerCase() === options.degree?.toLowerCase());
        }

        return results;
    }

    protected generateId(school: string): string {
        return school.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
}