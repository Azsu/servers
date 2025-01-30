import { BusinessValue, ImpactLevel } from '../types.js';

/**
 * Search filter configuration
 */
export interface SearchFilter {
    excludeTypes?: string[];
    minScore?: number;
    timeframe?: { start: string; end: string };
    technologies?: string[];
    impactLevel?: ImpactLevel;
}

/**
 * Search result item
 */
export interface SearchResult {
    type: string;
    item: any;
    score: number;
}

/**
 * Achievement data structure
 */
export interface Achievement {
    name: string;
    description: string;
    impactLevel: ImpactLevel;
    businessValue: BusinessValue[];
    metrics: {
        quantitative: string[];
        qualitative: string[];
    };
}

/**
 * Technical implementation data structure
 */
export interface TechnicalImplementation {
    name: string;
    description: string;
    architecture?: {
        patterns: string[];
        technologies: string[];
    };
    challenges?: string[];
}