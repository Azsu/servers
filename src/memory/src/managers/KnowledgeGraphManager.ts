/**
 * @file KnowledgeGraphManager.ts
 * @description Central manager coordinating all entity managers and graph operations
 *
 * @baseClassUsage
 * - Coordinates all specialized entity managers
 * - Manages graph-wide operations
 * - Handles cross-entity relationships
 * - Provides unified search interface
 *
 * @specialization
 * - Work experience tracking
 * - Education management
 * - Skills and expertise
 * - Projects and contributions
 * - Certifications and honors
 * - Career breaks
 * - Professional references
 *
 * @important
 * This manager serves as the central coordinator:
 * - Delegates operations to specialized managers
 * - Maintains graph consistency
 * - Handles cross-entity relationships
 * - Provides unified search and filtering
 * - Manages entity lifecycle
 *
 * @usage
 * // Add work experience
 * await manager.addWorkExperience({
 *   title: "Software Engineer",
 *   company: "Tech Corp"
 * });
 *
 * // Add education
 * await manager.addEducation({
 *   school: "University",
 *   degree: "Computer Science"
 * });
 *
 * // Search across all entities
 * const results = await manager.searchManager.search("software");
 */

import { GraphOperations } from '../graph-operations.js';
import {
    PROFICIENCY_LEVELS,
    type Achievement,
    type BusinessValue,
    type CareerBreak,
    type Course,
    type DomainExpertise,
    type EducationExperience,
    type HonorOrAward,
    type ImpactLevel,
    type LicenseOrCertification,
    type OnlineContribution,
    type Organization,
    type ProfessionalContribution,
    type ProficiencyLevel,
    type Project,
    type Reference,
    type SearchFilter,
    type SearchResult,
    type Skill,
    type TechnicalImplementation,
    type WorkExperience
} from '../types.js';
import { AchievementManager } from './AchievementManager.js';
import { CareerBreakManager } from './CareerBreakManager.js';
import { CertificationManager } from './CertificationManager.js';
import { ContributionManager } from './ContributionManager.js';
import { CourseManager } from './CourseManager.js';
import { DomainExpertiseManager } from './DomainExpertiseManager.js';
import { EducationManager } from './EducationManager.js';
import { HonorManager } from './HonorManager.js';
import { OrganizationManager } from './OrganizationManager.js';
import { ProjectManager } from './ProjectManager.js';
import { ReferenceManager } from './ReferenceManager.js';
import { RelationManager } from './RelationManager.js';
import { SearchManager } from './SearchManager.js';
import { SkillManager } from './SkillManager.js';
import { TechnicalImplementationManager } from './TechnicalImplementationManager.js';
import { WorkExperienceManager } from './WorkExperienceManager.js';

export class KnowledgeGraphManager {
    private relationManager: RelationManager;
    private workExperienceManager: WorkExperienceManager;
    private educationManager: EducationManager;
    private skillManager: SkillManager;
    private achievementManager: AchievementManager;
    private careerBreakManager: CareerBreakManager;
    private certificationManager: CertificationManager;
    private contributionManager: ContributionManager;
    private courseManager: CourseManager;
    private domainExpertiseManager: DomainExpertiseManager;
    private honorManager: HonorManager;
    private organizationManager: OrganizationManager;
    private projectManager: ProjectManager;
    private referenceManager: ReferenceManager;
    private technicalImplementationManager: TechnicalImplementationManager;
    private searchManager: SearchManager;
    private graph: GraphOperations;

    constructor(
        graph: GraphOperations,
        contributionManager: ContributionManager,
        achievementManager: AchievementManager,
        technicalImplementationManager: TechnicalImplementationManager,
        domainExpertiseManager: DomainExpertiseManager,
        relationManager: RelationManager
    ) {
        this.relationManager = relationManager;
        this.workExperienceManager = new WorkExperienceManager(this.relationManager);
        this.educationManager = new EducationManager(this.relationManager);
        this.skillManager = new SkillManager(this.relationManager);
        this.achievementManager = achievementManager;
        this.careerBreakManager = new CareerBreakManager(this.relationManager);
        this.certificationManager = new CertificationManager(this.relationManager);
        this.contributionManager = contributionManager;
        this.courseManager = new CourseManager(this.relationManager);
        this.domainExpertiseManager = domainExpertiseManager;
        this.honorManager = new HonorManager(this.relationManager);
        this.organizationManager = new OrganizationManager(this.relationManager);
        this.projectManager = new ProjectManager(this.relationManager);
        this.referenceManager = new ReferenceManager(this.relationManager);
        this.technicalImplementationManager = technicalImplementationManager;
        this.searchManager = new SearchManager(
            this.achievementManager,
            this.technicalImplementationManager,
            this.domainExpertiseManager,
            this.contributionManager,
            this.relationManager
        );
        this.graph = graph;
    }

