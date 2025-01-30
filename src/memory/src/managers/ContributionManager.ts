/**
 * @file ContributionManager.ts
 * @description Coordinator for managing different types of contributions (online, professional, certifications)
 *
 * @baseClassUsage
 * - Delegates to specialized managers for each contribution type
 * - Coordinates CRUD operations across contribution types
 * - Manages relationship tracking between contributions
 *
 * @specialization
 * - Online contribution tracking (blogs, articles, repositories)
 * - Professional contribution management (impact tracking)
 * - License and certification handling
 * - Impact level assessment
 * - Credential verification
 * - Media documentation
 *
 * @important
 * This manager coordinates three specialized managers:
 * - OnlineContributionManager: Web presence and content
 * - ProfessionalContributionManager: Work impact tracking
 * - LicenseCertificationManager: Credentials and certifications
 *
 * @usage
 * // Add online contribution
 * await manager.addOnlineContribution([{
 *   type: "Blog Post",
 *   title: "Tech Article",
 *   url: "https://example.com",
 *   dateAdded: "2024-01-01"
 * }]);
 *
 * // Add professional contribution
 * await manager.addProfessionalContribution([{
 *   title: "Process Improvement",
 *   description: "Optimized workflow",
 *   impact: "High",
 *   type: "Process"
 * }]);
 *
 * // Add certification
 * await manager.addLicenseOrCertification([{
 *   name: "AWS Certified",
 *   issuingOrganization: "Amazon",
 *   issueDate: "2024-01-01"
 * }]);
 */

import { z } from 'zod';
import { ImpactLevel } from '../types.js';
import { BaseEntityManager, EntityMapping } from './BaseEntityManager.js';
import { RELATION_TYPES, RelationManager } from './RelationManager.js';

// Define schemas for each contribution type
const OnlineContributionSchema = z.object({
    type: z.string(),
    title: z.string(),
    description: z.string().optional(),
    url: z.string(),
    media: z.array(z.string()).optional(),
    dateAdded: z.string()
});

const ProfessionalContributionSchema = z.object({
    title: z.string(),
    description: z.string(),
    impact: z.enum(['Low', 'Medium', 'High', 'Critical']),
    type: z.string()
});

const LicenseCertificationSchema = z.object({
    name: z.string(),
    issuingOrganization: z.string(),
    description: z.string().optional(),
    issueDate: z.string(),
    expirationDate: z.string().optional(),
    credentialID: z.string().optional(),
    credentialURL: z.string().optional(),
    skills: z.array(z.string()).optional(),
    media: z.array(z.string()).optional()
});

// Define mappings for each type
const OnlineContributionMapping: EntityMapping<z.infer<typeof OnlineContributionSchema>> = {
    schema: OnlineContributionSchema,
    toEntity: (contribution) => ({
        name: contribution.title,
        entityType: "OnlineContribution",
        observations: [
            contribution.description || "",
            contribution.url,
            ...(contribution.media || [])
        ]
    }),
    fromEntity: (entity) => ({
        type: "",
        title: entity.name,
        description: entity.observations[0] || "",
        url: entity.observations[1] || "",
        media: entity.observations.slice(2) || [],
        dateAdded: new Date().toISOString()
    })
};

const ProfessionalContributionMapping: EntityMapping<z.infer<typeof ProfessionalContributionSchema>> = {
    schema: ProfessionalContributionSchema,
    toEntity: (contribution) => ({
        name: contribution.title,
        entityType: "ProfessionalContribution",
        observations: [
            contribution.description || "",
            contribution.impact,
            contribution.type
        ]
    }),
    fromEntity: (entity) => ({
        title: entity.name,
        description: entity.observations[0] || "",
        impact: entity.observations[1] as ImpactLevel,
        type: entity.observations[2]
    })
};

const LicenseCertificationMapping: EntityMapping<z.infer<typeof LicenseCertificationSchema>> = {
    schema: LicenseCertificationSchema,
    toEntity: (item) => ({
        name: item.name,
        entityType: "LicenseOrCertification",
        observations: [
            item.description || "",
            item.issuingOrganization,
            item.issueDate,
            item.expirationDate || "",
            item.credentialID || "",
            item.credentialURL || "",
            ...(item.skills || []),
            ...(item.media || [])
        ]
    }),
    fromEntity: (entity) => ({
        name: entity.name,
        issuingOrganization: entity.observations[1],
        description: entity.observations[0] || "",
        issueDate: entity.observations[2],
        expirationDate: entity.observations[3] || undefined,
        credentialID: entity.observations[4] || undefined,
        credentialURL: entity.observations[5] || undefined,
        skills: entity.observations.slice(6, -2) || [],
        media: entity.observations.slice(-2) || []
    })
};

