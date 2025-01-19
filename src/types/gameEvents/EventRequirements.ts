import { GoverningOrgStatusEffects } from '../statusEffects';

export interface EventRequirements {
  personnel?: {
    workingAdmins?: boolean;
    workingScientists?: boolean;
  };
  empireWealth?: {
    min?: number;
    max?: number;
  };
  empireStatuses?: GoverningOrgStatusEffects[];
}
