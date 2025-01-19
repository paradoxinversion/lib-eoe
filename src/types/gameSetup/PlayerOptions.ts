import { GoverningOrgStatusEffects } from '../statusEffects';

export type PlayerOptions = {
  isCPU: boolean;
  leaderName?: string;
  organizationEffects: GoverningOrgStatusEffects[];
  fullStaff: boolean;
};
