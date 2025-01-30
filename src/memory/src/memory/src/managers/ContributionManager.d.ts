import { BaseEntityManager } from './BaseEntityManager';
import { RelationManager } from './RelationManager';

export type OnlineContribution = {
    type: string;
    title: string;
    description?: string;
    url: string;
    media?: string[];
    dateAdded: string;
};

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

export type ContributionMetadata = {
    type?: string;
    dateAdded?: string;
    issueDate?: string;
    expirationDate?: string;
    description?: string;
};

export declare class ContributionManager extends BaseEntityManager<OnlineContribution | LicenseOrCertification> {
    constructor(relationManager: RelationManager);
    addOnlineContribution(contribution: OnlineContribution): Promise<void>;
    addCertification(certification: LicenseOrCertification): Promise<void>;
    updateContribution(id: string, contribution: OnlineContribution | LicenseOrCertification): Promise<void>;
    deleteContribution(id: string): Promise<void>;
    getContributionById(id: string): Promise<OnlineContribution | LicenseOrCertification | undefined>;
    searchContributions(query: string): Promise<(OnlineContribution | LicenseOrCertification)[]>;
    filterContributions(options: {
        type?: string;
        dateRange?: { startDate: string; endDate: string };
        issuingOrganization?: string;
        isValid?: boolean;
    }): Promise<(OnlineContribution | LicenseOrCertification)[]>;
    protected generateId(title: string): string;
}