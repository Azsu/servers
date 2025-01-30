import { BaseEntityManager } from './BaseEntityManager';
import { RelationManager } from './RelationManager';

export type WorkExperience = {
    title: string;
    employmentType: string;
    companyName: string;
    isCurrentRole: boolean;
    startDate: string;
    endDate?: string;
    location: string;
    locationType: string;
    description: string;
    profileHeadline: string;
    jobSource?: string;
    skills?: string[];
    media?: string[];
};

export type WorkExperienceMetadata = {
    startDate?: string;
    endDate?: string;
    description?: string;
    companyName?: string;
    isCurrentRole?: string;
};

export declare class WorkExperienceManager extends BaseEntityManager<WorkExperience> {
    constructor(relationManager: RelationManager);
    getCurrentExperience(): Promise<WorkExperience | undefined>;
    addWorkExperience(experience: WorkExperience): Promise<void>;
    updateWorkExperience(id: string, experience: WorkExperience): Promise<void>;
    deleteWorkExperience(id: string): Promise<void>;
    getWorkExperienceById(id: string): Promise<WorkExperience | undefined>;
    searchWorkExperiences(query: string): Promise<WorkExperience[]>;
    filterWorkExperiences(options: {
        dateRange?: { startDate: string; endDate: string };
        company?: string;
        currentOnly?: boolean;
    }): Promise<WorkExperience[]>;
    protected generateId(title: string): string;
}