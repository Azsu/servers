import { GraphOperations } from './graph-operations.js';
import {
    ContributionExperienceRelation,
    CrossReferenceRelation,
    EntityNotFoundError,
    EntityType,
    ExperienceSkillRelation,
    ProjectExperienceRelation,
    Relation,
    SkillLevel,
    ValidationError
} from './types.js';

/**
 * Manages enhanced relations between different entity types in the knowledge graph
 */
export class RelationManager extends GraphOperations {
    /**
     * Creates a relation between a work experience and a skill
     * @param relation The experience-skill relation to create
     * @returns Promise<ExperienceSkillRelation> The created relation
     * @throws {EntityNotFoundError} If referenced entities don't exist
     * @throws {ValidationError} If validation fails
     */
    async createExperienceSkillRelation(relation: ExperienceSkillRelation): Promise<ExperienceSkillRelation> {
        const graph = await this.loadGraph();

        // Verify entities exist
        if (!graph.entities.some(e => e.name === relation.experienceId && e.entityType === "WorkExperience"))
        {
            throw new EntityNotFoundError(`WorkExperience: ${relation.experienceId}`);
        }
        if (!graph.entities.some(e => e.name === relation.skillId && e.entityType === "Skill"))
        {
            throw new EntityNotFoundError(`Skill: ${relation.skillId}`);
        }

        const newRelation: Relation = {
            from: relation.experienceId,
            to: relation.skillId,
            relationType: "HasSkill",
            metadata: {
                level: relation.level,
                context: relation.context,
                startDate: relation.startDate,
                endDate: relation.endDate
            }
        };

        await this.createRelations([newRelation]);
        return relation;
    }

    /**
     * Creates a relation between a project and a work experience
     * @param relation The project-experience relation to create
     * @returns Promise<ProjectExperienceRelation> The created relation
     * @throws {EntityNotFoundError} If referenced entities don't exist
     */
    async createProjectExperienceRelation(relation: ProjectExperienceRelation): Promise<ProjectExperienceRelation> {
        const graph = await this.loadGraph();

        if (!graph.entities.some(e => e.name === relation.projectId && e.entityType === "Project"))
        {
            throw new EntityNotFoundError(`Project: ${relation.projectId}`);
        }
        if (!graph.entities.some(e => e.name === relation.experienceId && e.entityType === "WorkExperience"))
        {
            throw new EntityNotFoundError(`WorkExperience: ${relation.experienceId}`);
        }

        const newRelation: Relation = {
            from: relation.experienceId,
            to: relation.projectId,
            relationType: "WorkedOn",
            metadata: {
                role: relation.role,
                impact: relation.impact,
                responsibilities: relation.responsibilities
            }
        };

        await this.createRelations([newRelation]);
        return relation;
    }

    /**
     * Creates a cross-reference relation between any two entities
     * @param relation The cross-reference relation to create
     * @returns Promise<CrossReferenceRelation> The created relation
     * @throws {EntityNotFoundError} If referenced entities don't exist
     */
    async createCrossReferenceRelation(relation: CrossReferenceRelation): Promise<CrossReferenceRelation> {
        const graph = await this.loadGraph();

        if (!graph.entities.some(e => e.name === relation.sourceId && e.entityType === relation.sourceType))
        {
            throw new EntityNotFoundError(`${relation.sourceType}: ${relation.sourceId}`);
        }
        if (!graph.entities.some(e => e.name === relation.targetId && e.entityType === relation.targetType))
        {
            throw new EntityNotFoundError(`${relation.targetType}: ${relation.targetId}`);
        }

        const newRelation: Relation = {
            from: relation.sourceId,
            to: relation.targetId,
            relationType: relation.referenceType,
            metadata: {
                context: relation.context
            }
        };

        await this.createRelations([newRelation]);
        return relation;
    }

    /**
     * Creates a relation between a contribution and a work experience
     * @param relation The contribution-experience relation to create
     * @returns Promise<ContributionExperienceRelation> The created relation
     * @throws {EntityNotFoundError} If referenced entities don't exist
     */
    async createContributionExperienceRelation(relation: ContributionExperienceRelation): Promise<ContributionExperienceRelation> {
        const graph = await this.loadGraph();

        if (!graph.entities.some(e => e.name === relation.contributionId && e.entityType === "OnlineContribution"))
        {
            throw new EntityNotFoundError(`OnlineContribution: ${relation.contributionId}`);
        }
        if (!graph.entities.some(e => e.name === relation.experienceId && e.entityType === "WorkExperience"))
        {
            throw new EntityNotFoundError(`WorkExperience: ${relation.experienceId}`);
        }

        const newRelation: Relation = {
            from: relation.experienceId,
            to: relation.contributionId,
            relationType: "Contributed",
            metadata: {
                relevance: relation.relevance,
                skills: relation.skills
            }
        };

        await this.createRelations([newRelation]);
        return relation;
    }

    /**
     * Gets all skills associated with a work experience
     * @param experienceId ID of the work experience
     * @returns Promise<ExperienceSkillRelation[]> Array of experience-skill relations
     */
    async getSkillsForExperience(experienceId: string): Promise<ExperienceSkillRelation[]> {
        const graph = await this.loadGraph();

        return graph.relations
            .filter(r => r.from === experienceId && r.relationType === "HasSkill")
            .map(r => ({
                experienceId: r.from,
                skillId: r.to,
                level: (r.metadata?.level || "BEGINNER") as SkillLevel,
                context: r.metadata?.context || "",
                startDate: r.metadata?.startDate,
                endDate: r.metadata?.endDate
            }));
    }

    /**
     * Gets all projects associated with a work experience
     * @param experienceId ID of the work experience
     * @returns Promise<ProjectExperienceRelation[]> Array of project-experience relations
     */
    async getProjectsForExperience(experienceId: string): Promise<ProjectExperienceRelation[]> {
        const graph = await this.loadGraph();

        return graph.relations
            .filter(r => r.from === experienceId && r.relationType === "WorkedOn")
            .map(r => ({
                experienceId: r.from,
                projectId: r.to,
                role: r.metadata?.role || "",
                impact: r.metadata?.impact || "",
                responsibilities: r.metadata?.responsibilities || []
            }));
    }

    /**
     * Gets all entities related to a specific entity
     * @param entityId ID of the entity
     * @param entityType Type of the entity
     * @returns Promise<CrossReferenceRelation[]> Array of cross-reference relations
     */
    async getRelatedEntities(entityId: string, entityType: EntityType): Promise<CrossReferenceRelation[]> {
        const graph = await this.loadGraph();

        return graph.relations
            .filter(r => (r.from === entityId || r.to === entityId))
            .map(r => ({
                sourceType: entityType,
                sourceId: r.from,
                targetType: r.to === entityId ? entityType : "RELATED" as EntityType,
                targetId: r.to,
                referenceType: r.relationType as any,
                context: r.metadata?.context
            }));
    }

    /**
     * Gets all contributions associated with a work experience
     * @param experienceId ID of the work experience
     * @returns Promise<ContributionExperienceRelation[]> Array of contribution-experience relations
     */
    async getContributionsForExperience(experienceId: string): Promise<ContributionExperienceRelation[]> {
        const graph = await this.loadGraph();

        return graph.relations
            .filter(r => r.from === experienceId && r.relationType === "Contributed")
            .map(r => ({
                experienceId: r.from,
                contributionId: r.to,
                relevance: r.metadata?.relevance || "",
                skills: r.metadata?.skills || []
            }));
    }
}