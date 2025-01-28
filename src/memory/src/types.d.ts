
// Error types
export class GraphError extends Error {
    name: 'GraphError';
    constructor(message: string);
}

export class EntityNotFoundError extends GraphError {
    name: 'EntityNotFoundError';
    constructor(entityName: string);
}

export class DuplicateEntityError extends GraphError {
    name: 'DuplicateEntityError';
    constructor(entityName: string);
}

export class ValidationError extends GraphError {
    name: 'ValidationError';
    constructor(message: string);
}

// Base types
export type Entity = {
    name: string;
    entityType: string;
    observations: string[];
    metadata?: {
        startDate?: string;
        endDate?: string;
        duration?: number;
        description?: string;
    };
};

export type Relation = {
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
    };
};

export type KnowledgeGraph = {
    entities: Entity[];
    relations: Relation[];
};

// Enums
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

export type ProficiencyLevel =
    | "Junior"
    | "Mid"
    | "Senior"
    | "Lead"
    | "Expert";

export type ProjectScale =
    | "Small"
    | "Medium"
    | "Large"
    | "Enterprise";

export type SkillLevel =
    | "BEGINNER"
    | "INTERMEDIATE"
    | "ADVANCED"
    | "EXPERT";

export type EntityType =
    | "WORK_EXPERIENCE"
    | "PROJECT"
    | "SKILL"
    | "EDUCATION"
    | "CONTRIBUTION";

export type ReferenceType =
    | "SUPPORTS"
    | "PREREQUISITES"
    | "LEADS_TO"
    | "RELATED";

// Experience types
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

export type CareerBreak = {
    type: string;
    location?: string;
    isCurrent: boolean;
    startDate: string;
    endDate?: string;
    description?: string;
    profileHeadline?: string;
    media?: string[];
};

// Skill types
export type Skill = {
    skillName: string;
    category: SkillCategory;
    subcategory?: string;
    relationships: {
        complementarySkills: string[];
        prerequisiteSkills: string[];
        progressionSkills: string[];
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

// Contribution types
export type OnlineContribution = {
    type: string;
    title: string;
    description?: string;
    url: string;
    media?: string[];
    dateAdded: string;
};

export type LicenseOrCertification = {
    name: string;
    issuingOrganization: string;
    description?: string;
    issueDate: string;
    expirationDate?: string;
    credentialID?: string;
    credentialURL?: string;
    skills?: string[];
    media?: string[];
};

// Project types
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

export type Course = {
    courseName: string;
    courseNumber?: string;
    associatedWith?: string;
};

// Reference types
export type Reference = {
    name: string;
    contactInfo: string;
    jobTitle: string;
    relation: string;
    organization?: string;
    additionalNotes?: string;
};

export type Organization = {
    organizationName: string;
    positionHeld: string;
    associatedWith?: string;
    isMembershipOngoing: boolean;
    startDate: string;
    endDate?: string;
    description?: string;
};

export type HonorOrAward = {
    title: string;
    associatedWith?: string;
    issuer: string;
    issueDate: string;
    description?: string;
    media?: string[];
};

// Relation types
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