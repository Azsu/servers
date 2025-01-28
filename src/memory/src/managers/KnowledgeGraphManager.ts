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
import { WorkExperienceManager } from './WorkExperienceManager.js';

export class KnowledgeGraphManager {
    private achievementManager: AchievementManager;
    private technicalImplementationManager: TechnicalImplementationManager;
    private domainExpertiseManager: DomainExpertiseManager;
    private professionalContributionManager: ProfessionalContributionManager;
    private relationManager: RelationManager;
    private searchManager: SearchManager;
    private graph: GraphOperations;
    private workExperienceManager: WorkExperienceManager;

    constructor() {
        this.relationManager = new RelationManager();
        this.workExperienceManager = new WorkExperienceManager(this.relationManager);
        this.achievementManager = new AchievementManager(this.relationManager);
        this.technicalImplementationManager = new TechnicalImplementationManager(
            this.relationManager,
            this.workExperienceManager
        );
        this.domainExpertiseManager = new DomainExpertiseManager(this.relationManager);
        this.professionalContributionManager = new ProfessionalContributionManager(this.relationManager);
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
        const searchTerms = query.toLowerCase().split(' ');
        return this.achievementManager.searchAchievements(searchTerms);
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
            return await this.applyFilters(results, filters);
        } catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Search failed: ${errorMessage}`);
        }
    }

    async searchByTechnology(technology: string, filters?: SearchFilter): Promise<SearchResult[]> {
        try
        {
            const results = await this.searchManager.searchByTechnology(technology);
            return await this.applyFilters(results, filters);
        } catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Technology search failed: ${errorMessage}`);
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
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Impact level search failed: ${errorMessage}`);
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
    private async applyFilters(results: SearchResult[], filters?: SearchFilter): Promise<SearchResult[]> {
        if (!filters) return results;

        const filteredResults = [];
        for (const result of results)
        {
            if (filters.minScore && result.score < filters.minScore) continue;
            if (filters.technologies && !this.hasTechnologies(result)) continue;
            if (filters.impactLevel && !this.matchesImpactLevel(result, filters.impactLevel)) continue;
            if (filters.timeframe && !(await this.isInTimeframe(result, filters.timeframe))) continue;
            filteredResults.push(result);
        }
        return filteredResults;
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

    private async isInTimeframe(result: SearchResult, timeframe: { start: string; end: string }): Promise<boolean> {
        if (!timeframe.start || !timeframe.end)
        {
            return false;
        }

        const startTimestamp = Date.parse(timeframe.start);
        const endTimestamp = Date.parse(timeframe.end);
        if (isNaN(startTimestamp) || isNaN(endTimestamp))
        {
            return false;
        }

        const startDate = new Date(startTimestamp);
        const endDate = new Date(endTimestamp);

        // Get entity name based on type
        let entityName = '';
        if (this.isAchievement(result.item))
        {
            entityName = result.item.title;
        } else if (this.isTechnicalImplementation(result.item))
        {
            entityName = result.item.name;
        } else if (this.isDomainExpertise(result.item))
        {
            entityName = result.item.domain;
        } else if (this.isProfessionalContribution(result.item))
        {
            entityName = result.item.title;
        }

        if (!entityName)
        {
            return false;
        }

        try
        {
            const graph = await this.graph.openNodes([entityName]);
            const entity = graph.entities.find(e => e.name === entityName);
            if (!entity?.metadata?.startDate)
            {
                return false;
            }

            const itemTimestamp = Date.parse(entity.metadata.startDate);
            if (isNaN(itemTimestamp))
            {
                return false;
            }
            const itemDate = new Date(itemTimestamp);
            return itemDate >= startDate && itemDate <= endDate;
        } catch (error)
        {
            console.error(`Error checking timeframe for ${entityName}:`, error);
            return false;
        }
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