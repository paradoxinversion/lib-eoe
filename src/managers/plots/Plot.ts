import plotConfig from './plotConfig';
import { PlotParams, PlotResult } from '../../types';

export default class Plot {
  /** The name of the plot (shown to the user) */
  name: string;
  plotParams: PlotParams;
  /** The parameters (set by the user) under which to execute the plot */
  plotType: string;
  resolution: PlotResult | Record<string, never>;
  type?: string;
  totalParticipants: number;
  constructor(name: string, plotType: string, plotParams: PlotParams) {
    this.name = name;
    this.plotType = plotType;
    this.resolution = {};
    this.plotParams = plotParams;
    this.totalParticipants = plotParams.participants.length;
  }

  /**
   * Execute a plot, returning the plot's ResolutionValue.
   */
  executePlot() {
    const result = plotConfig[this.plotType].fn({
      ...this.plotParams,
    });
    this.resolution = result;
    return result;
  }
}
