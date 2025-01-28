import { GraphOperations } from './graph-operations.js';
import {
  LicenseOrCertification,
  LicenseOrCertificationSchema,
  OnlineContribution,
  OnlineContributionSchema,
  ValidationError
} from './types.js';

/**
 * Manages contribution and certification related operations
 */
export class ContributionsManager extends GraphOperations {
  /**
   * Adds online contributions to the graph
   * @param contributions Array of contributions to add
   * @returns Promise<OnlineContribution[]> The added contributions
   * @throws {ValidationError} If contribution validation fails
   */
  async addOnlineContribution(contributions: OnlineContribution[]): Promise<OnlineContribution[]> {
    for (const contribution of contributions)
    {
      try
      {
        OnlineContributionSchema.parse(contribution);
      } catch (error)
      {
        throw new ValidationError(`Invalid contribution data for ${contribution.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const entities = contributions.map(contribution => ({
      name: contribution.title,
      entityType: "OnlineContribution",
      observations: [contribution.description || ""],
      metadata: {
        startDate: contribution.dateAdded,
        description: contribution.description,
      },
    }));

    const createdEntities = await this.createEntities(entities);
    return contributions.filter(contribution =>
      createdEntities.some(entity => entity.name === contribution.title)
    );
  }

  /**
   * Deletes online contributions from the graph
   * @param titles Array of contribution titles to delete
   */
  async deleteOnlineContribution(titles: string[]): Promise<void> {
    await this.deleteEntities(titles);
  }

  /**
   * Searches for online contributions
   * @param query Search query string
   * @returns Promise<OnlineContribution[]> Matching contributions
   */
  async searchOnlineContribution(query: string): Promise<OnlineContribution[]> {
    const graph = await this.loadGraph();
    return graph.entities
      .filter(e => e.entityType === "OnlineContribution" && e.name.toLowerCase().includes(query.toLowerCase()))
      .map(e => ({
        type: "",
        title: e.name,
        description: e.observations[0] || "",
        url: "",
        media: [],
        dateAdded: e.metadata?.startDate || "",
      }));
  }

  /**
   * Adds licenses or certifications to the graph
   * @param items Array of licenses or certifications to add
   * @returns Promise<LicenseOrCertification[]> The added items
   * @throws {ValidationError} If license/certification validation fails
   */
  async addLicenseOrCertification(items: LicenseOrCertification[]): Promise<LicenseOrCertification[]> {
    for (const item of items)
    {
      try
      {
        LicenseOrCertificationSchema.parse(item);
      } catch (error)
      {
        throw new ValidationError(`Invalid license/certification data for ${item.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const entities = items.map(item => ({
      name: item.name,
      entityType: "LicenseOrCertification",
      observations: [item.description || ""],
      metadata: {
        startDate: item.issueDate,
        endDate: item.expirationDate,
        description: item.description,
      },
    }));

    const createdEntities = await this.createEntities(entities);
    return items.filter(item =>
      createdEntities.some(entity => entity.name === item.name)
    );
  }

  /**
   * Deletes licenses or certifications from the graph
   * @param names Array of license/certification names to delete
   */
  async deleteLicenseOrCertification(names: string[]): Promise<void> {
    await this.deleteEntities(names);
  }

  /**
   * Searches for licenses or certifications
   * @param query Search query string
   * @returns Promise<LicenseOrCertification[]> Matching licenses/certifications
   */
  async searchLicenseOrCertification(query: string): Promise<LicenseOrCertification[]> {
    const graph = await this.loadGraph();
    return graph.entities
      .filter(e => e.entityType === "LicenseOrCertification" && e.name.toLowerCase().includes(query.toLowerCase()))
      .map(e => ({
        name: e.name,
        issuingOrganization: "",
        description: e.observations[0] || "",
        issueDate: e.metadata?.startDate || "",
        expirationDate: e.metadata?.endDate,
        credentialID: "",
        credentialURL: "",
        skills: [],
        media: [],
      }));
  }
}