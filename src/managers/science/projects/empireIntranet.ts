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
      'empire-intranet',
      GameManager.getInstance().gameData.player.organizationId,
    ),
  };
};

export const config: ScienceProjectDefinition = {
  name: 'Empire Intranet',
  description:
    "Empire Intranet will allow us to closer monitor our citizen's online habits and secrets.",
  indexName: 'empire-intranet',
  startHandler,
  completeHandler,
  science: 20,
  cost: 1,
  completionTime: 5,
  requirements: {
    completedProjects: ['centralized-communications'],
  },
};
