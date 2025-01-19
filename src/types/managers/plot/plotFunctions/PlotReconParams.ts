import { PlotParamsBase } from '../PlotParamsBase';

export interface PlotReconParams extends PlotParamsBase {
  targetZone: string;
  /** If caught by the enemy, surrender */
  surrender: boolean;
  /** Use drones for the operation */
  useDrones: boolean;
}
