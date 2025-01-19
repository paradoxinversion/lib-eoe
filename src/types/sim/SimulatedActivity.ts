import { Person } from '../entities';
import { GameData } from '../managers';
import { PersonStatusEffect } from '../statusEffects';

export interface SimulatedActivity {
  name: string;
  text: string;
  requirements: {
    loyalty?: 'low' | 'average' | 'high';
    employedCitizen?: boolean;
    wealth?: 'low' | 'medium' | 'high' | 'not-broke';
    hasStatusEffect?: PersonStatusEffect;
  };
  handler?: (person: Person) => Partial<GameData>;
}
