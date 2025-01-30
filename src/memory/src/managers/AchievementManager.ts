/**
 * @file AchievementManager.ts
 * @description Manager for achievement entities and their relationships
 *
 * @baseClassUsage
 * - CRUD operations (create/read/update/delete)
 * - Relation management (createEntityRelation)
 * - Impact level tracking
 * - Business value tracking
 *
 * @specialization
 * - Achievement tracking
 * - Impact level classification
 * - Business value assessment
 * - Deliverable type management
 * - Metric tracking (quantitative/qualitative)
 * - Achievement search and filtering
 *
 * @important
 * This manager implements achievement-based functionality:
 * - Impact level classification
 * - Business value tracking
 * - Deliverable type management
 * - Metric tracking and analysis
 * - Achievement relationship management
 *
 * @inheritance
 * Direct implementation with RelationManager:
 * - Focused on achievement-specific functionality
 * - Manages impact levels and business value
 * - Handles metric tracking
 * - Supports achievement relationships
 *
 * @usage
 * // Create new achievement
 * manager.addAchievement({
 *   title: "Project Success",
 *   description: "Led successful project delivery",
 *   impactLevel: "HIGH",
 *   businessValue: ["Revenue Growth", "Customer Satisfaction"],
 *   deliverableType: "Project",
 *   metrics: {
 *     quantitative: ["20% revenue increase"],
 *     qualitative: ["Improved team collaboration"]
 *   }
 * });
 *
 * // Update achievement
 * await manager.updateAchievement(id, updatedAchievement);
 *
 * // Search achievements
 * const results = manager.searchAchievements(["revenue", "growth"]);
 *
 * // Filter by impact
 * const highImpact = manager.getAchievementsByImpact("HIGH");
 */

import { Achievement, ImpactLevel } from '../types.js';
import { RELATION_TYPES, RelationManager } from './RelationManager.js';

export class AchievementManager {
    constructor(private relationManager: RelationManager) { }

    private achievements: Achievement[] = [];

    addAchievement(achievement: Achievement): void {
        this.achievements.push(achievement);
        const id = this.generateId(achievement.title);
        this.createAchievementRelationships(id, achievement);
    }

    async updateAchievement(id: string, achievement: Achievement): Promise<void> {
        const achievementIndex = this.achievements.findIndex(a => this.generateId(a.title) === id);
        if (achievementIndex === -1)
        {
            throw new Error(`Achievement with ID ${id} not found`);
        }
        this.achievements[achievementIndex] = achievement;
        await this.createAchievementRelationships(id, achievement);
    }

    async deleteAchievement(id: string): Promise<void> {
        const achievementIndex = this.achievements.findIndex(a => this.generateId(a.title) === id);
        if (achievementIndex === -1)
        {
            throw new Error(`Achievement with ID ${id} not found`);
        }
        this.achievements.splice(achievementIndex, 1);
    }

    async getAchievementById(id: string): Promise<Achievement | undefined> {
        return this.achievements.find(a => this.generateId(a.title) === id);
    }

    getAchievements(): Achievement[] {
        return this.achievements;
    }

    getAchievementsByImpact(level: ImpactLevel): Achievement[] {
        return this.achievements.filter(a => a.impactLevel === level);
    }

    searchAchievements(searchTerms: string[]): Achievement[] {
        return this.achievements.filter(achievement =>
            this.matchesSearchTerms(achievement, searchTerms)
        );
    }

    private matchesSearchTerms(achievement: Achievement, searchTerms: string[]): boolean {
        const searchableText = [
            achievement.title.toLowerCase(),
            achievement.description.toLowerCase(),
            achievement.impactLevel.toLowerCase(),
            ...achievement.businessValue.map((v: string) => v.toLowerCase()),
            achievement.deliverableType.toLowerCase(),
            ...achievement.metrics.quantitative.map((m: string) => m.toLowerCase()),
            ...achievement.metrics.qualitative.map((m: string) => m.toLowerCase())
        ].join(' ');

        return searchTerms.every(term => searchableText.includes(term));
    }

    private async createAchievementRelationships(id: string, achievement: Achievement): Promise<void> {
        // Create impact level relationship
        await this.relationManager.createRelation(
            id,
            achievement.impactLevel,
            RELATION_TYPES.HAS_IMPACT
        );

        // Create deliverable type relationship
        await this.relationManager.createRelation(
            id,
            achievement.deliverableType,
            RELATION_TYPES.HAS_TYPE
        );

        // Create business value relationships
        for (const value of achievement.businessValue)
        {
            await this.relationManager.createRelation(
                id,
                value,
                RELATION_TYPES.CONTRIBUTES_TO
            );
        }
    }

    private generateId(title: string): string {
        return title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
}