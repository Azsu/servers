/**
 * @file types.ts
 * @description Central type definition and export hub for the entire application
 *
 * @baseClassUsage
 * - Type re-exports
 * - Schema re-exports
 * - Constant re-exports
 * - Type organization
 *
 * @specialization
 * - Business value types
 * - Impact level types
 * - Proficiency level types
 * - Implementation scope types
 * - Deliverable types
 * - Project scale types
 * - Skill categorization
 *
 * @important
 * This file serves as the central type hub:
 * - Single source of truth for types
 * - Consistent type usage
 * - Type safety enforcement
 * - Schema validation
 * - Constant definitions
 *
 * @usage
 * // Import types and schemas
 * import {
 *   BusinessValue,
 *   IMPACT_LEVELS,
 *   BusinessValueSchema
 * } from '../types';
 *
 * // Use in type definitions
 * type MyType = {
 *   value: BusinessValue;
 *   impact: ImpactLevel;
 * };
 */

import {
  BUSINESS_VALUES,
  BusinessValueSchema,
  DELIVERABLE_TYPES,
  DeliverableTypeSchema,
  IMPACT_LEVELS,
  ImpactLevelSchema,
  IMPLEMENTATION_SCOPES,
  ImplementationScopeSchema,
  PROFICIENCY_LEVELS,
  ProficiencyLevelSchema,
  type BusinessValue,
  type DeliverableType,
  type ImpactLevel,
  type ImplementationScope,
  type ProficiencyLevel,
  type ProjectScale,
  type RelationType,
  type SkillCategory,
  type SkillFunction
} from './types/index.js';

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
  ProficiencyLevel,
  ProficiencyLevelSchema,
  ProjectScale,
  RelationType,
  SkillCategory,
  SkillFunction
};
