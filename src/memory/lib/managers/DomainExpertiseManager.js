import { GraphError } from '../errors';
export class DomainExpertiseManager {
    domains = new Map();
    async addDomainExpertise(domains) {
        const results = [];
        for (const domain of domains) {
            const id = this.generateId(domain.name);
            // Validate no duplicate domains
            if (this.domains.has(id)) {
                throw new GraphError(`Domain expertise '${domain.name}' already exists`);
            }
            this.domains.set(id, domain);
            results.push(domain);
            // Create relationships with related skills and experiences
            await this.createDomainRelationships(id, domain);
        }
        return results;
    }
    async searchDomainExpertise(query) {
        const results = [];
        const searchTerms = query.toLowerCase().split(' ');
        for (const domain of this.domains.values()) {
            if (this.matchesSearch(domain, searchTerms)) {
                results.push(domain);
            }
        }
        return results;
    }
    async getDomainsByCategory(category) {
        return Array.from(this.domains.values()).filter(domain => domain.category === category);
    }
    async calculateExpertiseMetrics(domainName) {
        const domain = Array.from(this.domains.values()).find(d => d.name === domainName);
        if (!domain) {
            throw new EntityNotFoundError(`Domain '${domainName}' not found`);
        }
        return {
            totalYears: domain.expertise.yearsOfExperience,
            applications: domain.applications.length,
            contexts: domain.expertise.contexts,
            relatedDomains: await this.findRelatedDomains(domainName)
        };
    }
    matchesSearch(domain, terms) {
        const searchableText = [
            domain.name,
            domain.category,
            ...domain.expertise.contexts,
            ...domain.applications.map(a => `${a.context} ${a.contribution} ${a.impact}`)
        ].join(' ').toLowerCase();
        return terms.every(term => searchableText.includes(term));
    }
    async createDomainRelationships(domainId, domain) {
        // Create relationships with skills, experiences, and other domains
        // This would integrate with the RelationManager
    }
    async findRelatedDomains(domainName) {
        // Implementation to find related domains based on shared contexts or applications
        return [];
    }
    generateId(name) {
        return `domain_${name.toLowerCase().replace(/\s+/g, '_')}`;
    }
}
