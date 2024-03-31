import Plot from '../../plots/Plot';
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
