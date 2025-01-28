import { GraphOperations } from './graph-operations.js';
import {
  CareerBreak,
  Course,
  EducationExperience,
  Entity,
  HonorOrAward,
  Organization,
  Project,
  Reference,
  ValidationError,
  WorkExperience,
} from './types.js';

/**
 * Manages entity-specific operations extending core graph functionality
 */
export class EntityManager extends GraphOperations {
  /**
   * Creates an entity from a specific type
   * @param entityType Type of entity to create
   * @param name Name of the entity
   * @param description Description or primary observation
   * @returns Promise<Entity> The created entity
   */
  private async createEntityOfType(
    entityType: string,
    name: string,
    description: string = ""
  ): Promise<Entity> {
    const entity: Entity = {
      name,
      entityType,
      observations: [description],
    };

    const [createdEntity] = await this.createEntities([entity]);
    return createdEntity;
  }

  /**
   * Searches entities of a specific type
   * @param entityType Type of entities to search
   * @param query Search query string
   * @returns Promise<Entity[]> Matching entities
   */
  private async searchEntitiesByType(entityType: string, query: string): Promise<Entity[]> {
    const graph = await this.loadGraph();
    return graph.entities.filter(e =>
      e.entityType === entityType &&
      (e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.observations.some(o => o.toLowerCase().includes(query.toLowerCase())))
    );
  }

  /**
   * Adds work experiences to the graph
   * @param experiences Array of work experiences to add
   * @returns Promise<WorkExperience[]> The added experiences
   */
  async addWorkExperience(experiences: WorkExperience[]): Promise<WorkExperience[]> {
    const entities = experiences.map(exp => ({
      name: exp.title,
      entityType: "WorkExperience",
      observations: [exp.description || ""],
      metadata: {
        startDate: new Date(exp.startDate).toISOString(),
        endDate: exp.endDate ? new Date(exp.endDate).toISOString() : undefined,
        description: exp.description,
      },
    }));

    const createdEntities = await this.createEntities(entities);
    return experiences.filter(exp =>
      createdEntities.some(entity => entity.name === exp.title)
    );
  }

  /**
   * Deletes work experiences from the graph
   * @param titles Array of work experience titles to delete
   */
  async deleteWorkExperience(titles: string[]): Promise<void> {
    await this.deleteEntities(titles);
  }

  /**
   * Searches for work experiences
   * @param query Search query string
   * @returns Promise<WorkExperience[]> Matching work experiences
   */
  async searchWorkExperience(query: string): Promise<WorkExperience[]> {
    const entities = await this.searchEntitiesByType("WorkExperience", query);
    return entities.map(e => ({
      title: e.name,
      description: e.observations[0] || "",
      employmentType: "",
      companyName: "",
      isCurrentRole: false,
      startDate: e.metadata?.startDate || "",
      endDate: e.metadata?.endDate,
      location: "",
      locationType: "",
      profileHeadline: "",
      jobSource: "",
      skills: [],
      media: [],
    }));
  }

  /**
   * Adds education experiences to the graph
   * @param experiences Array of education experiences to add
   * @returns Promise<EducationExperience[]> The added experiences
   */
  async addEducationExperience(experiences: EducationExperience[]): Promise<EducationExperience[]> {
    const entities = experiences.map(exp => ({
      name: exp.school,
      entityType: "EducationExperience",
      observations: [JSON.stringify({
        degree: exp.degree,
        fieldOfStudy: exp.fieldOfStudy,
        grade: exp.grade,
        activities: exp.activitiesAndSocieties,
        description: exp.description,
      })],
      metadata: {
        startDate: exp.startDate,
        endDate: exp.endDate,
        description: exp.description,
      },
    }));

    const createdEntities = await this.createEntities(entities);
    return experiences.filter(exp =>
      createdEntities.some(entity => entity.name === exp.school)
    );
  }

  /**
   * Deletes education experiences from the graph
   * @param schools Array of school names to delete
   */
  async deleteEducationExperience(schools: string[]): Promise<void> {
    await this.deleteEntities(schools);
  }

