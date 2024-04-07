import { GameManager } from '../GameManager';
import { Person } from '../types/interfaces/entities';

export const isPersonParticipant = (
  gameManager: GameManager,
  person: Person,
) => {
  const { activityManager } = gameManager;
  return activityManager.activities.some((activity) =>
    activity.agents.includes(person.id),
  );
};
