import { ProfessionalContribution } from '../types';
export declare class ProfessionalContributionManager {
    private contributions;
    addContribution(contributions: ProfessionalContribution[]): Promise<ProfessionalContribution[]>;
    searchContributions(query: string): Promise<ProfessionalContribution[]>;
    getContributionsByType(type: ProfessionalContribution['type']): Promise<ProfessionalContribution[]>;
    getContributionsByTopic(topic: string): Promise<ProfessionalContribution[]>;
    private matchesSearch;
    private createContributionRelationships;
    private generateId;
}
