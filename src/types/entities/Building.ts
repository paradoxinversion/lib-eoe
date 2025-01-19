import { IntelligenceSubject } from './IntelligenceSubject';
import { BuildingStatusEffects } from '../statusEffects';
export interface Building {
  id: string;
  organizationId: string;
  name: string;
  zoneId: string;
  personnel: string[];
  type: string;
  basicAttributes: {
    infrastructureCost: number;
    upkeepCost: number;
    maxPersonnel: number;
  };
  resourceAttributes: {
    wealthBonus: number;
    housingCapacity: number;
    scienceBonus: number;
    infrastructure: number;
    hospitalBeds: number;
  };
  intelAttributes: IntelligenceSubject;
  statusEffects: BuildingStatusEffects[];
  /**
   * People iving in the building if an apartment complex,
   * or people admitted for care if a hospital
   */
  inhabitants: string[];
  structure: {
    currentHealth: number;
    totalHealth: number;
  };
}
