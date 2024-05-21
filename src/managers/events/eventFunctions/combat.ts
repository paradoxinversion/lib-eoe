import { Person } from '../../../types/interfaces/entities';
import GameEvent from '../GameEvent';

export interface CombatEventParams {
  aggressingForce: Person[];
  defendingForce: Person[];
}
/**
 * Set parameters for a combat event
 */
export function setCombatParams(
  this: GameEvent,
  { aggressingForce, defendingForce }: CombatEventParams,
) {
  this.params = {
    aggressingForce,
    defendingForce,
  };
}

export const combatEventConfig = {
  name: 'Combat',
  setParams: setCombatParams,
  getEventText(this: GameEvent) {
    this.eventText = `Combat has occured!`;
  },
  resolve: () => {},
  icon: 'warning',
  type: 'combat',
  forceStop: true,
};
