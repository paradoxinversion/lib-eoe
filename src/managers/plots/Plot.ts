import { GameData } from '../game/GameManager';
import { CombatResult } from '../../combat/combat';
import plotConfig from './plotConfig';
import { PlotAttackZoneParams } from './plotFunctions/attackZone';
import {
  PlotResolutionEmbedAgents,
  PlotParamsEmbedAgents,
} from './plotFunctions/embedAgents';
import { InciteProtestData } from './plotFunctions/inciteProtest';
import { PlotReconParams, PlotReconResolution } from './plotFunctions/recon';

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
    | PlotReconResolution
    | CombatResult
    | PlotResolutionEmbedAgents
    | InciteProtestData;
}

type PlotParams =
  | PlotReconParams
  | PlotAttackZoneParams
  | PlotParamsEmbedAgents;

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
