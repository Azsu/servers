import { type DomainExpertise } from '../types.js';

export class DomainExpertiseManager {
    private domains: Map<string, DomainExpertise> = new Map();

    async addDomainExpertise(domains: DomainExpertise[]): Promise<DomainExpertise[]> {
        for (const domain of domains)
        {
            const id = this.generateId(domain.domain);
            this.domains.set(id, domain);
        }
        return domains;
    }

    async searchDomainExpertise(query: string): Promise<DomainExpertise[]> {
        const searchTerms = query.toLowerCase().split(' ');
        return Array.from(this.domains.values()).filter(domain =>
            this.matchesSearchTerms(domain, searchTerms)
        );
    }

    async getDomainsByCategory(category: DomainExpertise['category']): Promise<DomainExpertise[]> {
        return Array.from(this.domains.values()).filter(domain =>
            domain.category === category
        );
    }

    async calculateExpertiseMetrics(domainName: string): Promise<{
        level: string;
        specializations: string[];
        relatedDomains: string[];
    }> {
        const domain = Array.from(this.domains.values()).find(d => d.domain === domainName);
        if (!domain)
        {
            throw new Error(`Domain '${domainName}' not found`);
        }

        return {
            level: domain.level,
            specializations: domain.specializations,
            relatedDomains: await this.findRelatedDomains(domainName)
        };
    }

    private generateId(domain: string): string {
        return domain.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    private matchesSearchTerms(domain: DomainExpertise, searchTerms: string[]): boolean {
        const searchableText = [
            domain.domain.toLowerCase(),
            domain.category.toLowerCase(),
            domain.level.toLowerCase(),
            ...domain.specializations.map(s => s.toLowerCase())
        ].join(' ');

        return searchTerms.every(term => searchableText.includes(term));
    }

    private async createDomainRelationships(domainId: string, domain: DomainExpertise): Promise<void> {
        // Create relationships with skills, experiences, and other domains
        // This would integrate with the RelationManager
    }

    private async findRelatedDomains(domainName: string): Promise<string[]> {
        // Implementation to find related domains based on shared contexts or applications
        return [];
    }
}