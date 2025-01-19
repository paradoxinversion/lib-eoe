import { GameData } from '../game';

/**
 * The result of completing a science project
 */
export interface ScienceProjectResult {
  updatedGameData: Partial<GameData>;
  indexName: string;
}
