import { ActivityRequirements } from './ActivityRequirements';

export interface ActivityConfig {
  /** The name of the activity (to be shown to the user) */
  name: string;
  /** The activity's type */
  type: string;
  /** The function to handle the execution of the activity */
  fn: (particpantArray: string[]) => void;
  /** Cost per particpant */
  costPerParticipant: number;
  description?: string;
  requirements?: ActivityRequirements;
}
