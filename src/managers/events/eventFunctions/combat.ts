import { Person } from '../../../types/interfaces/entities';
import GameEvent from '../GameEvent';

export interface CombatEventParams {
  aggressingForce: Person[];
  defendingForce: Person[];
}

export const combatEventConfig = {
  name: 'Combat',
  getEventText(this: GameEvent) {
    this.eventText = `Combat has occured!`;
  },
  resolve: () => {},
  icon: 'warning',
  type: 'combat',
  forceStop: true,
};
