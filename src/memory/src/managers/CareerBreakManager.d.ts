import { BaseEntityManager } from './BaseEntityManager';
import { RelationManager } from './RelationManager';

export type CareerBreak = {
    type: string;
    location?: string;
    isCurrent: boolean;
    startDate: string;
    endDate?: string;
    description?: string;
    profileHeadline?: string;
    media?: string[];
};

export type CareerBreakMetadata = {
    startDate?: string;
    endDate?: string;
    description?: string;
    location?: string;
};

export declare class CareerBreakManager extends BaseEntityManager<CareerBreak> {
    constructor(relationManager: RelationManager);
    addCareerBreak(careerBreak: CareerBreak): Promise<void>;
    updateCareerBreak(id: string, careerBreak: CareerBreak): Promise<void>;
    deleteCareerBreak(id: string): Promise<void>;
    getCareerBreakById(id: string): Promise<CareerBreak | undefined>;
    searchCareerBreaks(query: string): Promise<CareerBreak[]>;
    filterCareerBreaks(options: {
        dateRange?: { startDate: string; endDate: string };
        type?: string;
        currentOnly?: boolean;
    }): Promise<CareerBreak[]>;
    protected generateId(type: string): string;
}