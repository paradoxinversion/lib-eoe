import { GameManager } from '../../game/GameManager';
import { GoverningOrganization } from '../../../types/interfaces/entities';
import utilities from '../../../utilities';
import GameEvent from '../GameEvent';
export interface WealthModEventParams {
  modAmount: number;
}

/**
 * Create and return a new Wealth Mod Game Event
 */
export const generateWealthMod = () => {
  return new GameEvent(wealthModEventConfig, {
    modAmount: utilities.randomInt(-10, 10),
  });
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
  GameManager.getInstance().addGameLogEvent({
    color: 'Primary',
    date: GameManager.getInstance().gameData.gameDate.toDateString(),
    icon: wealthModEventConfig.icon,
    text: 'Wealth Mod',
  });
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
