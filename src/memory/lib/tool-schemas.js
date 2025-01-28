import { z } from 'zod';
import { BusinessValueSchema, ImpactLevelSchema, ProficiencyLevelSchema, SearchFilterSchema } from './types.js';
// Request parameter schemas
export const SearchKnowledgeGraphParamsSchema = z.object({
    query: z.string().min(1),
    filters: SearchFilterSchema.optional()
});
export const SearchByTechnologyParamsSchema = z.object({
    technology: z.string().min(1),
    filters: SearchFilterSchema.optional()
});
export const SearchByImpactParamsSchema = z.object({
    impactLevel: ImpactLevelSchema,
    businessValue: z.array(BusinessValueSchema).optional()
});
export const SearchDomainExpertiseParamsSchema = z.object({
    domain: z.string().min(1),
    category: z.string().optional(),
    expertiseLevel: ProficiencyLevelSchema.optional()
});
