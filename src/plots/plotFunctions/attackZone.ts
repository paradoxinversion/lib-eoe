import { GameManager } from '../../GameManager';
import { getPeople } from '../../actions/people';
import { doCombat } from '../../combat';
import { getEvilEmpire } from '../../organization';
import {
  Building,
  GoverningOrganization,
  Person,
  Zone,
} from '../../types/interfaces/entities';
import { transferZoneControl } from '../../zones';
import { PlotResult } from '../Plot';

export interface PlotAttackZoneParams {}

interface PlotAttackZoneOpts {
  zone: {
    id: string;
    organizationId: string;
  };
  participants: string[];
}
/**
 * Attack a zone
 */
export const attackZone = (
  gameManager: GameManager,
  {
    zone: { id: zoneId, organizationId: zoneOrgId },
    participants,
  }: PlotAttackZoneOpts,
): PlotResult => {
  const { gameData } = gameManager;
  const defendingAgents = getPeople(gameManager, {
    organizationId: zoneOrgId,
    zoneId,
    agentFilter: { agentsOnly: true },
  });
  const attackingAgents = participants.map((agent) => gameData.people[agent]);
  const result = doCombat(attackingAgents, defendingAgents);

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
    const zoneTransferUpdate = transferZoneControl(gameManager, {
      zoneId,
      nationId: gameData.player.empireId,
      organizationId: gameData.player.organizationId,
    });

    updatedGameData.zones = { [zoneId]: zoneTransferUpdate.zones![zoneId] };
    updatedGameData.buildings = zoneTransferUpdate.buildings!;
  }

  const preupdateEmpire = getEvilEmpire(gameManager);
  const evilEmpire: GoverningOrganization = {
    ...preupdateEmpire,
    totalEvil: preupdateEmpire.totalEvil + 10,
  };
  updatedGameData.governingOrganizations = {};
  updatedGameData.governingOrganizations[evilEmpire.id] = evilEmpire;
  return {
    success: result.victoryResult === 1,
    resolutionData: result,
    updatedGameData,
  };
};
