import { z } from 'zod';
export declare class GraphError extends Error {
    constructor(message: string);
}
export declare class EntityNotFoundError extends GraphError {
    constructor(entityName: string);
}
export declare class DuplicateEntityError extends GraphError {
    constructor(entityName: string);
}
export declare class ValidationError extends GraphError {
    constructor(message: string);
}
declare const SkillCategoryEnum: z.ZodEnum<["Technical", "Programming Language", "Framework", "Platform", "Protocol", "Methodology", "Domain Knowledge", "Soft Skill"]>;
declare const SkillFunctionEnum: z.ZodEnum<["Development", "Architecture", "Testing", "Management", "Consulting"]>;
declare const ProficiencyLevelEnum: z.ZodEnum<["Junior", "Mid", "Senior", "Lead", "Expert"]>;
declare const ProjectScaleEnum: z.ZodEnum<["Small", "Medium", "Large", "Enterprise"]>;
declare const SkillLevelEnum: z.ZodEnum<["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]>;
declare const EntityTypeEnum: z.ZodEnum<["WORK_EXPERIENCE", "PROJECT", "SKILL", "EDUCATION", "CONTRIBUTION"]>;
declare const ReferenceTypeEnum: z.ZodEnum<["SUPPORTS", "PREREQUISITES", "LEADS_TO", "RELATED"]>;
declare const EntitySchema: z.ZodObject<{
    name: z.ZodString;
    entityType: z.ZodString;
    observations: z.ZodArray<z.ZodString, "many">;
    metadata: z.ZodOptional<z.ZodObject<{
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
        duration: z.ZodOptional<z.ZodNumber>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        startDate?: string | undefined;
        endDate?: string | undefined;
        duration?: number | undefined;
        description?: string | undefined;
    }, {
        startDate?: string | undefined;
        endDate?: string | undefined;
        duration?: number | undefined;
        description?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    entityType: string;
    observations: string[];
    metadata?: {
        startDate?: string | undefined;
        endDate?: string | undefined;
        duration?: number | undefined;
        description?: string | undefined;
    } | undefined;
}, {
    name: string;
    entityType: string;
    observations: string[];
    metadata?: {
        startDate?: string | undefined;
        endDate?: string | undefined;
        duration?: number | undefined;
        description?: string | undefined;
    } | undefined;
}>;
declare const RelationSchema: z.ZodObject<{
    from: z.ZodString;
    to: z.ZodString;
    relationType: z.ZodString;
    metadata: z.ZodOptional<z.ZodObject<{
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
        duration: z.ZodOptional<z.ZodNumber>;
        description: z.ZodOptional<z.ZodString>;
        level: z.ZodOptional<z.ZodString>;
        context: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodString>;
        impact: z.ZodOptional<z.ZodString>;
        responsibilities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        relevance: z.ZodOptional<z.ZodString>;
        skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        startDate?: string | undefined;
        endDate?: string | undefined;
        duration?: number | undefined;
        description?: string | undefined;
        level?: string | undefined;
        context?: string | undefined;
        role?: string | undefined;
        impact?: string | undefined;
        responsibilities?: string[] | undefined;
        relevance?: string | undefined;
        skills?: string[] | undefined;
    }, {
        startDate?: string | undefined;
        endDate?: string | undefined;
        duration?: number | undefined;
        description?: string | undefined;
        level?: string | undefined;
        context?: string | undefined;
        role?: string | undefined;
        impact?: string | undefined;
        responsibilities?: string[] | undefined;
        relevance?: string | undefined;
        skills?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    from: string;
    to: string;
    relationType: string;
    metadata?: {
        startDate?: string | undefined;
        endDate?: string | undefined;
        duration?: number | undefined;
        description?: string | undefined;
        level?: string | undefined;
        context?: string | undefined;
        role?: string | undefined;
        impact?: string | undefined;
        responsibilities?: string[] | undefined;
        relevance?: string | undefined;
        skills?: string[] | undefined;
    } | undefined;
}, {
    from: string;
    to: string;
    relationType: string;
    metadata?: {
        startDate?: string | undefined;
        endDate?: string | undefined;
        duration?: number | undefined;
        description?: string | undefined;
        level?: string | undefined;
        context?: string | undefined;
        role?: string | undefined;
        impact?: string | undefined;
        responsibilities?: string[] | undefined;
        relevance?: string | undefined;
        skills?: string[] | undefined;
    } | undefined;
}>;
declare const KnowledgeGraphSchema: z.ZodObject<{
    entities: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        entityType: z.ZodString;
        observations: z.ZodArray<z.ZodString, "many">;
        metadata: z.ZodOptional<z.ZodObject<{
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
            duration: z.ZodOptional<z.ZodNumber>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            startDate?: string | undefined;
            endDate?: string | undefined;
            duration?: number | undefined;
            description?: string | undefined;
        }, {
            startDate?: string | undefined;
            endDate?: string | undefined;
            duration?: number | undefined;
            description?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        entityType: string;
        observations: string[];
        metadata?: {
            startDate?: string | undefined;
            endDate?: string | undefined;
            duration?: number | undefined;
            description?: string | undefined;
        } | undefined;
    }, {
        name: string;
        entityType: string;
        observations: string[];
        metadata?: {
            startDate?: string | undefined;
            endDate?: string | undefined;
            duration?: number | undefined;
            description?: string | undefined;
        } | undefined;
    }>, "many">;
    relations: z.ZodArray<z.ZodObject<{
        from: z.ZodString;
        to: z.ZodString;
        relationType: z.ZodString;
        metadata: z.ZodOptional<z.ZodObject<{
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
            duration: z.ZodOptional<z.ZodNumber>;
            description: z.ZodOptional<z.ZodString>;
            level: z.ZodOptional<z.ZodString>;
            context: z.ZodOptional<z.ZodString>;
            role: z.ZodOptional<z.ZodString>;
            impact: z.ZodOptional<z.ZodString>;
            responsibilities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            relevance: z.ZodOptional<z.ZodString>;
            skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            startDate?: string | undefined;
            endDate?: string | undefined;
            duration?: number | undefined;
            description?: string | undefined;
            level?: string | undefined;
            context?: string | undefined;
            role?: string | undefined;
            impact?: string | undefined;
            responsibilities?: string[] | undefined;
            relevance?: string | undefined;
            skills?: string[] | undefined;
        }, {
            startDate?: string | undefined;
            endDate?: string | undefined;
            duration?: number | undefined;
            description?: string | undefined;
            level?: string | undefined;
            context?: string | undefined;
            role?: string | undefined;
            impact?: string | undefined;
            responsibilities?: string[] | undefined;
            relevance?: string | undefined;
            skills?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        from: string;
        to: string;
        relationType: string;
        metadata?: {
            startDate?: string | undefined;
            endDate?: string | undefined;
            duration?: number | undefined;
            description?: string | undefined;
            level?: string | undefined;
            context?: string | undefined;
            role?: string | undefined;
            impact?: string | undefined;
            responsibilities?: string[] | undefined;
            relevance?: string | undefined;
            skills?: string[] | undefined;
        } | undefined;
    }, {
        from: string;
        to: string;
        relationType: string;
        metadata?: {
            startDate?: string | undefined;
            endDate?: string | undefined;
            duration?: number | undefined;
            description?: string | undefined;
            level?: string | undefined;
            context?: string | undefined;
            role?: string | undefined;
            impact?: string | undefined;
            responsibilities?: string[] | undefined;
            relevance?: string | undefined;
            skills?: string[] | undefined;
        } | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    entities: {
        name: string;
        entityType: string;
        observations: string[];
        metadata?: {
            startDate?: string | undefined;
            endDate?: string | undefined;
            duration?: number | undefined;
            description?: string | undefined;
        } | undefined;
    }[];
    relations: {
        from: string;
        to: string;
        relationType: string;
        metadata?: {
            startDate?: string | undefined;
            endDate?: string | undefined;
            duration?: number | undefined;
            description?: string | undefined;
            level?: string | undefined;
            context?: string | undefined;
            role?: string | undefined;
            impact?: string | undefined;
            responsibilities?: string[] | undefined;
            relevance?: string | undefined;
            skills?: string[] | undefined;
        } | undefined;
    }[];
}, {
    entities: {
        name: string;
        entityType: string;
        observations: string[];
        metadata?: {
            startDate?: string | undefined;
            endDate?: string | undefined;
            duration?: number | undefined;
            description?: string | undefined;
        } | undefined;
    }[];
    relations: {
        from: string;
        to: string;
        relationType: string;
        metadata?: {
            startDate?: string | undefined;
            endDate?: string | undefined;
            duration?: number | undefined;
            description?: string | undefined;
            level?: string | undefined;
            context?: string | undefined;
            role?: string | undefined;
            impact?: string | undefined;
            responsibilities?: string[] | undefined;
            relevance?: string | undefined;
            skills?: string[] | undefined;
        } | undefined;
    }[];
}>;
declare const WorkExperienceSchema: z.ZodObject<{
    title: z.ZodString;
    employmentType: z.ZodString;
    companyName: z.ZodString;
    isCurrentRole: z.ZodBoolean;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    location: z.ZodString;
    locationType: z.ZodString;
    description: z.ZodString;
    profileHeadline: z.ZodString;
    jobSource: z.ZodOptional<z.ZodString>;
    skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    media: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    startDate: string;
    description: string;
    title: string;
    employmentType: string;
    companyName: string;
    isCurrentRole: boolean;
    location: string;
    locationType: string;
    profileHeadline: string;
    endDate?: string | undefined;
    skills?: string[] | undefined;
    jobSource?: string | undefined;
    media?: string[] | undefined;
}, {
    startDate: string;
    description: string;
    title: string;
    employmentType: string;
    companyName: string;
    isCurrentRole: boolean;
    location: string;
    locationType: string;
    profileHeadline: string;
    endDate?: string | undefined;
    skills?: string[] | undefined;
    jobSource?: string | undefined;
    media?: string[] | undefined;
}>;
declare const EducationExperienceSchema: z.ZodObject<{
    school: z.ZodString;
    degree: z.ZodString;
    fieldOfStudy: z.ZodString;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    grade: z.ZodOptional<z.ZodString>;
    activitiesAndSocieties: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    description: z.ZodOptional<z.ZodString>;
    skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    media: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    startDate: string;
    school: string;
    degree: string;
    fieldOfStudy: string;
    endDate?: string | undefined;
    description?: string | undefined;
    skills?: string[] | undefined;
    media?: string[] | undefined;
    grade?: string | undefined;
    activitiesAndSocieties?: string[] | undefined;
}, {
    startDate: string;
    school: string;
    degree: string;
    fieldOfStudy: string;
    endDate?: string | undefined;
    description?: string | undefined;
    skills?: string[] | undefined;
    media?: string[] | undefined;
    grade?: string | undefined;
    activitiesAndSocieties?: string[] | undefined;
}>;
declare const CareerBreakSchema: z.ZodObject<{
    type: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    isCurrent: z.ZodBoolean;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    profileHeadline: z.ZodOptional<z.ZodString>;
    media: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: string;
    startDate: string;
    isCurrent: boolean;
    endDate?: string | undefined;
    description?: string | undefined;
    location?: string | undefined;
    profileHeadline?: string | undefined;
    media?: string[] | undefined;
}, {
    type: string;
    startDate: string;
    isCurrent: boolean;
    endDate?: string | undefined;
    description?: string | undefined;
    location?: string | undefined;
    profileHeadline?: string | undefined;
    media?: string[] | undefined;
}>;
declare const SkillSchema: z.ZodObject<{
    skillName: z.ZodString;
    category: z.ZodEnum<["Technical", "Programming Language", "Framework", "Platform", "Protocol", "Methodology", "Domain Knowledge", "Soft Skill"]>;
    subcategory: z.ZodOptional<z.ZodString>;
    relationships: z.ZodObject<{
        complementarySkills: z.ZodArray<z.ZodString, "many">;
        prerequisiteSkills: z.ZodArray<z.ZodString, "many">;
        progressionSkills: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        complementarySkills: string[];
        prerequisiteSkills: string[];
        progressionSkills: string[];
    }, {
        complementarySkills: string[];
        prerequisiteSkills: string[];
        progressionSkills: string[];
    }>;
    tooling: z.ZodObject<{
        primaryTools: z.ZodArray<z.ZodString, "many">;
        frameworks: z.ZodArray<z.ZodString, "many">;
        supportingTools: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        primaryTools: string[];
        frameworks: string[];
        supportingTools: string[];
    }, {
        primaryTools: string[];
        frameworks: string[];
        supportingTools: string[];
    }>;
    workExperiences: z.ZodArray<z.ZodObject<{
        experienceId: z.ZodString;
        function: z.ZodEnum<["Development", "Architecture", "Testing", "Management", "Consulting"]>;
        level: z.ZodEnum<["Junior", "Mid", "Senior", "Lead", "Expert"]>;
        responsibilities: z.ZodArray<z.ZodString, "many">;
        projectScale: z.ZodOptional<z.ZodEnum<["Small", "Medium", "Large", "Enterprise"]>>;
        teamSize: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        function: "Development" | "Architecture" | "Testing" | "Management" | "Consulting";
        level: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
        responsibilities: string[];
        experienceId: string;
        projectScale?: "Small" | "Medium" | "Large" | "Enterprise" | undefined;
        teamSize?: number | undefined;
    }, {
        function: "Development" | "Architecture" | "Testing" | "Management" | "Consulting";
        level: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
        responsibilities: string[];
        experienceId: string;
        projectScale?: "Small" | "Medium" | "Large" | "Enterprise" | undefined;
        teamSize?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    skillName: string;
    category: "Technical" | "Programming Language" | "Framework" | "Platform" | "Protocol" | "Methodology" | "Domain Knowledge" | "Soft Skill";
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
        function: "Development" | "Architecture" | "Testing" | "Management" | "Consulting";
        level: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
        responsibilities: string[];
        experienceId: string;
        projectScale?: "Small" | "Medium" | "Large" | "Enterprise" | undefined;
        teamSize?: number | undefined;
    }[];
    subcategory?: string | undefined;
}, {
    skillName: string;
    category: "Technical" | "Programming Language" | "Framework" | "Platform" | "Protocol" | "Methodology" | "Domain Knowledge" | "Soft Skill";
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
        function: "Development" | "Architecture" | "Testing" | "Management" | "Consulting";
        level: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
        responsibilities: string[];
        experienceId: string;
        projectScale?: "Small" | "Medium" | "Large" | "Enterprise" | undefined;
        teamSize?: number | undefined;
    }[];
    subcategory?: string | undefined;
}>;
declare const SkillMetricsSchema: z.ZodObject<{
    skillName: z.ZodString;
    totalYearsExperience: z.ZodNumber;
    lastUsed: z.ZodString;
    firstUsed: z.ZodString;
    proficiencyLevel: z.ZodEnum<["Junior", "Mid", "Senior", "Lead", "Expert"]>;
    experiencesByFunction: z.ZodArray<z.ZodObject<{
        function: z.ZodEnum<["Development", "Architecture", "Testing", "Management", "Consulting"]>;
        years: z.ZodNumber;
        level: z.ZodEnum<["Junior", "Mid", "Senior", "Lead", "Expert"]>;
    }, "strip", z.ZodTypeAny, {
        function: "Development" | "Architecture" | "Testing" | "Management" | "Consulting";
        level: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
        years: number;
    }, {
        function: "Development" | "Architecture" | "Testing" | "Management" | "Consulting";
        level: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
        years: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    skillName: string;
    totalYearsExperience: number;
    lastUsed: string;
    firstUsed: string;
    proficiencyLevel: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
    experiencesByFunction: {
        function: "Development" | "Architecture" | "Testing" | "Management" | "Consulting";
        level: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
        years: number;
    }[];
}, {
    skillName: string;
    totalYearsExperience: number;
    lastUsed: string;
    firstUsed: string;
    proficiencyLevel: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
    experiencesByFunction: {
        function: "Development" | "Architecture" | "Testing" | "Management" | "Consulting";
        level: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
        years: number;
    }[];
}>;
declare const OnlineContributionSchema: z.ZodObject<{
    type: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    url: z.ZodString;
    media: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dateAdded: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: string;
    title: string;
    url: string;
    dateAdded: string;
    description?: string | undefined;
    media?: string[] | undefined;
}, {
    type: string;
    title: string;
    url: string;
    dateAdded: string;
    description?: string | undefined;
    media?: string[] | undefined;
}>;
declare const LicenseOrCertificationSchema: z.ZodObject<{
    name: z.ZodString;
    issuingOrganization: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    issueDate: z.ZodString;
    expirationDate: z.ZodOptional<z.ZodString>;
    credentialID: z.ZodOptional<z.ZodString>;
    credentialURL: z.ZodOptional<z.ZodString>;
    skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    media: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    issueDate: string;
    issuingOrganization: string;
    description?: string | undefined;
    skills?: string[] | undefined;
    media?: string[] | undefined;
    expirationDate?: string | undefined;
    credentialID?: string | undefined;
    credentialURL?: string | undefined;
}, {
    name: string;
    issueDate: string;
    issuingOrganization: string;
    description?: string | undefined;
    skills?: string[] | undefined;
    media?: string[] | undefined;
    expirationDate?: string | undefined;
    credentialID?: string | undefined;
    credentialURL?: string | undefined;
}>;
declare const ProjectSchema: z.ZodObject<{
    projectName: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    media: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    isCurrent: z.ZodBoolean;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    contributors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    associatedWith: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startDate: string;
    isCurrent: boolean;
    projectName: string;
    endDate?: string | undefined;
    description?: string | undefined;
    skills?: string[] | undefined;
    media?: string[] | undefined;
    contributors?: string[] | undefined;
    associatedWith?: string | undefined;
}, {
    startDate: string;
    isCurrent: boolean;
    projectName: string;
    endDate?: string | undefined;
    description?: string | undefined;
    skills?: string[] | undefined;
    media?: string[] | undefined;
    contributors?: string[] | undefined;
    associatedWith?: string | undefined;
}>;
declare const CourseSchema: z.ZodObject<{
    courseName: z.ZodString;
    courseNumber: z.ZodOptional<z.ZodString>;
    associatedWith: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    courseName: string;
    associatedWith?: string | undefined;
    courseNumber?: string | undefined;
}, {
    courseName: string;
    associatedWith?: string | undefined;
    courseNumber?: string | undefined;
}>;
declare const ReferenceSchema: z.ZodObject<{
    name: z.ZodString;
    contactInfo: z.ZodString;
    jobTitle: z.ZodString;
    relation: z.ZodString;
    organization: z.ZodOptional<z.ZodString>;
    additionalNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    relation: string;
    contactInfo: string;
    jobTitle: string;
    organization?: string | undefined;
    additionalNotes?: string | undefined;
}, {
    name: string;
    relation: string;
    contactInfo: string;
    jobTitle: string;
    organization?: string | undefined;
    additionalNotes?: string | undefined;
}>;
declare const OrganizationSchema: z.ZodObject<{
    organizationName: z.ZodString;
    positionHeld: z.ZodString;
    associatedWith: z.ZodOptional<z.ZodString>;
    isMembershipOngoing: z.ZodBoolean;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startDate: string;
    organizationName: string;
    positionHeld: string;
    isMembershipOngoing: boolean;
    endDate?: string | undefined;
    description?: string | undefined;
    associatedWith?: string | undefined;
}, {
    startDate: string;
    organizationName: string;
    positionHeld: string;
    isMembershipOngoing: boolean;
    endDate?: string | undefined;
    description?: string | undefined;
    associatedWith?: string | undefined;
}>;
declare const HonorOrAwardSchema: z.ZodObject<{
    title: z.ZodString;
    associatedWith: z.ZodOptional<z.ZodString>;
    issuer: z.ZodString;
    issueDate: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    media: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    issuer: string;
    issueDate: string;
    description?: string | undefined;
    media?: string[] | undefined;
    associatedWith?: string | undefined;
}, {
    title: string;
    issuer: string;
    issueDate: string;
    description?: string | undefined;
    media?: string[] | undefined;
    associatedWith?: string | undefined;
}>;
declare const ExperienceSkillRelationSchema: z.ZodObject<{
    experienceId: z.ZodString;
    skillId: z.ZodString;
    level: z.ZodEnum<["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]>;
    context: z.ZodString;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
    context: string;
    experienceId: string;
    skillId: string;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
    context: string;
    experienceId: string;
    skillId: string;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
declare const ProjectExperienceRelationSchema: z.ZodObject<{
    projectId: z.ZodString;
    experienceId: z.ZodString;
    role: z.ZodString;
    impact: z.ZodString;
    responsibilities: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    role: string;
    impact: string;
    responsibilities: string[];
    experienceId: string;
    projectId: string;
}, {
    role: string;
    impact: string;
    responsibilities: string[];
    experienceId: string;
    projectId: string;
}>;
declare const CrossReferenceRelationSchema: z.ZodObject<{
    sourceType: z.ZodEnum<["WORK_EXPERIENCE", "PROJECT", "SKILL", "EDUCATION", "CONTRIBUTION"]>;
    sourceId: z.ZodString;
    targetType: z.ZodEnum<["WORK_EXPERIENCE", "PROJECT", "SKILL", "EDUCATION", "CONTRIBUTION"]>;
    targetId: z.ZodString;
    referenceType: z.ZodEnum<["SUPPORTS", "PREREQUISITES", "LEADS_TO", "RELATED"]>;
    context: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sourceType: "WORK_EXPERIENCE" | "PROJECT" | "SKILL" | "EDUCATION" | "CONTRIBUTION";
    sourceId: string;
    targetType: "WORK_EXPERIENCE" | "PROJECT" | "SKILL" | "EDUCATION" | "CONTRIBUTION";
    targetId: string;
    referenceType: "SUPPORTS" | "PREREQUISITES" | "LEADS_TO" | "RELATED";
    context?: string | undefined;
}, {
    sourceType: "WORK_EXPERIENCE" | "PROJECT" | "SKILL" | "EDUCATION" | "CONTRIBUTION";
    sourceId: string;
    targetType: "WORK_EXPERIENCE" | "PROJECT" | "SKILL" | "EDUCATION" | "CONTRIBUTION";
    targetId: string;
    referenceType: "SUPPORTS" | "PREREQUISITES" | "LEADS_TO" | "RELATED";
    context?: string | undefined;
}>;
declare const ContributionExperienceRelationSchema: z.ZodObject<{
    contributionId: z.ZodString;
    experienceId: z.ZodString;
    relevance: z.ZodString;
    skills: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    relevance: string;
    skills: string[];
    experienceId: string;
    contributionId: string;
}, {
    relevance: string;
    skills: string[];
    experienceId: string;
    contributionId: string;
}>;
export { CareerBreakSchema, ContributionExperienceRelationSchema, CourseSchema, CrossReferenceRelationSchema, EducationExperienceSchema, EntitySchema, EntityTypeEnum, ExperienceSkillRelationSchema, HonorOrAwardSchema, KnowledgeGraphSchema, LicenseOrCertificationSchema, OnlineContributionSchema, OrganizationSchema, ProficiencyLevelEnum, ProjectExperienceRelationSchema, ProjectScaleEnum, ProjectSchema, ReferenceSchema, ReferenceTypeEnum, RelationSchema, SkillCategoryEnum, SkillFunctionEnum, SkillLevelEnum, SkillMetricsSchema, SkillSchema, WorkExperienceSchema };
export type Entity = z.infer<typeof EntitySchema>;
export type Relation = z.infer<typeof RelationSchema>;
export type KnowledgeGraph = z.infer<typeof KnowledgeGraphSchema>;
export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export type EducationExperience = z.infer<typeof EducationExperienceSchema>;
export type CareerBreak = z.infer<typeof CareerBreakSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type SkillMetrics = z.infer<typeof SkillMetricsSchema>;
export type OnlineContribution = z.infer<typeof OnlineContributionSchema>;
export type LicenseOrCertification = z.infer<typeof LicenseOrCertificationSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type Reference = z.infer<typeof ReferenceSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type HonorOrAward = z.infer<typeof HonorOrAwardSchema>;
export type SkillLevel = z.infer<typeof SkillLevelEnum>;
export type EntityType = z.infer<typeof EntityTypeEnum>;
export type ReferenceType = z.infer<typeof ReferenceTypeEnum>;
export type ExperienceSkillRelation = z.infer<typeof ExperienceSkillRelationSchema>;
export type ProjectExperienceRelation = z.infer<typeof ProjectExperienceRelationSchema>;
export type CrossReferenceRelation = z.infer<typeof CrossReferenceRelationSchema>;
export type ContributionExperienceRelation = z.infer<typeof ContributionExperienceRelationSchema>;
export type SkillCategory = z.infer<typeof SkillCategoryEnum>;
export type SkillFunction = z.infer<typeof SkillFunctionEnum>;
export type ProjectScale = z.infer<typeof ProjectScaleEnum>;
export declare const PROFICIENCY_LEVELS: readonly ["Junior", "Mid", "Senior", "Lead", "Expert"];
export type ProficiencyLevel = (typeof PROFICIENCY_LEVELS)[number];
export declare const IMPACT_LEVELS: readonly ["Individual", "Team", "Department", "Organization", "Industry"];
export type ImpactLevel = (typeof IMPACT_LEVELS)[number];
export declare const BUSINESS_VALUES: readonly ["Cost Reduction", "Revenue Growth", "Process Improvement", "Innovation", "Risk Mitigation", "Customer Satisfaction", "Market Expansion"];
export type BusinessValue = (typeof BUSINESS_VALUES)[number];
export declare const DELIVERABLE_TYPES: readonly ["Code", "Design", "Documentation", "Process", "Research"];
export type DeliverableType = (typeof DELIVERABLE_TYPES)[number];
export declare const IMPLEMENTATION_SCOPES: readonly ["Component", "Service", "System", "Platform", "Enterprise"];
export type ImplementationScope = (typeof IMPLEMENTATION_SCOPES)[number];
export declare const ProficiencyLevelSchema: z.ZodEnum<["Junior", "Mid", "Senior", "Lead", "Expert"]>;
export declare const ImpactLevelSchema: z.ZodEnum<["Individual", "Team", "Department", "Organization", "Industry"]>;
export declare const BusinessValueSchema: z.ZodEnum<["Cost Reduction", "Revenue Growth", "Process Improvement", "Innovation", "Risk Mitigation", "Customer Satisfaction", "Market Expansion"]>;
export declare const DeliverableTypeSchema: z.ZodEnum<["Code", "Design", "Documentation", "Process", "Research"]>;
export declare const ImplementationScopeSchema: z.ZodEnum<["Component", "Service", "System", "Platform", "Enterprise"]>;
export interface SearchFilter {
    excludeTypes?: string[];
    minScore?: number;
    timeframe?: {
        start: string;
        end: string;
    };
    technologies?: string[];
    impactLevel?: ImpactLevel;
}
export declare const SearchFilterSchema: z.ZodObject<{
    excludeTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    minScore: z.ZodOptional<z.ZodNumber>;
    timeframe: z.ZodOptional<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end: string;
    }, {
        start: string;
        end: string;
    }>>;
    technologies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    impactLevel: z.ZodOptional<z.ZodEnum<["Individual", "Team", "Department", "Organization", "Industry"]>>;
}, "strip", z.ZodTypeAny, {
    excludeTypes?: string[] | undefined;
    minScore?: number | undefined;
    timeframe?: {
        start: string;
        end: string;
    } | undefined;
    technologies?: string[] | undefined;
    impactLevel?: "Industry" | "Individual" | "Team" | "Department" | "Organization" | undefined;
}, {
    excludeTypes?: string[] | undefined;
    minScore?: number | undefined;
    timeframe?: {
        start: string;
        end: string;
    } | undefined;
    technologies?: string[] | undefined;
    impactLevel?: "Industry" | "Individual" | "Team" | "Department" | "Organization" | undefined;
}>;
export interface SearchResult {
    type: string;
    item: Achievement | TechnicalImplementation | DomainExpertise | ProfessionalContribution;
    score: number;
}
export interface Achievement {
    title: string;
    description: string;
    impactLevel: ImpactLevel;
    businessValue: BusinessValue[];
    deliverableType: DeliverableType;
    metrics: {
        quantitative: string[];
        qualitative: string[];
    };
}
export interface TechnicalImplementation {
    name: string;
    description: string;
    technologies: string[];
    proficiencyLevel: ProficiencyLevel;
    scope: ImplementationScope;
}
export interface DomainExpertise {
    domain: string;
    category: string;
    level: ProficiencyLevel;
    specializations: string[];
}
export interface ProfessionalContribution {
    title: string;
    description: string;
    impact: ImpactLevel;
    type: string;
}
export interface TechnicalSkill {
    name: string;
    level: ProficiencyLevel;
    yearsOfExperience: number;
    lastUsed: string;
}
export interface ExperienceEntry {
    role: string;
    skills: TechnicalSkill[];
    level: ProficiencyLevel;
    startDate: string;
    endDate?: string;
}
export interface SkillAssessment {
    skillName: string;
    currentLevel: ProficiencyLevel;
    targetLevel: ProficiencyLevel;
    gap: number;
}
export declare const TechnicalSkillSchema: z.ZodObject<{
    name: z.ZodString;
    level: z.ZodEnum<["Junior", "Mid", "Senior", "Lead", "Expert"]>;
    yearsOfExperience: z.ZodNumber;
    lastUsed: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    level: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
    lastUsed: string;
    yearsOfExperience: number;
}, {
    name: string;
    level: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
    lastUsed: string;
    yearsOfExperience: number;
}>;
export declare const ExperienceEntrySchema: z.ZodObject<{
    role: z.ZodString;
    skills: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        level: z.ZodEnum<["Junior", "Mid", "Senior", "Lead", "Expert"]>;
        yearsOfExperience: z.ZodNumber;
        lastUsed: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        level: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
        lastUsed: string;
        yearsOfExperience: number;
    }, {
        name: string;
        level: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
        lastUsed: string;
        yearsOfExperience: number;
    }>, "many">;
    level: z.ZodEnum<["Junior", "Mid", "Senior", "Lead", "Expert"]>;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startDate: string;
    level: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
    role: string;
    skills: {
        name: string;
        level: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
        lastUsed: string;
        yearsOfExperience: number;
    }[];
    endDate?: string | undefined;
}, {
    startDate: string;
    level: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
    role: string;
    skills: {
        name: string;
        level: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
        lastUsed: string;
        yearsOfExperience: number;
    }[];
    endDate?: string | undefined;
}>;
export declare const SkillAssessmentSchema: z.ZodObject<{
    skillName: z.ZodString;
    currentLevel: z.ZodEnum<["Junior", "Mid", "Senior", "Lead", "Expert"]>;
    targetLevel: z.ZodEnum<["Junior", "Mid", "Senior", "Lead", "Expert"]>;
    gap: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    skillName: string;
    currentLevel: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
    targetLevel: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
    gap: number;
}, {
    skillName: string;
    currentLevel: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
    targetLevel: "Junior" | "Mid" | "Senior" | "Lead" | "Expert";
    gap: number;
}>;
