export declare class RelationManager {
    private readonly RELATION_TYPES;
    createAchievementRelations(achievementId: string, experienceId: string, skills: string[]): Promise<void>;
    createImplementationRelations(implementationId: string, experienceId: string, technologies: string[]): Promise<void>;
}
