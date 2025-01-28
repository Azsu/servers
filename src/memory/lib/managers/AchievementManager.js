import { EntityNotFoundError } from '../errors';
export class AchievementManager {
    achievements = new Map();
    async addAchievement(achievements) {
        const results = [];
        for (const achievement of achievements) {
            // Validate experience ID exists
            if (!await this.validateExperienceId(achievement.experienceId)) {
                throw new EntityNotFoundError(`Experience ID ${achievement.experienceId} not found`);
            }
            const id = this.generateId(achievement.title);
            this.achievements.set(id, achievement);
            results.push(achievement);
        }
        return results;
    }
    async searchAchievements(query) {
        const results = [];
        const searchTerms = query.toLowerCase().split(' ');
        for (const achievement of this.achievements.values()) {
            if (this.matchesSearch(achievement, searchTerms)) {
                results.push(achievement);
            }
        }
        return results;
    }
    matchesSearch(achievement, terms) {
        const searchableText = [
            achievement.title,
            ...achievement.deliverables.map(d => d.description),
            ...achievement.metrics.quantitative,
            ...achievement.metrics.qualitative
        ].join(' ').toLowerCase();
        return terms.every(term => searchableText.includes(term));
    }
    async validateExperienceId(experienceId) {
        // Implementation to validate against WorkExperienceManager
        return true; // Placeholder
    }
    generateId(title) {
        return `achievement_${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    }
}
