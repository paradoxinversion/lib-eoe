import GameManager from '../../game/GameManager';
import Plot from '../../plots/Plot';
import {
  PlotResult,
  PlotReconParams,
  PlotReconResolution,
  ReconZoneEventParams,
} from '../../../types';

import GameEvent from '../GameEvent';

export const generateReconZoneEvent = (plot: Plot) => {
  const params: ReconZoneEventParams = {
    plot,
    plotResolution: {
      ...(plot.resolution.resolutionData as PlotReconResolution),
    },
    plotParams: {
      ...(plot.plotParams as PlotReconParams),
    },
  };

  let eventText = `Agents executed a recon operation in ${GameManager.getInstance().gameData.zones[params.plotParams.targetZone].name}. `;

  if (params.plotResolution.success) {
    eventText += `The operation was a success. Our intelligence in the zone has increased by a factor of ${params.plotResolution.intelligenceModifier}.`;
  } else {
    eventText += `The operation was a failure. Our intelligence in the zone has decreased by a factor of ${params.plotResolution.intelligenceModifier}.`;
  }

  return new GameEvent(reconZoneEventConfig, params, eventText);
};

/**
 *
 */
function resolveReconZone(this: GameEvent) {
  const params = this.params as ReconZoneEventParams;
  const resolution = params.plot.resolution as PlotResult;
  GameManager.getInstance().updateGameData(resolution.updatedGameData);
  GameManager.getInstance().addGameLogEvent({
    color: 'Primary',
    date: GameManager.getInstance().gameData.gameDate.toDateString(),
    icon: reconZoneEventConfig.icon,
    text: 'Recon Executed',
  });
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
  resolve: resolveReconZone,
  getEventText(this: GameEvent) {
    // this.eventText = 'A recon mision was executed';
  },
  icon: 'travel-explore',
  type: 'reconZone',
  forceStop: true,
};
