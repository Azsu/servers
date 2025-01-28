import { BusinessValue, ImpactLevel, SearchFilter, SearchResult } from '../types';
export declare class SearchManager {
    private achievementManager;
    private technicalImplementationManager;
    private domainExpertiseManager;
    private professionalContributionManager;
    private relationManager;
    constructor(achievementManager: AchievementManager, technicalImplementationManager: TechnicalImplementationManager, domainExpertiseManager: DomainExpertiseManager, professionalContributionManager: ProfessionalContributionManager, relationManager: RelationManager);
    searchAcrossEntities(query: string, filters?: SearchFilter): Promise<SearchResult[]>;
    searchByTechnology(technology: string): Promise<SearchResult[]>;
    searchByImpactLevel(level: ImpactLevel, businessValues?: BusinessValue[]): Promise<SearchResult[]>;
    private searchAchievements;
    private searchImplementations;
    private searchDomains;
    private searchContributions;
    private rankResults;
    private matchesBusinessValues;
    private formatResults;
    private calculateRelevanceScore;
    private calculateAchievementScore;
    private calculateImplementationScore;
    private applyFilters;
    private isInTimeframe;
    private hasTechnologies;
}
