export class RelationManager {
    // Add new relation types
    RELATION_TYPES = {
        ...this.RELATION_TYPES,
        ACHIEVEMENT_EXPERIENCE: 'ACHIEVEMENT_EXPERIENCE',
        IMPLEMENTATION_EXPERIENCE: 'IMPLEMENTATION_EXPERIENCE',
        DOMAIN_SKILL: 'DOMAIN_SKILL',
        CONTRIBUTION_DOMAIN: 'CONTRIBUTION_DOMAIN',
        IMPLEMENTATION_TECHNOLOGY: 'IMPLEMENTATION_TECHNOLOGY'
    };
    async createAchievementRelations(achievementId, experienceId, skills) {
        await this.createRelation(achievementId, experienceId, this.RELATION_TYPES.ACHIEVEMENT_EXPERIENCE);
        for (const skillId of skills) {
            await this.createRelation(achievementId, skillId, this.RELATION_TYPES.SKILL_USAGE);
        }
    }
    async createImplementationRelations(implementationId, experienceId, technologies) {
        await this.createRelation(implementationId, experienceId, this.RELATION_TYPES.IMPLEMENTATION_EXPERIENCE);
        for (const techId of technologies) {
            await this.createRelation(implementationId, techId, this.RELATION_TYPES.IMPLEMENTATION_TECHNOLOGY);
        }
    }
}
