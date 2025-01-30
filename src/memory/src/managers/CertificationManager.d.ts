import { BaseEntityManager } from './BaseEntityManager';
import { RelationManager } from './RelationManager';

export type LicenseOrCertification = {
    name: string;
    issuingOrganization: string;
    description?: string;
    issueDate: string;
    expirationDate?: string;
    credentialID?: string;
    credentialURL?: string;
    skills?: string[];
    media?: string[];
};

export type CertificationMetadata = {
    issuingOrganization?: string;
    issueDate?: string;
    expirationDate?: string;
    isValid?: boolean;
};

export declare class CertificationManager extends BaseEntityManager<LicenseOrCertification> {
    constructor(relationManager: RelationManager);
    addCertification(certification: LicenseOrCertification): Promise<void>;
    updateCertification(id: string, certification: LicenseOrCertification): Promise<void>;
    deleteCertification(id: string): Promise<void>;
    getCertificationById(id: string): Promise<LicenseOrCertification | undefined>;
    searchCertifications(query: string): Promise<LicenseOrCertification[]>;
    filterCertifications(options: {
        issuingOrganization?: string;
        isValid?: boolean;
    }): Promise<LicenseOrCertification[]>;
    protected generateId(name: string): string;
}