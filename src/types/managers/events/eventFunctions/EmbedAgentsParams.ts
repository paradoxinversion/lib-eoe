import Plot from '../../../../managers/plots/Plot';
import { PlotParamsEmbedAgents, PlotResolutionEmbedAgents } from '../../plot';

export interface EmbedAgentsParams {
  plot: Plot;
  plotResolution: PlotResolutionEmbedAgents;
  plotParams: PlotParamsEmbedAgents;
}
