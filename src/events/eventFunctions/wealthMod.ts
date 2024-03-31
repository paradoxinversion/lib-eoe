import { randomInt } from '../../utilities';
import GameEvent from '../GameEvent';
export interface WealthModEventParams {
  modAmount: number;
}
/**
 * Set parameters for a Wealth Mod event
 */
export function setWealthModParams(this: GameEvent) {
  this.params = { modAmount: randomInt(-10, 10) };
}
