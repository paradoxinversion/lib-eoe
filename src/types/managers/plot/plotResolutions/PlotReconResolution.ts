import { CombatResult } from '../CombatResult';
import { PlotResultBase } from '../PlotResultBase';

export interface PlotReconResolution extends PlotResultBase {
  intelligenceModifier: number;
  capturedAgentIds: string[];
  combatResult: CombatResult | null;
}
