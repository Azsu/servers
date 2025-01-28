import { GraphOperations } from './graph-operations.js';
import { CareerBreak, Course, EducationExperience, HonorOrAward, Organization, Project, Reference, WorkExperience } from './types.js';
/**
 * Manages entity-specific operations extending core graph functionality
 */
export declare class EntityManager extends GraphOperations {
    /**
     * Creates an entity from a specific type
     * @param entityType Type of entity to create
     * @param name Name of the entity
     * @param description Description or primary observation
     * @returns Promise<Entity> The created entity
     */
    private createEntityOfType;
    /**
     * Searches entities of a specific type
     * @param entityType Type of entities to search
     * @param query Search query string
     * @returns Promise<Entity[]> Matching entities
     */
    private searchEntitiesByType;
    /**
     * Adds work experiences to the graph
     * @param experiences Array of work experiences to add
     * @returns Promise<WorkExperience[]> The added experiences
     */
    addWorkExperience(experiences: WorkExperience[]): Promise<WorkExperience[]>;
    /**
     * Deletes work experiences from the graph
     * @param titles Array of work experience titles to delete
     */
    deleteWorkExperience(titles: string[]): Promise<void>;
    /**
     * Searches for work experiences
     * @param query Search query string
     * @returns Promise<WorkExperience[]> Matching work experiences
     */
    searchWorkExperience(query: string): Promise<WorkExperience[]>;
    /**
     * Adds education experiences to the graph
     * @param experiences Array of education experiences to add
     * @returns Promise<EducationExperience[]> The added experiences
     */
    addEducationExperience(experiences: EducationExperience[]): Promise<EducationExperience[]>;
    /**
     * Deletes education experiences from the graph
     * @param schools Array of school names to delete
     */
    deleteEducationExperience(schools: string[]): Promise<void>;
    /**
     * Searches for education experiences
     * @param query Search query string
     * @returns Promise<EducationExperience[]> Matching education experiences
     */
    searchEducationExperience(query: string): Promise<EducationExperience[]>;
    /**
     * Adds career breaks to the graph
     * @param breaks Array of career breaks to add
     * @returns Promise<CareerBreak[]> The added career breaks
     */
    addCareerBreak(breaks: CareerBreak[]): Promise<CareerBreak[]>;
    /**
     * Deletes career breaks from the graph
     * @param types Array of career break types to delete
     */
    deleteCareerBreak(types: string[]): Promise<void>;
    /**
     * Searches for career breaks
     * @param query Search query string
     * @returns Promise<CareerBreak[]> Matching career breaks
     */
    searchCareerBreak(query: string): Promise<CareerBreak[]>;
    /**
     * Adds projects to the graph
     * @param projects Array of projects to add
     * @returns Promise<Project[]> The added projects
     */
    addProject(projects: Project[]): Promise<Project[]>;
    /**
     * Deletes projects from the graph
     * @param projectNames Array of project names to delete
     */
    deleteProject(projectNames: string[]): Promise<void>;
    /**
     * Searches for projects
     * @param query Search query string
     * @returns Promise<Project[]> Matching projects
     */
    searchProject(query: string): Promise<Project[]>;
    /**
     * Adds courses to the graph
     * @param courses Array of courses to add
     * @returns Promise<Course[]> The added courses
     */
    addCourse(courses: Course[]): Promise<Course[]>;
    /**
     * Deletes courses from the graph
     * @param courseNames Array of course names to delete
     */
    deleteCourse(courseNames: string[]): Promise<void>;
    /**
     * Searches for courses
     * @param query Search query string
     * @returns Promise<Course[]> Matching courses
     */
    searchCourse(query: string): Promise<Course[]>;
    /**
     * Adds references to the graph
     * @param references Array of references to add
     * @returns Promise<Reference[]> The added references
     */
    addReference(references: Reference[]): Promise<Reference[]>;
    /**
     * Deletes references from the graph
     * @param names Array of reference names to delete
     */
    deleteReference(names: string[]): Promise<void>;
    /**
     * Searches for references
     * @param query Search query string
     * @returns Promise<Reference[]> Matching references
     */
    searchReference(query: string): Promise<Reference[]>;
    /**
     * Adds organizations to the graph
     * @param orgs Array of organizations to add
     * @returns Promise<Organization[]> The added organizations
     */
    addOrganization(orgs: Organization[]): Promise<Organization[]>;
    /**
     * Deletes organizations from the graph
     * @param names Array of organization names to delete
     */
    deleteOrganization(names: string[]): Promise<void>;
    /**
     * Searches for organizations
     * @param query Search query string
     * @returns Promise<Organization[]> Matching organizations
     */
    searchOrganization(query: string): Promise<Organization[]>;
    /**
     * Adds honors or awards to the graph
     * @param items Array of honors or awards to add
     * @returns Promise<HonorOrAward[]> The added honors or awards
     */
    addHonorOrAward(items: HonorOrAward[]): Promise<HonorOrAward[]>;
    /**
     * Deletes honors or awards from the graph
     * @param titles Array of honor or award titles to delete
     */
    deleteHonorOrAward(titles: string[]): Promise<void>;
    /**
     * Searches for honors or awards
     * @param query Search query string
     * @returns Promise<HonorOrAward[]> Matching honors or awards
     */
    searchHonorOrAward(query: string): Promise<HonorOrAward[]>;
}
