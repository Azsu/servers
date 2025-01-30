import { ProficiencyLevel } from '../types.js';
import { BaseEntityManager } from './BaseEntityManager';
import { RelationManager } from './RelationManager';

export type TechnicalImplementation = {
    name: string;
    description: string;
    technologies: string[];
    proficiencyLevel: ProficiencyLevel;
    scope: string;
    architecture?: {
        patterns: string[];
        technologies: string[];
    };
    challenges?: string[];
};

export type ImplementationMetadata = {
    technologies?: string[];
    proficiencyLevel?: ProficiencyLevel;
    scope?: string;
};

export declare class TechnicalImplementationManager extends BaseEntityManager<TechnicalImplementation> {
    constructor(relationManager: RelationManager);
    addImplementation(implementation: TechnicalImplementation, experienceId?: string): Promise<void>;
    updateImplementation(id: string, implementation: TechnicalImplementation, experienceId?: string): Promise<void>;
    deleteImplementation(id: string): Promise<void>;
    getImplementationById(id: string): Promise<TechnicalImplementation | undefined>;
    searchImplementations(query: string): Promise<TechnicalImplementation[]>;
    getImplementationsByTechnology(technology: string): Promise<TechnicalImplementation[]>;
    protected generateId(name: string): string;
}