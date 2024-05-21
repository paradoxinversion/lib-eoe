import { GameManager } from '../game/GameManager';
import { Person } from '../../types/interfaces/entities';

export const isPersonParticipant = (person: Person) => {
  const { activityManager } = GameManager.getInstance();
  return activityManager.activities.some((activity) =>
    activity.agents.includes(person.id),
  );
};
