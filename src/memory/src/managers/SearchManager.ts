/**
 * @file SearchManager.ts
 * @description Manages search operations across different entity types in the knowledge graph
 *
 * @baseClassUsage
 * - Unified search interface
 * - Result ranking and scoring
 * - Filter application
 * - Cross-entity search
 *
 * @specialization
 * - Multi-entity type search
 * - Technology-specific search
 * - Impact-level based search
 * - Business value matching
 * - Relevance scoring
 * - Filter customization
 *
 * @important
 * This manager provides advanced search capabilities:
 * - Unified search across all entities
 * - Specialized search by technology
 * - Impact-level filtering
 * - Result ranking and scoring
 * - Cross-entity relationships
 *
 * @usage
 * // Search across all entities
 * const results = await manager.searchAcrossEntities(
 *   "query",
 *   { timeframe: { start: "2023-01", end: "2023-12" } }
 * );
 *
 * // Search by technology
 * const techResults = await manager.searchByTechnology("React");
 *
 * // Search by impact
 * const impactResults = await manager.searchByImpactLevel(
 *   "High",
 *   ["Revenue", "Innovation"]
 * );
 */

import { z } from 'zod';
import {
    Achievement,
    BusinessValue,
    BusinessValueSchema,
    ImpactLevel,
    ImpactLevelSchema,
    ProficiencyLevelSchema,
    SearchFilter,
    SearchFilterSchema,
    SearchResult,
    TechnicalImplementation
} from '../types.js';
import {
    AchievementManager
} from './AchievementManager.js';
import {
    ContributionManager
} from './ContributionManager.js';
import {
    DomainExpertiseManager
} from './DomainExpertiseManager.js';
import { RelationManager } from './RelationManager.js';
import {
    TechnicalImplementationManager
} from './TechnicalImplementationManager.js';

/**
 * Schema for search tool parameters
 * @description Defines the structure and validation rules for search parameters
 */
export const SearchToolSchema = z.object({
    type: z.enum(['knowledge_graph', 'technology', 'impact', 'domain_expertise']),
    query: z.string().optional(),
    filters: SearchFilterSchema.optional(),
    technology: z.string().optional(),
    impactLevel: ImpactLevelSchema.optional(),
    businessValue: z.array(BusinessValueSchema).optional(),
    domain: z.string().optional(),
    category: z.string().optional(),
    expertiseLevel: ProficiencyLevelSchema.optional()
});

/**
 * Manages search operations across different entity types
 * @description Provides a unified interface for searching across various entity types,
 * with support for filtering, ranking, and specialized search operations
 */
export class SearchManager {
    constructor(
        private achievementManager: AchievementManager,
        private technicalImplementationManager: TechnicalImplementationManager,
        private domainExpertiseManager: DomainExpertiseManager,
        private contributionManager: ContributionManager,
        private relationManager: RelationManager
    ) { }

