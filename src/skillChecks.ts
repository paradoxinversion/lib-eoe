import people from './actions/people';
import { Person, Zone } from './types/entities';
import utilities from './utilities';

/**
 * Check one person's attempt to infiltrate a zone agains
 * the zone's security.
 */
const attemptInfiltration = (infiltrator: Person, zone: Zone) => {
  const enemyZoneAgents = people.getPeople({
    personFilter: {
      organizationId: zone.organizationId,
    },
    zone: {
      zoneId: zone.id,
    },
    agentFilter: { agentsOnly: true },
  });

  // Infiltrators should be more likely than not to succeed

  // Get the average security skill of the enemy agents as a measure of detection
  const detection =
    enemyZoneAgents.reduce((total, currentParticipant) => {
      return total + currentParticipant.skills.security;
    }, 0) / enemyZoneAgents.length;
  const detectionRolls = Math.ceil(detection / 2);
  let detectionTotal = 0;
  for (let i = 0; i < detectionRolls; i++) {
    detectionTotal += utilities.randomInt(0, detection);
  }

  const stealth =
    (infiltrator.skills.espionage + infiltrator.skills.disguise) / 2;
  const stealthRolls = Math.ceil(stealth / 2);
  let stealthTotal = 0;
  for (let i = 0; i < stealthRolls; i++) {
    stealthTotal += utilities.randomInt(0, stealth);
  }

  return stealthTotal > detectionTotal;
};

/**
 * Returns the intel gain by the person in the zone.
 */
const gatherIntelligence = (person: Person, zone: Zone) => {
  // Relevant Skills: Security, Espionage
  const intelGain = (person.skills.espionage + person.skills.security) * 0.02;
  return intelGain;
};

const attemptIncitement = (incitor: Person, zone: Zone) => {
  // Relevant Skills: Persuasion, Espionage
  const incitorSkills =
    incitor.skills.persuasion + incitor.skills.espionage / 2;
  // Get the zone's lower-loyalty citizens
  const zoneCitizens = people
    .getPeople({
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
    })
    .filter((citizen) => {
      if (citizen.intelAttributes.loyalties[zone.organizationId] < 0.5) {
        return true;
      }
      return false;
    });

  // Get the number of citizens that will participate in the protest
  const protestParticipantTotal = Math.floor(incitorSkills * 0.1);

  // Get the citizens that will participate in the protest
  const agitators = zoneCitizens
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
    });
  return agitators;
};

export default {
  attemptInfiltration,
  gatherIntelligence,
  attemptIncitement,
};
