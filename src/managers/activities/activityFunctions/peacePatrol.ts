import zones from '../../../zones';
import { GameManager } from '../../game/GameManager';
import people from '../../../actions/people';
import { Person } from '../../../types/interfaces/entities';
import utilities from '../../../utilities';

export const peacePatrol = (participantArray: string[]) => {
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
    const homeZoneCitizens = zones.getZoneCitizens(
      agentHomeZone.id,
      true,
      true,
    );
    const citizen = {
      ...homeZoneCitizens[utilities.randomInt(0, homeZoneCitizens.length) - 1],
    };
    const updatedGameData = people.updateIntelAttribute(citizen, 'loyalty', 2);
    updatedGameData.people[citizen.id] = updatedGameData.people[citizen.id];
  });
};