    // Work Experience methods
    async addWorkExperience(experience: WorkExperience): Promise<void> {
        return this.workExperienceManager.addWorkExperience(experience);
    }

    async searchWorkExperiences(query: string): Promise<WorkExperience[]> {
        return this.workExperienceManager.searchWorkExperiences(query);
    }

    // Education methods
    async addEducation(education: EducationExperience): Promise<void> {
        return this.educationManager.addEducation(education);
    }

    async searchEducation(query: string): Promise<EducationExperience[]> {
        return this.educationManager.searchEducation(query);
    }

    // Skill methods
    async addSkill(skill: Skill): Promise<void> {
        return this.skillManager.addSkill(skill);
    }

    async searchSkills(query: string): Promise<Skill[]> {
        return this.skillManager.searchSkills(query);
    }

    // Career Break methods
    async addCareerBreak(careerBreak: CareerBreak): Promise<void> {
        return this.careerBreakManager.addCareerBreak(careerBreak);
    }

    async searchCareerBreaks(query: string): Promise<CareerBreak[]> {
        return this.careerBreakManager.searchCareerBreaks(query);
    }

    // Project methods
    async addProject(project: Project): Promise<void> {
        return this.projectManager.addProject(project);
    }

    async searchProjects(query: string): Promise<Project[]> {
        return this.projectManager.searchProjects(query);
    }

    // Contribution methods
    async addContribution(contribution: OnlineContribution): Promise<void> {
        return this.contributionManager.addOnlineContribution([contribution]).then(() => void 0);
    }

    async addProfessionalContribution(contribution: ProfessionalContribution): Promise<void> {
        return this.contributionManager.addProfessionalContribution([contribution]).then(() => void 0);
    }

    async searchContributions(query: string): Promise<OnlineContribution[]> {
        return this.contributionManager.searchOnlineContributions(query);
    }

    async searchProfessionalContributions(query: string): Promise<ProfessionalContribution[]> {
        return this.contributionManager.searchProfessionalContributions(query);
    }

    async getContributionById(id: string): Promise<OnlineContribution | undefined> {
        return this.contributionManager.getOnlineContributionById(id);
    }

    async getProfessionalContributionById(id: string): Promise<ProfessionalContribution | undefined> {
        return this.contributionManager.getProfessionalContributionById(id);
    }

    async updateContribution(id: string, contribution: OnlineContribution): Promise<void> {
        return this.contributionManager.updateOnlineContribution(id, contribution);
    }

    async updateProfessionalContribution(id: string, contribution: ProfessionalContribution): Promise<void> {
        return this.contributionManager.updateProfessionalContribution(id, contribution);
    }

    async deleteContribution(id: string): Promise<void> {
        await this.contributionManager.deleteOnlineContribution([id]);
    }

    async deleteProfessionalContribution(id: string): Promise<void> {
        await this.contributionManager.deleteProfessionalContribution([id]);
    }

    async filterContributions(filters: { type?: string; dateRange?: { startDate: string; endDate: string } }): Promise<OnlineContribution[]> {
        if (filters.type)
        {
            return this.contributionManager.searchOnlineContributions(filters.type);
        }
        // TODO: Implement date range filtering
        return [];
    }

