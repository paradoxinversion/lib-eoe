import { Person } from '../../../entities';

export interface CombatEventParams {
  aggressingForce: Person[];
  defendingForce: Person[];
}
