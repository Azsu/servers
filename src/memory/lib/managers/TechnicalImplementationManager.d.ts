import { TechnicalImplementation } from '../types';
export declare class TechnicalImplementationManager {
    private implementations;
    addImplementation(implementations: TechnicalImplementation[]): Promise<TechnicalImplementation[]>;
    searchImplementations(query: string): Promise<TechnicalImplementation[]>;
    getImplementationsByTechnology(technology: string): Promise<TechnicalImplementation[]>;
    private matchesSearch;
    private createTechnologyRelationships;
    private validateExperienceId;
    private generateId;
}
