import { Achievement } from '../types';
export declare class AchievementManager {
    private achievements;
    addAchievement(achievements: Achievement[]): Promise<Achievement[]>;
    searchAchievements(query: string): Promise<Achievement[]>;
    private matchesSearch;
    private validateExperienceId;
    private generateId;
}
