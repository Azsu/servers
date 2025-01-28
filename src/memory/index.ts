#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

// Define paths for memory storage
const getMemoryPath = () => {
  // Try environment variable first
  if (process.env.MCP_MEMORY_PATH)
  {
    return process.env.MCP_MEMORY_PATH;
  }

  // Default paths by platform
  switch (process.platform)
  {
    case 'win32':
      return path.join(process.env.APPDATA || '', 'claude-memory', 'memory.jsonl');
    case 'darwin':
      return path.join(os.homedir(), 'Library', 'Application Support', 'claude-memory', 'memory.jsonl');
    default: // linux and others
      return path.join(os.homedir(), '.local', 'share', 'claude-memory', 'memory.jsonl');
  }
};

const MEMORY_FILE_PATH = getMemoryPath();

// Ensure memory directory exists
async function ensureMemoryDirectory() {
  const dir = path.dirname(MEMORY_FILE_PATH);
  try
  {
    await fs.mkdir(dir, { recursive: true });
  } catch (error)
  {
    console.error('Failed to create memory directory:', error);
    throw error;
  }
}

// We are storing our memory using entities, relations, and observations in a graph structure
interface Entity {
  name: string;
  entityType: string;
  observations: string[];
  metadata?: {
    startDate?: string;
    endDate?: string;
    duration?: number;
    description?: string;
  };
}

interface Relation {
  from: string;
  to: string;
  relationType: string;
  metadata?: {
    startDate?: string;
    endDate?: string;
    duration?: number;
    description?: string;
  };
}

interface KnowledgeGraph {
  entities: Entity[];
  relations: Relation[];
}

interface WorkExperience {
  title: string; // Job title, e.g., "Retail Sales Manager"
  employmentType: string; // Full-time, Part-time, etc.
  companyName: string; // Company or organization name
  isCurrentRole: boolean; // Indicates if the user is currently in this role
  startDate: string; // Start date in format YYYY-MM
  endDate?: string; // End date in format YYYY-MM, undefined if currently employed
  location: string; // Location of the role, e.g., "London, United Kingdom"
  locationType: string; // e.g., "Remote", "On-site", "Hybrid"
  description: string; // Major duties and successes, highlighting specific projects
  profileHeadline: string; // Headline displayed below the name, e.g., "Senior Python Engineer"
  jobSource?: string; // Where the job was found, optional
  skills?: string[]; // Array of top skills used in the role
  media?: string[]; // Array of media links or descriptions related to the role
}

interface EducationExperience {
  school: string; // Name of the school, e.g., "Boston University"
  degree: string; // Degree obtained, e.g., "Bachelor’s"
  fieldOfStudy: string; // Field of study, e.g., "Business"
  startDate: string; // Start date in format YYYY-MM
  endDate?: string; // End date in format YYYY-MM, or expected graduation date
  grade?: string; // Grade achieved, optional
  activitiesAndSocieties?: string[]; // List of activities and societies, e.g., ["Alpha Phi Omega", "Marching Band"]
  description?: string; // Additional details about the education experience
  skills?: string[]; // Array of top skills associated with this education experience
  media?: string[]; // Array of media links or descriptions related to the education experience
}

interface CareerBreak {
  type: string; // Type of career break, e.g., "Sabbatical", "Family leave"
  location?: string; // Location during the career break, e.g., "London, United Kingdom"
  isCurrent: boolean; // Indicates if the user is currently on this career break
  startDate: string; // Start date in format YYYY-MM
  endDate?: string; // End date in format YYYY-MM, undefined if ongoing
  description?: string; // Details about the career break
  profileHeadline?: string; // Optional headline during the career break
  media?: string[]; // Array of media links or descriptions related to the career break
}

type SkillCategory =
  | "Technical"
  | "Programming Language"
  | "Framework"
  | "Platform"
  | "Protocol"
  | "Methodology"
  | "Domain Knowledge"
  | "Soft Skill";

type SkillFunction =
  | "Development"
  | "Architecture"
  | "Testing"
  | "Management"
  | "Consulting";

type ProficiencyLevel =
  | "Junior"
  | "Mid"
  | "Senior"
  | "Lead"
  | "Expert";

type ProjectScale =
  | "Small"
  | "Medium"
  | "Large"
  | "Enterprise";

interface Skill {
  skillName: string;
  category: SkillCategory;
  subcategory?: string;
  // Relationships to other skills
  relationships: {
    complementarySkills: string[];
    prerequisiteSkills: string[];
    progressionSkills: string[];
  };
  // Associated tooling
  tooling: {
    primaryTools: string[];
    frameworks: string[];
    supportingTools: string[];
  };
  // Connection to work experiences
  workExperiences: {
    experienceId: string;
    function: SkillFunction;
    level: ProficiencyLevel;
    responsibilities: string[];
    projectScale?: ProjectScale;
    teamSize?: number;
  }[];
}

// Computed interface for skill metrics (derived from work experiences)
interface SkillMetrics {
  skillName: string;
  totalYearsExperience: number;
  lastUsed: string; // ISO date derived from latest work experience
  firstUsed: string; // ISO date derived from earliest work experience
  proficiencyLevel: ProficiencyLevel;
  experiencesByFunction: {
    function: SkillFunction;
    years: number;
    level: ProficiencyLevel;
  }[];
}

interface OnlineContribution {
  type: string; // Type of contribution, e.g., "Post", "Newsletter", "Article", "Link", "Media"
  title: string; // Title of the contribution, e.g., "Basic Data Engineering using AWS SageMaker"
  description?: string; // Description of the contribution
  url: string; // URL to the online contribution
  media?: string[]; // Associated media or files
  dateAdded: string; // Date when the contribution was added, format YYYY-MM-DD
}

interface LicenseOrCertification {
  name: string; // Name of the license or certification, e.g., "Microsoft Certified Network Associate Security"
  issuingOrganization: string; // Organization issuing the license or certification, e.g., "Microsoft"
  description?: string; // Description of the contribution
  issueDate: string; // Issue date in format YYYY-MM
  expirationDate?: string; // Expiration date in format YYYY-MM, undefined if no expiration
  credentialID?: string; // Credential ID, optional
  credentialURL?: string; // URL to the credential, optional
  skills?: string[]; // Associated skills
  media?: string[]; // Associated media links or descriptions
}

interface Project {
  projectName: string; // Name of the project, e.g., "AI Chatbot Development"
  description?: string; // Description of the project
  skills?: string[]; // Top skills used in the project
  media?: string[]; // Associated media links or descriptions
  isCurrent: boolean; // Indicates if the user is currently working on this project
  startDate: string; // Start date in format YYYY-MM
  endDate?: string; // End date in format YYYY-MM, undefined if ongoing
  contributors?: string[]; // Connections who contributed to the project
  associatedWith?: string; // Entity or organization associated with the project
}

interface Course {
  courseName: string; // Name of the course, e.g., "World History"
  courseNumber?: string; // Course number, e.g., "HIS101"
  associatedWith?: string; // Entity or organization associated with the course
}

