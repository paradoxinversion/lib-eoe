import { GameManager } from '../../GameManager';
import { getPeople } from '../../actions/people';
import { doCombat } from '../../combat';
import { Building, Person } from '../../types/interfaces/entities';
import { PlotResult } from '../Plot';

interface PlotAttackBuildingOpts {
  buildingId: string;
  participants: string[];
}

interface PlotAttackBuildingResult {}
export const attackBuilding = (opts: PlotAttackBuildingOpts): PlotResult => {
  const { gameData } = GameManager.getInstance();
  const { buildingId, participants } = opts;
  const building = gameData.buildings[buildingId];
  const buildingPersonnel = building.personnel.map(
    (personId) => gameData.people[personId],
  );
  const zoneAgents = getPeople({
    organizationId: building.organizationId,
    zoneId: building.zoneId,
    agentFilter: { agentsOnly: true },
  });
  const possibleDefenders = buildingPersonnel.concat(zoneAgents);
  const attackers = participants.map((agent) => gameData.people[agent]);
  const result = doCombat(attackers, possibleDefenders);
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
