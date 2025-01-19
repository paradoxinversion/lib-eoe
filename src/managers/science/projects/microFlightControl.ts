import { GameManager } from '../../game/GameManager';
import { applyStatusEffect } from '../../../organization';
import {
  ScienceProjectDefinition,
  ScienceProjectResult,
  ScienceProjectStatus,
} from '../../../types';

const startHandler = function (
  laboratoryId: string,
  gameManager?: GameManager,
): ScienceProjectStatus {
  const currentScience =
    gameManager!.gameData.governingOrganizations[
      gameManager!.gameData.player.organizationId
    ].science;
  return {
    indexName: config.indexName,
    accumulatedScience: currentScience,
    laboratory: laboratoryId,
    complete: false,
    daysRemaining: config.completionTime,
  };
};

const completeHandler = function (
  status: ScienceProjectStatus,
): ScienceProjectResult {
  return {
    indexName: status.indexName,
    updatedGameData: applyStatusEffect(
      'micro-flight-control',
      GameManager.getInstance().gameData.player.organizationId,
    ),
  };
};

export const config: ScienceProjectDefinition = {
  name: 'Micro Flight Control',
  description:
    'Micro flight controll will allow us to utilize drone technology.',
  indexName: 'micro-flight-control',
  startHandler,
  completeHandler,
  science: 20,
  cost: 1,
  completionTime: 5,
  requirements: {
    completedProjects: ['miniaturized-locomotion'],
  },
};
