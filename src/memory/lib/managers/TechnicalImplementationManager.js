import { EntityNotFoundError } from '../errors';
export class TechnicalImplementationManager {
    implementations = new Map();
    async addImplementation(implementations) {
        const results = [];
        for (const impl of implementations) {
            // Validate experience ID exists
            if (!await this.validateExperienceId(impl.experienceId)) {
                throw new EntityNotFoundError(`Experience ID ${impl.experienceId} not found`);
            }
            const id = this.generateId(impl.title);
            this.implementations.set(id, impl);
            results.push(impl);
            // Create relationships with technologies and patterns
            await this.createTechnologyRelationships(id, impl);
        }
        return results;
    }
    async searchImplementations(query) {
        const results = [];
        const searchTerms = query.toLowerCase().split(' ');
        for (const impl of this.implementations.values()) {
            if (this.matchesSearch(impl, searchTerms)) {
                results.push(impl);
            }
        }
        return results;
    }
    async getImplementationsByTechnology(technology) {
        return Array.from(this.implementations.values()).filter(impl => impl.architecture.technologies.includes(technology));
    }
    matchesSearch(impl, terms) {
        const searchableText = [
            impl.title,
            ...impl.architecture.patterns,
            ...impl.architecture.technologies,
            ...impl.challenges.map(c => `${c.description} ${c.solution} ${c.outcome}`)
        ].join(' ').toLowerCase();
        return terms.every(term => searchableText.includes(term));
    }
    async createTechnologyRelationships(implId, impl) {
        // Create relationships with skills and technologies in the knowledge graph
        // This would integrate with the RelationManager
    }
    async validateExperienceId(experienceId) {
        // Implementation to validate against WorkExperienceManager
        return true; // Placeholder
    }
    generateId(title) {
        return `impl_${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    }
}
