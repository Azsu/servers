import { BaseEntityManager } from './BaseEntityManager';
import { RelationManager } from './RelationManager';

export type ReferenceType =
    | "SUPPORTS"
    | "PREREQUISITES"
    | "LEADS_TO"
    | "RELATED";

export type Reference = {
    name: string;
    title: string;
    organization: string;
    relationship: string;
    contact: {
        email?: string;
        phone?: string;
        linkedIn?: string;
    };
    description?: string;
    isPublic: boolean;
};

export type ReferenceMetadata = {
    organization?: string;
    relationship?: string;
    isPublic?: boolean;
};

export declare class ReferenceManager extends BaseEntityManager<Reference> {
    constructor(relationManager: RelationManager);
    addReference(reference: Reference): Promise<void>;
    updateReference(id: string, reference: Reference): Promise<void>;
    deleteReference(id: string): Promise<void>;
    getReferenceById(id: string): Promise<Reference | undefined>;
    searchReferences(query: string): Promise<Reference[]>;
    filterReferences(options: {
        organization?: string;
        relation?: string;
    }): Promise<Reference[]>;
    protected generateId(name: string): string;
}