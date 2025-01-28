import { DomainExpertise } from '../types';
export declare class DomainExpertiseManager {
    private domains;
    addDomainExpertise(domains: DomainExpertise[]): Promise<DomainExpertise[]>;
    searchDomainExpertise(query: string): Promise<DomainExpertise[]>;
    getDomainsByCategory(category: DomainExpertise['category']): Promise<DomainExpertise[]>;
    calculateExpertiseMetrics(domainName: string): Promise<{
        totalYears: number;
        applications: number;
        contexts: string[];
        relatedDomains: string[];
    }>;
    private matchesSearch;
    private createDomainRelationships;
    private findRelatedDomains;
    private generateId;
}
