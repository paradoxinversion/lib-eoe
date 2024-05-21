import { GameManager } from '../../game/GameManager';
import Plot, { PlotResult } from '../../plots/Plot';
import GameEvent from '../GameEvent';

export interface ReconZoneEventParams {
  plot: Plot;
}

export function setReconEventParams(
  this: GameEvent,
  { plot }: ReconZoneEventParams,
) {
  this.params = {
    plot,
  };
}

export const generateReconZoneEvent = (plot: Plot) => {
  return new GameEvent(reconZoneEventConfig, { plot });
};

/**
 *
 */
function resolveReconZone(this: GameEvent) {
  const params = this.params as ReconZoneEventParams;
  const resolution = params.plot.resolution as PlotResult;
  GameManager.getInstance().updateGameData(resolution.updatedGameData);
  this.eventData = {
    type: 'recon-zone',
    resolution: {
      updatedGameData: resolution.updatedGameData,
    },
  };
  return this.eventData;
}

export const reconZoneEventConfig = {
  name: 'Recon Zone',
  setParams: setReconEventParams,
  resolve: resolveReconZone,
  getEventText(this: GameEvent) {
    this.eventText = 'A recon mision was executed';
  },
  icon: 'travel-explore',
  type: 'reconZone',
  forceStop: true,
};