// Specialized managers for each type
class OnlineContributionManager extends BaseEntityManager<z.infer<typeof OnlineContributionSchema>> {
    constructor(relationManager: RelationManager) {
        super(relationManager, "OnlineContribution", OnlineContributionMapping);
    }
}

class ProfessionalContributionManager extends BaseEntityManager<z.infer<typeof ProfessionalContributionSchema>> {
    constructor(relationManager: RelationManager) {
        super(relationManager, "ProfessionalContribution", ProfessionalContributionMapping);
    }

    protected override registerTools(): void {
        super.registerTools();

        // Register specialized tools
        this.registry.registerTool({
            name: 'get_contributions_by_impact',
            description: 'Get professional contributions by impact level',
            schema: z.object({
                impact: z.enum(['Low', 'Medium', 'High', 'Critical'])
            }),
            handler: async (params) => {
                const results = await this.searchEntities('');
                return results.filter(r => r.impact === params.impact);
            }
        });
    }

    async addEntities(items: z.infer<typeof ProfessionalContributionSchema>[]): Promise<z.infer<typeof ProfessionalContributionSchema>[]> {
        const result = await super.addEntities(items);

        // Create relationships for each contribution
        for (const contribution of items)
        {
            const id = this.generateId(contribution.title);
            await this.createEntityRelation(id, contribution.impact, RELATION_TYPES.HAS_IMPACT);
            await this.createEntityRelation(id, contribution.type, RELATION_TYPES.HAS_TYPE);
        }

        return result;
    }
}

class LicenseCertificationManager extends BaseEntityManager<z.infer<typeof LicenseCertificationSchema>> {
    constructor(relationManager: RelationManager) {
        super(relationManager, "LicenseOrCertification", LicenseCertificationMapping);
    }
}

/**
 * Main ContributionManager that coordinates the specialized managers
 */
export class ContributionManager {
    private onlineManager: OnlineContributionManager;
    private professionalManager: ProfessionalContributionManager;
    private licenseManager: LicenseCertificationManager;

    constructor(relationManager: RelationManager) {
        this.onlineManager = new OnlineContributionManager(relationManager);
        this.professionalManager = new ProfessionalContributionManager(relationManager);
        this.licenseManager = new LicenseCertificationManager(relationManager);
    }

    // Delegate methods to appropriate specialized managers
    async addOnlineContribution(items: z.infer<typeof OnlineContributionSchema>[]): Promise<z.infer<typeof OnlineContributionSchema>[]> {
        return this.onlineManager.addEntities(items);
    }

    async searchOnlineContributions(query: string): Promise<z.infer<typeof OnlineContributionSchema>[]> {
        return this.onlineManager.searchEntities(query);
    }

    async deleteOnlineContribution(ids: string[]): Promise<void> {
        return this.onlineManager.deleteEntities(ids);
    }

    async addProfessionalContribution(items: z.infer<typeof ProfessionalContributionSchema>[]): Promise<z.infer<typeof ProfessionalContributionSchema>[]> {
        return this.professionalManager.addEntities(items);
    }

    async searchProfessionalContributions(query: string): Promise<z.infer<typeof ProfessionalContributionSchema>[]> {
        return this.professionalManager.searchEntities(query);
    }

    async deleteProfessionalContribution(ids: string[]): Promise<void> {
        return this.professionalManager.deleteEntities(ids);
    }

    async addLicenseOrCertification(items: z.infer<typeof LicenseCertificationSchema>[]): Promise<z.infer<typeof LicenseCertificationSchema>[]> {
        return this.licenseManager.addEntities(items);
    }

    async searchLicenseOrCertification(query: string): Promise<z.infer<typeof LicenseCertificationSchema>[]> {
        return this.licenseManager.searchEntities(query);
    }

    async deleteLicenseOrCertification(ids: string[]): Promise<void> {
        return this.licenseManager.deleteEntities(ids);
    }
}