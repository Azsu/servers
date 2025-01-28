import { type TechnicalImplementation } from '../types.js';

export class TechnicalImplementationManager {
    private implementations: Map<string, TechnicalImplementation> = new Map();

    async addImplementation(implementations: TechnicalImplementation[]): Promise<TechnicalImplementation[]> {
        for (const impl of implementations)
        {
            const id = this.generateId(impl.name);
            this.implementations.set(id, impl);
        }
        return implementations;
    }

    async searchImplementations(query: string): Promise<TechnicalImplementation[]> {
        const searchTerms = query.toLowerCase().split(' ');
        return Array.from(this.implementations.values()).filter(impl =>
            this.matchesSearchTerms(impl, searchTerms)
        );
    }

    async getImplementationsByTechnology(technology: string): Promise<TechnicalImplementation[]> {
        return Array.from(this.implementations.values()).filter(impl =>
            impl.technologies.includes(technology)
        );
    }

    private matchesSearchTerms(impl: TechnicalImplementation, searchTerms: string[]): boolean {
        const searchableText = [
            impl.name.toLowerCase(),
            impl.description.toLowerCase(),
            ...impl.technologies.map(t => t.toLowerCase()),
            impl.proficiencyLevel.toLowerCase(),
            impl.scope.toLowerCase()
        ].join(' ');

        return searchTerms.every(term => searchableText.includes(term));
    }

    private async createTechnologyRelationships(implId: string, impl: TechnicalImplementation): Promise<void> {
        // Create relationships with skills and technologies in the knowledge graph
        // This would integrate with the RelationManager
    }

    private async validateExperienceId(experienceId: string): Promise<boolean> {
        // Implementation to validate against WorkExperienceManager
        return true; // Placeholder
    }

    private generateId(name: string): string {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
}