import { GoverningOrgStatusEffects } from '../../statusEffects';
import { ScienceProject } from '../science';

export interface ActivityRequirements {
  /** Research required to start the activity */
  research: ScienceProject[];
  orgStatusEffects: GoverningOrgStatusEffects[];
  maxParticipants: number;
  minParticipants: number;
}
