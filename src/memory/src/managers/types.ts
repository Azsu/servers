/**
 * @file types.ts
 * @description Core type definitions for the entity management system
 *
 * @scope
 * - Defines base entity and relation types
 * - Provides Zod schemas for validation
 * - Defines common enums and constants
 * - Re-exports domain-specific types
 *
 * @types
 * BaseMetadata - Common metadata fields for all entities
 * Entity - Base entity type with extensible metadata
 * Relation - Relationship between entities
 * KnowledgeGraph - Collection of entities and relations
 *
 * @schemas
 * EntitySchema - Validation schema for entities
 * RelationSchema - Validation schema for relations
 * KnowledgeGraphSchema - Validation schema for the entire graph
 *
 * @usage
 * ```typescript
 * interface CustomMetadata extends BaseMetadata {
 *   customField: string;
 * }
 *
 * interface CustomEntity extends Entity {
 *   metadata: CustomMetadata;
 * }
 * ```
 */

import { z } from 'zod';
import {
    BUSINESS_VALUES,
    BusinessValue,
    BusinessValueSchema,
    DELIVERABLE_TYPES,
    DeliverableType,
    DeliverableTypeSchema,
    IMPACT_LEVELS,
    ImpactLevel,
    ImpactLevelSchema,
    IMPLEMENTATION_SCOPES,
    ImplementationScope,
    ImplementationScopeSchema,
    PROFICIENCY_LEVELS,
    ProficiencyLevelSchema,
    ProjectScale,
    RelationType,
    SkillCategory,
    SkillFunction
} from '../types/index.js';

// Base metadata interface that all entity metadata should extend
export interface BaseMetadata {
    startDate?: string;
    endDate?: string;
    duration?: number;
    description?: string;
    [key: string]: any;  // Allow additional fields
}

// Base types
export interface Entity {
    name: string;
    entityType: string;
    observations: string[];
    metadata?: BaseMetadata;
}

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

export interface KnowledgeGraph {
    entities: Entity[];
    relations: Relation[];
}

// Zod Schemas
export const BaseMetadataSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    duration: z.number().optional(),
    description: z.string().optional(),
}).passthrough();  // Allow additional fields

export const EntitySchema = z.object({
    name: z.string(),
    entityType: z.string(),
    observations: z.array(z.string()),
    metadata: BaseMetadataSchema.optional(),
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
        level: z.string().optional(),
        context: z.string().optional(),
        role: z.string().optional(),
        impact: z.string().optional(),
        responsibilities: z.array(z.string()).optional(),
        relevance: z.string().optional(),
        skills: z.array(z.string()).optional()
    }).passthrough().optional(),  // Allow additional fields
});

export const KnowledgeGraphSchema = z.object({
    entities: z.array(EntitySchema),
    relations: z.array(RelationSchema),
});

// Common types
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type EntityType = 'WORK_EXPERIENCE' | 'PROJECT' | 'SKILL' | 'EDUCATION' | 'CONTRIBUTION';

// Re-export types from types/index.ts
export {
    BUSINESS_VALUES,
    BusinessValue,
    BusinessValueSchema,
    DELIVERABLE_TYPES,
    DeliverableType,
    DeliverableTypeSchema,
    IMPACT_LEVELS,
    ImpactLevel,
    ImpactLevelSchema,
    IMPLEMENTATION_SCOPES,
    ImplementationScope,
    ImplementationScopeSchema,
    PROFICIENCY_LEVELS,
    ProficiencyLevelSchema,
    ProjectScale,
    RelationType,
    SkillCategory,
    SkillFunction
};
