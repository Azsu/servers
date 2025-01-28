import { GraphOperations } from './graph-operations.js';
import { Skill, SkillMetrics } from './types.js';
/**
 * Manages skill-related operations and calculations
 */
export declare class SkillManager extends GraphOperations {
    /**
     * Helper function to get precedence of proficiency levels
     * @param level ProficiencyLevel to get precedence for
     * @returns number Precedence value
     */
    private getProficiencyPrecedence;
    /**
     * Helper function to get proficiency level from precedence
     * @param precedence Precedence value
     * @returns ProficiencyLevel
     */
    private getProficiencyLevel;
    /**
     * Adds skills to the graph
     * @param skills Array of skills to add
     * @returns Promise<Skill[]> The added skills
     * @throws {ValidationError} If skill validation fails
     */
    addSkill(skills: Skill[]): Promise<Skill[]>;
    /**
     * Deletes skills from the graph
     * @param skillNames Array of skill names to delete
     */
    deleteSkill(skillNames: string[]): Promise<void>;
    /**
     * Searches for skills
     * @param query Search query string
     * @returns Promise<Skill[]> Matching skills
     * @throws {ValidationError} If skill data parsing fails
     */
    searchSkill(query: string): Promise<Skill[]>;
    /**
     * Calculates total experience with a specific technology
     * @param technology Technology name to calculate experience for
     * @returns Promise<number> Total years of experience
     * @throws {EntityNotFoundError} If technology is not found
     */
    calculateExperience(technology: string): Promise<number>;
    /**
     * Calculates detailed metrics for a specific skill
     * @param skillName Name of the skill to calculate metrics for
     * @returns Promise<SkillMetrics> Calculated skill metrics
     * @throws {EntityNotFoundError} If skill is not found
     * @throws {ValidationError} If skill data parsing fails
     */
    calculateSkillMetrics(skillName: string): Promise<SkillMetrics>;
}
