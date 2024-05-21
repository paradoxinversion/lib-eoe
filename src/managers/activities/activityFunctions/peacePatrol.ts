import { zones } from '../../../..';
import { GameManager } from '../../game/GameManager';
import { updateIntelAttribute } from '../../../actions/people';
import { Person } from '../../../types/interfaces/entities';
import { randomInt } from '../../../utilities';

export const peacePatrol = (participantArray: string[]) => {
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
      ...homeZoneCitizens[randomInt(0, homeZoneCitizens.length) - 1],
    };
    const updatedGameData = updateIntelAttribute(citizen, 'loyalty', 2);
    updatedGameData.people[citizen.id] = updatedGameData.people[citizen.id];
  });
};
