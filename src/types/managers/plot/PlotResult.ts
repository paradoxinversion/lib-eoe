import { GameData } from '../game';
import { CombatResult } from './CombatResult';
import { InciteProtestData } from './plotFunctions';
import {
  PlotReconResolution,
  PlotResolutionEmbedAgents,
} from './plotResolutions';

export interface PlotResult {
  success: boolean;
  updatedGameData: Partial<GameData>;
  resolutionData:
    | PlotReconResolution
    | CombatResult
    | PlotResolutionEmbedAgents
    | InciteProtestData
    | null;
}
