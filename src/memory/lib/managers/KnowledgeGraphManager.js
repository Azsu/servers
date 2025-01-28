import { GraphOperations } from '../graph-operations';
import { PROFICIENCY_LEVELS } from '../types';
import { AchievementManager } from './AchievementManager';
import { DomainExpertiseManager } from './DomainExpertiseManager';
import { ProfessionalContributionManager } from './ProfessionalContributionManager';
import { RelationManager } from './RelationManager';
import { SearchManager } from './SearchManager';
import { TechnicalImplementationManager } from './TechnicalImplementationManager';
export class KnowledgeGraphManager {
    achievementManager;
    technicalImplementationManager;
    domainExpertiseManager;
    professionalContributionManager;
    relationManager;
    searchManager;
    graph;
    constructor() {
        this.achievementManager = new AchievementManager();
        this.technicalImplementationManager = new TechnicalImplementationManager();
        this.domainExpertiseManager = new DomainExpertiseManager();
        this.professionalContributionManager = new ProfessionalContributionManager();
        this.relationManager = new RelationManager();
        this.searchManager = new SearchManager(this.achievementManager, this.technicalImplementationManager, this.domainExpertiseManager, this.professionalContributionManager, this.relationManager);
        this.graph = new GraphOperations();
    }
    // Methods for achievements
    async addAchievement(achievement) {
        try {
            await this.graph.createEntities([{
                    name: achievement.title,
                    entityType: 'Achievement',
                    observations: [achievement.description],
                    metadata: {
                        description: achievement.description
                    }
                }]);
        }
        catch (error) {
            throw new Error(`Failed to add achievement: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async searchAchievements(query) {
        return this.achievementManager.searchAchievements(query);
    }
    // Methods for technical implementations
    async addTechnicalImplementation(implementation) {
        try {
            await this.graph.createEntities([{
                    name: implementation.name,
                    entityType: 'TechnicalImplementation',
                    observations: [implementation.description],
                    metadata: {
                        description: implementation.description
                    }
                }]);
        }
        catch (error) {
            throw new Error(`Failed to add implementation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async searchImplementations(query) {
        return this.technicalImplementationManager.searchImplementations(query);
    }
    // Methods for domain expertise
    async addDomainExpertise(expertise) {
        try {
            await this.graph.createEntities([{
                    name: expertise.domain,
                    entityType: 'DomainExpertise',
                    observations: expertise.specializations,
                    metadata: {
                        description: expertise.specializations.join(', ')
                    }
                }]);
        }
        catch (error) {
            throw new Error(`Failed to add domain expertise: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async searchDomainExpertise(domain, category, expertiseLevel) {
        try {
            const results = await this.searchManager.searchAcrossEntities(domain);
            return results.filter(result => {
                if (!this.isDomainExpertise(result.item))
                    return false;
                if (category && result.item.category !== category)
                    return false;
                if (expertiseLevel && result.item.level !== expertiseLevel)
                    return false;
                return true;
            });
        }
        catch (error) {
            throw new Error(`Domain expertise search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Methods for professional contributions
    async addProfessionalContribution(contribution) {
        try {
            await this.graph.createEntities([{
                    name: contribution.title,
                    entityType: 'ProfessionalContribution',
                    observations: [contribution.description],
                    metadata: {
                        description: contribution.description
                    }
                }]);
        }
        catch (error) {
            throw new Error(`Failed to add contribution: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async searchProfessionalContributions(query) {
        return this.professionalContributionManager.searchContributions(query);
    }
    async search(query, filters) {
        try {
            const results = await this.searchManager.searchAcrossEntities(query);
            return this.applyFilters(results, filters);
        }
        catch (error) {
            throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async searchByTechnology(technology, filters) {
        try {
            const results = await this.searchManager.searchByTechnology(technology);
            return this.applyFilters(results, filters);
        }
        catch (error) {
            throw new Error(`Technology search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async searchByImpactLevel(level, businessValues) {
        try {
            const results = await this.searchManager.searchByImpactLevel(level);
            if (businessValues?.length) {
                return results.filter(result => this.isAchievement(result.item) &&
                    this.matchesBusinessValues(result.item, businessValues));
            }
            return results;
        }
        catch (error) {
            throw new Error(`Impact level search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Type guards
    isAchievement(item) {
        return item.impactLevel !== undefined;
    }
    isTechnicalImplementation(item) {
        return item.technologies !== undefined;
    }
    isDomainExpertise(item) {
        return item.domain !== undefined;
    }
    isProfessionalContribution(item) {
        return item.impact !== undefined;
    }
    // Helper methods
    applyFilters(results, filters) {
        if (!filters)
            return results;
        return results.filter(result => {
            if (filters.minScore && result.score < filters.minScore)
                return false;
            if (filters.technologies && !this.hasTechnologies(result))
                return false;
            if (filters.impactLevel && !this.matchesImpactLevel(result, filters.impactLevel))
                return false;
            if (filters.timeframe && !this.isInTimeframe(result, filters.timeframe))
                return false;
            return true;
        });
    }
    hasTechnologies(result) {
        return this.isTechnicalImplementation(result.item) &&
            result.item.technologies.length > 0;
    }
    matchesImpactLevel(result, impactLevel) {
        return (this.isAchievement(result.item) && result.item.impactLevel === impactLevel) ||
            (this.isProfessionalContribution(result.item) && result.item.impact === impactLevel);
    }
    matchesBusinessValues(achievement, businessValues) {
        return businessValues.some(value => achievement.businessValue.includes(value));
    }
    isInTimeframe(result, timeframe) {
        // Implementation depends on your data structure
        return true;
    }
    convertLegacyProficiencyLevel(level) {
        const normalizedLevel = level.trim().toLowerCase();
        const mapping = {
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
        if (!convertedLevel) {
            throw new Error(`Invalid proficiency level: ${level}. Valid levels are: ${PROFICIENCY_LEVELS.join(', ')}`);
        }
        return convertedLevel;
    }
    getProficiencyPrecedence(level) {
        const precedence = {
            'Junior': 1,
            'Mid': 2,
            'Senior': 3,
            'Lead': 4,
            'Expert': 5
        };
        return precedence[level];
    }
    getProficiencyLevel(precedence) {
        if (precedence >= 5)
            return 'Expert';
        if (precedence >= 4)
            return 'Lead';
        if (precedence >= 3)
            return 'Senior';
        if (precedence >= 2)
            return 'Mid';
        return 'Junior';
    }
}
