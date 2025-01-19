import { Person } from '../../entities/Person';

export interface CombatInitiative {
  /** The initiative order */
  initiative: number;
  /** Is this person in the attacking force? */
  attackingForce: boolean;
  /** The index of the character within their source array */
  characterIndex: number;
  person: Person;
}
