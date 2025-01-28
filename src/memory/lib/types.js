import { z } from 'zod';
// Error types
export class GraphError extends Error {
    constructor(message) {
        super(message);
        this.name = 'GraphError';
    }
}
export class EntityNotFoundError extends GraphError {
    constructor(entityName) {
        super(`Entity not found: ${entityName}`);
        this.name = 'EntityNotFoundError';
    }
}
export class DuplicateEntityError extends GraphError {
    constructor(entityName) {
        super(`Entity already exists: ${entityName}`);
        this.name = 'DuplicateEntityError';
    }
}
export class ValidationError extends GraphError {
    constructor(message) {
        super(`Validation error: ${message}`);
        this.name = 'ValidationError';
    }
}
// Base enums
const SkillCategoryEnum = z.enum([
    "Technical",
    "Programming Language",
    "Framework",
    "Platform",
    "Protocol",
    "Methodology",
    "Domain Knowledge",
    "Soft Skill"
]);
const SkillFunctionEnum = z.enum([
    "Development",
    "Architecture",
    "Testing",
    "Management",
    "Consulting"
]);
const ProficiencyLevelEnum = z.enum([
    "Junior",
    "Mid",
    "Senior",
    "Lead",
    "Expert"
]);
const ProjectScaleEnum = z.enum([
    "Small",
    "Medium",
    "Large",
    "Enterprise"
]);
const SkillLevelEnum = z.enum([
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
    "EXPERT"
]);
const EntityTypeEnum = z.enum([
    "WORK_EXPERIENCE",
    "PROJECT",
    "SKILL",
    "EDUCATION",
    "CONTRIBUTION"
]);
const ReferenceTypeEnum = z.enum([
    "SUPPORTS",
    "PREREQUISITES",
    "LEADS_TO",
    "RELATED"
]);
// Base schemas
const EntitySchema = z.object({
    name: z.string(),
    entityType: z.string(),
    observations: z.array(z.string()),
    metadata: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        duration: z.number().optional(),
        description: z.string().optional(),
    }).optional(),
});
const RelationSchema = z.object({
    from: z.string(),
    to: z.string(),
    relationType: z.string(),
    metadata: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        duration: z.number().optional(),
        description: z.string().optional(),
        level: z.string().optional(),
        context: z.string().optional(),
        role: z.string().optional(),
        impact: z.string().optional(),
        responsibilities: z.array(z.string()).optional(),
        relevance: z.string().optional(),
        skills: z.array(z.string()).optional()
    }).optional(),
});
const KnowledgeGraphSchema = z.object({
    entities: z.array(EntitySchema),
    relations: z.array(RelationSchema),
});
// Experience schemas
const WorkExperienceSchema = z.object({
    title: z.string(),
    employmentType: z.string(),
    companyName: z.string(),
    isCurrentRole: z.boolean(),
    startDate: z.string(),
    endDate: z.string().optional(),
    location: z.string(),
    locationType: z.string(),
    description: z.string(),
    profileHeadline: z.string(),
    jobSource: z.string().optional(),
    skills: z.array(z.string()).optional(),
    media: z.array(z.string()).optional(),
});
const EducationExperienceSchema = z.object({
    school: z.string(),
    degree: z.string(),
    fieldOfStudy: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    grade: z.string().optional(),
    activitiesAndSocieties: z.array(z.string()).optional(),
    description: z.string().optional(),
    skills: z.array(z.string()).optional(),
    media: z.array(z.string()).optional(),
});
const CareerBreakSchema = z.object({
    type: z.string(),
    location: z.string().optional(),
    isCurrent: z.boolean(),
    startDate: z.string(),
    endDate: z.string().optional(),
    description: z.string().optional(),
    profileHeadline: z.string().optional(),
    media: z.array(z.string()).optional(),
});
// Skill schemas
const SkillSchema = z.object({
    skillName: z.string(),
    category: SkillCategoryEnum,
    subcategory: z.string().optional(),
    relationships: z.object({
        complementarySkills: z.array(z.string()),
        prerequisiteSkills: z.array(z.string()),
        progressionSkills: z.array(z.string()),
    }),
    tooling: z.object({
        primaryTools: z.array(z.string()),
        frameworks: z.array(z.string()),
        supportingTools: z.array(z.string()),
    }),
    workExperiences: z.array(z.object({
        experienceId: z.string(),
        function: SkillFunctionEnum,
        level: ProficiencyLevelEnum,
        responsibilities: z.array(z.string()),
        projectScale: ProjectScaleEnum.optional(),
        teamSize: z.number().optional(),
    })),
});
const SkillMetricsSchema = z.object({
    skillName: z.string(),
    totalYearsExperience: z.number(),
    lastUsed: z.string(),
    firstUsed: z.string(),
    proficiencyLevel: ProficiencyLevelEnum,
    experiencesByFunction: z.array(z.object({
        function: SkillFunctionEnum,
        years: z.number(),
        level: ProficiencyLevelEnum,
    })),
});
// Contribution schemas
const OnlineContributionSchema = z.object({
    type: z.string(),
    title: z.string(),
    description: z.string().optional(),
    url: z.string(),
    media: z.array(z.string()).optional(),
    dateAdded: z.string(),
});
const LicenseOrCertificationSchema = z.object({
    name: z.string(),
    issuingOrganization: z.string(),
    description: z.string().optional(),
    issueDate: z.string(),
    expirationDate: z.string().optional(),
    credentialID: z.string().optional(),
    credentialURL: z.string().optional(),
    skills: z.array(z.string()).optional(),
    media: z.array(z.string()).optional(),
});
// Project schemas
const ProjectSchema = z.object({
    projectName: z.string(),
    description: z.string().optional(),
    skills: z.array(z.string()).optional(),
    media: z.array(z.string()).optional(),
    isCurrent: z.boolean(),
    startDate: z.string(),
    endDate: z.string().optional(),
    contributors: z.array(z.string()).optional(),
    associatedWith: z.string().optional(),
});
const CourseSchema = z.object({
    courseName: z.string(),
    courseNumber: z.string().optional(),
    associatedWith: z.string().optional(),
});
// Reference schemas
const ReferenceSchema = z.object({
    name: z.string(),
    contactInfo: z.string(),
    jobTitle: z.string(),
    relation: z.string(),
    organization: z.string().optional(),
    additionalNotes: z.string().optional(),
});
const OrganizationSchema = z.object({
    organizationName: z.string(),
    positionHeld: z.string(),
    associatedWith: z.string().optional(),
    isMembershipOngoing: z.boolean(),
    startDate: z.string(),
    endDate: z.string().optional(),
    description: z.string().optional(),
});
const HonorOrAwardSchema = z.object({
    title: z.string(),
    associatedWith: z.string().optional(),
    issuer: z.string(),
    issueDate: z.string(),
    description: z.string().optional(),
    media: z.array(z.string()).optional(),
});
// Relation schemas
const ExperienceSkillRelationSchema = z.object({
    experienceId: z.string(),
    skillId: z.string(),
    level: SkillLevelEnum,
    context: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional()
});
const ProjectExperienceRelationSchema = z.object({
    projectId: z.string(),
    experienceId: z.string(),
    role: z.string(),
    impact: z.string(),
    responsibilities: z.array(z.string())
});
const CrossReferenceRelationSchema = z.object({
    sourceType: EntityTypeEnum,
    sourceId: z.string(),
    targetType: EntityTypeEnum,
    targetId: z.string(),
    referenceType: ReferenceTypeEnum,
    context: z.string().optional()
});
const ContributionExperienceRelationSchema = z.object({
    contributionId: z.string(),
    experienceId: z.string(),
    relevance: z.string(),
    skills: z.array(z.string())
});
// Export schemas and enums
export { CareerBreakSchema, ContributionExperienceRelationSchema, CourseSchema, CrossReferenceRelationSchema, EducationExperienceSchema, EntitySchema, EntityTypeEnum, ExperienceSkillRelationSchema, HonorOrAwardSchema, KnowledgeGraphSchema, LicenseOrCertificationSchema, OnlineContributionSchema, OrganizationSchema, ProficiencyLevelEnum, ProjectExperienceRelationSchema, ProjectScaleEnum, ProjectSchema, ReferenceSchema, ReferenceTypeEnum, RelationSchema, SkillCategoryEnum, SkillFunctionEnum, SkillLevelEnum, SkillMetricsSchema, SkillSchema, WorkExperienceSchema };
// Core enums and types
export const PROFICIENCY_LEVELS = [
    'Junior',
    'Mid',
    'Senior',
    'Lead',
    'Expert'
];
export const IMPACT_LEVELS = [
    'Individual',
    'Team',
    'Department',
    'Organization',
    'Industry'
];
export const BUSINESS_VALUES = [
    'Cost Reduction',
    'Revenue Growth',
    'Process Improvement',
    'Innovation',
    'Risk Mitigation',
    'Customer Satisfaction',
    'Market Expansion'
];
export const DELIVERABLE_TYPES = [
    'Code',
    'Design',
    'Documentation',
    'Process',
    'Research'
];
export const IMPLEMENTATION_SCOPES = [
    'Component',
    'Service',
    'System',
    'Platform',
    'Enterprise'
];
// Zod Schemas
export const ProficiencyLevelSchema = z.enum(PROFICIENCY_LEVELS);
export const ImpactLevelSchema = z.enum(IMPACT_LEVELS);
export const BusinessValueSchema = z.enum(BUSINESS_VALUES);
export const DeliverableTypeSchema = z.enum(DELIVERABLE_TYPES);
export const ImplementationScopeSchema = z.enum(IMPLEMENTATION_SCOPES);
export const SearchFilterSchema = z.object({
    excludeTypes: z.array(z.string()).optional(),
    minScore: z.number().min(0).max(1).optional(),
    timeframe: z.object({
        start: z.string(),
        end: z.string()
    }).optional(),
    technologies: z.array(z.string()).optional(),
    impactLevel: ImpactLevelSchema.optional()
});
// Update validation schemas
export const TechnicalSkillSchema = z.object({
    name: z.string(),
    level: z.enum(PROFICIENCY_LEVELS),
    yearsOfExperience: z.number(),
    lastUsed: z.string()
});
export const ExperienceEntrySchema = z.object({
    role: z.string(),
    skills: z.array(TechnicalSkillSchema),
    level: z.enum(PROFICIENCY_LEVELS),
    startDate: z.string(),
    endDate: z.string().optional()
});
export const SkillAssessmentSchema = z.object({
    skillName: z.string(),
    currentLevel: z.enum(PROFICIENCY_LEVELS),
    targetLevel: z.enum(PROFICIENCY_LEVELS),
    gap: z.number()
});
