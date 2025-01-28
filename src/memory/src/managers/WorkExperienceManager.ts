import { WorkExperience } from '../types.js';
import { RELATION_TYPES, RelationManager } from './RelationManager.js';

export class WorkExperienceManager {
    constructor(private relationManager: RelationManager) { }

    private experiences: Map<string, WorkExperience> = new Map();

    async addExperience(experience: WorkExperience): Promise<void> {
        const id = this.generateId(experience.title);
        this.experiences.set(id, experience);
        await this.createExperienceRelationships(id, experience);
    }

    async updateExperience(id: string, experience: WorkExperience): Promise<void> {
        if (!this.experiences.has(id))
        {
            throw new Error(`Experience with ID ${id} not found`);
        }
        this.experiences.set(id, experience);
        await this.createExperienceRelationships(id, experience);
    }

    async deleteExperience(id: string): Promise<void> {
        if (!this.experiences.has(id))
        {
            throw new Error(`Experience with ID ${id} not found`);
        }
        this.experiences.delete(id);
    }

    async getExperienceById(id: string): Promise<WorkExperience | undefined> {
        return this.experiences.get(id);
    }

    getExperiences(): WorkExperience[] {
        return Array.from(this.experiences.values());
    }

    async searchExperiences(query: string): Promise<WorkExperience[]> {
        const searchTerms = query.toLowerCase().split(' ');
        return Array.from(this.experiences.values()).filter(exp =>
            this.matchesSearchTerms(exp, searchTerms)
        );
    }

    async filterByDateRange(startDate: string, endDate: string): Promise<WorkExperience[]> {
        const start = new Date(startDate);
        const end = new Date(endDate);

        return Array.from(this.experiences.values()).filter(exp => {
            const expStart = new Date(exp.startDate);
            const expEnd = exp.endDate ? new Date(exp.endDate) : new Date();
            return expStart >= start && expEnd <= end;
        });
    }

    async filterByCompany(companyName: string): Promise<WorkExperience[]> {
        const normalizedCompany = companyName.toLowerCase();
        return Array.from(this.experiences.values()).filter(exp =>
            exp.companyName.toLowerCase().includes(normalizedCompany)
        );
    }

    async getCurrentExperience(): Promise<WorkExperience | undefined> {
        return Array.from(this.experiences.values()).find(exp => exp.isCurrentRole);
    }

    private matchesSearchTerms(experience: WorkExperience, searchTerms: string[]): boolean {
        const searchableText = [
            experience.title.toLowerCase(),
            experience.description.toLowerCase(),
            experience.companyName.toLowerCase(),
            experience.location.toLowerCase(),
            experience.profileHeadline.toLowerCase(),
            ...(experience.skills || []).map(s => s.toLowerCase())
        ].join(' ');

        return searchTerms.every(term => searchableText.includes(term));
    }

    private async createExperienceRelationships(id: string, experience: WorkExperience): Promise<void> {
        // Create relationships for each skill
        if (experience.skills)
        {
            for (const skill of experience.skills)
            {
                await this.relationManager.createRelation(
                    id,
                    skill,
                    RELATION_TYPES.USES
                );
            }
        }

        // Create company relationship
        await this.relationManager.createRelation(
            id,
            experience.companyName,
            RELATION_TYPES.WORKS_AT
        );

        // Create location relationship
        await this.relationManager.createRelation(
            id,
            experience.location,
            RELATION_TYPES.LOCATED_AT
        );
    }

    private generateId(title: string): string {
        return title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
}