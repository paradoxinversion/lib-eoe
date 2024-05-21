import { GameData, GameManager } from '../GameManager';
import { CombatResult } from '../combat';
import plotConfig from './plotConfig';
import { PlotAttackZoneParams } from './plotFunctions/attackZone';
import { PlotEmbedAgentsData } from './plotFunctions/embedAgents';
import { InciteProtestData } from './plotFunctions/inciteProtest';
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
  resolutionData:
    | ReconPlotData
    | CombatResult
    | PlotEmbedAgentsData
    | InciteProtestData
    | null;
}

export default class Plot {
  /** The name of the plot (shown to the user) */
  name: string;
  /** Basic parameters common to any plot */
  standardParams: PlotParamsStandard;
  plotParams: PlotReconParams | PlotAttackZoneParams | {};
  /** The parameters (set by the user) under which to execute the plot */
  plotType: string;
  resolution: PlotResult | {};
  type?: string;
  constructor(
    name: string,
    plotType: string,
    standardParams: PlotParamsStandard,
    plotParams: PlotReconParams | PlotAttackZoneParams | {},
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
  executePlot() {
    const result = plotConfig[this.plotType].fn({
      ...this.standardParams,
      ...this.plotParams,
    });
    this.resolution = result;
    return result;
  }
}
