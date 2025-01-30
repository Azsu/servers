import { ProficiencyLevel } from '../types.js';
import { BaseEntityManager } from './BaseEntityManager';
import { RelationManager } from './RelationManager';

export type DomainExpertise = {
    domain: string;
    category: string;
    level: ProficiencyLevel;
    specializations: string[];
    description?: string;
    projects?: string[];
    media?: string[];
};

export type DomainMetadata = {
    category?: string;
    level?: ProficiencyLevel;
    specializations?: string[];
};

export declare class DomainExpertiseManager extends BaseEntityManager<DomainExpertise> {
    constructor(relationManager: RelationManager);
    addDomain(domain: DomainExpertise): Promise<void>;
    updateDomain(id: string, domain: DomainExpertise): Promise<void>;
    deleteDomain(id: string): Promise<void>;
    getDomainById(id: string): Promise<DomainExpertise | undefined>;
    getDomains(): Promise<DomainExpertise[]>;
    searchDomains(query: string): Promise<DomainExpertise[]>;
    protected generateId(domain: string): string;
}