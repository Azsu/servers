import { BaseEntityManager } from './BaseEntityManager';
import { RelationManager } from './RelationManager';

export type EducationExperience = {
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string;
    grade?: string;
    activitiesAndSocieties?: string[];
    description?: string;
    skills?: string[];
    media?: string[];
};

export type EducationMetadata = {
    startDate?: string;
    endDate?: string;
    description?: string;
    grade?: string;
};

export declare class EducationManager extends BaseEntityManager<EducationExperience> {
    constructor(relationManager: RelationManager);
    addEducation(education: EducationExperience): Promise<void>;
    updateEducation(id: string, education: EducationExperience): Promise<void>;
    deleteEducation(id: string): Promise<void>;
    getEducationById(id: string): Promise<EducationExperience | undefined>;
    searchEducation(query: string): Promise<EducationExperience[]>;
    filterEducation(options: {
        dateRange?: { startDate: string; endDate: string };
        school?: string;
        degree?: string;
    }): Promise<EducationExperience[]>;
    protected generateId(school: string): string;
}