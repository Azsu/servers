import { BaseEntityManager } from './BaseEntityManager';
import { RelationManager } from './RelationManager';

export type Course = {
    name: string;
    platform: string;
    description?: string;
    startDate?: string;
    completionDate?: string;
    certificateUrl?: string;
    skills?: string[];
    media?: string[];
    associatedWith?: string;
};

export type CourseMetadata = {
    platform?: string;
    startDate?: string;
    completionDate?: string;
    associatedWith?: string;
};

export declare class CourseManager extends BaseEntityManager<Course> {
    constructor(relationManager: RelationManager);
    addCourse(course: Course): Promise<void>;
    updateCourse(id: string, course: Course): Promise<void>;
    deleteCourse(id: string): Promise<void>;
    getCourseById(id: string): Promise<Course | undefined>;
    searchCourses(query: string): Promise<Course[]>;
    filterCourses(options: {
        associatedWith?: string;
    }): Promise<Course[]>;
    protected generateId(name: string): string;
}