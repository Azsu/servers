import { GraphOperations } from './graph-operations.js';
import { ContributionExperienceRelation, CrossReferenceRelation, EntityType, ExperienceSkillRelation, ProjectExperienceRelation } from './types.js';
/**
 * Manages enhanced relations between different entity types in the knowledge graph
 */
export declare class RelationManager extends GraphOperations {
    /**
     * Creates a relation between a work experience and a skill
     * @param relation The experience-skill relation to create
     * @returns Promise<ExperienceSkillRelation> The created relation
     * @throws {EntityNotFoundError} If referenced entities don't exist
     * @throws {ValidationError} If validation fails
     */
    createExperienceSkillRelation(relation: ExperienceSkillRelation): Promise<ExperienceSkillRelation>;
    /**
     * Creates a relation between a project and a work experience
     * @param relation The project-experience relation to create
     * @returns Promise<ProjectExperienceRelation> The created relation
     * @throws {EntityNotFoundError} If referenced entities don't exist
     */
    createProjectExperienceRelation(relation: ProjectExperienceRelation): Promise<ProjectExperienceRelation>;
    /**
     * Creates a cross-reference relation between any two entities
     * @param relation The cross-reference relation to create
     * @returns Promise<CrossReferenceRelation> The created relation
     * @throws {EntityNotFoundError} If referenced entities don't exist
     */
    createCrossReferenceRelation(relation: CrossReferenceRelation): Promise<CrossReferenceRelation>;
    /**
     * Creates a relation between a contribution and a work experience
     * @param relation The contribution-experience relation to create
     * @returns Promise<ContributionExperienceRelation> The created relation
     * @throws {EntityNotFoundError} If referenced entities don't exist
     */
    createContributionExperienceRelation(relation: ContributionExperienceRelation): Promise<ContributionExperienceRelation>;
    /**
     * Gets all skills associated with a work experience
     * @param experienceId ID of the work experience
     * @returns Promise<ExperienceSkillRelation[]> Array of experience-skill relations
     */
    getSkillsForExperience(experienceId: string): Promise<ExperienceSkillRelation[]>;
    /**
     * Gets all projects associated with a work experience
     * @param experienceId ID of the work experience
     * @returns Promise<ProjectExperienceRelation[]> Array of project-experience relations
     */
    getProjectsForExperience(experienceId: string): Promise<ProjectExperienceRelation[]>;
    /**
     * Gets all entities related to a specific entity
     * @param entityId ID of the entity
     * @param entityType Type of the entity
     * @returns Promise<CrossReferenceRelation[]> Array of cross-reference relations
     */
    getRelatedEntities(entityId: string, entityType: EntityType): Promise<CrossReferenceRelation[]>;
    /**
     * Gets all contributions associated with a work experience
     * @param experienceId ID of the work experience
     * @returns Promise<ContributionExperienceRelation[]> Array of contribution-experience relations
     */
    getContributionsForExperience(experienceId: string): Promise<ContributionExperienceRelation[]>;
}
