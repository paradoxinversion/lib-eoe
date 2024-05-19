import { GameManager } from '../../../GameManager';
import { applyStatusEffect } from '../../../organization';
import {
  ScienceProject,
  ScienceProjectDefinition,
  ScienceProjectResult,
  ScienceProjectStatus,
} from '../types';

const startHandler = function (laboratoryId: string): ScienceProjectStatus {
  const currentScience =
    GameManager.getInstance().gameData.governingOrganizations[
      GameManager.getInstance().gameData.player.organizationId
    ].science;
  return {
    indexName: config.indexName,
    accumulatedScience: currentScience,
    laboratory: laboratoryId,
    complete: false,
    daysRemaining: config.completionTime,
  };
};

const progressHandler = function (
  status: ScienceProjectStatus,
): ScienceProjectStatus {
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
};

const completeHandler = function (
  status: ScienceProjectStatus,
): ScienceProjectResult {
  return {
    indexName: status.indexName,
    updatedGameData: applyStatusEffect(
      'centralized-telecommunications',
      GameManager.getInstance().gameData.player.organizationId,
    ),
  };
};

export const config: ScienceProjectDefinition = {
  name: 'Centralized Communications',
  description:
    'Centralizing our communications will allow us to intercept citizens messages and control the narrative.',
  indexName: 'centralized-communications',
  startHandler,
  completeHandler,
  science: 20,
  cost: 2500,
  completionTime: 5,
  requirements: {
    completedProjects: [],
  },
};
