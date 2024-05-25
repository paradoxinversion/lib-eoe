import { GameManager } from '../../game/GameManager';
import Plot, { PlotResult } from '../../plots/Plot';
import {
  PlotParamsEmbedAgents,
  PlotResolutionEmbedAgents,
} from '../../plots/plotFunctions/embedAgents';
import GameEvent from '../GameEvent';

export interface EmbedAgentsParams {
  plot: Plot;
  plotResolution: PlotResolutionEmbedAgents;
  plotParams: PlotParamsEmbedAgents;
}

export const generateEmbedAgentsEvent = (plot: Plot) => {
  const params: EmbedAgentsParams = {
    plot,
    plotParams: {
      ...(plot.plotParams as PlotParamsEmbedAgents),
    },
    plotResolution: {
      ...(plot.resolution.resolutionData as PlotResolutionEmbedAgents),
    },
  };
  return new GameEvent(embedAgentsConfig, params);
};

function resolveEmbedAgentd(this: GameEvent) {
  const params = this.params as EmbedAgentsParams;
  const result = params.plot.resolution as PlotResult;

  GameManager.getInstance().updateGameData(result.updatedGameData);
  GameManager.getInstance().addGameLogEvent({
    color: 'Primary',
    date: GameManager.getInstance().gameData.gameDate.toDateString(),
    icon: embedAgentsConfig.icon,
    text: 'Agents Embedded',
  });
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
  resolve: resolveEmbedAgentd,
  getEventText(this: GameEvent) {
    this.eventText = `An agent was embedded in a zone!`;
  },
  icon: 'warning',
  type: 'embedAgents',
  forceStop: true,
};
