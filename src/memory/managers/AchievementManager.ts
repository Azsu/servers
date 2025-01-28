import { type Achievement } from '../types.js';

export class AchievementManager {
    private achievements: Map<string, Achievement> = new Map();

    async addAchievement(achievements: Achievement[]): Promise<Achievement[]> {
        for (const achievement of achievements)
        {
            const id = this.generateId(achievement.title);
            this.achievements.set(id, achievement);
        }
        return achievements;
    }

    async searchAchievements(query: string): Promise<Achievement[]> {
        const searchTerms = query.toLowerCase().split(' ');
        return Array.from(this.achievements.values()).filter(achievement =>
            this.matchesSearchTerms(achievement, searchTerms)
        );
    }

    private generateId(title: string): string {
        return title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    private matchesSearchTerms(achievement: Achievement, searchTerms: string[]): boolean {
        const searchableText = [
            achievement.title.toLowerCase(),
            achievement.description.toLowerCase(),
            achievement.impactLevel.toLowerCase(),
            ...achievement.businessValue.map(v => v.toLowerCase()),
            achievement.deliverableType.toLowerCase(),
            ...achievement.metrics.quantitative,
            ...achievement.metrics.qualitative
        ].join(' ');

        return searchTerms.every(term => searchableText.includes(term));
    }
}