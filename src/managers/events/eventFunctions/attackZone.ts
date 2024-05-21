import { GameManager } from '../../game/GameManager';
import Plot, { PlotResult } from '../../plots/Plot';
import GameEvent from '../GameEvent';

export interface AttackZoneParams {
  plot: Plot;
}

/**
 * Create and return a new Attack Zone Plot Event
 */
export const generateAttackZonePlotEvent = (plot: Plot) => {
  return new GameEvent(attackZoneConfig, {
    plot,
  });
};
/**
 * Set parameters for an Attack Zone Plot Event
 */
function setAttackZoneParams(this: GameEvent, { plot }: AttackZoneParams) {
  this.params = {
    plot,
  };
}

/**
 * Resolve an attack zone event.
 */
function resolveAttackZone(this: GameEvent) {
  const params = this.params as AttackZoneParams;
  const result = params.plot.resolution as PlotResult;

  GameManager.getInstance().updateGameData(result.updatedGameData);

  this.eventData = {
    type: 'attack-zone',
    resolution: {
      updatedGameData: result.updatedGameData,
    },
  };

  return this.eventData;
}

export const attackZoneConfig = {
  name: 'Attack Zone',
  setParams: setAttackZoneParams,
  resolve: resolveAttackZone,
  getEventText(this: GameEvent) {
    this.eventText = `The Empire has attacked a Zone!`;
  },
  icon: 'warning',
  type: 'attackZone',
  forceStop: true,
};
