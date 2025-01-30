/**
 * @file DomainExpertiseManager.ts
 * @description Manager for domain expertise and specializations
 *
 * @baseClassUsage
 * - CRUD operations for domain expertise
 * - Relation management with specializations
 * - Proficiency level tracking
 * - Category management
 *
 * @specialization
 * - Domain expertise tracking
 * - Specialization management
 * - Proficiency assessment
 * - Domain categorization
 * - Expertise search and filtering
 * - Relationship mapping
 *
 * @important
 * This manager implements domain expertise functionality:
 * - Domain and specialization tracking
 * - Proficiency level management
 * - Category-based organization
 * - Expertise relationship mapping
 *
 * @usage
 * // Add domain expertise
 * manager.addDomain({
 *   domain: "Software Architecture",
 *   category: "Technical",
 *   level: "Expert",
 *   specializations: ["Microservices", "Cloud Native"]
 * });
 *
 * // Update domain
 * await manager.updateDomain(id, updatedDomain);
 *
 * // Search domains
 * const results = manager.searchDomains("architecture cloud");
 */

import { DomainExpertise } from '../types.js';
import { RELATION_TYPES, RelationManager } from './RelationManager.js';

export class DomainExpertiseManager {
    constructor(private relationManager: RelationManager) { }

    private domains: DomainExpertise[] = [];

    addDomain(domain: DomainExpertise): void {
        this.domains.push(domain);
        const id = this.generateId(domain.domain);
        this.createDomainRelationships(id, domain);
    }

    async updateDomain(id: string, domain: DomainExpertise): Promise<void> {
        const domainIndex = this.domains.findIndex(d => this.generateId(d.domain) === id);
        if (domainIndex === -1)
        {
            throw new Error(`Domain with ID ${id} not found`);
        }
        this.domains[domainIndex] = domain;
        await this.createDomainRelationships(id, domain);
    }

    async deleteDomain(id: string): Promise<void> {
        const domainIndex = this.domains.findIndex(d => this.generateId(d.domain) === id);
        if (domainIndex === -1)
        {
            throw new Error(`Domain with ID ${id} not found`);
        }
        this.domains.splice(domainIndex, 1);
    }

    async getDomainById(id: string): Promise<DomainExpertise | undefined> {
        return this.domains.find(d => this.generateId(d.domain) === id);
    }

    getDomains(): DomainExpertise[] {
        return this.domains;
    }

    searchDomains(query: string): DomainExpertise[] {
        const searchTerms = query.toLowerCase().split(' ');
        return this.domains.filter(domain =>
            this.matchesSearchTerms(domain, searchTerms)
        );
    }

    private matchesSearchTerms(domain: DomainExpertise, searchTerms: string[]): boolean {
        const searchableText = [
            domain.domain.toLowerCase(),
            domain.category.toLowerCase(),
            ...domain.specializations.map((s: string) => s.toLowerCase())
        ].join(' ');

        return searchTerms.every(term => searchableText.includes(term));
    }

    private async createDomainRelationships(id: string, domain: DomainExpertise): Promise<void> {
        // Create relationships for specializations
        for (const specialization of domain.specializations)
        {
            await this.relationManager.createRelation(
                id,
                specialization,
                RELATION_TYPES.DOMAIN_SKILL
            );
        }

        // Create relationship for proficiency level
        await this.relationManager.createRelation(
            id,
            domain.level,
            RELATION_TYPES.HAS_PROFICIENCY
        );

        // Create relationship for category
        await this.relationManager.createRelation(
            id,
            domain.category,
            RELATION_TYPES.HAS_TYPE
        );
    }

    private generateId(domain: string): string {
        return domain.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
}