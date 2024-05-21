import { GameManager } from '../../game/GameManager';
import people from '../../../actions/people';
import { updateEvil } from '../../../organization';
import {
  Person,
  PersonStandardAttributes,
} from '../../../types/interfaces/entities';
import utilities from '../../../utilities';

export const executeTrainingActivity = (participantArray: string[]) => {
  if (participantArray.length === 0) {
    return null;
  }
  const { gameData } = GameManager.getInstance();

  const updatedAgents: { [x: string]: Person } = participantArray.reduce(
    (participants: { [x: string]: Person }, participantId) => {
      const particpantObject: Person = {
        ...gameData.people[participantId],
      };
      const basicAttributes = Object.keys(particpantObject.standardAttributes);
      const attributeKey = utilities.randomInt(0, basicAttributes.length);
      const updatedGameData = people.updateBasicAttribute(
        particpantObject,
        basicAttributes[attributeKey] as keyof PersonStandardAttributes,
        1,
      );

      participants[particpantObject.id] =
        updatedGameData.people[particpantObject.id];
      return participants;
    },
    {},
  );
  updateEvil(1);
  return { people: updatedAgents };
};
