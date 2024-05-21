import { GameManager } from '../../game/GameManager';
import Plot, { PlotResult } from '../../plots/Plot';
import GameEvent from '../GameEvent';

export interface EmbedAgentsParams {
  plot: Plot;
}

export const generateEmbedAgentsEvent = (plot: Plot) => {
  return new GameEvent(embedAgentsConfig, {
    plot,
  });
};

function setEmbedAgentsParams(this: GameEvent, { plot }: EmbedAgentsParams) {
  this.params = {
    plot,
  };
}

function resolveEmbedAgentd(this: GameEvent) {
  const params = this.params as EmbedAgentsParams;
  const result = params.plot.resolution as PlotResult;

  GameManager.getInstance().updateGameData(result.updatedGameData);

  this.eventData = {
    type: 'embed-agents',
    resolution: {
      updatedGameData: result.updatedGameData,
    },
  };

  return this.eventData;
}

export const embedAgentsConfig = {
  name: 'Embed Agents',
  setParams: setEmbedAgentsParams,
  resolve: resolveEmbedAgentd,
  getEventText(this: GameEvent) {
    this.eventText = `An agent was embedded in a zone!`;
  },
  icon: 'warning',
  type: 'embedAgents',
  forceStop: true,
};
