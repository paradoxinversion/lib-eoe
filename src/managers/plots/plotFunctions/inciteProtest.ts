import GameManager from '../../game/GameManager';
import people from '../../../actions/people';
import { Person, PlotParamsStandard, PlotResult } from '../../../types';

export const executeInciteProtestPlot = (
  params: PlotParamsStandard,
): PlotResult => {
  const { participants, targetZone } = params;
  const zone = GameManager.getInstance().gameData.zones[targetZone!];
  const agents = participants.map(
    (agentId) => GameManager.getInstance().gameData.people[agentId],
  );
  const zoneCitizens = people.getPeople({
    personFilter: {
      organizationId: zone.organizationId,
      excludeDeceased: true,
    },
    zone: {
      zoneId: zone.id,
    },
    agentFilter: {
      excludeAgents: true,
    },
  });
  const agentSkillTotal = agents.reduce(
    (acc, agent) => acc + agent.skills.espionage + agent.skills.security,
    0,
  );
  const protestParticipantTotal = Math.floor(agentSkillTotal * 0.1);
  const protestParticipants = zoneCitizens
    .slice(0, protestParticipantTotal)
    .map((citizen) => {
      return {
        ...citizen,
        intelAttributes: {
          ...citizen.intelAttributes,
          loyalties: {
            ...citizen.intelAttributes.loyalties,
            [zone.organizationId]:
              citizen.intelAttributes.loyalties[zone.organizationId] - 0.5,
          },
        },
      };
    })
    .reduce<{ [index: string]: Person }>((acc, citizen) => {
      acc[citizen.id] = citizen;
      return acc;
    }, {});
  GameManager.getInstance().updateGameData({ people: protestParticipants });

  return {
    success: true,
    resolutionData: {
      agents: participants,
      protesters: protestParticipants,
    },
    updatedGameData: {
      people: protestParticipants,
    },
  };
};
