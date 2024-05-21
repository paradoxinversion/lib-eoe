import { Person } from '../../types/interfaces/entities';
import ActivityManager from './ActivityManager';

export const isPersonParticipant = (person: Person) => {
  return ActivityManager.getInstance().activities.some((activity) =>
    activity.agents.includes(person.id),
  );
};
