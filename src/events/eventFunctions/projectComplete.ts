import { GameData, GameManager } from '../../GameManager';
import { ScienceProjectResult } from '../../managers/science/types';
import GameEvent from '../GameEvent';

export interface ProjectCompleteParams {
  projectIndexName: string;
  empireUpdate: Partial<GameData>;
}
export const generateProjectCompleteEvent = (
  projectResult: ScienceProjectResult,
) => {
  return new GameEvent(projectCompleteEventConfig, {
    projectIndexName: projectResult.indexName,
    empireUpdate: projectResult.updatedGameData,
  });
};
function setProjectCompleteParams(
  this: GameEvent,
  { projectIndexName, empireUpdate }: ProjectCompleteParams,
) {
  this.params = {
    projectIndexName,
    empireUpdate,
  };
}

function resolveProjectComplete(this: GameEvent, gameManager: GameManager) {
  const { gameData } = gameManager;
  const params = this.params as ProjectCompleteParams;
  gameManager.updateGameData(params.empireUpdate);
  this.eventData = {
    type: 'project-complete',
    resolution: {
      updatedGameData: params.empireUpdate,
    },
  };
}

export const projectCompleteEventConfig = {
  name: 'Science Project Complete',
  setParams: setProjectCompleteParams,
  resolve: resolveProjectComplete,
  getEventText(this: GameEvent) {
    this.eventText = 'A project has been completed!';
  },
  icon: 'info',
  type: 'projectComplete',
  forceStop: true,
};
