import GameManager from '../../game/GameManager';
import people from '../../../actions/people';
import combat from '../../../combat';
import organization from '../../../actions/organization';
import {
  Building,
  GoverningOrganization,
  Person,
  Zone,
  PlotAttackZoneOpts,
  PlotResult,
} from '../../../types';
import zones from '../../../actions/zones';
import utilities from '../../../utilities';

/**
 * Launch a direct assault against the Zone's security forces.
 *
 * Notes:
 * - A percentage of enemy agents <= participants * 1.5 will be involved in the combat.
 * - Responding agents can be personnel, but troops should be prioritized
 */
export const attackZone = ({
  zone: { id: zoneId, organizationId: zoneOrgId },
  participants,
}: PlotAttackZoneOpts): PlotResult => {
  const attackingAgents = participants.map(
    (agent) => GameManager.getInstance().gameData.people[agent],
  );

  // Responder Mobilization Phase
  const defendingAgentPool = people.getPeople({
    personFilter: {
      organizationId: zoneOrgId,
    },
    zone: {
      zoneId,
    },
    agentFilter: { agentsOnly: true },
  });

  const totalRespondersMin = defendingAgentPool.length / 2;
  const totalRespondersMax = defendingAgentPool.length * 1.5;
  const totalResponders = utilities.randomInt(
    totalRespondersMin,
    totalRespondersMax,
  );
  const responders: Person[] = [];

  for (let i = 0; i < totalResponders; i++) {
    const agentIndex = utilities.randomInt(0, defendingAgentPool.length - 1);
    const agent = defendingAgentPool[agentIndex];
    if (agent) {
      responders.push();
      defendingAgentPool.splice(agentIndex, 1);
    }
  }
  // Combat Phase
  const result = combat.doCombat(attackingAgents, responders);

  const updatedGameData: {
    people: { [x: string]: Person };
    zones: { [x: string]: Zone };
    governingOrganizations: { [x: string]: GoverningOrganization };
    buildings: { [x: string]: Building };
  } = {
    people: {},
    zones: {},
    governingOrganizations: {},
    buildings: {},
  };
  const { attackers, defenders } = result.characters;
  // Update the agents involved in the attack
  attackers.forEach((agent: Person) => {
    updatedGameData.people[agent.id] = agent;
  });

  defenders.forEach((agent: Person) => {
    updatedGameData.people[agent.id] = agent;
  });
  if (result.victoryResult === 1) {
    const zoneTransferUpdate = zones.transferZoneControl({
      zoneId,
      nationId: GameManager.getInstance().gameData.player.empireId,
      organizationId: GameManager.getInstance().gameData.player.organizationId,
    });

    updatedGameData.zones = { [zoneId]: zoneTransferUpdate.zones![zoneId] };
    updatedGameData.buildings = zoneTransferUpdate.buildings!;
  }

  const preupdateEmpire = organization.getEvilEmpire();
  const evilEmpire: GoverningOrganization = {
    ...preupdateEmpire,
    totalEvil: preupdateEmpire.totalEvil + 10,
  };
  updatedGameData.governingOrganizations = {};
  updatedGameData.governingOrganizations[evilEmpire.id] = evilEmpire;
  GameManager.getInstance().updateGameData(updatedGameData);
  return {
    success: result.victoryResult === 1,
    resolutionData: result,
    updatedGameData,
  };
};
