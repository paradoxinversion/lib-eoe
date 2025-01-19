import { GameManager } from '../../game/GameManager';
import utilities from '../../../utilities';

import { generateEvent as generateDomesticEncounter } from '../../events/eventFunctions/domesticCombatEncounter';
import { CrowdSize } from '../../../types';
import GameEventQueue from '../../events/GameEventQueue';
const harassNuns = (participantArray: string[]) => {
  if (participantArray.length === 0) {
    return null;
  }
  let empathy = 0;
  // For this, low empathy is mostly required
  participantArray.forEach((participant) => {
    const agent = GameManager.getInstance().gameData.people[participant];
    empathy += agent.standardAttributes.empathy;
  });

  // The lower the empathy of the squad, the more effective the harrassment
  // ...and the more likely they'll be attacked in retaliation

  // Figure out what the percentage of the squad's empathy is (relative to its while potential)
  const potentialEmpathy = participantArray.length * 10;
  const empathyPercentage = (empathy / potentialEmpathy) * 100;

  let evil = participantArray.length;
  let retaliation = false;
  let crowdSize = 'small';
  if (empathyPercentage < 25) {
    // Most effective result, highest likelihood of retaliation
    evil *= 5;
    retaliation = utilities.randomInt(1, 100) < 50;
    crowdSize = utilities.randomInt(1, 100) < 75 ? 'medium' : 'large';
  } else if (empathyPercentage < 50) {
    // Effective result, moderate likelihood of retaliation
    evil *= 3;
    retaliation = utilities.randomInt(1, 100) < 50;
    crowdSize = utilities.randomInt(1, 100) < 50 ? 'medium' : 'small';
  } else if (empathyPercentage < 75) {
    // Ineffective result, low likelihood of retaliation
    evil *= 2;
    retaliation = utilities.randomInt(1, 100) - 25 < 50;
    crowdSize = 'small';
  }
  const org =
    GameManager.getInstance().gameData.governingOrganizations[
      GameManager.getInstance().gameData.people[participantArray[0]].agent!
        .organizationId
    ];

  GameManager.getInstance().updateGameData({
    governingOrganizations: {
      [org.id]: {
        ...org,
        totalEvil: org.totalEvil + evil,
      },
    },
  });

  if (retaliation) {
    // Add a new event to the queue
    // The nuns are not pleased
    const event = generateDomesticEncounter({
      crowd: crowdSize as CrowdSize,
      targetedAgents: participantArray,
      zone: GameManager.getInstance().gameData.people[participantArray[0]]
        .homeZoneId,
    });

    GameEventQueue.getInstance().addEvent(event);
    console.debug('Activity::Harass Nuns::\n', { event, retaliation, evil });
  }
};

export default harassNuns;
