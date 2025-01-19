import {
  PlotAttackZoneParams,
  PlotParamsEmbedAgents,
  PlotReconParams,
} from './plotFunctions';

export type PlotParams =
  | PlotReconParams
  | PlotAttackZoneParams
  | PlotParamsEmbedAgents;
