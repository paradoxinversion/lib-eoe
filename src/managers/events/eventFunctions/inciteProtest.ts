import Plot from '../../plots/Plot';
import { PlotResult, InciteProtestParams } from '../../../types';

import GameEvent from '../GameEvent';

export const generateInciteProtestEvent = (plot: Plot) => {
  return new GameEvent(inciteProtestConfig, { plot });
};

function resolveInciteProtest(this: GameEvent) {
  const params = this.params as InciteProtestParams;
  const resolution = params.plot.resolution as PlotResult;
  this.eventData = {
    type: 'incite-protest',
    resolution: {
      updatedGameData: resolution.updatedGameData,
    },
  };
  return this.eventData;
}

export const inciteProtestConfig = {
  name: 'Incite Protest',
  resolve: resolveInciteProtest,
  getEventText(this: GameEvent) {
    this.eventText = 'A protest was incited';
  },
  icon: 'travel-explore',
  type: 'inciteProtest',
  forceStop: true,
};
