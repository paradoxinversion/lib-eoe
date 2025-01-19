import { GameManager } from '../../game/GameManager';
import Plot from '../../plots/Plot';
import { PlotResult, AttackZoneParams } from '../../../types';
import GameEvent from '../GameEvent';

/**
 * Create and return a new Attack Zone Plot Event
 */
export const generateAttackZonePlotEvent = (plot: Plot) => {
  return new GameEvent(attackZoneConfig, {
    plot,
  });
};

/**
 * Resolve an attack zone event.
 */
function resolveAttackZone(this: GameEvent) {
  const params = this.params as AttackZoneParams;
  const result = params.plot.resolution as PlotResult;

  GameManager.getInstance().updateGameData(result.updatedGameData);
  GameManager.getInstance().addGameLogEvent({
    color: 'Primary',
    date: GameManager.getInstance().gameData.gameDate.toDateString(),
    icon: attackZoneConfig.icon,
    text: 'Attack Zone',
  });
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
  resolve: resolveAttackZone,
  getEventText(this: GameEvent) {
    this.eventText = `The Empire has attacked a Zone!`;
  },
  icon: 'warning',
  type: 'attackZone',
  forceStop: true,
};
