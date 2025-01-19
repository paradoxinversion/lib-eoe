import { GameManager } from '../../game/GameManager';
import people from '../../../actions/people';
import combat from '../../../combat/combat';
import organization from '../../../actions/organization';
import {
  GoverningOrganization,
  Person,
  Zone,
  CombatResult,
  PlotReconParams,
  PlotResult,
} from '../../../types';
// import utilities from '../../../utilities';
import Plot from '../Plot';
import PlotManager from '../PlotManager';
import skillChecks from '../../../skillChecks';
import utilities from '../../../utilities';

export const generateReconPlot = (params: PlotReconParams) => {
  const plot = new Plot('Recon Zone', 'recon-zone', params);
  PlotManager.getInstance().addPlot(plot);
};

export const executeReconPlot = (params: PlotReconParams): PlotResult => {
  // Less participants = higher chance of success/lower chance of detection, less information
  // Relevant skills: Espionage, Security, Disguise

  const { participants, targetZone, surrender } = params;
  const zone = GameManager.getInstance().gameData.zones[targetZone!];
  /** Final intelligence modifier for the zone. May be negative
   * if the plot is failed
   */
  let intelMod = 0;
  let empireAgents: Person[] = [];
  const detectedAgents: Person[] = [];
  if (params.useDrones) {
    // Drones are used in the operation
    // This is a placeholder for now
    intelMod = 10;
  } else {
    empireAgents = participants.map(
      (agent) => GameManager.getInstance().gameData.people[agent],
    );

    empireAgents.forEach((agent) => {
      const succeeded = skillChecks.attemptInfiltration(agent, zone);
      if (!succeeded) {
        detectedAgents.push(agent);
      }
    });
  }

  // determine which of the zone's agents will respond to detected agents
  const enemyZoneAgents = people.getPeople({
    personFilter: {
      organizationId: zone.organizationId,
    },
    zone: {
      zoneId: zone.id,
    },
    agentFilter: { agentsOnly: true },
  });
  const maxRespondingAgents = detectedAgents.length + detectedAgents.length / 2;

  // Make this a random selection of agents
  const respondingAgents = enemyZoneAgents.slice(0, maxRespondingAgents);
  let capturedAgentIds: string[] = [];
  let combatResult: CombatResult | null = null;
  let success = false;
  if (participants.length > detectedAgents.length) {
    success = true;
    // get the total intelligence gathered by the agents
    let intelligenceTotal = 0;
    participants
      .filter(
        (agent) =>
          !detectedAgents.includes(
            GameManager.getInstance().gameData.people[agent],
          ),
      )
      .forEach((agent) => {
        intelligenceTotal += skillChecks.gatherIntelligence(
          GameManager.getInstance().gameData.people[agent],
          zone,
        );
      });

    if (intelligenceTotal > 100) {
      intelligenceTotal = 100;
    }
    intelMod = intelligenceTotal;
  } else {
    if (params.useDrones) {
      // Something should happen
    } else {
      // Enemy Alert Phase
      // Empire agents may be captured here
      // We don't want to use all of the zone's agents as responders
      //
      if (surrender) {
        // If agents are instructed to surrender, they have a chance to be captured
        // For now, we're going to make it a simple coin toss
        capturedAgentIds = participants.filter(() => Math.random() > 0.01);
      } else {
        // Agents will engage in combat with the enemy
        combatResult = combat.doCombat(empireAgents, respondingAgents);
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
    ...GameManager.getInstance().gameData.zones[zone.id!],
    intelAttributes: {
      ...GameManager.getInstance().gameData.zones[zone.id!].intelAttributes,
      intelligenceLevel:
        GameManager.getInstance().gameData.zones[zone.id!].intelAttributes
          .intelligenceLevel + intelMod,
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
        GameManager.getInstance().gameData.people[agent],
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
