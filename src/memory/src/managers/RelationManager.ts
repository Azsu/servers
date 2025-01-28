import { type Relation } from '../types.js';

// Define relation types as a const object to avoid initialization issues
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

type RelationType = typeof RELATION_TYPES[keyof typeof RELATION_TYPES];

export class RelationManager {
    private relations: Relation[] = [];

    createRelation(from: string, to: string, type: RelationType): Relation {
        const relation: Relation = {
            from,
            to,
            relationType: type
        };
        this.relations.push(relation);
        return relation;
    }

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