import { CombatEventParams } from './CombatEventParams';

export interface DomesticCombatEncounterEventParams extends CombatEventParams {
  zoneId: string;
}
