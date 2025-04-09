import GameManager from '../../game/GameManager';
import { Person, PlotParamsEmbedAgents, PlotResult } from '../../../types';
import Plot from '../Plot';
import PlotManager from '../PlotManager';
import skillChecks from '../../../skillChecks';
import actions from '../../../actions';

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
  const detectedAgents: Person[] = [];

  // Infiltration phase
  const embeddedAgents = participants.reduce<{ [key: string]: Person }>(
    (acc, agentId) => {
      const agentObj = GameManager.getInstance().gameData.people[agentId];

      if (agentObj.agent) {
        const infiltrationSuccess = skillChecks.attemptInfiltration(
          agentObj,
          zone,
        );
        if (infiltrationSuccess) {
          acc[agentId] = {
            ...agentObj,
            agent: {
              ...agentObj.agent,
              embeddedAt: zone.id,
            },
          };
        } else {
          detectedAgents.push(agentObj);
        }
      }

      return acc;
    },
    {},
  );

  // Response Phase
  // TODO: Implement response phase
  // Generate a response from the zone's security forces
  //
  if (detectedAgents.length > 0) {
    if (params.surrender) {
      // If the surrender flag is set, the agents that were detected are captured
      detectedAgents.forEach((agent) => {
        const agentObj = GameManager.getInstance().gameData.people[agent.id];
        actions.organization.takeCaptive(zone.organizationId, agentObj);
      });
    }
  }

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