  /**
   * Searches for education experiences
   * @param query Search query string
   * @returns Promise<EducationExperience[]> Matching education experiences
   */
  async searchEducationExperience(query: string): Promise<EducationExperience[]> {
    const entities = await this.searchEntitiesByType("EducationExperience", query);
    return entities.map(e => {
      try
      {
        const data = JSON.parse(e.observations[0] || "{}");
        return {
          school: e.name,
          degree: data.degree || "",
          fieldOfStudy: data.fieldOfStudy || "",
          startDate: e.metadata?.startDate || "",
          endDate: e.metadata?.endDate,
          grade: data.grade || "",
          activitiesAndSocieties: data.activities || [],
          description: data.description || "",
          skills: [],
          media: [],
        };
      } catch (error)
      {
        throw new ValidationError(`Failed to parse education data for ${e.name}`);
      }
    });
  }

  /**
   * Adds career breaks to the graph
   * @param breaks Array of career breaks to add
   * @returns Promise<CareerBreak[]> The added career breaks
   */
  async addCareerBreak(breaks: CareerBreak[]): Promise<CareerBreak[]> {
    const entities = breaks.map(br => ({
      name: br.type,
      entityType: "CareerBreak",
      observations: [br.description || ""],
      metadata: {
        startDate: br.startDate,
        endDate: br.endDate,
        description: br.description,
      },
    }));

    const createdEntities = await this.createEntities(entities);
    return breaks.filter(br =>
      createdEntities.some(entity => entity.name === br.type)
    );
  }

  /**
   * Deletes career breaks from the graph
   * @param types Array of career break types to delete
   */
  async deleteCareerBreak(types: string[]): Promise<void> {
    await this.deleteEntities(types);
  }

  /**
   * Searches for career breaks
   * @param query Search query string
   * @returns Promise<CareerBreak[]> Matching career breaks
   */
  async searchCareerBreak(query: string): Promise<CareerBreak[]> {
    const entities = await this.searchEntitiesByType("CareerBreak", query);
    return entities.map(e => ({
      type: e.name,
      description: e.observations[0] || "",
      startDate: e.metadata?.startDate || "",
      endDate: e.metadata?.endDate,
      isCurrent: !e.metadata?.endDate,
      location: "",
      profileHeadline: "",
      media: [],
    }));
  }

  /**
   * Adds projects to the graph
   * @param projects Array of projects to add
   * @returns Promise<Project[]> The added projects
   */
  async addProject(projects: Project[]): Promise<Project[]> {
    const entities = projects.map(proj => ({
      name: proj.projectName,
      entityType: "Project",
      observations: [proj.description || ""],
      metadata: {
        startDate: proj.startDate,
        endDate: proj.endDate,
        description: proj.description,
      },
    }));

    const createdEntities = await this.createEntities(entities);
    return projects.filter(proj =>
      createdEntities.some(entity => entity.name === proj.projectName)
    );
  }

  /**
   * Deletes projects from the graph
   * @param projectNames Array of project names to delete
   */
  async deleteProject(projectNames: string[]): Promise<void> {
    await this.deleteEntities(projectNames);
  }

  /**
   * Searches for projects
   * @param query Search query string
   * @returns Promise<Project[]> Matching projects
   */
  async searchProject(query: string): Promise<Project[]> {
    const entities = await this.searchEntitiesByType("Project", query);
    return entities.map(e => ({
      projectName: e.name,
      description: e.observations[0] || "",
      startDate: e.metadata?.startDate || "",
      endDate: e.metadata?.endDate,
      isCurrent: !e.metadata?.endDate,
      skills: [],
      media: [],
      contributors: [],
      associatedWith: "",
    }));
  }

  /**
   * Adds courses to the graph
   * @param courses Array of courses to add
   * @returns Promise<Course[]> The added courses
   */
  async addCourse(courses: Course[]): Promise<Course[]> {
    const entities = courses.map(course => ({
      name: course.courseName,
      entityType: "Course",
      observations: [course.courseNumber || ""],
    }));

    const createdEntities = await this.createEntities(entities);
    return courses.filter(course =>
      createdEntities.some(entity => entity.name === course.courseName)
    );
  }

  /**
   * Deletes courses from the graph
   * @param courseNames Array of course names to delete
   */
  async deleteCourse(courseNames: string[]): Promise<void> {
    await this.deleteEntities(courseNames);
  }

