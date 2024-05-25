import { GameManager } from '../../game/GameManager';
import { Person } from '../../../types/interfaces/entities';
import Plot, { PlotParamsStandard, PlotResult } from '../Plot';
import PlotManager from '../PlotManager';

export interface PlotParamsEmbedAgents extends PlotParamsStandard {
  targetZone: string;
}
export interface PlotResolutionEmbedAgents {
  /** The agents that were embedded */
  agents: string[];
}

const generateEmbedAgentsPlot = (params: PlotParamsEmbedAgents) => {
  PlotManager.getInstance().addPlot(
    new Plot('Embed Agents', 'embed-agents', params),
  );
};

export const executeEmbedAgentsPlot = (
  params: PlotParamsEmbedAgents,
): PlotResult => {
  const { participants, targetZone } = params;
  const { gameData } = GameManager.getInstance();
  const zone = gameData.zones[targetZone!];

  const embeddedAgents = participants.reduce<{ [key: string]: Person }>(
    (acc, agentId) => {
      const agentObj = GameManager.getInstance().gameData.people[agentId];
      if (agentObj.agent) {
        acc[agentId] = {
          ...agentObj,
          agent: {
            ...agentObj.agent,
            embeddedAt: zone.id,
          },
        };
      }
      return acc;
    },
    {},
  );
  GameManager.getInstance().updateGameData({ people: embeddedAgents });
  return {
    success: true,
    resolutionData: {
      agents: participants,
    },
    updatedGameData: {
      people: embeddedAgents,
    },
  };
};

export default {
  generateEmbedAgentsPlot,
};
