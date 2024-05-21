import { GameManager } from '../../game/GameManager';
import Plot, { PlotResult } from '../../plots/Plot';
import GameEvent from '../GameEvent';

export interface RecallEmbeddedAgentsParams {
  plot: Plot;
}

export const generateRecallEmbeddedAgentsEvent = (plot: Plot) => {
  return new GameEvent(recallEmbeddedAgentsConfig, {
    plot,
  });
};

function setRecallEmbedAgentsParams(
  this: GameEvent,
  { plot }: RecallEmbeddedAgentsParams,
) {
  this.params = {
    plot,
  };
}

function resolveRecallEmbedAgents(this: GameEvent) {
  const params = this.params as RecallEmbeddedAgentsParams;
  const result = params.plot.resolution as PlotResult;

  GameManager.getInstance().updateGameData(result.updatedGameData);

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
  setParams: setRecallEmbedAgentsParams,
  resolve: resolveRecallEmbedAgents,
  getEventText(this: GameEvent) {
    this.eventText = `Agents were recalled from foreign territory!`;
  },
  icon: 'warning',
  type: 'recallEmbeddedAgents',
  forceStop: true,
};
