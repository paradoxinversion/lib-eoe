import { GameManager } from '../game/GameManager';
import { SCIENCE_PROJECTS } from './scienceProjects';
import { GameData } from '../../types';

/**
 * The result of completing a science project
 */
export interface ScienceProjectResult {
  updatedGameData: Partial<GameData>;
  indexName: string;
}

/**
 * The status of a science project
 */
export interface ScienceProjectStatus {
  /** The indexName of the science project */
  indexName: string;
  /** The amount of science applied toward the project */
  accumulatedScience: number;
  targetScience?: number;
  complete: boolean;
  /** The  laboratory completing the work. All projects must have an associated Laboratory.*/
  laboratory: string;
  daysRemaining: number;
}
/**
 * The definition of a science project
 */
export interface ScienceProjectDefinition {
  /** The name of the project */
  name: string;
  /** index name */
  indexName: string;
  /** The description of the project */
  description: string;
  /** The function to call to start the project */
  startHandler: (
    laboratoryId: string,
    gameManager?: GameManager,
  ) => ScienceProjectStatus;
  /**
   * The function to call to make progress on the project
   */
  // progressHandler: (
  //   gameManager: GameManager,
  //   status: ScienceProjectStatus,
  // ) => ScienceProjectStatus;
  /**
   * The function to call to finish the project
   * The handler should also modify status effects as necessary
   */
  completeHandler: (status: ScienceProjectStatus) => ScienceProjectResult;
  /** The amount of science required to complete the project */
  science: number;
  /** The amount of money required to start the project */
  cost: number;
  /** The amount of days from the start it will take to finish the project */
  completionTime: number;
  /** The requirements to start the project */
  requirements: {
    completedProjects: ScienceProject[];
  };
}
export type ScienceProject = keyof typeof SCIENCE_PROJECTS;
export type ScienceProjectMap = typeof SCIENCE_PROJECTS;
