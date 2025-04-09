import GameManager from '../../game/GameManager';
import { applyStatusEffect } from '../../../organization';
import {
  ScienceProjectDefinition,
  ScienceProjectResult,
  ScienceProjectStatus,
} from '../../../types';

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

const completeHandler = function (
  status: ScienceProjectStatus,
): ScienceProjectResult {
  return {
    indexName: status.indexName,
    updatedGameData: applyStatusEffect(
      'rocket-scientists',
      GameManager.getInstance().gameData.player.organizationId,
    ),
  };
};

export const config: ScienceProjectDefinition = {
  name: 'Applied Rocketry',
  description:
    'Researchers will determine the most efficient methods of combustion for rocket propulsion',
  indexName: 'advanced-rocketry',
  startHandler,
  completeHandler,
  science: 20,
  cost: 1,
  completionTime: 5,
  requirements: {
    completedProjects: ['advanced-explosives'],
  },
};
