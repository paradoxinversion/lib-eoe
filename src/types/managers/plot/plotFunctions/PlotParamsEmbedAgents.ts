import { PlotParamsStandard } from '../PlotParamsStandard';

export interface PlotParamsEmbedAgents extends PlotParamsStandard {
  targetZone: string;
  surrender?: boolean;
}
