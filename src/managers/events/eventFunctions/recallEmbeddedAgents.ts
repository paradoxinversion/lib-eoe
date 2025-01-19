import { GameManager } from '../../game/GameManager';
import Plot from '../../plots/Plot';
import { PlotResult, RecallEmbeddedAgentsParams } from '../../../types';

import GameEvent from '../GameEvent';

export const generateRecallEmbeddedAgentsEvent = (plot: Plot) => {
  return new GameEvent(recallEmbeddedAgentsConfig, {
    plot,
  });
};

function resolveRecallEmbedAgents(this: GameEvent) {
  const params = this.params as RecallEmbeddedAgentsParams;
  const result = params.plot.resolution as PlotResult;

  GameManager.getInstance().updateGameData(result.updatedGameData);
  GameManager.getInstance().addGameLogEvent({
    color: 'Primary',
    date: GameManager.getInstance().gameData.gameDate.toDateString(),
    icon: recallEmbeddedAgentsConfig.icon,
    text: 'Agents Recalled',
  });
  this.eventData = {
    type: 'recall-embedded-agents',
    resolution: {
      updatedGameData: result.updatedGameData,
    },
  };

  return this.eventData;
}

export const recallEmbeddedAgentsConfig = {
  name: 'Recall Embedded Agents',
  resolve: resolveRecallEmbedAgents,
  getEventText(this: GameEvent) {
    this.eventText = `Agents were recalled from foreign territory!`;
  },
  icon: 'warning',
  type: 'recallEmbeddedAgents',
  forceStop: true,
};
