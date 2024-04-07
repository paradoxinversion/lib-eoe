import { GameManager } from '../../GameManager';
import { getPeople } from '../../actions/people';
import { CombatResult, doCombat } from '../../combat';
import { getEvilEmpire, takeCaptive } from '../../organization';
import {
  GoverningOrganization,
  Person,
  Zone,
} from '../../types/interfaces/entities';
import { randomInt } from '../../utilities';
import Plot, { PlotResult, PlotParamsStandard } from '../Plot';

export interface PlotReconParams {
  /** If caught by the enemy, surrender */
  surrender: boolean;
}

export interface ReconPlotData {
  intelligenceModifier: number;
  capturedAgentIds: string[];
  combatResult: CombatResult | null;
}

export const executeReconPlot = (
  gameManager: GameManager,
  params: PlotParamsStandard & PlotReconParams,
): PlotResult => {
  const { participants, targetZone, surrender } = params;
  const { gameData } = gameManager;
  const zone = gameData.zones[targetZone!];
  /** Final intelligence modifier for the zone. May be negative
   * if the plot is failed
   */
  let intelMod = 0;

  const enemyZoneAgents = getPeople(gameManager, {
    organizationId: zone.organizationId,
    zoneId: zone.id,
    agentFilter: { agentsOnly: true },
  });
  const empireAgents = participants.map((agent) => gameData.people[agent]);
  // Detection Phase
  // Zone agents may detect the player agents
  const detection = enemyZoneAgents.reduce((total, currentParticipant) => {
    return total + currentParticipant.skills.security;
  }, 0);

  const stealth = empireAgents.reduce((total, currentParticipant) => {
    return (
      total +
      currentParticipant.skills.espionage +
      currentParticipant.skills.disguise
    );
  }, 0);

  const detectionRoll =
    randomInt(0, detection) + randomInt(0, detection) + randomInt(0, detection);
  const stealthRoll =
    randomInt(0, stealth) + randomInt(0, stealth) + randomInt(0, stealth);

  const success = stealthRoll > detectionRoll;

  let capturedAgentIds: string[] = [];
  let combatResult: CombatResult | null = null;
  if (success) {
    // Intelligence Phase
    intelMod = randomInt(5, 10);
    if (intelMod > 100) {
      intelMod = 100;
    }
  } else {
    // Enemy Alert Phase
    // Empire agents may be captured here
    if (surrender) {
      // If agents are instructed to surrender, they have a chance to be captured
      // For now, we're going to make it a simple coin toss
      capturedAgentIds = participants.filter(() => Math.random() > 0.01);
    } else {
      // Agents will engage in combat with the enemy
      combatResult = doCombat(empireAgents, enemyZoneAgents);
    }
  }

  // Resolve the plot
  const updatedGameData: {
    zones: { [x: string]: Zone };
    governingOrganizations: { [x: string]: GoverningOrganization };
    people: { [x: string]: Person };
  } = {
    zones: {},
    governingOrganizations: {},
    people: {},
  };

  // Update the zone's intelligence level
  const updatedZone: Zone = {
    ...gameData.zones[zone.id!],
    intelAttributes: {
      ...gameData.zones[zone.id!].intelAttributes,
      intelligenceLevel:
        gameData.zones[zone.id!].intelAttributes.intelligenceLevel + intelMod,
    },
  };

  // updatedZone.intelAttributes.intelligenceLevel += intelMod;
  updatedGameData.zones[updatedZone.id] = updatedZone;
  const preupdateEmpire = getEvilEmpire(gameManager);
  const evilEmpire: GoverningOrganization = {
    ...preupdateEmpire,
    totalEvil: preupdateEmpire.totalEvil + 10,
  };
  updatedGameData.governingOrganizations[evilEmpire.id] = evilEmpire;
  if (capturedAgentIds) {
    capturedAgentIds.forEach((agent) => {
      updatedGameData.people[agent] = takeCaptive(
        gameManager,
        updatedZone.organizationId,
        gameData.people[agent],
      ).people![agent];
      console.log(agent, 'taken captive');
    });
  }
  return {
    success,
    updatedGameData,
    resolutionData: {
      intelligenceModifier: intelMod,
      capturedAgentIds,
      combatResult,
    },
  };
};
