import { GameManager } from '../../game/GameManager';
import { Person } from '../../../types/interfaces/entities';
import { PlotParamsStandard, PlotResult } from '../Plot';

export interface PlotEmbedAgentsData {
  /** The agents that were embedded */
  agents: string[];
}

export const executeEmbedAgentsPlot = (
  params: PlotParamsStandard,
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
