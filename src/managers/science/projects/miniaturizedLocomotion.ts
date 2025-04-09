import GameManager from '../../game/GameManager';
import { applyStatusEffect } from '../../../organization';
import {
  ScienceProjectDefinition,
  ScienceProjectResult,
  ScienceProjectStatus,
} from '../../../types';

const startHandler = function (laboratoryId: string): ScienceProjectStatus {
  return {
    indexName: config.indexName,
    accumulatedScience: 0,
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
      'miniaturized-locomotion',
      GameManager.getInstance().gameData.player.organizationId,
    ),
  };
};

export const config: ScienceProjectDefinition = {
  name: 'Miniaturized Locomotion',
  indexName: 'miniaturized-locomotion',
  description:
    'Developing a new form of locomotion that is smaller and more efficient.',
  science: 1,
  cost: 1,
  completionTime: 5,
  requirements: {
    completedProjects: [],
  },
  startHandler,
  completeHandler,
};
