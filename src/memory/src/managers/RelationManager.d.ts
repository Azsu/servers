import { GraphOperations } from '../graph-operations';
import { EntityType, ReferenceType, SkillLevel } from './types';

export type ExperienceSkillRelation = {
    experienceId: string;
    skillId: string;
    level: SkillLevel;
    context: string;
    startDate?: string;
    endDate?: string;
};

export type ProjectExperienceRelation = {
    projectId: string;
    experienceId: string;
    role: string;
    impact: string;
    responsibilities: string[];
};

export type CrossReferenceRelation = {
    sourceType: EntityType;
    sourceId: string;
    targetType: EntityType;
    targetId: string;
    referenceType: ReferenceType;
    context?: string;
};

export type ContributionExperienceRelation = {
    contributionId: string;
    experienceId: string;
    relevance: string;
    skills: string[];
};

export declare class RelationManager extends GraphOperations {
    createExperienceSkillRelation(relation: ExperienceSkillRelation): Promise<ExperienceSkillRelation>;
    createProjectExperienceRelation(relation: ProjectExperienceRelation): Promise<ProjectExperienceRelation>;
    createCrossReferenceRelation(relation: CrossReferenceRelation): Promise<CrossReferenceRelation>;
    createContributionExperienceRelation(relation: ContributionExperienceRelation): Promise<ContributionExperienceRelation>;
    getSkillsForExperience(experienceId: string): Promise<ExperienceSkillRelation[]>;
    getProjectsForExperience(experienceId: string): Promise<ProjectExperienceRelation[]>;
    getRelatedEntities(entityId: string, entityType: EntityType): Promise<CrossReferenceRelation[]>;
    getContributionsForExperience(experienceId: string): Promise<ContributionExperienceRelation[]>;
    createRelation(fromId: string, toId: string, type: string): Promise<void>;
}

/**
 * Represents a relationship between two entities
 */
export interface Relation {
    from: string;
    to: string;
    relationType: string;
    metadata?: {
        startDate?: string;
        endDate?: string;
        duration?: number;
        description?: string;
        level?: string;
        context?: string;
        role?: string;
        impact?: string;
        responsibilities?: string[];
        relevance?: string;
        skills?: string[];
        [key: string]: any;  // Allow additional fields
    };
}