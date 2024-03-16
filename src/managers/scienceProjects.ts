import { GameData, GameManager } from '../GameManager';
import { applyStatusEffect } from '../organization';
import { ScienceManager } from './science';

export interface ScienceProjectResult {
  updatedGameData: Partial<GameData>;
  indexName: string;
}

export interface ScienceProjectStatus {
  /** The indexName of the science project */
  indexName: string;
  /** The amount of science applied toward the project */
  science: number;
  targetScience?: number;
  complete: boolean;
}

export interface ScienceProject {
  /** The name of the project */
  name: string;
  /** index name */
  indexName: string;
  /** The description of the project */
  description: string;
  /** The function to call to start the project */
  startHandler: (gameManager: GameManager) => ScienceProjectStatus;
  progressHandler: (
    gameManager: GameManager,
    status: ScienceProjectStatus,
  ) => ScienceProjectStatus;
  /**
   * The function to call to finish the project
   * The handler should also modify status effects as necessary
   */
  completeHandler: (
    gameManager: GameManager,
    status: ScienceProjectStatus,
  ) => ScienceProjectResult;
  /** The amount of science required to complete the project */
  science: number;
  /** The amount of money required to start the project */
  cost: number;
  /** The amount of days from the start it will take to finish the project */
  completionTime: number;
  /** The requirements to start the project */
  requirements: {};
}

export interface ScienceProjectMap {
  [x: string]: ScienceProject;
}

export const SCIENCE_PROJECTS: ScienceProjectMap = {
  test: {
    name: 'Test Project',
    description: 'A test project',
    indexName: 'test',
    startHandler: function (gameManager: GameManager) {
      const currentScience =
        gameManager.gameData.governingOrganizations[
          gameManager.gameData.player.organizationId
        ].science;
      return {
        indexName: 'test',
        science: currentScience,
        complete: false,
      };
    },
    progressHandler: function (
      gameManager: GameManager,
      status: ScienceProjectStatus,
    ) {
      const project = SCIENCE_PROJECTS[status.indexName];
      const empireScience =
        gameManager.gameData.governingOrganizations[
          gameManager.gameData.player.organizationId
        ].science;
      const contribution = Math.min(
        empireScience,
        project.science - status.science,
      );
      if (contribution === 0) {
        return status;
      }

      return {
        indexName: status.indexName,
        science: status.science + contribution,
        complete: status.science + contribution >= project.science,
      };
    },
    completeHandler: function (gameManager, status: ScienceProjectStatus) {
      console.log('Test project complete');
      return {
        indexName: status.indexName,
        updatedGameData: applyStatusEffect(
          gameManager,
          'centralized-telecommunications',
          gameManager.gameData.player.organizationId,
        ),
      };
    },
    science: 1,
    cost: 1,
    completionTime: 1,
    requirements: {},
  },
};
