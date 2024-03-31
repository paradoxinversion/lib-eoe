import { GameManager } from '../GameManager';
import { Zone } from '../types/interfaces/entities';
import plotConfig from './plotConfig';
export interface PlotParams {
  zoneId?: string;
  zone?: Zone;
  plotParams: {
    zoneId?: string;
    zone?: Zone;
  };
}

export class Plot {
  name: string;
  plotParams: PlotParams;
  plotType: string;
  resolution: {
    plot?: Plot;
    data?: any;
  };
  type?: string;
  constructor(name: string, plotType: string, plotParams: PlotParams) {
    this.name = name;
    this.plotParams = plotParams;
    this.plotType = plotType;
    this.resolution = {};
  }

  /**
   * Execute a plot, returning the plot's ResolutionValue.
   */
  executePlot(gameManager: GameManager) {
    const result = plotConfig[this.plotType].fn(gameManager, this.plotParams);
    this.resolution = result;
    return result;
  }
}
