import { education } from './activityFunctions/education';
import { peacePatrol } from './activityFunctions/peacePatrol';
import { surveyCitizens } from './activityFunctions/surveyCitizens';
import { executeTrainingActivity } from './activityFunctions/training';

export interface ActivityConfig {
  /** The name of the activity (to be shown to the user) */
  name: string;
  /** The activity's type */
  type: string;
  /** The function to handle the execution of the activity */
  fn: Function;
  /** Cost per particpant */
  costPerParticipant: number;
  description?: string;
}
const activityConfig: ActivityConfig[] = [
  {
    name: 'Training',
    type: 'training',
    fn: executeTrainingActivity,
    costPerParticipant: 1,
    description: 'Train your agents to improve their skills',
  },
  {
    name: 'EVIL Education',
    type: 'evil-educaton',
    fn: education,
    costPerParticipant: 1,
    description: "Ensure loyalty from your agents via 'continuing education'",
  },
  {
    name: 'Peace Patrol',
    type: 'peace-patrol',
    fn: peacePatrol,
    costPerParticipant: 2,
  },
  {
    name: 'Survey Citizens',
    type: 'survey-citizens',
    fn: surveyCitizens,
    costPerParticipant: 1,
  },
];

export default activityConfig;
