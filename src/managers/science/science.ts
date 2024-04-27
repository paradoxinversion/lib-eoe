import { GameData, GameManager } from '../../GameManager';
import { SCIENCE_PROJECTS } from './scienceProjects';
import {
  ScienceProject,
  ScienceProjectMap,
  ScienceProjectStatus,
} from './types';

/** The manager for all science projects in the game */
export class ScienceManager {
  private static instance: ScienceManager;
  /** The list of available science projects in the game */
  PROJECT_DEFINITIONS: ScienceProjectMap;
  /** The list of projects that have been started */
  activeProjects: ScienceProjectStatus[] = [];
  completedProjects: ScienceProject[] = [];
  /** Prepare the Science Manager */
  constructor(
    /** The list of available science projects in the game */
    projects: ScienceProjectMap,
    /** The list of projects that have been started */
    activeProjects: ScienceProjectStatus[] = [],
  ) {
    console.info('Science Manager Initialized');
    this.PROJECT_DEFINITIONS = projects;
    activeProjects = activeProjects;
  }

  public static getInstance(): ScienceManager {
    if (!ScienceManager.instance) {
      ScienceManager.instance = new ScienceManager(SCIENCE_PROJECTS);
    }

    return ScienceManager.instance;
  }

  /** Start a science project */
  startProject(projectIndex: ScienceProject, laboratoryId: string) {
    const project = this.PROJECT_DEFINITIONS[projectIndex];
    if (project === undefined) {
      throw new Error(`Project ${projectIndex} does not exist`);
    }

    const status: ScienceProjectStatus = project.startHandler(laboratoryId);
    this.activeProjects = [...this.activeProjects, status];
  }

  /** Complete a science project */
  completeProject(projectName: ScienceProject) {
    const projectConstant = this.PROJECT_DEFINITIONS[projectName];
    const project = this.activeProjects.find(
      (p) => p.indexName === projectName,
    )!;
    const result = projectConstant.completeHandler(project);
    this.activeProjects = this.activeProjects.filter(
      (p) => p.indexName !== projectName,
    );
    this.completedProjects = [...this.completedProjects, projectName];
    return result;
  }

  updateActiveProject(
    status: ScienceProjectStatus,
    projectName: ScienceProject,
  ) {
    const projectStatus = this.activeProjects.find(
      (p) => p.indexName === projectName,
    )!;

    const updatedProject = {
      ...projectStatus,
      ...status,
    };

    this.activeProjects = this.activeProjects.map((p) =>
      p.indexName === projectName ? updatedProject : p,
    );
  }

  handleProjectProgress(status: ScienceProjectStatus): ScienceProjectStatus {
    const project =
      GameManager.getInstance().scienceManager.PROJECT_DEFINITIONS[
        status.indexName as ScienceProject
      ];
    const empireUpdate =
      GameManager.getInstance().gameData.governingOrganizations[
        GameManager.getInstance().gameData.player.organizationId
      ];
    const contribution = Math.min(
      empireUpdate.science,
      project.science - status.accumulatedScience,
    );

    // This function should be consuming the empire's
    // science, but the empire's science is not being
    // reduced, and this event never completes.
    if (contribution > 0) {
      GameManager.getInstance().updateGameData({
        governingOrganizations: {
          ...GameManager.getInstance().gameData.governingOrganizations,
          [GameManager.getInstance().gameData.player.organizationId]: {
            ...empireUpdate,
            science: empireUpdate.science - contribution,
          },
        },
      });
    }

    return {
      ...status,
      accumulatedScience: status.accumulatedScience + contribution,
      complete: status.accumulatedScience + contribution >= project.science,
      daysRemaining: status.daysRemaining - 1,
    };
  }
}