    private generateId(title: string): string {
        return title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    // Certification methods
    async addCertification(certification: LicenseOrCertification): Promise<void> {
        return this.certificationManager.addCertification(certification);
    }

    async searchCertifications(query: string): Promise<LicenseOrCertification[]> {
        return this.certificationManager.searchCertifications(query);
    }

    // Organization methods
    async addOrganization(organization: Organization): Promise<void> {
        return this.organizationManager.addOrganization(organization);
    }

    async searchOrganizations(query: string): Promise<Organization[]> {
        return this.organizationManager.searchOrganizations(query);
    }

    // Course methods
    async addCourse(course: Course): Promise<void> {
        return this.courseManager.addCourse(course);
    }

    async searchCourses(query: string): Promise<Course[]> {
        return this.courseManager.searchCourses(query);
    }

    // Reference methods
    async addReference(reference: Reference): Promise<void> {
        return this.referenceManager.addReference(reference);
    }

    async searchReferences(query: string): Promise<Reference[]> {
        return this.referenceManager.searchReferences(query);
    }

    // Honor methods
    async addHonor(honor: HonorOrAward): Promise<void> {
        return this.honorManager.addHonor(honor);
    }

    async searchHonors(query: string): Promise<HonorOrAward[]> {
        return this.honorManager.searchHonors(query);
    }

    // Achievement methods
    async addAchievement(achievement: Achievement): Promise<void> {
        try
        {
            await this.graph.createEntities([{
                name: achievement.title,
                entityType: 'Achievement',
                observations: [achievement.description],
                metadata: {
                    description: achievement.description
                }
            }]);
        } catch (error)
        {
            throw new Error(`Failed to add achievement: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async searchAchievements(query: string): Promise<Achievement[]> {
        const searchTerms = query.toLowerCase().split(' ');
        return this.achievementManager.searchAchievements(searchTerms);
    }

    // Technical Implementation methods
    async addTechnicalImplementation(implementation: TechnicalImplementation): Promise<void> {
        try
        {
            await this.graph.createEntities([{
                name: implementation.name,
                entityType: 'TechnicalImplementation',
                observations: [implementation.description],
                metadata: {
                    description: implementation.description
                }
            }]);
        } catch (error)
        {
            throw new Error(`Failed to add implementation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async searchImplementations(query: string): Promise<TechnicalImplementation[]> {
        return this.technicalImplementationManager.searchImplementations(query);
    }

    // Domain Expertise methods
    async addDomainExpertise(expertise: DomainExpertise): Promise<void> {
        try
        {
            await this.graph.createEntities([{
                name: expertise.domain,
                entityType: 'DomainExpertise',
                observations: expertise.specializations,
                metadata: {
                    description: expertise.specializations.join(', ')
                }
            }]);
        } catch (error)
        {
            throw new Error(`Failed to add domain expertise: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async searchDomainExpertise(
        domain: string,
        category?: string,
        expertiseLevel?: ProficiencyLevel
    ): Promise<SearchResult[]> {
        try
        {
            const results = await this.searchManager.searchAcrossEntities(domain);
            return results.filter(result => {
                if (!this.isDomainExpertise(result.item)) return false;
                if (category && result.item.category !== category) return false;
                if (expertiseLevel && result.item.level !== expertiseLevel) return false;
                return true;
            });
        } catch (error)
        {
            throw new Error(`Domain expertise search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Type guards
    private isAchievement(item: unknown): item is Achievement {
        return (item as Achievement).impactLevel !== undefined;
    }

    private isTechnicalImplementation(item: unknown): item is TechnicalImplementation {
        return (item as TechnicalImplementation).technologies !== undefined;
    }

    private isDomainExpertise(item: Achievement | TechnicalImplementation | DomainExpertise | ProfessionalContribution): item is DomainExpertise {
        return 'domain' in item && 'specializations' in item;
    }

    private isProfessionalContribution(item: unknown): item is ProfessionalContribution {
        return (item as ProfessionalContribution).impact !== undefined;
    }

    // Helper methods
    private async applyFilters(results: SearchResult[], filters?: SearchFilter): Promise<SearchResult[]> {
        if (!filters) return results;

        const filteredResults = [];
        for (const result of results)
        {
            if (filters.minScore && result.score < filters.minScore) continue;
            if (filters.technologies && !this.hasTechnologies(result)) continue;
            if (filters.impactLevel && !this.matchesImpactLevel(result, filters.impactLevel)) continue;
            if (filters.timeframe && !(await this.isInTimeframe(result, filters.timeframe))) continue;
            filteredResults.push(result);
        }
        return filteredResults;
    }

    private hasTechnologies(result: SearchResult): boolean {
        return this.isTechnicalImplementation(result.item) &&
            result.item.technologies.length > 0;
    }

    private matchesImpactLevel(result: SearchResult, impactLevel: ImpactLevel): boolean {
        return (this.isAchievement(result.item) && result.item.impactLevel === impactLevel) ||
            (this.isProfessionalContribution(result.item) && result.item.impact === impactLevel);
    }

    private matchesBusinessValues(achievement: Achievement, businessValues: BusinessValue[]): boolean {
        return businessValues.some(value => achievement.businessValue.includes(value));
    }

    private async isInTimeframe(result: SearchResult, timeframe: { start: string; end: string }): Promise<boolean> {
        if (!timeframe.start || !timeframe.end)
        {
            return false;
        }

        const startTimestamp = Date.parse(timeframe.start);
        const endTimestamp = Date.parse(timeframe.end);
        if (isNaN(startTimestamp) || isNaN(endTimestamp))
        {
            return false;
        }

        const startDate = new Date(startTimestamp);
        const endDate = new Date(endTimestamp);

        // Get entity name based on type
        let entityName = '';
        if (this.isAchievement(result.item))
        {
            entityName = result.item.title;
        } else if (this.isTechnicalImplementation(result.item))
        {
            entityName = result.item.name;
        } else if (this.isDomainExpertise(result.item))
        {
            entityName = result.item.domain;
        } else if (this.isProfessionalContribution(result.item))
        {
            entityName = result.item.title;
        }

        if (!entityName)
        {
            return false;
        }

        try
        {
            const graph = await this.graph.openNodes([entityName]);
            const entity = graph.entities.find(e => e.name === entityName);
            if (!entity?.metadata?.startDate)
            {
                return false;
            }

            const itemTimestamp = Date.parse(entity.metadata.startDate);
            if (isNaN(itemTimestamp))
            {
                return false;
            }
            const itemDate = new Date(itemTimestamp);
            return itemDate >= startDate && itemDate <= endDate;
        } catch (error)
        {
            console.error(`Error checking timeframe for ${entityName}:`, error);
            return false;
        }
    }

    private convertLegacyProficiencyLevel(level: string): ProficiencyLevel {
        const normalizedLevel = level.trim().toLowerCase();
        const mapping: Record<string, ProficiencyLevel> = {
            'beginner': 'Junior',
            'junior': 'Junior',
            'intermediate': 'Mid',
            'mid': 'Mid',
            'advanced': 'Senior',
            'senior': 'Senior',
            'lead': 'Lead',
            'expert': 'Expert',
        };

        const convertedLevel = mapping[normalizedLevel];
        if (!convertedLevel)
        {
            throw new Error(
                `Invalid proficiency level: ${level}. Valid levels are: ${PROFICIENCY_LEVELS.join(', ')}`
            );
        }

        return convertedLevel;
    }

    private getProficiencyPrecedence(level: ProficiencyLevel): number {
        const precedence: Record<ProficiencyLevel, number> = {
            'Junior': 1,
            'Mid': 2,
            'Senior': 3,
            'Lead': 4,
            'Expert': 5
        };
        return precedence[level];
    }

    private getProficiencyLevel(precedence: number): ProficiencyLevel {
        if (precedence >= 5) return 'Expert';
        if (precedence >= 4) return 'Lead';
        if (precedence >= 3) return 'Senior';
        if (precedence >= 2) return 'Mid';
        return 'Junior';
    }

    // Get methods
    async getWorkExperienceById(id: string): Promise<WorkExperience | undefined> {
        return this.workExperienceManager.getExperienceById(id);
    }

    async getEducationById(id: string): Promise<EducationExperience | undefined> {
        return this.educationManager.getEducationById(id);
    }

    async getSkillById(id: string): Promise<Skill | undefined> {
        return this.skillManager.getSkillById(id);
    }

    async getCareerBreakById(id: string): Promise<CareerBreak | undefined> {
        return this.careerBreakManager.getCareerBreakById(id);
    }

    async getProjectById(id: string): Promise<Project | undefined> {
        return this.projectManager.getProjectById(id);
    }

    async getCertificationById(id: string): Promise<LicenseOrCertification | undefined> {
        return this.certificationManager.getCertificationById(id);
    }

    async getOrganizationById(id: string): Promise<Organization | undefined> {
        return this.organizationManager.getOrganizationById(id);
    }

    async getCourseById(id: string): Promise<Course | undefined> {
        return this.courseManager.getCourseById(id);
    }

    async getReferenceById(id: string): Promise<Reference | undefined> {
        return this.referenceManager.getReferenceById(id);
    }

    async getHonorById(id: string): Promise<HonorOrAward | undefined> {
        return this.honorManager.getHonorById(id);
    }

    // Filter methods
    async filterWorkExperiences(filters: { dateRange?: { startDate: string; endDate: string }; company?: string; currentOnly?: boolean }): Promise<WorkExperience[]> {
        const results: WorkExperience[] = [];

        if (filters.dateRange)
        {
            const dateFiltered = await this.workExperienceManager.filterByDateRange(
                filters.dateRange.startDate,
                filters.dateRange.endDate
            );
            results.push(...dateFiltered);
        }

        if (filters.company)
        {
            const companyFiltered = await this.workExperienceManager.filterByCompany(filters.company);
            results.push(...companyFiltered);
        }

        if (filters.currentOnly)
        {
            const current = await this.workExperienceManager.getCurrentExperience();
            if (current)
            {
                results.push(current);
            }
        }

        return results;
    }

    async filterProjects(filters: { currentOnly?: boolean; associatedWith?: string }): Promise<Project[]> {
        return this.projectManager.searchProjects(filters.associatedWith || '');
    }

    async filterCertifications(filters: { issuingOrganization?: string; isValid?: boolean }): Promise<LicenseOrCertification[]> {
        return this.certificationManager.searchCertifications(filters.issuingOrganization || '');
    }

    async filterOrganizations(filters: { currentOnly?: boolean; associatedWith?: string }): Promise<Organization[]> {
        return this.organizationManager.searchOrganizations(filters.associatedWith || '');
    }

    async filterCourses(filters: { associatedWith?: string }): Promise<Course[]> {
        return this.courseManager.searchCourses(filters.associatedWith || '');
    }

    async filterReferences(filters: { organization?: string; relation?: string }): Promise<Reference[]> {
        return this.referenceManager.searchReferences(filters.organization || filters.relation || '');
    }

    async filterHonors(filters: { issuer?: string; associatedWith?: string }): Promise<HonorOrAward[]> {
        return this.honorManager.searchHonors(filters.issuer || filters.associatedWith || '');
    }

    // Update methods
    async updateWorkExperience(id: string, experience: WorkExperience): Promise<void> {
        return this.workExperienceManager.updateExperience(id, experience);
    }

    async updateEducation(id: string, education: EducationExperience): Promise<void> {
        return this.educationManager.updateEducation(id, education);
    }

    async updateSkill(id: string, skill: Skill): Promise<void> {
        return this.skillManager.updateSkill(id, skill);
    }

    async updateCareerBreak(id: string, careerBreak: CareerBreak): Promise<void> {
        return this.careerBreakManager.updateCareerBreak(id, careerBreak);
    }

    async updateProject(id: string, project: Project): Promise<void> {
        return this.projectManager.updateProject(id, project);
    }

    async updateCertification(id: string, certification: LicenseOrCertification): Promise<void> {
        return this.certificationManager.updateCertification(id, certification);
    }

    async updateOrganization(id: string, organization: Organization): Promise<void> {
        return this.organizationManager.updateOrganization(id, organization);
    }

    async updateCourse(id: string, course: Course): Promise<void> {
        return this.courseManager.updateCourse(id, course);
    }

    async updateReference(id: string, reference: Reference): Promise<void> {
        return this.referenceManager.updateReference(id, reference);
    }

    async updateHonor(id: string, honor: HonorOrAward): Promise<void> {
        return this.honorManager.updateHonor(id, honor);
    }

    // Delete methods
    async deleteWorkExperience(id: string): Promise<void> {
        return this.workExperienceManager.deleteExperience(id);
    }

    async deleteEducation(id: string): Promise<void> {
        return this.educationManager.deleteEducation(id);
    }

    async deleteSkill(id: string): Promise<void> {
        return this.skillManager.deleteSkill(id);
    }

    async deleteCareerBreak(id: string): Promise<void> {
        return this.careerBreakManager.deleteCareerBreak(id);
    }

    async deleteProject(id: string): Promise<void> {
        return this.projectManager.deleteProject(id);
    }

    async deleteCertification(id: string): Promise<void> {
        return this.certificationManager.deleteCertification(id);
    }

    async deleteOrganization(id: string): Promise<void> {
        return this.organizationManager.deleteOrganization(id);
    }

    async deleteCourse(id: string): Promise<void> {
        return this.courseManager.deleteCourse(id);
    }

    async deleteReference(id: string): Promise<void> {
        return this.referenceManager.deleteReference(id);
    }

    async deleteHonor(id: string): Promise<void> {
        return this.honorManager.deleteHonor(id);
    }
}