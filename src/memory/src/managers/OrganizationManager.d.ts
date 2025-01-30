import { BaseEntityManager } from './BaseEntityManager';
import { RelationManager } from './RelationManager';

export type Organization = {
    name: string;
    industry: string;
    size: string;
    type: string;
    location: string;
    description?: string;
    website?: string;
    linkedInUrl?: string;
    media?: string[];
};

export type OrganizationMetadata = {
    industry?: string;
    size?: string;
    type?: string;
    location?: string;
};

export declare class OrganizationManager extends BaseEntityManager<Organization> {
    constructor(relationManager: RelationManager);
    addOrganization(organization: Organization): Promise<void>;
    updateOrganization(id: string, organization: Organization): Promise<void>;
    deleteOrganization(id: string): Promise<void>;
    getOrganizationById(id: string): Promise<Organization | undefined>;
    searchOrganizations(query: string): Promise<Organization[]>;
    filterOrganizations(options: {
        currentOnly?: boolean;
        associatedWith?: string;
    }): Promise<Organization[]>;
    protected generateId(name: string): string;
}