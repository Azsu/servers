/**
 * @file KnowledgeGraphTools.ts
 * @description Registers and configures tools for interacting with the knowledge graph
 *
 * @baseClassUsage
 * - Tool registration
 * - Schema definition
 * - Handler binding
 * - Manager integration
 *
 * @specialization
 * - Work experience tools
 * - Education tools
 * - Skill tools
 * - Achievement tools
 * - Project tools
 * - Implementation tools
 * - Domain expertise tools
 *
 * @important
 * This file provides tool registration functionality:
 * - Schema validation for each tool
 * - Handler mapping to manager methods
 * - Type-safe parameter validation
 * - Consistent tool interfaces
 * - Centralized tool management
 *
 * @usage
 * // Register all tools
 * const manager = new KnowledgeGraphManager();
 * registerKnowledgeGraphTools(manager);
 *
 * // Tools are now available:
 * // - add_work_experience
 * // - search_education
 * // - add_skill
 * // - search_achievements
 * // - add_project
 * // - search_implementations
 */

import { z } from 'zod';
import { IMPACT_LEVELS, PROFICIENCY_LEVELS } from '../types.js';
import { KnowledgeGraphManager } from './KnowledgeGraphManager.js';
import { ToolRegistry } from './ToolRegistry.js';

/**
 * Registers all KnowledgeGraphManager functionality as tools
 */
export function registerKnowledgeGraphTools(manager: KnowledgeGraphManager) {
    const registry = ToolRegistry.getInstance();

    // Work Experience Tools
    registry.registerTool({
        name: 'add_work_experience',
        description: 'Add a new work experience entry',
        schema: z.object({
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
            media: z.array(z.string()).optional()
        }),
        handler: (params) => manager.addWorkExperience(params)
    });

    registry.registerTool({
        name: 'search_work_experience',
        description: 'Search for work experiences',
        schema: z.object({
            query: z.string(),
            filters: z.object({
                dateRange: z.object({
                    startDate: z.string(),
                    endDate: z.string()
                }).optional(),
                company: z.string().optional(),
                currentOnly: z.boolean().optional()
            }).optional()
        }),
        handler: async (params) => {
            if (params.filters)
            {
                return manager.filterWorkExperiences(params.filters);
            }
            return manager.searchWorkExperiences(params.query);
        }
    });

    // Education Tools
    registry.registerTool({
        name: 'add_education',
        description: 'Add a new education experience',
        schema: z.object({
            school: z.string(),
            degree: z.string(),
            fieldOfStudy: z.string(),
            startDate: z.string(),
            endDate: z.string().optional(),
            grade: z.string().optional(),
            activitiesAndSocieties: z.array(z.string()).optional(),
            description: z.string().optional(),
            skills: z.array(z.string()).optional(),
            media: z.array(z.string()).optional()
        }),
        handler: (params) => manager.addEducation(params)
    });

    registry.registerTool({
        name: 'search_education',
        description: 'Search for education experiences',
        schema: z.object({
            query: z.string()
        }),
        handler: (params) => manager.searchEducation(params.query)
    });

    // Skill Tools
    registry.registerTool({
        name: 'add_skill',
        description: 'Add a new skill',
        schema: z.object({
            name: z.string(),
            category: z.string(),
            proficiencyLevel: z.enum(PROFICIENCY_LEVELS),
            yearsOfExperience: z.number(),
            description: z.string().optional(),
            endorsements: z.array(z.string()).optional(),
            projects: z.array(z.string()).optional(),
            certifications: z.array(z.string()).optional()
        }),
        handler: (params) => manager.addSkill(params)
    });

    registry.registerTool({
        name: 'search_skills',
        description: 'Search for skills',
        schema: z.object({
            query: z.string()
        }),
        handler: (params) => manager.searchSkills(params.query)
    });

    // Achievement Tools
    registry.registerTool({
        name: 'add_achievement',
        description: 'Add a new achievement',
        schema: z.object({
            title: z.string(),
            description: z.string(),
            impactLevel: z.enum(IMPACT_LEVELS),
            businessValue: z.array(z.string()),
            deliverableType: z.string(),
            metrics: z.object({
                quantitative: z.array(z.string()),
                qualitative: z.array(z.string())
            })
        }),
        handler: (params) => manager.addAchievement(params)
    });

    registry.registerTool({
        name: 'search_achievements',
        description: 'Search for achievements',
        schema: z.object({
            query: z.string()
        }),
        handler: (params) => manager.searchAchievements(params.query)
    });

    // Project Tools
    registry.registerTool({
        name: 'add_project',
        description: 'Add a new project',
        schema: z.object({
            projectName: z.string(),
            description: z.string().optional(),
            skills: z.array(z.string()).optional(),
            media: z.array(z.string()).optional(),
            isCurrent: z.boolean(),
            startDate: z.string(),
            endDate: z.string().optional(),
            contributors: z.array(z.string()).optional(),
            associatedWith: z.string().optional()
        }),
        handler: (params) => manager.addProject(params)
    });

    registry.registerTool({
        name: 'search_projects',
        description: 'Search for projects',
        schema: z.object({
            query: z.string(),
            filters: z.object({
                currentOnly: z.boolean().optional(),
                associatedWith: z.string().optional()
            }).optional()
        }),
        handler: async (params) => {
            if (params.filters)
            {
                return manager.filterProjects(params.filters);
            }
            return manager.searchProjects(params.query);
        }
    });

    // Technical Implementation Tools
    registry.registerTool({
        name: 'add_implementation',
        description: 'Add a new technical implementation',
        schema: z.object({
            name: z.string(),
            description: z.string(),
            technologies: z.array(z.string()),
            proficiencyLevel: z.enum(PROFICIENCY_LEVELS),
            scope: z.string(),
            architecture: z.object({
                patterns: z.array(z.string()),
                technologies: z.array(z.string())
            }).optional(),
            challenges: z.array(z.string()).optional()
        }),
        handler: (params) => manager.addTechnicalImplementation(params)
    });

    registry.registerTool({
        name: 'search_implementations',
        description: 'Search for technical implementations',
        schema: z.object({
            query: z.string()
        }),
        handler: (params) => manager.searchImplementations(params.query)
    });

    // Domain Expertise Tools
    registry.registerTool({
        name: 'add_domain_expertise',
        description: 'Add new domain expertise',
        schema: z.object({
            domain: z.string(),
            category: z.string(),
            level: z.enum(PROFICIENCY_LEVELS),
            specializations: z.array(z.string())
        }),
        handler: (params) => manager.addDomainExpertise(params)
    });

    registry.registerTool({
        name: 'search_domain_expertise',
        description: 'Search for domain expertise',
        schema: z.object({
            domain: z.string(),
            category: z.string().optional(),
            expertiseLevel: z.enum(PROFICIENCY_LEVELS).optional()
        }),
        handler: (params) => manager.searchDomainExpertise(params.domain, params.category, params.expertiseLevel)
    });
}
