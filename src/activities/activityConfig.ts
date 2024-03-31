import { education } from './activityFunctions/education';
import { peacePatrol } from './activityFunctions/peacePatrol';
import { executeTrainingActivity } from './activityFunctions/training';

export interface ActivityConfig {
  /** The name of the activity (to be shown to the user) */
  name: string;
  /** The activity's type */
  type: string;
  /** The function to handle the execution of the activity */
  fn: Function;
}
const activityConfig: ActivityConfig[] = [
  {
    name: 'Training',
    type: 'training',
    fn: executeTrainingActivity,
  },
  {
    name: 'EVIL Education',
    type: 'evil-educaton',
    fn: education,
  },
  {
    name: 'Peace Patrol',
    type: 'peace-patrol',
    fn: peacePatrol,
  },
];

export default activityConfig;
