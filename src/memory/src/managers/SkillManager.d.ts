import { BaseEntityManager } from './BaseEntityManager';
import { RelationManager } from './RelationManager';
import { ProficiencyLevel, ProjectScale, SkillCategory, SkillFunction } from './types';

export type SkillLevel =
    | "BEGINNER"
    | "INTERMEDIATE"
    | "ADVANCED"
    | "EXPERT";

export type SkillCategory =
    | "Technical"
    | "Programming Language"
    | "Framework"
    | "Platform"
    | "Protocol"
    | "Methodology"
    | "Domain Knowledge"
    | "Soft Skill";

export type SkillFunction =
    | "Development"
    | "Architecture"
    | "Testing"
    | "Management"
    | "Consulting";

export type Skill = {
    skillName: string;
    category: SkillCategory;
    subcategory?: string;
    relationships: {
        complementarySkills: string[];
    };
    tooling: {
        primaryTools: string[];
        frameworks: string[];
        supportingTools: string[];
    };
    workExperiences: {
        experienceId: string;
        function: SkillFunction;
        level: ProficiencyLevel;
        responsibilities: string[];
        projectScale?: ProjectScale;
        teamSize?: number;
    }[];
};

export type SkillMetrics = {
    skillName: string;
    totalYearsExperience: number;
    lastUsed: string;
    firstUsed: string;
    proficiencyLevel: ProficiencyLevel;
    experiencesByFunction: {
        function: SkillFunction;
        years: number;
        level: ProficiencyLevel;
    }[];
};

export type SkillMetadata = {
    category?: string;
    subcategory?: string;
    level?: ProficiencyLevel;
};

export declare class SkillManager extends BaseEntityManager<Skill> {
    constructor(relationManager: RelationManager);
    addSkill(skill: Skill): Promise<void>;
    updateSkill(id: string, skill: Skill): Promise<void>;
    deleteSkill(id: string): Promise<void>;
    getSkillById(id: string): Promise<Skill | undefined>;
    searchSkills(query: string): Promise<Skill[]>;
    filterSkills(options: {
        category?: SkillCategory;
        level?: ProficiencyLevel;
        function?: SkillFunction;
    }): Promise<Skill[]>;
    calculateSkillMetrics(skillName: string): Promise<SkillMetrics>;
    protected generateId(skillName: string): string;
}