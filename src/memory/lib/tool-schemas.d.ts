import { z } from 'zod';
export declare const SearchKnowledgeGraphParamsSchema: z.ZodObject<{
    query: z.ZodString;
    filters: z.ZodOptional<z.ZodObject<{
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
    }>>;
}, "strip", z.ZodTypeAny, {
    query: string;
    filters?: {
        excludeTypes?: string[] | undefined;
        minScore?: number | undefined;
        timeframe?: {
            start: string;
            end: string;
        } | undefined;
        technologies?: string[] | undefined;
        impactLevel?: "Industry" | "Individual" | "Team" | "Department" | "Organization" | undefined;
    } | undefined;
}, {
    query: string;
    filters?: {
        excludeTypes?: string[] | undefined;
        minScore?: number | undefined;
        timeframe?: {
            start: string;
            end: string;
        } | undefined;
        technologies?: string[] | undefined;
        impactLevel?: "Industry" | "Individual" | "Team" | "Department" | "Organization" | undefined;
    } | undefined;
}>;
export type SearchKnowledgeGraphParams = z.infer<typeof SearchKnowledgeGraphParamsSchema>;
export declare const SearchByTechnologyParamsSchema: z.ZodObject<{
    technology: z.ZodString;
    filters: z.ZodOptional<z.ZodObject<{
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
    }>>;
}, "strip", z.ZodTypeAny, {
    technology: string;
    filters?: {
        excludeTypes?: string[] | undefined;
        minScore?: number | undefined;
        timeframe?: {
            start: string;
            end: string;
        } | undefined;
        technologies?: string[] | undefined;
        impactLevel?: "Industry" | "Individual" | "Team" | "Department" | "Organization" | undefined;
    } | undefined;
}, {
    technology: string;
    filters?: {
        excludeTypes?: string[] | undefined;
        minScore?: number | undefined;
        timeframe?: {
            start: string;
            end: string;
        } | undefined;
        technologies?: string[] | undefined;
        impactLevel?: "Industry" | "Individual" | "Team" | "Department" | "Organization" | undefined;
    } | undefined;
}>;
export type SearchByTechnologyParams = z.infer<typeof SearchByTechnologyParamsSchema>;
export declare const SearchByImpactParamsSchema: z.ZodObject<{
    impactLevel: z.ZodEnum<["Individual", "Team", "Department", "Organization", "Industry"]>;
    businessValue: z.ZodOptional<z.ZodArray<z.ZodEnum<["Cost Reduction", "Revenue Growth", "Process Improvement", "Innovation", "Risk Mitigation", "Customer Satisfaction", "Market Expansion"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    impactLevel: "Industry" | "Individual" | "Team" | "Department" | "Organization";
    businessValue?: ("Cost Reduction" | "Revenue Growth" | "Process Improvement" | "Innovation" | "Risk Mitigation" | "Customer Satisfaction" | "Market Expansion")[] | undefined;
}, {
    impactLevel: "Industry" | "Individual" | "Team" | "Department" | "Organization";
    businessValue?: ("Cost Reduction" | "Revenue Growth" | "Process Improvement" | "Innovation" | "Risk Mitigation" | "Customer Satisfaction" | "Market Expansion")[] | undefined;
}>;
export type SearchByImpactParams = z.infer<typeof SearchByImpactParamsSchema>;
export declare const SearchDomainExpertiseParamsSchema: z.ZodObject<{
    domain: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    expertiseLevel: z.ZodOptional<z.ZodEnum<["Junior", "Mid", "Senior", "Lead", "Expert"]>>;
}, "strip", z.ZodTypeAny, {
    domain: string;
    category?: string | undefined;
    expertiseLevel?: "Junior" | "Mid" | "Senior" | "Lead" | "Expert" | undefined;
}, {
    domain: string;
    category?: string | undefined;
    expertiseLevel?: "Junior" | "Mid" | "Senior" | "Lead" | "Expert" | undefined;
}>;
export type SearchDomainExpertiseParams = z.infer<typeof SearchDomainExpertiseParamsSchema>;