interface Reference {
  name: string; // Full name of the reference
  contactInfo: string; // Contact information, e.g., email or phone
  jobTitle: string; // Job title of the reference, e.g., "Senior Manager"
  relation: string; // Relationship to the individual, e.g., "Former Manager"
  organization?: string; // Organization associated with the reference, optional
  additionalNotes?: string; // Any additional notes about the reference
}

interface Organization {
  organizationName: string; // Name of the organization, e.g., "Rotary Club"
  positionHeld: string; // Position held in the organization, e.g., "President"
  associatedWith?: string; // Associated entity or purpose of the membership
  isMembershipOngoing: boolean; // Indicates if the membership is ongoing
  startDate: string; // Start date in format YYYY-MM
  endDate?: string; // End date in format YYYY-MM, undefined if ongoing
  description?: string; // Description of the membership or role
}

interface HonorOrAward {
  title: string; // Title of the honor or award, e.g., "Employee of the Month"
  associatedWith?: string; // Associated entity or context, optional
  issuer: string; // Issuer of the honor or award, e.g., "Microsoft"
  issueDate: string; // Date the honor or award was issued, format YYYY-MM
  description?: string; // Description of the honor or award
  media?: string[]; // Associated media links or descriptions
}

class KnowledgeGraphManager {
  private async loadGraph(): Promise<KnowledgeGraph> {
    try
    {
      await ensureMemoryDirectory();
      const data = await fs.readFile(MEMORY_FILE_PATH, "utf-8");
      const lines = data.split("\n").filter(line => line.trim() !== "");
      return lines.reduce((graph: KnowledgeGraph, line) => {
        try
        {
          const item = JSON.parse(line);
          if (item.type === "entity")
          {
            const entity = item as Entity;
            if (!graph.entities.some(e => e.name === entity.name))
            {
              graph.entities.push(entity);
            }
          }
          if (item.type === "relation")
          {
            const relation = item as Relation;
            if (!graph.relations.some(r =>
              r.from === relation.from &&
              r.to === relation.to &&
              r.relationType === relation.relationType
            ))
            {
              graph.relations.push(relation);
            }
          }
          return graph;
        } catch (parseError)
        {
          console.error('Failed to parse line:', line, parseError);
          return graph;
        }
      }, { entities: [], relations: [] });
    } catch (error)
    {
      if (error instanceof Error && 'code' in error && (error as any).code === "ENOENT")
      {
        return { entities: [], relations: [] };
      }
      console.error('Failed to load graph:', error);
      throw error;
    }
  }

  private async saveGraph(graph: KnowledgeGraph): Promise<void> {
    try
    {
      await ensureMemoryDirectory();
      const lines = [
        ...graph.entities.map(e => JSON.stringify({ type: "entity", ...e })),
        ...graph.relations.map(r => JSON.stringify({ type: "relation", ...r })),
      ];

      // Write to temporary file first
      const tempPath = `${MEMORY_FILE_PATH}.tmp`;
      await fs.writeFile(tempPath, lines.join("\n"));

      // Rename temporary file to actual file (atomic operation)
      await fs.rename(tempPath, MEMORY_FILE_PATH);
    } catch (error)
    {
      console.error('Failed to save graph:', error);
      throw error;
    }
  }

  // ---------------------------------------
  // Base Graph Operations
  // ---------------------------------------

  async createEntities(entities: Entity[]): Promise<Entity[]> {
    const graph = await this.loadGraph();
    const newEntities = entities.filter(e =>
      !graph.entities.some(existingEntity => existingEntity.name === e.name)
    );
    graph.entities.push(...newEntities);
    await this.saveGraph(graph);
    return newEntities;
  }

  async createRelations(relations: Relation[]): Promise<Relation[]> {
    const graph = await this.loadGraph();
    const newRelations = relations.filter(r =>
      !graph.relations.some(existingRelation =>
        existingRelation.from === r.from &&
        existingRelation.to === r.to &&
        existingRelation.relationType === r.relationType
      )
    );
    graph.relations.push(...newRelations);
    await this.saveGraph(graph);
    return newRelations;
  }

  async addObservations(
    observations: { entityName: string; contents: string[] }[]
  ): Promise<{ entityName: string; addedObservations: string[] }[]> {
    const graph = await this.loadGraph();
    const results = observations.map(o => {
      const entity = graph.entities.find(e => e.name === o.entityName);
      if (!entity)
      {
        throw new Error(`Entity with name ${o.entityName} not found`);
      }
      const newObservations = o.contents.filter(content => !entity.observations.includes(content));
      entity.observations.push(...newObservations);
      return { entityName: o.entityName, addedObservations: newObservations };
    });
    await this.saveGraph(graph);
    return results;
  }

  async deleteEntities(entityNames: string[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.entities = graph.entities.filter(e => !entityNames.includes(e.name));
    graph.relations = graph.relations.filter(r =>
      !entityNames.includes(r.from) && !entityNames.includes(r.to)
    );
    await this.saveGraph(graph);
  }

  async deleteObservations(
    deletions: { entityName: string; observations: string[] }[]
  ): Promise<void> {
    const graph = await this.loadGraph();
    deletions.forEach(d => {
      const entity = graph.entities.find(e => e.name === d.entityName);
      if (entity)
      {
        entity.observations = entity.observations.filter(o => !d.observations.includes(o));
      }
    });
    await this.saveGraph(graph);
  }

  async deleteRelations(relations: Relation[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.relations = graph.relations.filter(r =>
      !relations.some(delRelation =>
        r.from === delRelation.from &&
        r.to === delRelation.to &&
        r.relationType === delRelation.relationType
      )
    );
    await this.saveGraph(graph);
  }

  async readGraph(): Promise<KnowledgeGraph> {
    return this.loadGraph();
  }

  async searchNodes(query: string): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph();

    const filteredEntities = graph.entities.filter(e =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.entityType.toLowerCase().includes(query.toLowerCase()) ||
      e.observations.some(o => o.toLowerCase().includes(query.toLowerCase()))
    );

    const filteredEntityNames = new Set(filteredEntities.map(e => e.name));
    const filteredRelations = graph.relations.filter(r =>
      filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );

    return {
      entities: filteredEntities,
      relations: filteredRelations,
    };
  }

  async openNodes(names: string[]): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph();

    const filteredEntities = graph.entities.filter(e => names.includes(e.name));
    const filteredEntityNames = new Set(filteredEntities.map(e => e.name));
    const filteredRelations = graph.relations.filter(r =>
      filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );

    return {
      entities: filteredEntities,
      relations: filteredRelations,
    };
  }

  // ---------------------------------------
  // WorkExperience
  // ---------------------------------------

