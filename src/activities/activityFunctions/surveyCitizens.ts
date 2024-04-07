import { GameManager } from '../../GameManager';
import { getPeople } from '../../actions/people';
import { updateEvil } from '../../organization';
import { Person } from '../../types/interfaces/entities';
import { randomInt } from '../../utilities';

export const surveyCitizens = (
  gameManager: GameManager,
  participantArray: string[],
) => {
  if (participantArray.length === 0) {
    return null;
  }
  const updatedGameData: { people: { [x: string]: Person } } = {
    people: {},
  };
  participantArray.forEach((participant) => {
    const agent = gameManager.gameData.people[participant];
    const agentHomeZone = gameManager.gameData.zones[agent.homeZoneId];
    const homeZoneCitizens = getPeople(gameManager, {
      zoneId: agentHomeZone.id,
    });

    const intelGain = randomInt(0, agent.skills.security);
    const citizen = {
      ...homeZoneCitizens[randomInt(0, homeZoneCitizens.length) - 1],
    };
    updatedGameData.people[citizen.id] = {
      ...citizen,
      intelAttributes: {
        ...citizen.intelAttributes,
        intelligenceLevel:
          citizen.intelAttributes.intelligenceLevel + intelGain,
      },
    };
  });

  updateEvil(gameManager, 1);

  return updatedGameData;
};
