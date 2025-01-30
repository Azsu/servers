/**
 * @file index.ts
 * @description Core domain-specific type definitions and constants for the knowledge graph system
 *
 * @scope Defines domain types, constants, and validation schemas for the entity management system
 *
 * @exports
 * Constants: PROFICIENCY_LEVELS, IMPACT_LEVELS, BUSINESS_VALUES, IMPLEMENTATION_SCOPES, DELIVERABLE_TYPES, RELATION_TYPES
 * Types: ProficiencyLevel, ImpactLevel, BusinessValue, ImplementationScope, DeliverableType, RelationType, SkillCategory, SkillFunction
 * Schemas: Zod validation schemas for all enum types
 *
 * @usage
 * import { PROFICIENCY_LEVELS, SkillCategory, ProficiencyLevelSchema } from './types';
 *
 * @notes
 * - All constants use 'as const' for readonly arrays
 * - All enums have corresponding Zod schemas
 * - Relation types follow naming pattern: ACTION_TARGET or HAS_PROPERTY
 *
 * @instructions
 * DO:
 * - Add new domain-wide constants and types here
 * - Create corresponding Zod schemas for new types
 * - Keep type names generic and domain-focused
 * DON'T:
 * - Add manager-specific types (put these in manager's types)
 * - Add implementation-specific enums
 * - Mix domain types with entity structure
 *
 * @todo
 * - Add enum value descriptions
 * - Add validation rules for combinations
 * - Add hierarchical type relationships
 */

import { z } from 'zod';

// Constants
export const PROFICIENCY_LEVELS = ['Junior', 'Mid', 'Senior', 'Lead', 'Expert'] as const;
export const IMPACT_LEVELS = ['Low', 'Medium', 'High', 'Critical'] as const;
export const BUSINESS_VALUES = ['Revenue', 'Cost', 'Efficiency', 'Quality', 'Innovation'] as const;
export const IMPLEMENTATION_SCOPES = [
    'Component',
    'Service',
    'System',
    'Platform',
    'Enterprise'
] as const;
export const DELIVERABLE_TYPES = [
    'Code',
    'Documentation',
    'Design',
    'Architecture',
    'Process',
    'Research',
    'Analysis',
    'Report'
] as const;
export const RELATION_TYPES = [
    'implements',
    'uses',
    'requires',
    'contributes_to',
    'ACHIEVEMENT_EXPERIENCE',
    'IMPLEMENTATION_EXPERIENCE',
    'DOMAIN_SKILL',
    'CONTRIBUTION_DOMAIN',
    'IMPLEMENTATION_TECHNOLOGY',
    'SKILL_USAGE',
    'HAS_IMPACT',
    'HAS_TYPE',
    'HAS_PROFICIENCY',
    'HAS_SCOPE',
    'WORKS_AT',
    'LOCATED_AT'
] as const;

// Basic Types
export type ProficiencyLevel = typeof PROFICIENCY_LEVELS[number];
export type ImpactLevel = typeof IMPACT_LEVELS[number];
export type BusinessValue = typeof BUSINESS_VALUES[number];
export type ImplementationScope = typeof IMPLEMENTATION_SCOPES[number];
export type DeliverableType = typeof DELIVERABLE_TYPES[number];
export type RelationType = typeof RELATION_TYPES[number];

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

export type ProjectScale =
    | "Small"
    | "Medium"
    | "Large"
    | "Enterprise";

// Zod Schemas
export const ProficiencyLevelSchema = z.enum(PROFICIENCY_LEVELS);
export const ImpactLevelSchema = z.enum(IMPACT_LEVELS);
export const BusinessValueSchema = z.enum(BUSINESS_VALUES);
export const ImplementationScopeSchema = z.enum(IMPLEMENTATION_SCOPES);
export const DeliverableTypeSchema = z.enum(DELIVERABLE_TYPES);