import { ProfessionalContribution } from '../types.js';
import { RelationManager } from './RelationManager.js';

export class ProfessionalContributionManager {
    constructor(private relationManager: RelationManager) { }

    private contributions: Map<string, ProfessionalContribution> = new Map();

    async addContribution(contributions: ProfessionalContribution[]): Promise<ProfessionalContribution[]> {
        for (const contribution of contributions)
        {
            const id = this.generateId(contribution.title);
            this.contributions.set(id, contribution);
            await this.createContributionRelationships(id, contribution);
        }
        return contributions;
    }

    async searchContributions(query: string): Promise<ProfessionalContribution[]> {
        const searchTerms = query.toLowerCase().split(' ');
        return Array.from(this.contributions.values()).filter(contribution =>
            this.matchesSearchTerms(contribution, searchTerms)
        );
    }

    async getContributionsByType(type: ProfessionalContribution['type']): Promise<ProfessionalContribution[]> {
        return Array.from(this.contributions.values())
            .filter(contribution => contribution.type === type);
    }

    async getContributionsByDescription(searchText: string): Promise<ProfessionalContribution[]> {
        const searchLower = searchText.toLowerCase();
        return Array.from(this.contributions.values())
            .filter(contribution =>
                contribution.description.toLowerCase().includes(searchLower)
            );
    }

    private generateId(title: string): string {
        return title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    private matchesSearchTerms(contribution: ProfessionalContribution, searchTerms: string[]): boolean {
        const searchableText = [
            contribution.title.toLowerCase(),
            contribution.description.toLowerCase(),
            contribution.impact.toLowerCase(),
            contribution.type.toLowerCase()
        ].join(' ');

        return searchTerms.every(term => searchableText.includes(term));
    }

    private async createContributionRelationships(
        contributionId: string,
        contribution: ProfessionalContribution
    ): Promise<void> {
        // Create impact level relationship
        await this.relationManager.createRelation(
            contributionId,
            contribution.impact,
            'HAS_IMPACT'
        );

        // Create type relationship
        await this.relationManager.createRelation(
            contributionId,
            contribution.type,
            'HAS_TYPE'
        );
    }
}