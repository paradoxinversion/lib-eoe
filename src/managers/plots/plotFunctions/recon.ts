import { GameManager } from '../../game/GameManager';
import people from '../../../actions/people';
import combat, { CombatResult } from '../../../combat/combat';
import organization from '../../../actions/organization';
import {
  GoverningOrganization,
  Person,
  Zone,
} from '../../../types/interfaces/entities';
import utilities from '../../../utilities';
import Plot, { PlotResult } from '../Plot';
import { PlotParamsBase, PlotResultBase } from '../types';
import PlotManager from '../PlotManager';

export interface PlotReconParams extends PlotParamsBase {
  targetZone: string;
  /** If caught by the enemy, surrender */
  surrender: boolean;
  /** Use drones for the operation */
  useDrones: boolean;
}

export interface PlotReconResolution extends PlotResultBase {
  intelligenceModifier: number;
  capturedAgentIds: string[];
  combatResult: CombatResult | null;
}

export const generateReconPlot = (params: PlotReconParams) => {
  const plot = new Plot('Recon Zone', 'recon-zone', params);
  PlotManager.getInstance().addPlot(plot);
};

export const executeReconPlot = (params: PlotReconParams): PlotResult => {
  const { participants, targetZone, surrender } = params;
  const { gameData } = GameManager.getInstance();
  const zone = gameData.zones[targetZone!];
  /** Final intelligence modifier for the zone. May be negative
   * if the plot is failed
   */
  let intelMod = 0;
  let success = false;
  let empireAgents: Person[] = [];
  let enemyZoneAgents: Person[] = [];
  if (params.useDrones) {
    // Drones are used in the operation
    // This is a placeholder for now
    intelMod = 10;
  } else {
    enemyZoneAgents = people.getPeople({
      personFilter: {
        organizationId: zone.organizationId,
      },
      zone: {
        zoneId: zone.id,
      },
      agentFilter: { agentsOnly: true },
    });

    empireAgents = participants.map((agent) => gameData.people[agent]);

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
      utilities.randomInt(0, detection) +
      utilities.randomInt(0, detection) +
      utilities.randomInt(0, detection);
    const stealthRoll =
      utilities.randomInt(0, stealth) +
      utilities.randomInt(0, stealth) +
      utilities.randomInt(0, stealth);

    success = stealthRoll > detectionRoll;
  }
  let capturedAgentIds: string[] = [];
  let combatResult: CombatResult | null = null;

  if (success) {
    // Intelligence Phase
    intelMod = utilities.randomInt(5, 10);
    if (intelMod > 100) {
      intelMod = 100;
    }
  } else {
    if (params.useDrones) {
      // Something should happen
    } else {
      // Enemy Alert Phase
      // Empire agents may be captured here
      if (!params.useDrones && surrender) {
        // If agents are instructed to surrender, they have a chance to be captured
        // For now, we're going to make it a simple coin toss
        capturedAgentIds = participants.filter(() => Math.random() > 0.01);
      } else {
        // Agents will engage in combat with the enemy
        combatResult = combat.doCombat(empireAgents, enemyZoneAgents);
      }
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
  const preupdateEmpire = organization.getEvilEmpire();
  const evilEmpire: GoverningOrganization = {
    ...preupdateEmpire,
    totalEvil: preupdateEmpire.totalEvil + 10,
  };
  updatedGameData.governingOrganizations[evilEmpire.id] = evilEmpire;
  if (capturedAgentIds) {
    capturedAgentIds.forEach((agent) => {
      updatedGameData.people[agent] = organization.takeCaptive(
        updatedZone.organizationId,
        gameData.people[agent],
      ).people![agent];
      console.log(agent, 'taken captive');
    });
  }

  GameManager.getInstance().updateGameData(updatedGameData);

  return {
    success,
    updatedGameData,
    resolutionData: {
      success,
      intelligenceModifier: intelMod,
      capturedAgentIds,
      combatResult,
    },
  };
};

export default {
  generateReconPlot,
};
