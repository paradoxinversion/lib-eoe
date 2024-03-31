import { GameManager } from '../../GameManager';
import { getAgentsInZone } from '../../organization';
import { randomInt } from '../../utilities';

interface PlotReconParams {
  zoneId: string;
  participants: string[];
}

export const recon = (
  gameManager: GameManager,
  { zoneId, participants }: PlotReconParams,
) => {
  const { gameData } = gameManager;
  const zone = gameData.zones[zoneId];
  /** Final intelligence modifier for the zone. May be negative
   * if the plot is failed
   */
  let intelMod = 0;

  // Detection Phase
  // Zone agents may detect the player agents
  const detection = getAgentsInZone(
    gameManager,
    zone.organizationId,
    zone.id,
  ).reduce((total, currentParticipant) => {
    return total + currentParticipant.skills.security;
  }, 0);

  const stealth = participants.reduce((total, currentParticipant) => {
    const agent = gameData.people[currentParticipant];
    return total + agent.skills.espionage + agent.skills.disguise;
  }, 0);

  const detectionRoll =
    randomInt(0, detection) + randomInt(0, detection) + randomInt(0, detection);
  const stealthRoll =
    randomInt(0, stealth) + randomInt(0, stealth) + randomInt(0, stealth);

  const success = stealthRoll > detectionRoll;

  let capturedAgentIds: string[] = [];
  if (success) {
    // Intelligence Phase
    intelMod = randomInt(5, 10);
    if (intelMod > 100) {
      intelMod = 100;
    }
  } else {
    // Enemy Alert Phase
    // Empire agents may be captured here
    // For now, we're going to make it a simple coin toss
    capturedAgentIds = participants.filter(() => Math.random() > 0.01);
  }

  const evil = 5;
  return {
    data: {
      intelligenceModifier: intelMod,
      success,
      evil,
      capturedAgentIds,
    },
  };
};
