import { GameManager } from '../../game/GameManager';
import people from '../../../actions/people';
import { updateEvil } from '../../../organization';
import { Person } from '../../../types/interfaces/entities';
import utilities from '../../../utilities';

export const education = (participantArray: string[]) => {
  if (participantArray.length === 0) {
    return null;
  }
  const { gameData } = GameManager.getInstance();
  const updatedAgents: { [x: string]: Person } = participantArray.reduce(
    (participants: { [x: string]: Person }, participant) => {
      const updatedParticipant: Person = {
        ...gameData.people[participant],
      };
      const loyaltyIncrease = utilities.randomInt(1, 4);
      const updatedGameData = people.updateLoyalty(
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
  updateEvil(1);
  GameManager.getInstance().updateGameData({ people: updatedAgents });
  return { people: updatedAgents };
};
