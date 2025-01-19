import { EventRequirements } from '../../gameEvents';

export interface EventConfig {
  name: string;
  resolve: Function;
  getEventText: Function;
  icon: string;
  type: string;
  forceStop: boolean;
  requirements?: EventRequirements;
}