  async addWorkExperience(experiences: WorkExperience[]): Promise<WorkExperience[]> {
    const graph = await this.loadGraph();
    const newExperiences = experiences.filter(exp =>
      !graph.entities.some(entity => entity.name === exp.title)
    );
    const existingEntities = experiences.filter(exp =>
      graph.entities.some(entity => entity.name === exp.title)
    );

    // Update existing entries
    for (const exp of existingEntities)
    {
      const existingEntity = graph.entities.find(e => e.name === exp.title);
      if (existingEntity)
      {
        existingEntity.observations[0] = exp.description || "";
      }
    }

    // Add new entities
    const newEntityExperiences = newExperiences.map(exp => ({
      name: exp.title,
      entityType: "WorkExperience",
      observations: [exp.description || ""]
    }));

    graph.entities = graph.entities.map(entity => {
      const matchingNewEntity = newEntityExperiences.find(newEntity => newEntity.name === entity.name);
      if (matchingNewEntity && entity.entityType === "WorkExperience")
      {
        return matchingNewEntity;
      }
      return entity;
    });

    // Add any new entities that weren't already in the graph
    const existingTitles = graph.entities.map(e => e.name);
    graph.entities.push(...newEntityExperiences.filter(newEntity => !existingTitles.includes(newEntity.name)));

    await this.saveGraph(graph);
    return [...newExperiences, ...existingEntities];
  }

