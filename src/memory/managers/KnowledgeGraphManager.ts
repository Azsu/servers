import { GraphOperations } from '../graph-operations.js';
import {
    type Achievement,
    type BusinessValue,
    type DomainExpertise,
    type ImpactLevel,
    type ProfessionalContribution,
    PROFICIENCY_LEVELS,
    type ProficiencyLevel,
    type SearchFilter,
    type SearchResult,
    type TechnicalImplementation
} from '../types.js';
import { AchievementManager } from './AchievementManager.js';
import { DomainExpertiseManager } from './DomainExpertiseManager.js';
import { ProfessionalContributionManager } from './ProfessionalContributionManager.js';
import { RelationManager } from './RelationManager.js';
import { SearchManager } from './SearchManager.js';
import { TechnicalImplementationManager } from './TechnicalImplementationManager.js';

export class KnowledgeGraphManager {
    private achievementManager: AchievementManager;
    private technicalImplementationManager: TechnicalImplementationManager;
    private domainExpertiseManager: DomainExpertiseManager;
    private professionalContributionManager: ProfessionalContributionManager;
    private relationManager: RelationManager;
    private searchManager: SearchManager;
    private graph: GraphOperations;

    constructor() {
        this.achievementManager = new AchievementManager();
        this.technicalImplementationManager = new TechnicalImplementationManager();
        this.domainExpertiseManager = new DomainExpertiseManager();
        this.professionalContributionManager = new ProfessionalContributionManager();
        this.relationManager = new RelationManager();
        this.searchManager = new SearchManager(
            this.achievementManager,
            this.technicalImplementationManager,
            this.domainExpertiseManager,
            this.professionalContributionManager,
            this.relationManager
        );
        this.graph = new GraphOperations();
    }

