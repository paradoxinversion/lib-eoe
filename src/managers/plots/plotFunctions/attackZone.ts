import { GameManager } from '../../game/GameManager';
import people from '../../../actions/people';
import combat from '../../../combat';
import organization from '../../../actions/organization';
import {
  Building,
  GoverningOrganization,
  Person,
  Zone,
} from '../../../types/interfaces/entities';
import zones from '../../../actions/zones';
import { PlotResult } from '../Plot';
import { PlotParamsBase } from '../types';

export interface PlotAttackZoneParams extends PlotParamsBase {}

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
export const attackZone = ({
  zone: { id: zoneId, organizationId: zoneOrgId },
  participants,
}: PlotAttackZoneOpts): PlotResult => {
  const { gameData } = GameManager.getInstance();
  const defendingAgents = people.getPeople({
    personFilter: {
      organizationId: zoneOrgId,
    },
    zone: {
      zoneId,
    },
    agentFilter: { agentsOnly: true },
  });
  const attackingAgents = participants.map((agent) => gameData.people[agent]);
  const result = combat.doCombat(attackingAgents, defendingAgents);

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
      nationId: gameData.player.empireId,
      organizationId: gameData.player.organizationId,
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
  return {
    success: result.victoryResult === 1,
    resolutionData: result,
    updatedGameData,
  };
};
