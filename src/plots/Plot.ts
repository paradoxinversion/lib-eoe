import { GameData, GameManager } from '../GameManager';
import { CombatResult } from '../combat';
import plotConfig from './plotConfig';
import { PlotReconParams, ReconPlotData } from './plotFunctions/recon';
/** Basic parameters common to any plot */
export interface PlotParamsStandard {
  /** IDs of Agents executing the plot */
  participants: string[];
  /** IDs of the zone targeted in the plot */
  targetZone?: string;
}

export interface PlotResult {
  success: boolean;
  updatedGameData: Partial<GameData>;
  resolutionData: ReconPlotData | CombatResult | null;
}

export default class Plot {
  /** The name of the plot (shown to the user) */
  name: string;
  /** Basic parameters common to any plot */
  standardParams: PlotParamsStandard;
  plotParams: PlotReconParams | {};
  /** The parameters (set by the user) under which to execute the plot */
  plotType: string;
  resolution: PlotResult | {};
  type?: string;
  constructor(
    name: string,
    plotType: string,
    standardParams: PlotParamsStandard,
    plotParams: PlotReconParams,
  ) {
    this.name = name;
    this.standardParams = standardParams;
    this.plotType = plotType;
    this.resolution = {};
    this.plotParams = plotParams;
  }

  /**
   * Execute a plot, returning the plot's ResolutionValue.
   */
  executePlot(gameManager: GameManager) {
    const result = plotConfig[this.plotType].fn(gameManager, {
      ...this.standardParams,
      ...this.plotParams,
    });
    this.resolution = result;
    return result;
  }
}
