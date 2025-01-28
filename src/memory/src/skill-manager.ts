import { GraphOperations } from './graph-operations.js';
import {
  Entity,
  EntityNotFoundError,
  ProficiencyLevel,
  Skill,
  SkillFunction,
  SkillMetrics,
  SkillSchema,
  ValidationError
} from './types.js';

/**
 * Manages skill-related operations and calculations
 */
export class SkillManager extends GraphOperations {
  /**
   * Helper function to get precedence of proficiency levels
   * @param level ProficiencyLevel to get precedence for
   * @returns number Precedence value
   */
  private getProficiencyPrecedence(level: ProficiencyLevel): number {
    const precedence: Record<ProficiencyLevel, number> = {
      "Junior": 1,
      "Mid": 2,
      "Senior": 3,
      "Lead": 4,
      "Expert": 5
    };
    return precedence[level];
  }

  /**
   * Helper function to get proficiency level from precedence
   * @param precedence Precedence value
   * @returns ProficiencyLevel
   */
  private getProficiencyLevel(precedence: number): ProficiencyLevel {
    if (precedence >= 5) return "Expert";
    if (precedence >= 4) return "Lead";
    if (precedence >= 3) return "Senior";
    if (precedence >= 2) return "Mid";
    return "Junior";
  }

  /**
   * Adds skills to the graph
   * @param skills Array of skills to add
   * @returns Promise<Skill[]> The added skills
   * @throws {ValidationError} If skill validation fails
   */
  async addSkill(skills: Skill[]): Promise<Skill[]> {
    // Validate all skills first
    for (const skill of skills)
    {
      try
      {
        SkillSchema.parse(skill);
      } catch (error)
      {
        throw new ValidationError(`Invalid skill data for ${skill.skillName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const entities = skills.map((skill: Skill) => ({
      name: skill.skillName,
      entityType: "Skill",
      observations: [
        JSON.stringify({
          category: skill.category,
          subcategory: skill.subcategory,
          relationships: skill.relationships,
          tooling: skill.tooling,
          workExperiences: skill.workExperiences
        })
      ],
    }));

    const createdEntities = await this.createEntities(entities);
    return skills.filter(skill =>
      createdEntities.some((entity: Entity) => entity.name === skill.skillName)
    );
  }

  /**
   * Deletes skills from the graph
   * @param skillNames Array of skill names to delete
   */
  async deleteSkill(skillNames: string[]): Promise<void> {
    await this.deleteEntities(skillNames);
  }

  /**
   * Searches for skills
   * @param query Search query string
   * @returns Promise<Skill[]> Matching skills
   * @throws {ValidationError} If skill data parsing fails
   */
  async searchSkill(query: string): Promise<Skill[]> {
    const graph = await this.loadGraph();
    return graph.entities
      .filter(e => e.entityType === "Skill" && e.name.toLowerCase().includes(query.toLowerCase()))
      .map(e => {
        try
        {
          const skillData = JSON.parse(e.observations[0]);
          const skill: Skill = {
            skillName: e.name,
            category: skillData.category,
            subcategory: skillData.subcategory,
            relationships: skillData.relationships,
            tooling: skillData.tooling,
            workExperiences: skillData.workExperiences
          };
          return SkillSchema.parse(skill);
        } catch (error)
        {
          throw new ValidationError(`Failed to parse skill data for ${e.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });
  }

  /**
   * Calculates total experience with a specific technology
   * @param technology Technology name to calculate experience for
   * @returns Promise<number> Total years of experience
   * @throws {EntityNotFoundError} If technology is not found
   */
  async calculateExperience(technology: string): Promise<number> {
    const graph = await this.loadGraph();
    let totalDuration = 0;

    const techEntity = graph.entities.find(e =>
      e.name.toLowerCase() === technology.toLowerCase() &&
      (e.entityType === "Skill" || e.entityType === "Technology")
    );

    if (!techEntity)
    {
      throw new EntityNotFoundError(technology);
    }

    // Calculate from relations
    const relatedExperiences = graph.relations.filter(relation =>
      relation.from === techEntity.name &&
      (relation.relationType === "UsedIn" || relation.relationType === "UsedSkill")
    );

    for (const experience of relatedExperiences)
    {
      if (experience.metadata?.duration)
      {
        totalDuration += experience.metadata.duration;
        continue;
      }

      if (experience.metadata?.startDate)
      {
        const startDate = new Date(experience.metadata.startDate);
        const endDate = experience.metadata?.endDate ? new Date(experience.metadata.endDate) : new Date();
        const durationInYears = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        totalDuration += durationInYears;
      }
    }

    // Calculate from work experiences
    const workExperiences = graph.entities.filter(e => e.entityType === "WorkExperience");
    for (const work of workExperiences)
    {
      try
      {
        const expData = JSON.parse(work.observations[0] || '{}');
        if (expData.skills?.includes(technology))
        {
          const startDate = new Date(expData.startDate || work.metadata?.startDate);
          const endDate = expData.endDate ? new Date(expData.endDate) :
            work.metadata?.endDate ? new Date(work.metadata.endDate) :
              new Date();

          if (startDate)
          {
            const durationInYears = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
            totalDuration += durationInYears;
          }
        }
      } catch (error)
      {
        console.error(`Error processing work experience ${work.name}:`, error);
      }
    }

    return parseFloat(totalDuration.toFixed(2));
  }

  /**
   * Calculates detailed metrics for a specific skill
   * @param skillName Name of the skill to calculate metrics for
   * @returns Promise<SkillMetrics> Calculated skill metrics
   * @throws {EntityNotFoundError} If skill is not found
   * @throws {ValidationError} If skill data parsing fails
   */
  async calculateSkillMetrics(skillName: string): Promise<SkillMetrics> {
    const graph = await this.loadGraph();
    const skillEntity = graph.entities.find(e =>
      e.entityType === "Skill" && e.name === skillName
    );

    if (!skillEntity)
    {
      throw new EntityNotFoundError(skillName);
    }

    try
    {
      const skillData = JSON.parse(skillEntity.observations[0]);
      const workExperiences = skillData.workExperiences;

      if (!workExperiences.length)
      {
        return {
          skillName,
          totalYearsExperience: 0,
          lastUsed: new Date().toISOString(),
          firstUsed: new Date().toISOString(),
          proficiencyLevel: "Junior",
          experiencesByFunction: []
        };
      }

      // Calculate dates and experience
      const now = new Date();
      const dates = workExperiences
        .map((exp: { experienceId: string }) => {
          const workExp = graph.entities.find(e =>
            e.entityType === "WorkExperience" && e.name === exp.experienceId
          );
          if (!workExp) return null;

          try
          {
            const expData = JSON.parse(workExp.observations[0]);
            return {
              start: new Date(expData.startDate),
              end: expData.endDate ? new Date(expData.endDate) : now
            };
          } catch
          {
            return null;
          }
        })
        .filter((d: { start: Date; end: Date }) => d !== null);

      if (!dates.length)
      {
        throw new ValidationError(`No valid dates found for skill: ${skillName}`);
      }

      // Calculate metrics
      const firstUsed = new Date(Math.min(...dates.map((d: { start: Date; end: Date }) => d.start.getTime()))).toISOString();
      const lastUsed = new Date(Math.max(...dates.map((d: { start: Date; end: Date }) => d.end.getTime()))).toISOString();

      const totalYearsExperience = dates.reduce((total: number, date: { start: Date; end: Date }) => {
        const years = (date.end.getTime() - date.start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        return total + years;
      }, 0);

      // Calculate experience by function
      const functionMap = new Map<SkillFunction, { years: number; maxLevel: ProficiencyLevel }>();

      for (const exp of workExperiences)
      {
        const fn = exp.function;
        const current = functionMap.get(fn) || { years: 0, maxLevel: "Junior" };
        const workExp = graph.entities.find(e =>
          e.entityType === "WorkExperience" && e.name === exp.experienceId
        );

        if (workExp)
        {
          try
          {
            const expData = JSON.parse(workExp.observations[0]);
            const start = new Date(expData.startDate);
            const end = expData.endDate ? new Date(expData.endDate) : now;
            const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

            functionMap.set(fn, {
              years: current.years + years,
              maxLevel: this.getProficiencyPrecedence(exp.level) > this.getProficiencyPrecedence(current.maxLevel)
                ? exp.level
                : current.maxLevel
            });
          } catch (error)
          {
            console.error(`Error processing experience data for ${workExp.name}:`, error);
          }
        }
      }

      const experiencesByFunction = Array.from(functionMap.entries())
        .map(([fn, data]) => ({
          function: fn,
          years: parseFloat(data.years.toFixed(2)),
          level: data.maxLevel
        }));

      // Calculate overall proficiency level
      const maxLevel = Math.max(...Array.from(functionMap.values())
        .map(data => this.getProficiencyPrecedence(data.maxLevel)));

      return {
        skillName,
        totalYearsExperience: parseFloat(totalYearsExperience.toFixed(2)),
        lastUsed,
        firstUsed,
        proficiencyLevel: this.getProficiencyLevel(maxLevel),
        experiencesByFunction
      };
    } catch (error)
    {
      throw new ValidationError(`Failed to calculate metrics for ${skillName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}