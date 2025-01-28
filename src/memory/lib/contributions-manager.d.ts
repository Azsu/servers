import { GraphOperations } from './graph-operations.js';
import { LicenseOrCertification, OnlineContribution } from './types.js';
/**
 * Manages contribution and certification related operations
 */
export declare class ContributionsManager extends GraphOperations {
    /**
     * Adds online contributions to the graph
     * @param contributions Array of contributions to add
     * @returns Promise<OnlineContribution[]> The added contributions
     * @throws {ValidationError} If contribution validation fails
     */
    addOnlineContribution(contributions: OnlineContribution[]): Promise<OnlineContribution[]>;
    /**
     * Deletes online contributions from the graph
     * @param titles Array of contribution titles to delete
     */
    deleteOnlineContribution(titles: string[]): Promise<void>;
    /**
     * Searches for online contributions
     * @param query Search query string
     * @returns Promise<OnlineContribution[]> Matching contributions
     */
    searchOnlineContribution(query: string): Promise<OnlineContribution[]>;
    /**
     * Adds licenses or certifications to the graph
     * @param items Array of licenses or certifications to add
     * @returns Promise<LicenseOrCertification[]> The added items
     * @throws {ValidationError} If license/certification validation fails
     */
    addLicenseOrCertification(items: LicenseOrCertification[]): Promise<LicenseOrCertification[]>;
    /**
     * Deletes licenses or certifications from the graph
     * @param names Array of license/certification names to delete
     */
    deleteLicenseOrCertification(names: string[]): Promise<void>;
    /**
     * Searches for licenses or certifications
     * @param query Search query string
     * @returns Promise<LicenseOrCertification[]> Matching licenses/certifications
     */
    searchLicenseOrCertification(query: string): Promise<LicenseOrCertification[]>;
}
