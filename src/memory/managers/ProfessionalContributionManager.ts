import { type ProfessionalContribution } from '../types';

export class ProfessionalContributionManager {
    private contributions: Map<string, ProfessionalContribution> = new Map();

    async addContribution(contributions: ProfessionalContribution[]): Promise<ProfessionalContribution[]> {
        for (const contribution of contributions)
        {
            const id = this.generateId(contribution.title);
            this.contributions.set(id, contribution);
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

    async getContributionsByTopic(topic: string): Promise<ProfessionalContribution[]> {
        return Array.from(this.contributions.values())
            .filter(contribution =>
                contribution.technical_depth.topics.includes(topic)
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
        // Create relationships with skills, technologies, and domains
        // This would integrate with the RelationManager
    }
}