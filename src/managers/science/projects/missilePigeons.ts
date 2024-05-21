import { GameManager } from '../../game/GameManager';
import { applyStatusEffect } from '../../../organization';
import {
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

const completeHandler = function (
  status: ScienceProjectStatus,
): ScienceProjectResult {
  return {
    indexName: status.indexName,
    updatedGameData: applyStatusEffect(
      'missile-pigeons',
      GameManager.getInstance().gameData.player.organizationId,
    ),
  };
};

export const config: ScienceProjectDefinition = {
  name: 'Missile Pigeons',
  description:
    'Researchers have determined rocket-propelled pigeons are harder to intercept. More research is needed.',
  indexName: 'missile-pigeons',
  startHandler,
  completeHandler,
  science: 20,
  cost: 1,
  completionTime: 5,
  requirements: {
    completedProjects: ['applied-rocketry', 'carrier-pigeons'],
  },
};
