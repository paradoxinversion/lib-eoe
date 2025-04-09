import GameManager from '../../game/GameManager';
import people from '../../../actions/people';
import { updateEvil } from '../../../organization';
import { Person } from '../../../types';
import utilities from '../../../utilities';

export const surveyCitizens = (participantArray: string[]) => {
  if (participantArray.length === 0) {
    return null;
  }
  const updatedGameData: { people: { [x: string]: Person } } = {
    people: {},
  };
  participantArray.forEach((participant) => {
    const agent = GameManager.getInstance().gameData.people[participant];
    const agentHomeZone =
      GameManager.getInstance().gameData.zones[agent.homeZoneId];
    const homeZoneCitizens = people.getPeople({
      zone: {
        zoneId: agentHomeZone.id,
      },
    });

    const intelGain = utilities.randomInt(0, agent.skills.security);
    const citizen = {
      ...homeZoneCitizens[utilities.randomInt(0, homeZoneCitizens.length) - 1],
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

  updateEvil(1);
  GameManager.getInstance().updateGameData(updatedGameData);

  console.debug('Activity::Survey Citizens::\n', { updatedGameData });
  return updatedGameData;
};
