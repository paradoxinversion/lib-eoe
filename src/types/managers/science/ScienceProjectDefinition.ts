import { GameManager } from '../../../managers/game/GameManager';
import { ScienceProject } from '../../../managers/science/types';
import { ScienceProjectResult } from './ScienceProjectResult';
import { ScienceProjectStatus } from './ScienceProjectStatus';

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
