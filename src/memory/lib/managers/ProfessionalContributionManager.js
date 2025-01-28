import { GraphError } from '../errors';
export class ProfessionalContributionManager {
    contributions = new Map();
    async addContribution(contributions) {
        const results = [];
        for (const contribution of contributions) {
            const id = this.generateId(contribution.content.title);
            if (this.contributions.has(id)) {
                throw new GraphError(`Contribution '${contribution.content.title}' already exists`);
            }
            this.contributions.set(id, contribution);
            results.push(contribution);
            // Create relationships with technologies and topics
            await this.createContributionRelationships(id, contribution);
        }
        return results;
    }
    async searchContributions(query) {
        const results = [];
        const searchTerms = query.toLowerCase().split(' ');
        for (const contribution of this.contributions.values()) {
            if (this.matchesSearch(contribution, searchTerms)) {
                results.push(contribution);
            }
        }
        return results;
    }
    async getContributionsByType(type) {
        return Array.from(this.contributions.values())
            .filter(contribution => contribution.type === type);
    }
    async getContributionsByTopic(topic) {
        return Array.from(this.contributions.values())
            .filter(contribution => contribution.technical_depth.topics.includes(topic));
    }
    matchesSearch(contribution, terms) {
        const searchableText = [
            contribution.content.title,
            contribution.content.summary,
            contribution.type,
            ...contribution.technical_depth.topics,
            ...contribution.technical_depth.technologies,
            contribution.impact.reach,
            ...(contribution.impact.feedback || [])
        ].join(' ').toLowerCase();
        return terms.every(term => searchableText.includes(term));
    }
    async createContributionRelationships(contributionId, contribution) {
        // Create relationships with skills, technologies, and domains
        // This would integrate with the RelationManager
    }
    generateId(title) {
        return `contribution_${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    }
}
