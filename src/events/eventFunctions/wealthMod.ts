import { GameManager } from '../../GameManager';
import { GoverningOrganization } from '../../types/interfaces/entities';
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

/**
 * Create and return a new Wealth Mod Game Event
 */
export const generateWealthMod = () => {
  return new GameEvent(wealthModEventConfig);
};

/**
 * Resolve a Wealth Modification event
 */
export function resolveWealthMod(this: GameEvent) {
  const params = this.params as WealthModEventParams;
  const { gameData } = GameManager.getInstance();
  const updatedGameData: {
    governingOrganizations: { [x: string]: GoverningOrganization };
  } = { governingOrganizations: {} };
  const updatedOrg = JSON.parse(
    JSON.stringify(
      gameData.governingOrganizations[gameData.player.organizationId],
    ),
  );
  updatedGameData.governingOrganizations[gameData.player.organizationId] =
    updatedOrg;
  updatedOrg.wealth += params.modAmount;
  GameManager.getInstance().updateGameData(updatedGameData);
  this.eventData = {
    type: 'cashmod',
    resolution: {
      updatedGameData,
    },
  };

  return this.eventData;
}

export const wealthModEventConfig = {
  name: 'Wealth Change',
  setParams: setWealthModParams,
  resolve: resolveWealthMod,
  getEventText(this: GameEvent) {
    this.eventText = `The Empire's wealth has fluctuated by ${(this.params as WealthModEventParams).modAmount}`;
  },
  icon: 'paid',
  type: 'wealthMod',
  forceStop: true,
  requirements: {
    empireWealth: {
      min: 0,
    },
  },
};
