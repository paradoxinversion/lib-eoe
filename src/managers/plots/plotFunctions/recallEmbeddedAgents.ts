import { GameManager } from '../../game/GameManager';
import { Person } from '../../../types/interfaces/entities';
import Plot, { PlotResult } from '../Plot';
import { PlotParamsBase } from '../types';
import PlotManager from '../PlotManager';

export interface PlotResolutionRecallEmbeddedAgents {
  /** The agents that are returning */
  agents: string[];
}

const generateRecallEmbeddedAgentsPlot = (params: PlotParamsBase) => {
  PlotManager.getInstance().addPlot(
    new Plot('Recall Embedded Agents', 'recall-embedded-agents', params),
  );
};

export const executeRecallEmbeddedAgentsPlot = (
  params: PlotParamsBase,
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

export default {
  generateRecallEmbeddedAgentsPlot,
};
