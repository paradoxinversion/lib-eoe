import { GameManager } from '../../GameManager';
import { updateLoyalty } from '../../actions/people';
import { Person } from '../../types/interfaces/entities';
import { randomInt } from '../../utilities';

export const education = (
  gameManager: GameManager,
  participantArray: string[],
) => {
  const { gameData } = gameManager;
  const updatedAgents: { [x: string]: Person } = participantArray.reduce(
    (participants: { [x: string]: Person }, participant) => {
      const updatedParticipant: Person = {
        ...gameData.people[participant],
      };
      const loyaltyIncrease = randomInt(1, 4);
      const updatedGameData = updateLoyalty(
        updatedParticipant,
        updatedParticipant.agent?.organizationId!,
        loyaltyIncrease,
      );
      participants[updatedParticipant.id] =
        updatedGameData.people[updatedParticipant.id];
      return participants;
    },
    {},
  );
  return { people: updatedAgents };
};
