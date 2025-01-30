/**
 * @file ProjectManager.ts
 * @description Manager for project entities
 *
 * @baseClassUsage
 * - CRUD operations (create/read/update/delete)
 * - Relation management (createEntityRelation)
 * - Graph operations (loadGraph/saveGraph)
 * - Tool registration
 *
 * @specialization
 * - Project lifecycle management
 * - Technical implementation tracking
 * - Project team coordination
 * - Deliverable management
 * - Contributor relationship tracking
 * - Project skill requirements
 * - Media and documentation handling
 *
 * @important
 * This manager extends BaseEntityManager directly, using its relation system to implement:
 * - Temporal aspects (from TimelineEntityManager patterns)
 * - Skill aspects (from SkillableEntityManager patterns)
 * - Team collaboration tracking
 * - Project association management
 * - Media and documentation storage
 *
 * @inheritance
 * Extends BaseEntityManager directly because:
 * - Multiple inheritance isn't available/desirable
 * - Need flexible combination of multiple aspects
 * - Base relation system already supports all needed features
 * - Specialized managers serve as implementation patterns
 *
 * @usage
 * // Create new project
 * await manager.addProject({
 *   projectName: "Project Name",
 *   description: "Project description",
 *   startDate: "2023-01-01",
 *   endDate: "2023-12-31",
 *   isCurrent: false,
 *   skills: ["TypeScript", "React"],
 *   contributors: ["John Doe", "Jane Smith"],
 *   associatedWith: "Company Name"
 * });
 *
 * // Update project details
 * await manager.updateProject(id, updatedProject);
 *
 * // Search and filter
 * const results = await manager.filterProjects({
 *   currentOnly: true,
 *   skills: ["TypeScript"],
 *   dateRange: {
 *     startDate: "2023-01-01",
 *     endDate: "2023-12-31"
 *   }
 * });
 *
 * // Get current projects
 * const currentProjects = await manager.getCurrentProjects();
 */

import { z } from 'zod';
import { BaseEntityManager, EntityMapping } from './BaseEntityManager.js';
import { RELATION_TYPES, RelationManager } from './RelationManager.js';
import { Entity } from './types.js';

// Define metadata type
type ProjectMetadata = {
    startDate?: string;
    endDate?: string;
    description?: string;
    associatedWith?: string;
};

// Define the schema
const ProjectSchema = z.object({
    projectName: z.string(),
    description: z.string().optional(),
    skills: z.array(z.string()).optional(),
    media: z.array(z.string()).optional(),
    isCurrent: z.boolean(),
    startDate: z.string(),
    endDate: z.string().optional(),
    contributors: z.array(z.string()).optional(),
    associatedWith: z.string().optional()
});

// Define the mapping
const ProjectMapping: EntityMapping<z.infer<typeof ProjectSchema>> = {
    schema: ProjectSchema,
    toEntity: (project) => ({
        name: project.projectName,
        entityType: "Project",
        observations: [
            project.description || "",
            ...(project.contributors || []),
            ...(project.skills || []),
            ...(project.media || [])
        ],
        metadata: {
            startDate: project.startDate,
            endDate: project.endDate,
            description: project.description,
            associatedWith: project.associatedWith
        } as ProjectMetadata
    }),
    fromEntity: (entity: Entity) => ({
        projectName: entity.name,
        description: entity.observations[0] || undefined,
        contributors: entity.observations.slice(1, -entity.observations.length + (entity.observations.length - 1) / 2) || [],
        skills: entity.observations.slice(-((entity.observations.length - 1) / 2)) || [],
        media: [],
        isCurrent: !entity.metadata?.endDate,
        startDate: (entity.metadata as ProjectMetadata)?.startDate || '',
        endDate: (entity.metadata as ProjectMetadata)?.endDate,
        associatedWith: (entity.metadata as ProjectMetadata)?.associatedWith
    })
};

export class ProjectManager extends BaseEntityManager<z.infer<typeof ProjectSchema>> {
    constructor(relationManager: RelationManager) {
        super(relationManager, "Project", ProjectMapping);
    }

    protected override registerTools(): void {
        super.registerTools();

        // Register specialized tools
        this.registry.registerTool({
            name: 'get_current_projects',
            description: 'Get current projects',
            schema: z.object({}),
            handler: async () => {
                const results = await this.searchEntities('');
                return results.filter(r => r.isCurrent);
            }
        });

        this.registry.registerTool({
            name: 'filter_by_skills',
            description: 'Filter projects by required skills',
            schema: z.object({
                skills: z.array(z.string())
            }),
            handler: async (params) => {
                const results = await this.searchEntities('');
                return results.filter(r =>
                    params.skills.every((skill: string) =>
                        r.skills?.some(s => s.toLowerCase() === skill.toLowerCase())
                    )
                );
            }
        });
    }

    async addEntities(items: z.infer<typeof ProjectSchema>[]): Promise<z.infer<typeof ProjectSchema>[]> {
        const result = await super.addEntities(items);

        // Create relationships for each project
        for (const project of items)
        {
            const id = this.generateId(project.projectName);
            await this.createCommonRelationships(id, undefined, undefined, project.skills);

            if (project.associatedWith)
            {
                await this.createEntityRelation(id, project.associatedWith, RELATION_TYPES.HAS_TYPE);
            }

            // Create contributor relationships
            if (project.contributors?.length)
            {
                for (const contributor of project.contributors)
                {
                    await this.createEntityRelation(contributor, id, RELATION_TYPES.CONTRIBUTES_TO);
                }
            }
        }

        return result;
    }

    async addProject(project: z.infer<typeof ProjectSchema>): Promise<void> {
        await this.addEntities([project]);
    }

    async updateProject(id: string, project: z.infer<typeof ProjectSchema>): Promise<void> {
        await this.updateEntity(id, project);
    }

    async deleteProject(id: string): Promise<void> {
        await this.deleteEntities([id]);
    }

    async getProjectById(id: string): Promise<z.infer<typeof ProjectSchema> | undefined> {
        return this.getEntityById(id);
    }

    async searchProjects(query: string): Promise<z.infer<typeof ProjectSchema>[]> {
        return this.searchEntities(query);
    }

    async filterProjects(options: {
        dateRange?: { startDate: string; endDate: string };
        currentOnly?: boolean;
        associatedWith?: string;
        skills?: string[];
    }): Promise<z.infer<typeof ProjectSchema>[]> {
        let results = await this.searchEntities('');

        if (options.dateRange)
        {
            results = await this.filterByDateRange(options.dateRange.startDate, options.dateRange.endDate);
        }

        if (options.currentOnly)
        {
            results = results.filter(r => r.isCurrent);
        }

        if (options.associatedWith)
        {
            results = results.filter(r => r.associatedWith?.toLowerCase() === options.associatedWith?.toLowerCase());
        }

        if (options.skills?.length)
        {
            results = results.filter(r =>
                options.skills!.every(skill =>
                    r.skills?.some(s => s.toLowerCase() === skill.toLowerCase())
                )
            );
        }

        return results;
    }

    protected generateId(projectName: string): string {
        return projectName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
}