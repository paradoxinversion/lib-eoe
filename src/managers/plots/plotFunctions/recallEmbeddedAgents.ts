import { GameManager } from '../../game/GameManager';
import { Person } from '../../../types/interfaces/entities';
import { PlotParamsStandard, PlotResult } from '../Plot';

export interface PlotEmbedAgentsData {
  /** The agents that are returning */
  agents: string[];
}

export const executeRecallEmbeddedAgentsPlot = (
  params: PlotParamsStandard,
): PlotResult => {
  // For now, we just nullify the embeddedAt property from the agent object
  const { participants } = params;

  const returningAgents = participants.reduce<{ [key: string]: Person }>(
    (acc, agentId) => {
      const agentObj = GameManager.getInstance().gameData.people[agentId];
      if (agentObj.agent) {
        acc[agentId] = {
          ...agentObj,
          agent: {
            ...agentObj.agent,
            embeddedAt: null,
          },
        };
      }
      return acc;
    },
    {},
  );
  GameManager.getInstance().updateGameData({ people: returningAgents });
  return {
    success: true,
    resolutionData: {
      agents: participants,
    },
    updatedGameData: {
      people: returningAgents,
    },
  };
};