    /**
     * Search across all entity types
     * @description Performs a unified search across all entity types with optional filtering
     *
     * @param query - Search terms to match against entities
     * @param filters - Optional filters to apply to search results
     * @returns Promise<SearchResult[]> - Ranked and filtered search results
     * @throws Error if search operation fails
     */
    async searchAcrossEntities(query: string, filters?: SearchFilter): Promise<SearchResult[]> {
        const searchTerms = query.toLowerCase().split(' ');
        const results: SearchResult[] = [];

        try
        {
            // Get results from each manager using appropriate search methods
            const achievements = await Promise.resolve(this.achievementManager.searchAchievements(searchTerms));
            const implementations = await this.technicalImplementationManager.searchImplementations(query);
            const domains = await Promise.resolve(this.domainExpertiseManager.searchDomains(query));
            const onlineContributions = await this.contributionManager.searchOnlineContributions(query);
            const professionalContributions = await this.contributionManager.searchProfessionalContributions(query);

            // Format and combine results
            results.push(
                ...this.formatResults(achievements, 'achievement'),
                ...this.formatResults(implementations, 'implementation'),
                ...this.formatResults(domains, 'domain'),
                ...this.formatResults(onlineContributions, 'online_contribution'),
                ...this.formatResults(professionalContributions, 'professional_contribution')
            );

            // Apply any filters
            const filteredResults = filters ? this.applyFilters(results, filters) : results;

            // Return ranked results
            return this.rankResults(filteredResults);
        } catch (error)
        {
            throw new Error(`Search across entities failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Search by technology
     * @description Searches for implementations and related entities using a technology name
     *
     * @param technology - Technology name to search for
     * @returns Promise<SearchResult[]> - Ranked search results related to the technology
     * @throws Error if technology search fails
     */
    async searchByTechnology(technology: string): Promise<SearchResult[]> {
        try
        {
            const results: SearchResult[] = [];
            const techLower = technology.toLowerCase();

            // Get direct technology matches
            const implementations = await this.technicalImplementationManager.searchImplementations(techLower);
            results.push(...this.formatResults(implementations, 'implementation'));

            // Get related technologies through implementation relations
            const relatedImplementations = await Promise.all(
                implementations.map(impl =>
                    this.technicalImplementationManager.searchImplementations(impl.name))
            );

            results.push(...relatedImplementations.flat().map((impl: TechnicalImplementation) => ({
                type: 'implementation',
                item: impl,
                score: this.calculateRelevanceScore(impl, 'implementation') * 0.8 // Lower score for related techs
            })));

            return this.rankResults(results);
        } catch (error)
        {
            throw new Error(`Technology search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Search by impact level
     * @description Searches for achievements with specified impact level and optional business values
     *
     * @param level - Impact level to filter by
     * @param businessValues - Optional business values to further filter results
     * @returns Promise<SearchResult[]> - Filtered search results
     * @throws Error if impact level search fails
     */
    async searchByImpactLevel(level: ImpactLevel, businessValues?: BusinessValue[]): Promise<SearchResult[]> {
        try
        {
            // Get achievements matching impact level
            const achievements = await this.achievementManager.getAchievementsByImpact(level);
            const results = this.formatResults(achievements, 'achievement');

            // Filter by business values if provided
            if (businessValues && businessValues.length > 0)
            {
                return results.filter(result =>
                    this.matchesBusinessValues(result, businessValues)
                );
            }

            return results;
        } catch (error)
        {
            throw new Error(`Impact level search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private rankResults(results: SearchResult[]): SearchResult[] {
        return results.sort((a, b) => b.score - a.score);
    }

    private matchesBusinessValues(result: SearchResult, businessValues: BusinessValue[]): boolean {
        if (result.type !== 'achievement') return false;
        const achievement = result.item as Achievement;
        return businessValues.every(value => achievement.businessValue.includes(value));
    }

    private formatResults(items: any[], type: string): SearchResult[] {
        return items.map(item => ({
            type,
            item,
            score: this.calculateRelevanceScore(item, type)
        }));
    }

    private calculateRelevanceScore(item: any, type: string): number {
        let score = 1.0;

        switch (type)
        {
            case 'achievement':
                score *= this.calculateAchievementScore(item as Achievement);
                break;
            case 'implementation':
                score *= this.calculateImplementationScore(item as TechnicalImplementation);
                break;
            case 'domain':
                score *= 1.0; // Base score for domains
                break;
            case 'online_contribution':
            case 'professional_contribution':
                score *= 1.0; // Base score for contributions
                break;
        }

        return score;
    }

    private calculateAchievementScore(achievement: Achievement): number {
        let score = 1.0;

        // Impact level multiplier
        const impactMultipliers: Record<ImpactLevel, number> = {
            'Low': 1.0,
            'Medium': 1.2,
            'High': 1.6,
            'Critical': 2.0
        };
        score *= impactMultipliers[achievement.impactLevel];

        // Metrics completeness
        score *= (achievement.metrics.quantitative.length + achievement.metrics.qualitative.length) * 0.1 + 1;

        return score;
    }

    private calculateImplementationScore(implementation: TechnicalImplementation): number {
        let score = 1.0;

        // Architecture completeness
        if (implementation.architecture)
        {
            score *= (implementation.architecture.patterns.length * 0.2) + 1;
            score *= (implementation.architecture.technologies.length * 0.1) + 1;
        }

        // Challenges documented
        if (implementation.challenges)
        {
            score *= (implementation.challenges.length * 0.3) + 1;
        }

        return score;
    }

    private applyFilters(results: SearchResult[], filters: SearchFilter): SearchResult[] {
        return results.filter(result => {
            if (filters.excludeTypes?.includes(result.type)) return false;
            if (filters.minScore && result.score < filters.minScore) return false;
            if (filters.timeframe && !this.isInTimeframe(result.item, filters.timeframe)) return false;
            if (filters.technologies && !this.hasTechnologies(result.item, filters.technologies)) return false;
            if (filters.impactLevel && !this.matchesImpactLevel(result.item, filters.impactLevel)) return false;
            return true;
        });
    }

    private isInTimeframe(item: any, timeframe: { start: string; end: string }): boolean {
        // Implementation depends on item type and date fields
        return true; // Placeholder
    }

    private hasTechnologies(item: any, technologies: string[]): boolean {
        if (item.technologies)
        {
            const itemTechs = item.technologies.map((t: string) => t.toLowerCase());
            return technologies.some(tech => itemTechs.includes(tech.toLowerCase()));
        }
        return false;
    }

    private matchesImpactLevel(item: any, impactLevel: ImpactLevel): boolean {
        return item.impactLevel === impactLevel;
    }
}