  /**
   * Searches for courses
   * @param query Search query string
   * @returns Promise<Course[]> Matching courses
   */
  async searchCourse(query: string): Promise<Course[]> {
    const entities = await this.searchEntitiesByType("Course", query);
    return entities.map(e => ({
      courseName: e.name,
      courseNumber: e.observations[0] || "",
      associatedWith: "",
    }));
  }

  /**
   * Adds references to the graph
   * @param references Array of references to add
   * @returns Promise<Reference[]> The added references
   */
  async addReference(references: Reference[]): Promise<Reference[]> {
    const entities = references.map(ref => ({
      name: ref.name,
      entityType: "Reference",
      observations: [ref.additionalNotes || ""],
    }));

    const createdEntities = await this.createEntities(entities);
    return references.filter(ref =>
      createdEntities.some(entity => entity.name === ref.name)
    );
  }

  /**
   * Deletes references from the graph
   * @param names Array of reference names to delete
   */
  async deleteReference(names: string[]): Promise<void> {
    await this.deleteEntities(names);
  }

  /**
   * Searches for references
   * @param query Search query string
   * @returns Promise<Reference[]> Matching references
   */
  async searchReference(query: string): Promise<Reference[]> {
    const entities = await this.searchEntitiesByType("Reference", query);
    return entities.map(e => ({
      name: e.name,
      additionalNotes: e.observations[0] || "",
      contactInfo: "",
      jobTitle: "",
      relation: "",
      organization: "",
    }));
  }

  /**
   * Adds organizations to the graph
   * @param orgs Array of organizations to add
   * @returns Promise<Organization[]> The added organizations
   */
  async addOrganization(orgs: Organization[]): Promise<Organization[]> {
    const entities = orgs.map(org => ({
      name: org.organizationName,
      entityType: "Organization",
      observations: [org.description || ""],
      metadata: {
        startDate: org.startDate,
        endDate: org.endDate,
        description: org.description,
      },
    }));

    const createdEntities = await this.createEntities(entities);
    return orgs.filter(org =>
      createdEntities.some(entity => entity.name === org.organizationName)
    );
  }

  /**
   * Deletes organizations from the graph
   * @param names Array of organization names to delete
   */
  async deleteOrganization(names: string[]): Promise<void> {
    await this.deleteEntities(names);
  }

  /**
   * Searches for organizations
   * @param query Search query string
   * @returns Promise<Organization[]> Matching organizations
   */
  async searchOrganization(query: string): Promise<Organization[]> {
    const entities = await this.searchEntitiesByType("Organization", query);
    return entities.map(e => ({
      organizationName: e.name,
      description: e.observations[0] || "",
      startDate: e.metadata?.startDate || "",
      endDate: e.metadata?.endDate,
      isMembershipOngoing: !e.metadata?.endDate,
      positionHeld: "",
      associatedWith: "",
    }));
  }

  /**
   * Adds honors or awards to the graph
   * @param items Array of honors or awards to add
   * @returns Promise<HonorOrAward[]> The added honors or awards
   */
  async addHonorOrAward(items: HonorOrAward[]): Promise<HonorOrAward[]> {
    const entities = items.map(item => ({
      name: item.title,
      entityType: "HonorOrAward",
      observations: [item.description || ""],
      metadata: {
        startDate: item.issueDate,
        description: item.description,
      },
    }));

    const createdEntities = await this.createEntities(entities);
    return items.filter(item =>
      createdEntities.some(entity => entity.name === item.title)
    );
  }

  /**
   * Deletes honors or awards from the graph
   * @param titles Array of honor or award titles to delete
   */
  async deleteHonorOrAward(titles: string[]): Promise<void> {
    await this.deleteEntities(titles);
  }

  /**
   * Searches for honors or awards
   * @param query Search query string
   * @returns Promise<HonorOrAward[]> Matching honors or awards
   */
  async searchHonorOrAward(query: string): Promise<HonorOrAward[]> {
    const entities = await this.searchEntitiesByType("HonorOrAward", query);
    return entities.map(e => ({
      title: e.name,
      description: e.observations[0] || "",
      issueDate: e.metadata?.startDate || "",
      issuer: "",
      associatedWith: "",
      media: [],
    }));
  }
}