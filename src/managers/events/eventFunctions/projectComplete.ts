import { GameManager } from '../../game/GameManager';
import { ProjectCompleteParams } from '../../../types';
import { ScienceProjectResult } from '../../science/types';
import GameEvent from '../GameEvent';

export const generateProjectCompleteEvent = (
  projectResult: ScienceProjectResult,
) => {
  return new GameEvent(projectCompleteEventConfig, {
    projectIndexName: projectResult.indexName,
    empireUpdate: projectResult.updatedGameData,
  });
};

function resolveProjectComplete(this: GameEvent) {
  const params = this.params as ProjectCompleteParams;
  GameManager.getInstance().updateGameData(params.empireUpdate);
  GameManager.getInstance().addGameLogEvent({
    color: 'Primary',
    date: GameManager.getInstance().gameData.gameDate.toDateString(),
    icon: projectCompleteEventConfig.icon,
    text: 'Project Complete',
  });
  this.eventData = {
    type: 'project-complete',
    resolution: {
      updatedGameData: params.empireUpdate,
    },
  };
}

export const projectCompleteEventConfig = {
  name: 'Science Project Complete',
  resolve: resolveProjectComplete,
  getEventText(this: GameEvent) {
    this.eventText = 'A project has been completed!';
  },
  icon: 'info',
  type: 'projectComplete',
  forceStop: true,
};