  async deleteWorkExperience(titles: string[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.entities = graph.entities.filter(e => !titles.includes(e.name));
    await this.saveGraph(graph);
  }

  async searchWorkExperience(query: string): Promise<WorkExperience[]> {
    const graph = await this.loadGraph();
    return graph.entities
      .filter(e => e.entityType === "WorkExperience" && e.name.includes(query))
      .map(e => ({
        title: e.name,
        description: e.observations[0],
        employmentType: "",
        companyName: "",
        isCurrentRole: false,
        startDate: "",
        endDate: "",
        location: "",
        locationType: "",
        profileHeadline: "",
        jobSource: "",
        skills: [],
        media: [],
      }));
  }

  // ---------------------------------------
  // EducationExperience
  // ---------------------------------------

  async addEducationExperience(experiences: EducationExperience[]): Promise<EducationExperience[]> {
    const graph = await this.loadGraph();
    const newExperiences = experiences.filter(exp =>
      !graph.entities.some(entity => entity.name === exp.school)
    );
    const existingEntities = experiences.filter(exp =>
      graph.entities.some(entity => entity.name === exp.school)
    );

    // Update existing entries
    for (const exp of existingEntities)
    {
      const existingEntity = graph.entities.find(e => e.name === exp.school);
      if (existingEntity)
      {
        existingEntity.observations[0] = JSON.stringify({
          degree: exp.degree || "",
          fieldOfStudy: exp.fieldOfStudy || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          grade: exp.grade || "",
          activitiesAndSocieties: exp.activitiesAndSocieties || [],
          description: exp.description || "",
          skills: exp.skills || [],
          media: exp.media || []
        });
      }
    }

    // Add new entities
    const newEntityExperiences = newExperiences.map(exp => ({
      name: exp.school,
      entityType: "EducationExperience",
      observations: [JSON.stringify({
        degree: exp.degree || "",
        fieldOfStudy: exp.fieldOfStudy || "",
        startDate: exp.startDate || "",
        endDate: exp.endDate || "",
        grade: exp.grade || "",
        activitiesAndSocieties: exp.activitiesAndSocieties || [],
        description: exp.description || "",
        skills: exp.skills || [],
        media: exp.media || []
      })]
    }));

    graph.entities = graph.entities.map(entity => {
      const matchingNewEntity = newEntityExperiences.find(newEntity => newEntity.name === entity.name);
      if (matchingNewEntity && entity.entityType === "EducationExperience")
      {
        return matchingNewEntity;
      }
      return entity;
    });

    // Add any new entities that weren't already in the graph
    const existingSchools = graph.entities.map(e => e.name);
    graph.entities.push(...newEntityExperiences.filter(newEntity => !existingSchools.includes(newEntity.name)));

    await this.saveGraph(graph);
    return [...newExperiences, ...existingEntities];
  }

  async deleteEducationExperience(schools: string[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.entities = graph.entities.filter(e => !schools.includes(e.name));
    await this.saveGraph(graph);
  }

  async searchEducationExperience(query: string): Promise<EducationExperience[]> {
    const graph = await this.loadGraph();
    return graph.entities
      .filter(e => e.entityType === "EducationExperience" && e.name.includes(query))
      .map(e => {
        try
        {
          const obs = e.observations[0] || '{}';
          const expData = JSON.parse(obs);
          return {
            school: e.name,
            degree: expData.degree || "",
            fieldOfStudy: expData.fieldOfStudy || "",
            startDate: expData.startDate || "",
            endDate: expData.endDate || "",
            grade: expData.grade || "",
            activitiesAndSocieties: expData.activitiesAndSocieties || [],
            description: expData.description || "",
            skills: expData.skills || [],
            media: expData.media || [],
          };
        } catch (error)
        {
          console.error(`Failed to parse education experience for ${e.name}:`, error);
          return {
            school: e.name,
            degree: "",
            fieldOfStudy: "",
            startDate: "",
            endDate: "",
            grade: "",
            activitiesAndSocieties: [],
            description: "",
            skills: [],
            media: [],
          };
        }
      });
  } // --------------------------------------- // CareerBreak
  // ---------------------------------------

  async addCareerBreak(careerBreaks: CareerBreak[]): Promise<CareerBreak[]> {
    const graph = await this.loadGraph();
    const newBreaks = careerBreaks.filter(cb =>
      // Use cb.type (plus optional startDate if you want to differentiate)
      !graph.entities.some(entity => entity.name === cb.type)
    );
    graph.entities.push(...newBreaks.map(cb => ({
      name: cb.type,
      entityType: "CareerBreak",
      observations: [cb.description || ""],
    })));
    await this.saveGraph(graph);
    return newBreaks;
  }

  async deleteCareerBreak(types: string[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.entities = graph.entities.filter(e => !types.includes(e.name));
    await this.saveGraph(graph);
  }

  async searchCareerBreak(query: string): Promise<CareerBreak[]> {
    const graph = await this.loadGraph();
    return graph.entities
      .filter(e => e.entityType === "CareerBreak" && e.name.includes(query))
      .map(e => ({
        type: e.name,
        location: "",
        isCurrent: false,
        startDate: "",
        endDate: "",
        description: e.observations[0],
        profileHeadline: "",
        media: [],
      }));
  }

  // ---------------------------------------
  // Skill
  // ---------------------------------------

  async addSkill(skills: Skill[]): Promise<Skill[]> {
    const graph = await this.loadGraph();
    const newSkills = skills.filter(s =>
      !graph.entities.some(entity => entity.name === s.skillName)
    );
    graph.entities.push(...newSkills.map(s => ({
      name: s.skillName,
      entityType: "Skill",
      observations: [
        JSON.stringify({
          category: s.category,
          subcategory: s.subcategory,
          relationships: s.relationships,
          tooling: s.tooling,
          workExperiences: s.workExperiences
        })
      ],
    })));
    await this.saveGraph(graph);
    return newSkills;
  }

  async deleteSkill(skillNames: string[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.entities = graph.entities.filter(e => !skillNames.includes(e.name));
    await this.saveGraph(graph);
  }

  async searchSkill(query: string): Promise<Skill[]> {
    const graph = await this.loadGraph();
    return graph.entities
      .filter(e => e.entityType === "Skill" && e.name.includes(query))
      .map(e => {
        const skillData = JSON.parse(e.observations[0]);
        return {
          skillName: e.name,
          category: skillData.category,
          subcategory: skillData.subcategory,
          relationships: skillData.relationships,
          tooling: skillData.tooling,
          workExperiences: skillData.workExperiences
        };
      });
  }

  async calculateExperience(technology: string): Promise<number> {
    const graph = await this.loadGraph();
    let totalDuration = 0;

    // First find the technology entity
    const techEntity = graph.entities.find(e =>
      e.name.toLowerCase() === technology.toLowerCase() &&
      (e.entityType === "Skill" || e.entityType === "Technology")
    );

    if (!techEntity)
    {
      throw new Error(`Technology/Skill not found: ${technology}`);
    }

    // Get all relations where this technology was used
    const relatedExperiences = graph.relations.filter(relation =>
      relation.from === techEntity.name &&
      (relation.relationType === "UsedIn" || relation.relationType === "UsedSkill")
    );

    for (const experience of relatedExperiences)
    {
      // If the relation has explicit duration metadata, use that
      if (experience.metadata?.duration)
      {
        totalDuration += experience.metadata.duration;
        continue;
      }

      // Otherwise calculate duration from dates
      if (experience.metadata?.startDate)
      {
        const startDate = new Date(experience.metadata.startDate);
        const endDate = experience.metadata?.endDate ? new Date(experience.metadata.endDate) : new Date();
        const durationInYears = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        totalDuration += durationInYears;
      }
    }

    // Also check work experiences that used this technology
    const workExperiences = graph.entities.filter(e => e.entityType === "WorkExperience");
    for (const work of workExperiences)
    {
      try
      {
        // Check if this work experience used the technology
        const expData = JSON.parse(work.observations[0] || '{}');
        if (expData.skills?.includes(technology))
        {
          const startDate = new Date(expData.startDate || work.metadata?.startDate);
          const endDate = expData.endDate ? new Date(expData.endDate) :
            work.metadata?.endDate ? new Date(work.metadata.endDate) :
              new Date();

          if (startDate)
          {
            const durationInYears = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
            totalDuration += durationInYears;
          }
        }
      } catch (error)
      {
        console.error(`Error processing work experience ${work.name}:`, error);
      }
    }

    return parseFloat(totalDuration.toFixed(2)); // Round to 2 decimal places
  }

  async calculateSkillMetrics(skillName: string): Promise<SkillMetrics> {
    const graph = await this.loadGraph();
    const skillEntity = graph.entities.find(e =>
      e.entityType === "Skill" && e.name === skillName
    );

    if (!skillEntity)
    {
      throw new Error(`Skill not found: ${skillName}`);
    }

    const skillData = JSON.parse(skillEntity.observations[0]);
    const workExperiences = skillData.workExperiences;

    if (!workExperiences.length)
    {
      return {
        skillName,
        totalYearsExperience: 0,
        lastUsed: new Date().toISOString(), // Default to current date if no experiences
        firstUsed: new Date().toISOString(),
        proficiencyLevel: "Junior" as ProficiencyLevel,
        experiencesByFunction: []
      };
    }

    // Calculate dates
    const now = new Date();
    const dates = workExperiences.map((exp: { experienceId: string }) => {
      const workExp = graph.entities.find(e =>
        e.entityType === "WorkExperience" && e.name === exp.experienceId
      );
      if (!workExp) return null;

      const expData = JSON.parse(workExp.observations[0]);
      return {
        start: new Date(expData.startDate),
        end: expData.endDate ? new Date(expData.endDate) : now
      };
    }).filter((d: { start: Date; end: Date } | null): d is { start: Date; end: Date } => d !== null);

    // Calculate first and last used dates
    const firstUsed = new Date(Math.min(...dates.map((d: { start: Date; end: Date } | null) => d!.start.getTime()))).toISOString();
    const lastUsed = new Date(Math.max(...dates.map((d: { start: Date; end: Date } | null) => d!.end.getTime()))).toISOString();

    // Calculate total years of experience
    const totalYearsExperience = dates.reduce((total: number, date: { start: Date; end: Date } | null) => {
      const years = (date!.end.getTime() - date!.start.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return total + years;
    }, 0);

    // Calculate experience by function
    const functionMap = new Map<SkillFunction, { years: number; maxLevel: ProficiencyLevel }>();
    workExperiences.forEach((exp: { experienceId: string; function: SkillFunction; level: ProficiencyLevel }) => {
      const fn = exp.function;
      const current = functionMap.get(fn) || { years: 0, maxLevel: "Junior" as ProficiencyLevel };

      // Add years for this experience
      const workExp = graph.entities.find(e =>
        e.entityType === "WorkExperience" && e.name === exp.experienceId
      );
      if (workExp)
      {
        const expData = JSON.parse(workExp.observations[0]);
        const start = new Date(expData.startDate);
        const end = expData.endDate ? new Date(expData.endDate) : now;
        const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);

        functionMap.set(fn, {
          years: current.years + years,
          maxLevel: this.getProficiencyPrecedence(exp.level) > this.getProficiencyPrecedence(current.maxLevel)
            ? exp.level
            : current.maxLevel
        });
      }
    });

    const experiencesByFunction = Array.from(functionMap.entries())
      .map(([fn, data]) => ({
        function: fn,
        years: data.years,
        level: data.maxLevel
      }));

    // Calculate overall proficiency level based on years and max level across all functions
    const maxLevel = Math.max(...Array.from(functionMap.values())
      .map(data => this.getProficiencyPrecedence(data.maxLevel)));

    const proficiencyLevel = this.getProficiencyLevel(maxLevel);

    return {
      skillName,
      totalYearsExperience,
      lastUsed,
      firstUsed,
      proficiencyLevel,
      experiencesByFunction
    };
  }

  // Helper function to get precedence of proficiency levels
  private getProficiencyPrecedence(level: ProficiencyLevel): number {
    const precedence: Record<ProficiencyLevel, number> = {
      "Junior": 1,
      "Mid": 2,
      "Senior": 3,
      "Lead": 4,
      "Expert": 5
    };
    return precedence[level];
  }

  // Helper function to get proficiency level from precedence
  private getProficiencyLevel(precedence: number): ProficiencyLevel {
    if (precedence >= 5) return "Expert";
    if (precedence >= 4) return "Lead";
    if (precedence >= 3) return "Senior";
    if (precedence >= 2) return "Mid";
    return "Junior";
  }

  // ---------------------------------------
  // OnlineContribution
  // ---------------------------------------

  async addOnlineContribution(contributions: OnlineContribution[]): Promise<OnlineContribution[]> {
    const graph = await this.loadGraph();
    const newContributions = contributions.filter(c =>
      !graph.entities.some(entity => entity.name === c.title)
    );
    graph.entities.push(...newContributions.map(c => ({
      name: c.title,
      entityType: "OnlineContribution",
      observations: [c.description || ""],
    })));
    await this.saveGraph(graph);
    return newContributions;
  }

  async deleteOnlineContribution(titles: string[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.entities = graph.entities.filter(e => !titles.includes(e.name));
    await this.saveGraph(graph);
  }

  async searchOnlineContribution(query: string): Promise<OnlineContribution[]> {
    const graph = await this.loadGraph();
    return graph.entities
      .filter(e => e.entityType === "OnlineContribution" && e.name.includes(query))
      .map(e => ({
        type: "",
        title: e.name,
        description: e.observations[0],
        url: "",
        media: [],
        dateAdded: "",
      }));
  }

  // ---------------------------------------
  // LicenseOrCertification
  // ---------------------------------------

  async addLicenseOrCertification(items: LicenseOrCertification[]): Promise<LicenseOrCertification[]> {
    const graph = await this.loadGraph();
    const newItems = items.filter(item =>
      !graph.entities.some(entity => entity.name === item.name)
    );
    graph.entities.push(...newItems.map(item => ({
      name: item.name,
      entityType: "LicenseOrCertification",
      observations: [item.description || ""],
    })));
    await this.saveGraph(graph);
    return newItems;
  }

  async deleteLicenseOrCertification(names: string[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.entities = graph.entities.filter(e => !names.includes(e.name));
    await this.saveGraph(graph);
  }

  async searchLicenseOrCertification(query: string): Promise<LicenseOrCertification[]> {
    const graph = await this.loadGraph();
    return graph.entities
      .filter(e => e.entityType === "LicenseOrCertification" && e.name.includes(query))
      .map(e => ({
        name: e.name,
        issuingOrganization: "",
        issueDate: "",
        expirationDate: "",
        credentialID: "",
        credentialURL: "",
        skills: [],
        media: [],
      }));
  }

  // ---------------------------------------
  // Project
  // ---------------------------------------

  async addProject(projects: Project[]): Promise<Project[]> {
    const graph = await this.loadGraph();
    const newProjects = projects.filter(p =>
      !graph.entities.some(entity => entity.name === p.projectName)
    );
    graph.entities.push(...newProjects.map(p => ({
      name: p.projectName,
      entityType: "Project",
      observations: [p.description || ""],
    })));
    await this.saveGraph(graph);
    return newProjects;
  }

  async deleteProject(projectNames: string[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.entities = graph.entities.filter(e => !projectNames.includes(e.name));
    await this.saveGraph(graph);
  }

  async searchProject(query: string): Promise<Project[]> {
    const graph = await this.loadGraph();
    return graph.entities
      .filter(e => e.entityType === "Project" && e.name.includes(query))
      .map(e => ({
        projectName: e.name,
        description: e.observations[0],
        skills: [],
        media: [],
        isCurrent: false,
        startDate: "",
        endDate: "",
        contributors: [],
        associatedWith: "",
      }));
  }

  // ---------------------------------------
  // Course
  // ---------------------------------------

  async addCourse(courses: Course[]): Promise<Course[]> {
    const graph = await this.loadGraph();
    const newCourses = courses.filter(c =>
      !graph.entities.some(entity => entity.name === c.courseName)
    );
    graph.entities.push(...newCourses.map(c => ({
      name: c.courseName,
      entityType: "Course",
      observations: [c.courseNumber || ""],
    })));
    await this.saveGraph(graph);
    return newCourses;
  }

  async deleteCourse(courseNames: string[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.entities = graph.entities.filter(e => !courseNames.includes(e.name));
    await this.saveGraph(graph);
  }

  async searchCourse(query: string): Promise<Course[]> {
    const graph = await this.loadGraph();
    return graph.entities
      .filter(e => e.entityType === "Course" && e.name.includes(query))
      .map(e => ({
        courseName: e.name,
        courseNumber: e.observations[0] || "",
        associatedWith: "",
      }));
  }

  // ---------------------------------------
  // Reference
  // ---------------------------------------

  async addReference(references: Reference[]): Promise<Reference[]> {
    const graph = await this.loadGraph();
    const newRefs = references.filter(r =>
      !graph.entities.some(entity => entity.name === r.name)
    );
    graph.entities.push(...newRefs.map(r => ({
      name: r.name,
      entityType: "Reference",
      observations: [r.additionalNotes || ""],
    })));
    await this.saveGraph(graph);
    return newRefs;
  }

  async deleteReference(names: string[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.entities = graph.entities.filter(e => !names.includes(e.name));
    await this.saveGraph(graph);
  }

  async searchReference(query: string): Promise<Reference[]> {
    const graph = await this.loadGraph();
    return graph.entities
      .filter(e => e.entityType === "Reference" && e.name.includes(query))
      .map(e => ({
        name: e.name,
        contactInfo: "",
        jobTitle: "",
        relation: "",
        organization: "",
        additionalNotes: e.observations[0],
      }));
  }

  // ---------------------------------------
  // Organization
  // ---------------------------------------

  async addOrganization(orgs: Organization[]): Promise<Organization[]> {
    const graph = await this.loadGraph();
    const newOrgs = orgs.filter(o =>
      !graph.entities.some(entity => entity.name === o.organizationName)
    );
    graph.entities.push(...newOrgs.map(o => ({
      name: o.organizationName,
      entityType: "Organization",
      observations: [o.description || ""],
    })));
    await this.saveGraph(graph);
    return newOrgs;
  }

  async deleteOrganization(names: string[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.entities = graph.entities.filter(e => !names.includes(e.name));
    await this.saveGraph(graph);
  }

  async searchOrganization(query: string): Promise<Organization[]> {
    const graph = await this.loadGraph();
    return graph.entities
      .filter(e => e.entityType === "Organization" && e.name.includes(query))
      .map(e => ({
        organizationName: e.name,
        positionHeld: "",
        associatedWith: "",
        isMembershipOngoing: false,
        startDate: "",
        endDate: "",
        description: e.observations[0],
      }));
  }

  // ---------------------------------------
  // HonorOrAward
  // ---------------------------------------

  async addHonorOrAward(items: HonorOrAward[]): Promise<HonorOrAward[]> {
    const graph = await this.loadGraph();
    const newItems = items.filter(item =>
      !graph.entities.some(entity => entity.name === item.title)
    );
    graph.entities.push(...newItems.map(item => ({
      name: item.title,
      entityType: "HonorOrAward",
      observations: [item.description || ""],
    })));
    await this.saveGraph(graph);
    return newItems;
  }

  async deleteHonorOrAward(titles: string[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.entities = graph.entities.filter(e => !titles.includes(e.name));
    await this.saveGraph(graph);
  }

  async searchHonorOrAward(query: string): Promise<HonorOrAward[]> {
    const graph = await this.loadGraph();
    return graph.entities
      .filter(e => e.entityType === "HonorOrAward" && e.name.includes(query))
      .map(e => ({
        title: e.name,
        associatedWith: "",
        issuer: "",
        issueDate: "",
        description: e.observations[0],
        media: [],
      }));
  }
}

const knowledgeGraphManager = new KnowledgeGraphManager();

const server = new Server(
  {
    name: "memory-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "calculate_experience",
        description: "Calculate total experience with a specific technology",
        inputSchema: {
          type: "object",
          properties: {
            technology: { type: "string" }
          },
          required: ["technology"]
        }
      },
      {
        name: "calculate_experience",
        description: "Calculate total experience with a specific technology",
        inputSchema: {
          type: "object",
          properties: {
            technology: { type: "string" },
          },
          required: ["technology"],
        },
      },
      {
        name: "add_work_experience",
        description: "Add multiple new work experiences to the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            experiences: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Title of the work experience" },
                  description: { type: "string", description: "Description or summary of the experience" },
                  employmentType: { type: "string", description: "Employment type (e.g., Full-time, Part-time, etc.)" },
                  companyName: { type: "string", description: "Name of the company or organization" },
                  isCurrentRole: { type: "boolean", description: "Indicates if this role is still ongoing" },
                  startDate: { type: "string", description: "Start date of the work (ISO 8601 format recommended)" },
                  endDate: { type: "string", description: "End date of the work (ISO 8601 format recommended)" },
                  location: { type: "string", description: "Location of the work" },
                  locationType: { type: "string", description: "Type of location (e.g., On-site, Remote, Hybrid)" },
                  profileHeadline: { type: "string", description: "Short headline for the experience" },
                  jobSource: { type: "string", description: "Source of the job listing" },
                  skills: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of relevant skills"
                  },
                  media: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of media URLs or identifiers"
                  },
                },
                required: ["title"]
              }
            }
          },
          required: ["experiences"]
        }
      },
      {
        name: "delete_work_experience",
        description: "Delete one or more work experiences from the knowledge graph by title",
        inputSchema: {
          type: "object",
          properties: {
            titles: {
              type: "array",
              items: { type: "string" },
              description: "List of work experience titles to delete"
            }
          },
          required: ["titles"]
        }
      },
      {
        name: "search_work_experience",
        description: "Search for work experiences by a text query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Query string to match against work experience titles" }
          },
          required: ["query"]
        }
      },
      {
        name: "add_education_experience",
        description: "Add multiple new education experiences to the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            experiences: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  school: { type: "string", description: "Name of the school or institution" },
                  degree: { type: "string", description: "Degree obtained or in progress" },
                  fieldOfStudy: { type: "string", description: "Field of study" },
                  startDate: { type: "string", description: "Start date (ISO 8601 format recommended)" },
                  endDate: { type: "string", description: "End date (ISO 8601 format recommended)" },
                  grade: { type: "string", description: "Grade or GPA" },
                  activitiesAndSocieties: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of activities or societies participated in"
                  },
                  description: { type: "string", description: "Additional description" },
                  skills: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of relevant skills"
                  },
                  media: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of media URLs or identifiers"
                  },
                },
                required: ["school"]
              }
            }
          },
          required: ["experiences"]
        }
      },
      {
        name: "delete_education_experience",
        description: "Delete one or more education experiences by school name",
        inputSchema: {
          type: "object",
          properties: {
            schools: {
              type: "array",
              items: { type: "string" },
              description: "List of school names to delete"
            }
          },
          required: ["schools"]
        }
      },
      {
        name: "search_education_experience",
        description: "Search for education experiences by a text query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Query string to match against school names" }
          },
          required: ["query"]
        }
      },
      {
        name: "query_technologies_used_by",
        description: "List all technologies used by a specific company",
        inputSchema: {
          type: "object",
          properties: {
            companyName: { type: "string" },
          },
          required: ["companyName"],
        },
      },
      {
        name: "add_career_break",
        description: "Add multiple new career breaks to the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            careerBreaks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", description: "Type of the career break (e.g., sabbatical, gap year)" },
                  location: { type: "string", description: "Location of the career break" },
                  isCurrent: { type: "boolean", description: "Indicates if this break is still ongoing" },
                  startDate: { type: "string", description: "Start date (ISO 8601 format recommended)" },
                  endDate: { type: "string", description: "End date (ISO 8601 format recommended)" },
                  description: { type: "string", description: "Additional description or notes" },
                  profileHeadline: { type: "string", description: "Headline or short summary" },
                  media: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of media URLs or identifiers"
                  }
                },
                required: ["type"]
              }
            }
          },
          required: ["careerBreaks"]
        }
      },
      {
        name: "delete_career_break",
        description: "Delete one or more career breaks by type",
        inputSchema: {
          type: "object",
          properties: {
            types: {
              type: "array",
              items: { type: "string" },
              description: "List of career break types to delete"
            }
          },
          required: ["types"]
        }
      },
      {
        name: "search_career_break",
        description: "Search for career breaks by a text query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Query string to match against career break types" }
          },
          required: ["query"]
        }
      },
      {
        name: "add_skill",
        description: "Add multiple new skills to the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            skills: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skillName: { type: "string", description: "Name of the skill" },
                  category: {
                    type: "string",
                    enum: ["Technical", "Programming Language", "Framework", "Platform", "Protocol", "Methodology", "Domain Knowledge", "Soft Skill"],
                    description: "Category of the skill"
                  },
                  subcategory: { type: "string", description: "Optional subcategory" },
                  relationships: {
                    type: "object",
                    properties: {
                      complementarySkills: { type: "array", items: { type: "string" } },
                      prerequisiteSkills: { type: "array", items: { type: "string" } },
                      progressionSkills: { type: "array", items: { type: "string" } }
                    },
                    required: ["complementarySkills", "prerequisiteSkills", "progressionSkills"]
                  },
                  tooling: {
                    type: "object",
                    properties: {
                      primaryTools: { type: "array", items: { type: "string" } },
                      frameworks: { type: "array", items: { type: "string" } },
                      supportingTools: { type: "array", items: { type: "string" } }
                    },
                    required: ["primaryTools", "frameworks", "supportingTools"]
                  },
                  workExperiences: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        experienceId: { type: "string" },
                        function: {
                          type: "string",
                          enum: ["Development", "Architecture", "Testing", "Management", "Consulting"]
                        },
                        level: {
                          type: "string",
                          enum: ["Junior", "Mid", "Senior", "Lead", "Expert"]
                        },
                        responsibilities: { type: "array", items: { type: "string" } },
                        projectScale: {
                          type: "string",
                          enum: ["Small", "Medium", "Large", "Enterprise"]
                        },
                        teamSize: { type: "number" }
                      },
                      required: ["experienceId", "function", "level", "responsibilities"]
                    }
                  }
                },
                required: ["skillName", "category", "relationships", "tooling", "workExperiences"]
              }
            }
          },
          required: ["skills"]
        }
      },
      {
        name: "delete_skill",
        description: "Delete one or more skills by name",
        inputSchema: {
          type: "object",
          properties: {
            skillNames: {
              type: "array",
              items: { type: "string" },
              description: "List of skill names to delete"
            }
          },
          required: ["skillNames"]
        }
      },
      {
        name: "calculate_skill_metrics",
        description: "Calculate detailed metrics for a specific skill based on work experiences",
        inputSchema: {
          type: "object",
          properties: {
            skillName: {
              type: "string",
              description: "Name of the skill to calculate metrics for"
            }
          },
          required: ["skillName"]
        }
      },
      {
        name: "search_skill",
        description: "Search for skills by a text query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Query string to match against skill names" }
          },
          required: ["query"]
        }
      },
      {
        name: "add_online_contribution",
        description: "Add multiple new online contributions to the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            contributions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", description: "Type of contribution (e.g., Blog, Article, etc.)" },
                  title: { type: "string", description: "Title of the contribution" },
                  description: { type: "string", description: "Description of the contribution" },
                  url: { type: "string", description: "URL link to the online resource" },
                  media: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of media URLs or identifiers"
                  },
                  dateAdded: { type: "string", description: "Date the contribution was added" }
                },
                required: ["title"]
              }
            }
          },
          required: ["contributions"]
        }
      },
      {
        name: "delete_online_contribution",
        description: "Delete one or more online contributions by title",
        inputSchema: {
          type: "object",
          properties: {
            titles: {
              type: "array",
              items: { type: "string" },
              description: "List of contribution titles to delete"
            }
          },
          required: ["titles"]
        }
      },
      {
        name: "search_online_contribution",
        description: "Search for online contributions by a text query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Query string to match against contribution titles" }
          },
          required: ["query"]
        }
      },
      {
        name: "add_license_or_certification",
        description: "Add multiple new licenses or certifications to the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Name of the license or certification" },
                  issuingOrganization: { type: "string", description: "Organization that issued it" },
                  issueDate: { type: "string", description: "Issue date (ISO 8601 format recommended)" },
                  expirationDate: { type: "string", description: "Expiration date (ISO 8601 format recommended)" },
                  credentialID: { type: "string", description: "Credential identifier" },
                  credentialURL: { type: "string", description: "URL to verify or see details" },
                  skills: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of related skills"
                  },
                  media: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of media URLs or identifiers"
                  },
                  description: { type: "string", description: "Additional description or notes" }
                },
                required: ["name"]
              }
            }
          },
          required: ["items"]
        }
      },
      {
        name: "delete_license_or_certification",
        description: "Delete one or more licenses or certifications by name",
        inputSchema: {
          type: "object",
          properties: {
            names: {
              type: "array",
              items: { type: "string" },
              description: "List of license/certification names to delete"
            }
          },
          required: ["names"]
        }
      },
      {
        name: "search_license_or_certification",
        description: "Search for licenses or certifications by a text query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Query string to match against names" }
          },
          required: ["query"]
        }
      },
      {
        name: "add_project",
        description: "Add multiple new projects to the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            projects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  projectName: { type: "string", description: "Name of the project" },
                  description: { type: "string", description: "Description of the project" },
                  skills: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of related skills"
                  },
                  media: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of media URLs or identifiers"
                  },
                  isCurrent: { type: "boolean", description: "Indicates if the project is still ongoing" },
                  startDate: { type: "string", description: "Start date (ISO 8601 format recommended)" },
                  endDate: { type: "string", description: "End date (ISO 8601 format recommended)" },
                  contributors: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of contributors"
                  },
                  associatedWith: { type: "string", description: "Organization or entity associated with the project" }
                },
                required: ["projectName"]
              }
            }
          },
          required: ["projects"]
        }
      },
      {
        name: "delete_project",
        description: "Delete one or more projects by project name",
        inputSchema: {
          type: "object",
          properties: {
            projectNames: {
              type: "array",
              items: { type: "string" },
              description: "List of project names to delete"
            }
          },
          required: ["projectNames"]
        }
      },
      {
        name: "search_project",
        description: "Search for projects by a text query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Query string to match against project names" }
          },
          required: ["query"]
        }
      },
      {
        name: "add_course",
        description: "Add multiple new courses to the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            courses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  courseName: { type: "string", description: "Name of the course" },
                  courseNumber: { type: "string", description: "Course number or code" },
                  associatedWith: { type: "string", description: "Associated institution or program" }
                },
                required: ["courseName"]
              }
            }
          },
          required: ["courses"]
        }
      },
      {
        name: "delete_course",
        description: "Delete one or more courses by course name",
        inputSchema: {
          type: "object",
          properties: {
            courseNames: {
              type: "array",
              items: { type: "string" },
              description: "List of course names to delete"
            }
          },
          required: ["courseNames"]
        }
      },
      {
        name: "search_course",
        description: "Search for courses by a text query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Query string to match against course names" }
          },
          required: ["query"]
        }
      },
      {
        name: "add_reference",
        description: "Add multiple new references to the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            references: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Name of the reference contact" },
                  contactInfo: { type: "string", description: "Contact information (email, phone, etc.)" },
                  jobTitle: { type: "string", description: "Job title of the reference" },
                  relation: { type: "string", description: "Relationship to the person (e.g., manager, colleague)" },
                  organization: { type: "string", description: "Organization the reference is affiliated with" },
                  additionalNotes: { type: "string", description: "Additional notes or comments" }
                },
                required: ["name"]
              }
            }
          },
          required: ["references"]
        }
      },
      {
        name: "delete_reference",
        description: "Delete one or more references by name",
        inputSchema: {
          type: "object",
          properties: {
            names: {
              type: "array",
              items: { type: "string" },
              description: "List of reference names to delete"
            }
          },
          required: ["names"]
        }
      },
      {
        name: "search_reference",
        description: "Search for references by a text query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Query string to match against reference names" }
          },
          required: ["query"]
        }
      },
      {
        name: "add_organization",
        description: "Add multiple new organizations to the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            orgs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  organizationName: { type: "string", description: "Name of the organization" },
                  positionHeld: { type: "string", description: "Position held in the organization" },
                  associatedWith: { type: "string", description: "Associated project or entity" },
                  isMembershipOngoing: { type: "boolean", description: "Indicates if membership is ongoing" },
                  startDate: { type: "string", description: "Start date (ISO 8601 format recommended)" },
                  endDate: { type: "string", description: "End date (ISO 8601 format recommended)" },
                  description: { type: "string", description: "Additional description or notes" }
                },
                required: ["organizationName"]
              }
            }
          },
          required: ["orgs"]
        }
      },
      {
        name: "delete_organization",
        description: "Delete one or more organizations by name",
        inputSchema: {
          type: "object",
          properties: {
            names: {
              type: "array",
              items: { type: "string" },
              description: "List of organization names to delete"
            }
          },
          required: ["names"]
        }
      },
      {
        name: "search_organization",
        description: "Search for organizations by a text query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Query string to match against organization names" }
          },
          required: ["query"]
        }
      },
      {
        name: "add_honor_or_award",
        description: "Add multiple new honors or awards to the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Title of the honor or award" },
                  associatedWith: { type: "string", description: "Associated organization or entity" },
                  issuer: { type: "string", description: "Organization or person issuing the award" },
                  issueDate: { type: "string", description: "Issue date (ISO 8601 format recommended)" },
                  description: { type: "string", description: "Additional description or details" },
                  media: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of media URLs or identifiers"
                  }
                },
                required: ["title"]
              }
            }
          },
          required: ["items"]
        }
      },
      {
        name: "delete_honor_or_award",
        description: "Delete one or more honors or awards by title",
        inputSchema: {
          type: "object",
          properties: {
            titles: {
              type: "array",
              items: { type: "string" },
              description: "List of honor/award titles to delete"
            }
          },
          required: ["titles"]
        }
      },
      {
        name: "search_honor_or_award",
        description: "Search for honors or awards by a text query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Query string to match against honor/award titles" }
          },
          required: ["query"]
        }
      },
      {
        name: "read_graph",
        description: "Read the entire knowledge graph",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "search_nodes",
        description: "Search for nodes in the knowledge graph based on a query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "The search query to match against entity names, types, and observation content" },
          },
          required: ["query"],
        },
      },
      {
        name: "open_nodes",
        description: "Open specific nodes in the knowledge graph by their names",
        inputSchema: {
          type: "object",
          properties: {
            names: {
              type: "array",
              items: { type: "string" },
              description: "An array of entity names to retrieve",
            },
          },
          required: ["names"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args)
  {
    throw new Error(`No arguments provided for tool: ${name}`);
  }

  switch (name)
  {
    case "calculate_experience":
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ years: await knowledgeGraphManager.calculateExperience(args.technology as string) }, null, 2)
        }]
      };
    case "read_graph":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.readGraph(), null, 2) }] };
    case "search_nodes":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.searchNodes(args.query as string), null, 2) }] };
    case "open_nodes":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.openNodes(args.names as string[]), null, 2) }] };
    case "add_work_experience":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.addWorkExperience(args.experiences as WorkExperience[]), null, 2) }] };
    case "delete_work_experience":
      await knowledgeGraphManager.deleteWorkExperience(args.titles as string[]);
      return { content: [{ type: "text", text: "Successfully deleted specified work experiences." }] };
    case "search_work_experience":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.searchWorkExperience(args.query as string), null, 2) }] };
    case "add_education_experience":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.addEducationExperience(args.experiences as EducationExperience[]), null, 2) }] };
    case "delete_education_experience":
      await knowledgeGraphManager.deleteEducationExperience(args.schools as string[]);
      return { content: [{ type: "text", text: "Successfully deleted specified education experiences." }] };
    case "search_education_experience":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.searchEducationExperience(args.query as string), null, 2) }] };
    case "add_career_break":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.addCareerBreak(args.careerBreaks as CareerBreak[]),
              null,
              2
            )
          }
        ]
      };

    case "delete_career_break":
      await knowledgeGraphManager.deleteCareerBreak(args.types as string[]);
      return {
        content: [
          {
            type: "text",
            text: "Successfully deleted specified career breaks."
          }
        ]
      };

    case "search_career_break":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.searchCareerBreak(args.query as string),
              null,
              2
            )
          }
        ]
      };
    case "add_skill":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.addSkill(args.skills as Skill[]),
              null,
              2
            )
          }
        ]
      };

    case "delete_skill":
      await knowledgeGraphManager.deleteSkill(args.skillNames as string[]);
      return {
        content: [
          {
            type: "text",
            text: "Successfully deleted specified skills."
          }
        ]
      };

    case "search_skill":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.searchSkill(args.query as string),
              null,
              2
            )
          }
        ]
      };
    case "calculate_skill_metrics":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.calculateSkillMetrics(args.skillName as string),
              null,
              2
            )
          }
        ]
      };
    case "add_online_contribution":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.addOnlineContribution(args.contributions as OnlineContribution[]),
              null,
              2
            )
          }
        ]
      };

    case "delete_online_contribution":
      await knowledgeGraphManager.deleteOnlineContribution(args.titles as string[]);
      return {
        content: [
          {
            type: "text",
            text: "Successfully deleted specified online contributions."
          }
        ]
      };

    case "search_online_contribution":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.searchOnlineContribution(args.query as string),
              null,
              2
            )
          }
        ]
      };
    case "add_license_or_certification":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.addLicenseOrCertification(args.items as LicenseOrCertification[]),
              null,
              2
            )
          }
        ]
      };

    case "delete_license_or_certification":
      await knowledgeGraphManager.deleteLicenseOrCertification(args.names as string[]);
      return {
        content: [
          {
            type: "text",
            text: "Successfully deleted specified licenses/certifications."
          }
        ]
      };

    case "search_license_or_certification":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.searchLicenseOrCertification(args.query as string),
              null,
              2
            )
          }
        ]
      };
    case "add_project":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.addProject(args.projects as Project[]),
              null,
              2
            )
          }
        ]
      };

    case "delete_project":
      await knowledgeGraphManager.deleteProject(args.projectNames as string[]);
      return {
        content: [
          {
            type: "text",
            text: "Successfully deleted specified projects."
          }
        ]
      };

    case "search_project":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.searchProject(args.query as string),
              null,
              2
            )
          }
        ]
      };
    case "add_course":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.addCourse(args.courses as Course[]),
              null,
              2
            )
          }
        ]
      };

    case "delete_course":
      await knowledgeGraphManager.deleteCourse(args.courseNames as string[]);
      return {
        content: [
          {
            type: "text",
            text: "Successfully deleted specified courses."
          }
        ]
      };

    case "search_course":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.searchCourse(args.query as string),
              null,
              2
            )
          }
        ]
      };
    case "add_reference":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.addReference(args.references as Reference[]),
              null,
              2
            )
          }
        ]
      };

    case "delete_reference":
      await knowledgeGraphManager.deleteReference(args.names as string[]);
      return {
        content: [
          {
            type: "text",
            text: "Successfully deleted specified references."
          }
        ]
      };

    case "search_reference":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.searchReference(args.query as string),
              null,
              2
            )
          }
        ]
      };
    case "add_organization":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.addOrganization(args.orgs as Organization[]),
              null,
              2
            )
          }
        ]
      };

    case "delete_organization":
      await knowledgeGraphManager.deleteOrganization(args.names as string[]);
      return {
        content: [
          {
            type: "text",
            text: "Successfully deleted specified organizations."
          }
        ]
      };

    case "search_organization":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.searchOrganization(args.query as string),
              null,
              2
            )
          }
        ]
      };
    case "add_honor_or_award":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.addHonorOrAward(args.items as HonorOrAward[]),
              null,
              2
            )
          }
        ]
      };

    case "delete_honor_or_award":
      await knowledgeGraphManager.deleteHonorOrAward(args.titles as string[]);
      return {
        content: [
          {
            type: "text",
            text: "Successfully deleted specified honors or awards."
          }
        ]
      };

    case "search_honor_or_award":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await knowledgeGraphManager.searchHonorOrAward(args.query as string),
              null,
              2
            )
          }
        ]
      };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  try
  {
    await ensureMemoryDirectory();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Knowledge Graph MCP Server running on stdio");
    console.error("Using memory file:", MEMORY_FILE_PATH);
  } catch (error)
  {
    if (error instanceof Error)
    {
      console.error("Fatal error during startup:", error.message);
      if (error.stack) console.error(error.stack);
    } else
    {
      console.error("Fatal error during startup:", error);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});