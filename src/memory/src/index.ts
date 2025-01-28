#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { z } from 'zod';
import { KnowledgeGraphManager } from './managers/KnowledgeGraphManager.js';
import { RelationManager } from './managers/RelationManager.js';
import {
  BusinessValueSchema,
  ImpactLevelSchema,
  type ProficiencyLevel,
  ProficiencyLevelSchema,
  SearchFilterSchema,
  type SearchResult
} from './types.js';

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
  degree: string; // Degree obtained, e.g., "Bachelor's"
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

type DeliverableType =
  | "Application"
  | "Framework"
  | "Infrastructure"
  | "Process"
  | "Integration"
  | "Documentation"
  | "Training";

type ImplementationScope =
  | "Prototype"
  | "MVP"
  | "Production"
  | "Enterprise"
  | "Industry";

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
  title: string;
  associatedWith?: string;
  issuer: string;
  issueDate: string;
  description?: string;
  media?: string[];
}

const knowledgeGraphManager = new KnowledgeGraphManager();
const relationManager = new RelationManager();

const server = new Server(
  {
    name: "memory-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {
        search: {
          name: 'search',
          description: 'Search the knowledge graph',
          inputSchema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['knowledge_graph', 'technology', 'impact', 'domain_expertise']
              },
              query: {
                type: 'string',
                description: 'Search query for knowledge graph search'
              },
              filters: {
                type: 'object',
                properties: {
                  excludeTypes: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  minScore: {
                    type: 'number',
                    minimum: 0,
                    maximum: 1
                  },
                  timeframe: {
                    type: 'object',
                    properties: {
                      start: { type: 'string' },
                      end: { type: 'string' }
                    }
                  },
                  technologies: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  impactLevel: {
                    type: 'string',
                    enum: ['Individual', 'Team', 'Department', 'Organization', 'Industry']
                  }
                }
              }
            }
          }
        }
      }
    }
  }
);

// Response types
interface ToolResponse {
  name: string;
  description?: string;
  inputSchema: {
    type: 'object';
    properties?: Record<string, unknown>;
  };
}

interface ServerResponse {
  _meta?: {
    [key: string]: unknown;
  };
  tools?: ToolResponse[];
  content: Array<{
    type: string;
    text: string;
  }>;
}

// Request validation schemas
const BaseRequestSchema = z.object({
  method: z.literal('search'),
  params: z.object({
    arguments: z.object({
      type: z.enum(['knowledge_graph', 'technology', 'impact', 'domain_expertise']),
      query: z.string().optional(),
      filters: SearchFilterSchema.optional(),
      technology: z.string().optional(),
      impactLevel: ImpactLevelSchema.optional(),
      businessValue: z.array(BusinessValueSchema).optional(),
      domain: z.string().optional(),
      category: z.string().optional(),
      expertiseLevel: ProficiencyLevelSchema.optional()
    })
  })
});

type SearchRequest = z.infer<typeof BaseRequestSchema>;

// Request handler
server.setRequestHandler(BaseRequestSchema, async (request: SearchRequest): Promise<ServerResponse> => {
  const knowledgeGraphManager = new KnowledgeGraphManager();

  try
  {
    const { type, query, filters, technology, impactLevel, businessValue, domain, category, expertiseLevel } = request.params.arguments;

    switch (type)
    {
      case 'knowledge_graph': {
        if (!query) throw new Error('Query is required for knowledge graph search');
        const results = await knowledgeGraphManager.search(query, filters);
        return formatResponse(results);
      }
      case 'technology': {
        if (!technology) throw new Error('Technology is required for technology search');
        const results = await knowledgeGraphManager.searchByTechnology(technology, filters);
        return formatResponse(results);
      }
      case 'impact': {
        if (!impactLevel) throw new Error('Impact level is required for impact search');
        const results = await knowledgeGraphManager.searchByImpactLevel(impactLevel, businessValue);
        return formatResponse(results);
      }
      case 'domain_expertise': {
        if (!domain) throw new Error('Domain is required for domain expertise search');
        const results = await knowledgeGraphManager.searchDomainExpertise(domain, category, expertiseLevel);
        return formatResponse(results);
      }
      default: {
        throw new Error(`Unknown search type: ${type}`);
      }
    }
  } catch (error)
  {
    return formatError(error);
  }
});

// Helper functions
function formatResponse(results: SearchResult[]): ServerResponse {
  return {
    _meta: {},
    tools: [{
      name: 'search',
      description: 'Search the knowledge graph',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['knowledge_graph', 'technology', 'impact', 'domain_expertise']
          }
        }
      }
    }],
    content: [{
      type: "text",
      text: JSON.stringify(results, null, 2)
    }]
  };
}

function formatError(error: unknown): ServerResponse {
  const response: ServerResponse = {
    _meta: {},
    tools: [{
      name: 'search',
      description: 'Search the knowledge graph',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['knowledge_graph', 'technology', 'impact', 'domain_expertise']
          }
        }
      }
    }],
    content: [{
      type: "text",
      text: error instanceof Error ? error.message : "Unknown error"
    }]
  };

  if (error instanceof z.ZodError)
  {
    response.content[0].text = JSON.stringify({
      error: "Invalid parameters",
      details: error.errors
    }, null, 2);
  } else
  {
    response.content[0].text = JSON.stringify({
      error: "Operation failed",
      message: error instanceof Error ? error.message : "Unknown error"
    }, null, 2);
  }

  return response;
}

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