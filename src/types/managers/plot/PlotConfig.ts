import { PlotRequirements } from './PlotRequirements';

export interface PlotConfig {
  /** The name of the activity (to be shown to the user) */
  name: string;
  /** The activity's type */
  type: string;
  /** The function to handle the execution of the activity */
  fn: Function;
  /** Cost per particpant */
  costPerParticipant: number;
  description?: string;
  requirements?: PlotRequirements;
}
