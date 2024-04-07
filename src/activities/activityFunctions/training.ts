import { GameManager } from '../../GameManager';
import { updateBasicAttribute } from '../../actions/people';
import { updateEvil } from '../../organization';
import {
  Person,
  PersonStandardAttributes,
} from '../../types/interfaces/entities';
import { randomInt } from '../../utilities';

export const executeTrainingActivity = (
  gameManager: GameManager,
  participantArray: string[],
) => {
  if (participantArray.length === 0) {
    return null;
  }
  const { gameData } = gameManager;

  const updatedAgents: { [x: string]: Person } = participantArray.reduce(
    (participants: { [x: string]: Person }, participantId) => {
      const particpantObject: Person = {
        ...gameData.people[participantId],
      };
      const basicAttributes = Object.keys(particpantObject.standardAttributes);
      const attributeKey = randomInt(0, basicAttributes.length);
      const updatedGameData = updateBasicAttribute(
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
  updateEvil(gameManager, 1);
  return { people: updatedAgents };
};
