import { BaseEntityManager } from './BaseEntityManager';
import { RelationManager } from './RelationManager';

export type ProjectScale =
    | "Small"
    | "Medium"
    | "Large"
    | "Enterprise";

export type ImpactLevel =
    | "Low"
    | "Medium"
    | "High"
    | "Critical";

export type Project = {
    projectName: string;
    description?: string;
    skills?: string[];
    media?: string[];
    isCurrent: boolean;
    startDate: string;
    endDate?: string;
    contributors?: string[];
    associatedWith?: string;
};

export type ProjectMetadata = {
    startDate?: string;
    endDate?: string;
    description?: string;
    associatedWith?: string;
};

export declare class ProjectManager extends BaseEntityManager<Project> {
    constructor(relationManager: RelationManager);
    addProject(project: Project): Promise<void>;
    updateProject(id: string, project: Project): Promise<void>;
    deleteProject(id: string): Promise<void>;
    getProjectById(id: string): Promise<Project | undefined>;
    searchProjects(query: string): Promise<Project[]>;
    filterProjects(options: {
        dateRange?: { startDate: string; endDate: string };
        currentOnly?: boolean;
        associatedWith?: string;
        skills?: string[];
    }): Promise<Project[]>;
    protected generateId(projectName: string): string;
}