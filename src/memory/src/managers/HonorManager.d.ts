import { BaseEntityManager } from './BaseEntityManager';
import { RelationManager } from './RelationManager';

export type HonorOrAward = {
    title: string;
    issuer: string;
    dateReceived: string;
    description: string;
    associatedWith?: string;
    media?: string[];
};

export type HonorMetadata = {
    issuer?: string;
    dateReceived?: string;
    description?: string;
};

export declare class HonorManager extends BaseEntityManager<HonorOrAward> {
    constructor(relationManager: RelationManager);
    addHonor(honor: HonorOrAward): Promise<void>;
    updateHonor(id: string, honor: HonorOrAward): Promise<void>;
    deleteHonor(id: string): Promise<void>;
    getHonorById(id: string): Promise<HonorOrAward | undefined>;
    searchHonors(query: string): Promise<HonorOrAward[]>;
    filterHonors(options: {
        issuer?: string;
        associatedWith?: string;
    }): Promise<HonorOrAward[]>;
    protected generateId(title: string): string;
}