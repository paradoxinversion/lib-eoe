import { GameManager } from '../../game/GameManager';
import people from '../../../actions/people';
import combat from '../../../combat';
import { Person, PlotAttackBuildingOpts, PlotResult } from '../../../types';

export const attackBuilding = (opts: PlotAttackBuildingOpts): PlotResult => {
  const { gameData } = GameManager.getInstance();
  const { buildingId, participants } = opts;
  const building = gameData.buildings[buildingId];
  const buildingPersonnel = building.personnel.map(
    (personId) => gameData.people[personId],
  );
  const zoneAgents = people.getPeople({
    personFilter: {
      organizationId: building.organizationId,
    },
    zone: {
      zoneId: building.zoneId,
    },
    agentFilter: { agentsOnly: true },
  });
  const possibleDefenders = buildingPersonnel.concat(zoneAgents);
  const attackers = participants.map((agent) => gameData.people[agent]);
  const result = combat.doCombat(attackers, possibleDefenders);
  if (result.victoryResult === 1) {
    return {
      success: true,
      updatedGameData: {
        people: result.characters.defenders.reduce<{ [x: string]: Person }>(
          (prev, agent) => {
            prev[agent.id] = agent;
            return prev;
          },
          {},
        ),
        buildings: {
          [buildingId]: {
            ...building,
            structure: {
              ...building.structure,
              currentHealth: building.structure.currentHealth - 1,
            },
          },
        },
      },
      resolutionData: null,
    };
  } else {
    return {
      success: false,
      updatedGameData: {
        people: result.characters.defenders.reduce<{ [x: string]: Person }>(
          (prev, agent) => {
            prev[agent.id] = agent;
            return prev;
          },
          {},
        ),
      },
      resolutionData: null,
    };
  }
};
