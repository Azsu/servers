import { z } from 'zod';

// Custom error types
export class GraphError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GraphError';
  }
}

export class EntityNotFoundError extends GraphError {
  constructor(entityName: string) {
    super(`Entity not found: ${entityName}`);
    this.name = 'EntityNotFoundError';
  }
}

export class DuplicateEntityError extends GraphError {
  constructor(entityName: string) {
    super(`Entity already exists: ${entityName}`);
    this.name = 'DuplicateEntityError';
  }
}

export class ValidationError extends GraphError {
  constructor(message: string) {
    super(`Validation error: ${message}`);
    this.name = 'ValidationError';
  }
}

// Base schemas
export const EntitySchema = z.object({
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

export const RelationSchema = z.object({
  from: z.string(),
  to: z.string(),
  relationType: z.string(),
  metadata: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    duration: z.number().optional(),
    description: z.string().optional(),
  }).optional(),
});

export const KnowledgeGraphSchema = z.object({
  entities: z.array(EntitySchema),
  relations: z.array(RelationSchema),
});

// Derived types from schemas
export type Entity = z.infer<typeof EntitySchema>;
export type Relation = z.infer<typeof RelationSchema>;
export type KnowledgeGraph = z.infer<typeof KnowledgeGraphSchema>;

// Experience and skill related types
export const SkillCategoryEnum = z.enum([
  "Technical",
  "Programming Language",
  "Framework",
  "Platform",
  "Protocol",
  "Methodology",
  "Domain Knowledge",
  "Soft Skill",
]);

export const SkillFunctionEnum = z.enum([
  "Development",
  "Architecture",
  "Testing",
  "Management",
  "Consulting",
]);

export const ProficiencyLevelEnum = z.enum([
  "Junior",
  "Mid",
  "Senior",
  "Lead",
  "Expert",
]);

export const ProjectScaleEnum = z.enum([
  "Small",
  "Medium",
  "Large",
  "Enterprise",
]);

export type SkillCategory = z.infer<typeof SkillCategoryEnum>;
export type SkillFunction = z.infer<typeof SkillFunctionEnum>;
export type ProficiencyLevel = z.infer<typeof ProficiencyLevelEnum>;
export type ProjectScale = z.infer<typeof ProjectScaleEnum>;

// Experience schemas
export const WorkExperienceSchema = z.object({
  title: z.string(),
  employmentType: z.string(),
  companyName: z.string(),
  isCurrentRole: z.boolean(),
  startDate: z.string().regex(/^\d{4}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  location: z.string(),
  locationType: z.string(),
  description: z.string(),
  profileHeadline: z.string(),
  jobSource: z.string().optional(),
  skills: z.array(z.string()).optional(),
  media: z.array(z.string()).optional(),
});

export const EducationExperienceSchema = z.object({
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

export const CareerBreakSchema = z.object({
  type: z.string(),
  location: z.string().optional(),
  isCurrent: z.boolean(),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  profileHeadline: z.string().optional(),
  media: z.array(z.string()).optional(),
});

export const SkillSchema = z.object({
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

export const SkillMetricsSchema = z.object({
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

// Contribution and certification schemas
export const OnlineContributionSchema = z.object({
  type: z.string(),
  title: z.string(),
  description: z.string().optional(),
  url: z.string(),
  media: z.array(z.string()).optional(),
  dateAdded: z.string(),
});

export const LicenseOrCertificationSchema = z.object({
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

// Project and course schemas
export const ProjectSchema = z.object({
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

export const CourseSchema = z.object({
  courseName: z.string(),
  courseNumber: z.string().optional(),
  associatedWith: z.string().optional(),
});

// Reference and organization schemas
export const ReferenceSchema = z.object({
  name: z.string(),
  contactInfo: z.string(),
  jobTitle: z.string(),
  relation: z.string(),
  organization: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export const OrganizationSchema = z.object({
  organizationName: z.string(),
  positionHeld: z.string(),
  associatedWith: z.string().optional(),
  isMembershipOngoing: z.boolean(),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

export const HonorOrAwardSchema = z.object({
  title: z.string(),
  associatedWith: z.string().optional(),
  issuer: z.string(),
  issueDate: z.string(),
  description: z.string().optional(),
  media: z.array(z.string()).optional(),
});

// Export derived types
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