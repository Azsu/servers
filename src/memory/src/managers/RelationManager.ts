/**
 * @file RelationManager.ts
 * @description Manages relationships between entities in the knowledge graph
 *
 * @baseClassUsage
 * - Relationship creation and management
 * - Type-safe relation handling
 * - Metadata management
 * - Bulk operations
 *
 * @specialization
 * - Achievement relationships
 * - Implementation relationships
 * - Skill relationships
 * - Experience relationships
 * - Domain relationships
 * - Location relationships
 *
 * @important
 * This manager provides core relationship functionality:
 * - Type-safe relationship creation
 * - Relationship consistency
 * - Metadata support
 * - Bulk operations
 * - Cross-entity relationships
 *
 * @usage
 * // Create basic relation
 * const relation = manager.createRelation(
 *   'entityA',
 *   'entityB',
 *   RELATION_TYPES.USES
 * );
 *
 * // Create achievement relations
 * await manager.createAchievementRelations(
 *   'achievement1',
 *   'experience1',
 *   ['skill1', 'skill2']
 * );
 */

import type { Relation } from './RelationManager.d';

/**
 * Defines all possible relationship types in the system
 * @description Constant object defining all valid relationship types
 * to ensure type safety and consistency across the application
 */
export const RELATION_TYPES = {
    IMPLEMENTS: 'implements',
    USES: 'uses',
    REQUIRES: 'requires',
    CONTRIBUTES_TO: 'contributes_to',
    ACHIEVEMENT_EXPERIENCE: 'ACHIEVEMENT_EXPERIENCE',
    IMPLEMENTATION_EXPERIENCE: 'IMPLEMENTATION_EXPERIENCE',
    DOMAIN_SKILL: 'DOMAIN_SKILL',
    CONTRIBUTION_DOMAIN: 'CONTRIBUTION_DOMAIN',
    IMPLEMENTATION_TECHNOLOGY: 'IMPLEMENTATION_TECHNOLOGY',
    SKILL_USAGE: 'SKILL_USAGE',
    HAS_IMPACT: 'HAS_IMPACT',
    HAS_TYPE: 'HAS_TYPE',
    HAS_PROFICIENCY: 'HAS_PROFICIENCY',
    HAS_SCOPE: 'HAS_SCOPE',
    WORKS_AT: 'WORKS_AT',
    LOCATED_AT: 'LOCATED_AT'
} as const;

/**
 * Type representing valid relationship types
 */
type RelationType = typeof RELATION_TYPES[keyof typeof RELATION_TYPES];

/**
 * Manages relationships between entities in the knowledge graph
 * @description Provides methods for creating and managing relationships
 * between different types of entities with type safety and consistency
 */
export class RelationManager {
    private relations: Relation[] = [];

    /**
     * Creates a basic relationship between two entities
     * @description Creates and stores a new relationship with the specified type
     *
     * @param from - Source entity ID
     * @param to - Target entity ID
     * @param type - Type of relationship
     * @returns {Relation} The created relationship
     */
    createRelation(from: string, to: string, type: RelationType): Relation {
        const relation: Relation = {
            from,
            to,
            relationType: type
        };
        this.relations.push(relation);
        return relation;
    }

    /**
     * Creates achievement-related relationships
     * @description Creates relationships between an achievement, its experience,
     * and associated skills
     *
     * @param achievementId - ID of the achievement
     * @param experienceId - ID of the related experience
     * @param skills - Array of skill IDs
     */
    async createAchievementRelations(
        achievementId: string,
        experienceId: string,
        skills: string[]
    ): Promise<void> {
        await this.createRelation(achievementId, experienceId, RELATION_TYPES.ACHIEVEMENT_EXPERIENCE);
        for (const skillId of skills)
        {
            await this.createRelation(achievementId, skillId, RELATION_TYPES.SKILL_USAGE);
        }
    }

    /**
     * Creates implementation-related relationships
     * @description Creates relationships between an implementation, its experience,
     * and associated technologies
     *
     * @param implementationId - ID of the implementation
     * @param experienceId - ID of the related experience
     * @param technologies - Array of technology IDs
     */
    async createImplementationRelations(
        implementationId: string,
        experienceId: string,
        technologies: string[]
    ): Promise<void> {
        await this.createRelation(
            implementationId,
            experienceId,
            RELATION_TYPES.IMPLEMENTATION_EXPERIENCE
        );
        for (const techId of technologies)
        {
            await this.createRelation(
                implementationId,
                techId,
                RELATION_TYPES.IMPLEMENTATION_TECHNOLOGY
            );
        }
    }
}