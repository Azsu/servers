/**
 * @file TechnicalImplementationManager.ts
 * @description Manages technical implementations and their relationships with technologies and experiences
 *
 * @baseClassUsage
 * - CRUD operations for implementations
 * - Technology relationship management
 * - Experience linking
 * - Search functionality
 *
 * @specialization
 * - Technology stack tracking
 * - Implementation scope management
 * - Proficiency level tracking
 * - Experience validation
 * - Technology relationship mapping
 * - Implementation search
 *
 * @important
 * This manager provides implementation functionality:
 * - Technical implementation tracking
 * - Technology stack relationships
 * - Experience associations
 * - Proficiency management
 * - Scope tracking
 *
 * @usage
 * // Add implementation
 * await manager.addImplementation({
 *   name: "Cloud Architecture",
 *   technologies: ["AWS", "Kubernetes"],
 *   proficiencyLevel: "Expert",
 *   scope: "Enterprise"
 * }, "exp_123");
 *
 * // Search implementations
 * const results = await manager.searchImplementations("cloud aws");
 */

import { TechnicalImplementation } from '../types.js';
import { RelationManager } from './RelationManager.js';
import { WorkExperienceManager } from './WorkExperienceManager.js';

export class TechnicalImplementationManager {
    constructor(
        private relationManager: RelationManager,
        private workExperienceManager: WorkExperienceManager
    ) { }

    private implementations: TechnicalImplementation[] = [];

    async addImplementation(implementation: TechnicalImplementation, experienceId?: string): Promise<void> {
        this.implementations.push(implementation);
        const implId = this.generateId(implementation.name);
        await this.createTechnologyRelationships(implId, implementation);

        if (experienceId)
        {
            if (await this.validateExperienceId(experienceId))
            {
                await this.relationManager.createImplementationRelations(
                    implId,
                    experienceId,
                    implementation.technologies
                );
            } else
            {
                throw new Error(`Invalid experience ID: ${experienceId}`);
            }
        }
    }

    getImplementations(): TechnicalImplementation[] {
        return this.implementations;
    }

    getImplementationsByTechnology(technology: string): TechnicalImplementation[] {
        const techLower = technology.toLowerCase();
        return this.implementations.filter(impl =>
            impl.technologies.some((t: string) => t.toLowerCase() === techLower)
        );
    }

    async searchImplementations(query: string): Promise<TechnicalImplementation[]> {
        const searchTerms = query.toLowerCase().split(' ');
        return this.implementations.filter(impl =>
            this.matchesSearchTerms(impl, searchTerms)
        );
    }

    private matchesSearchTerms(impl: TechnicalImplementation, searchTerms: string[]): boolean {
        const searchableText = [
            impl.name.toLowerCase(),
            impl.description.toLowerCase(),
            ...impl.technologies.map((t: string) => t.toLowerCase()),
            impl.proficiencyLevel.toLowerCase(),
            impl.scope.toLowerCase()
        ].join(' ');

        return searchTerms.every(term => searchableText.includes(term));
    }

    private async createTechnologyRelationships(implId: string, impl: TechnicalImplementation): Promise<void> {
        // Create relationships for each technology
        for (const tech of impl.technologies)
        {
            await this.relationManager.createRelation(
                implId,
                tech,
                'IMPLEMENTATION_TECHNOLOGY'
            );
        }

        // Create relationship for proficiency level
        await this.relationManager.createRelation(
            implId,
            impl.proficiencyLevel,
            'HAS_PROFICIENCY'
        );

        // Create relationship for implementation scope
        await this.relationManager.createRelation(
            implId,
            impl.scope,
            'HAS_SCOPE'
        );
    }

    private async validateExperienceId(experienceId: string): Promise<boolean> {
        try
        {
            const experience = await this.workExperienceManager.getExperienceById(experienceId);
            return !!experience;
        } catch
        {
            return false;
        }
    }

    private generateId(name: string): string {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    async updateImplementation(id: string, implementation: TechnicalImplementation, experienceId?: string): Promise<void> {
        const implIndex = this.implementations.findIndex(impl => this.generateId(impl.name) === id);
        if (implIndex === -1)
        {
            throw new Error(`Implementation with ID ${id} not found`);
        }

        this.implementations[implIndex] = implementation;
        await this.createTechnologyRelationships(id, implementation);

        if (experienceId)
        {
            if (await this.validateExperienceId(experienceId))
            {
                await this.relationManager.createImplementationRelations(
                    id,
                    experienceId,
                    implementation.technologies
                );
            } else
            {
                throw new Error(`Invalid experience ID: ${experienceId}`);
            }
        }
    }

    async deleteImplementation(id: string): Promise<void> {
        const implIndex = this.implementations.findIndex(impl => this.generateId(impl.name) === id);
        if (implIndex === -1)
        {
            throw new Error(`Implementation with ID ${id} not found`);
        }
        this.implementations.splice(implIndex, 1);
    }

    async getImplementationById(id: string): Promise<TechnicalImplementation | undefined> {
        return this.implementations.find(impl => this.generateId(impl.name) === id);
    }
}