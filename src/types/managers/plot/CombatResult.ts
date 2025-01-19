import { Person } from '../../entities';

export interface CombatResult {
  /** The number of rounds the combat encounter lasted */
  rounds: number;
  /** An array of strings representing the combat log */
  combatLog: string[];
  /** The result of the combat encounter */
  victoryResult: 0 | 1 | 2;
  characters: {
    attackers: Person[];
    defenders: Person[];
  };
}