    // Methods for achievements
    async addAchievement(achievement: Achievement): Promise<void> {
        try
        {
            await this.graph.createEntities([{
                name: achievement.title,
                entityType: 'Achievement',
                observations: [achievement.description],
                metadata: {
                    description: achievement.description
                }
            }]);
        } catch (error)
        {
            throw new Error(`Failed to add achievement: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async searchAchievements(query: string): Promise<Achievement[]> {
        return this.achievementManager.searchAchievements(query);
    }

    // Methods for technical implementations
    async addTechnicalImplementation(implementation: TechnicalImplementation): Promise<void> {
        try
        {
            await this.graph.createEntities([{
                name: implementation.name,
                entityType: 'TechnicalImplementation',
                observations: [implementation.description],
                metadata: {
                    description: implementation.description
                }
            }]);
        } catch (error)
        {
            throw new Error(`Failed to add implementation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async searchImplementations(query: string): Promise<TechnicalImplementation[]> {
        return this.technicalImplementationManager.searchImplementations(query);
    }

    // Methods for domain expertise
    async addDomainExpertise(expertise: DomainExpertise): Promise<void> {
        try
        {
            await this.graph.createEntities([{
                name: expertise.domain,
                entityType: 'DomainExpertise',
                observations: expertise.specializations,
                metadata: {
                    description: expertise.specializations.join(', ')
                }
            }]);
        } catch (error)
        {
            throw new Error(`Failed to add domain expertise: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async searchDomainExpertise(
        domain: string,
        category?: string,
        expertiseLevel?: ProficiencyLevel
    ): Promise<SearchResult[]> {
        try
        {
            const results = await this.searchManager.searchAcrossEntities(domain);
            return results.filter(result => {
                if (!this.isDomainExpertise(result.item)) return false;
                if (category && result.item.category !== category) return false;
                if (expertiseLevel && result.item.level !== expertiseLevel) return false;
                return true;
            });
        } catch (error)
        {
            throw new Error(`Domain expertise search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Methods for professional contributions
    async addProfessionalContribution(contribution: ProfessionalContribution): Promise<void> {
        try
        {
            await this.graph.createEntities([{
                name: contribution.title,
                entityType: 'ProfessionalContribution',
                observations: [contribution.description],
                metadata: {
                    description: contribution.description
                }
            }]);
        } catch (error)
        {
            throw new Error(`Failed to add contribution: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async searchProfessionalContributions(query: string): Promise<ProfessionalContribution[]> {
        return this.professionalContributionManager.searchContributions(query);
    }

    async search(query: string, filters?: SearchFilter): Promise<SearchResult[]> {
        try
        {
            const results = await this.searchManager.searchAcrossEntities(query);
            return this.applyFilters(results, filters);
        } catch (error)
        {
            throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async searchByTechnology(technology: string, filters?: SearchFilter): Promise<SearchResult[]> {
        try
        {
            const results = await this.searchManager.searchByTechnology(technology);
            return this.applyFilters(results, filters);
        } catch (error)
        {
            throw new Error(`Technology search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async searchByImpactLevel(level: ImpactLevel, businessValues?: BusinessValue[]): Promise<SearchResult[]> {
        try
        {
            const results = await this.searchManager.searchByImpactLevel(level);
            if (businessValues?.length)
            {
                return results.filter(result =>
                    this.isAchievement(result.item) &&
                    this.matchesBusinessValues(result.item, businessValues)
                );
            }
            return results;
        } catch (error)
        {
            throw new Error(`Impact level search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Type guards
    private isAchievement(item: unknown): item is Achievement {
        return (item as Achievement).impactLevel !== undefined;
    }

    private isTechnicalImplementation(item: unknown): item is TechnicalImplementation {
        return (item as TechnicalImplementation).technologies !== undefined;
    }

    private isDomainExpertise(item: unknown): item is DomainExpertise {
        return (item as DomainExpertise).domain !== undefined;
    }

    private isProfessionalContribution(item: unknown): item is ProfessionalContribution {
        return (item as ProfessionalContribution).impact !== undefined;
    }

    // Helper methods
    private applyFilters(results: SearchResult[], filters?: SearchFilter): SearchResult[] {
        if (!filters) return results;

        return results.filter(result => {
            if (filters.minScore && result.score < filters.minScore) return false;
            if (filters.technologies && !this.hasTechnologies(result)) return false;
            if (filters.impactLevel && !this.matchesImpactLevel(result, filters.impactLevel)) return false;
            if (filters.timeframe && !this.isInTimeframe(result, filters.timeframe)) return false;
            return true;
        });
    }

    private hasTechnologies(result: SearchResult): boolean {
        return this.isTechnicalImplementation(result.item) &&
            result.item.technologies.length > 0;
    }

    private matchesImpactLevel(result: SearchResult, impactLevel: ImpactLevel): boolean {
        return (this.isAchievement(result.item) && result.item.impactLevel === impactLevel) ||
            (this.isProfessionalContribution(result.item) && result.item.impact === impactLevel);
    }

    private matchesBusinessValues(achievement: Achievement, businessValues: BusinessValue[]): boolean {
        return businessValues.some(value => achievement.businessValue.includes(value));
    }

    private isInTimeframe(result: SearchResult, timeframe: { start: string; end: string }): boolean {
        // Implementation depends on your data structure
        return true;
    }

    private convertLegacyProficiencyLevel(level: string): ProficiencyLevel {
        const normalizedLevel = level.trim().toLowerCase();
        const mapping: Record<string, ProficiencyLevel> = {
            'beginner': 'Junior',
            'junior': 'Junior',
            'intermediate': 'Mid',
            'mid': 'Mid',
            'advanced': 'Senior',
            'senior': 'Senior',
            'lead': 'Lead',
            'expert': 'Expert',
        };

        const convertedLevel = mapping[normalizedLevel];
        if (!convertedLevel)
        {
            throw new Error(
                `Invalid proficiency level: ${level}. Valid levels are: ${PROFICIENCY_LEVELS.join(', ')}`
            );
        }

        return convertedLevel;
    }

    private getProficiencyPrecedence(level: ProficiencyLevel): number {
        const precedence: Record<ProficiencyLevel, number> = {
            'Junior': 1,
            'Mid': 2,
            'Senior': 3,
            'Lead': 4,
            'Expert': 5
        };
        return precedence[level];
    }

    private getProficiencyLevel(precedence: number): ProficiencyLevel {
        if (precedence >= 5) return 'Expert';
        if (precedence >= 4) return 'Lead';
        if (precedence >= 3) return 'Senior';
        if (precedence >= 2) return 'Mid';
        return 'Junior';
    }
}