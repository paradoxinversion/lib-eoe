import Plot from '../../../../managers/plots/Plot';
import { PlotReconParams, PlotReconResolution } from '../../plot';

export interface ReconZoneEventParams {
  plot: Plot;
  plotResolution: PlotReconResolution;
  plotParams: PlotReconParams;
}
