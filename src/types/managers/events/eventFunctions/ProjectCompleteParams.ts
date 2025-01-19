import { GameData } from '../../game';

export interface ProjectCompleteParams {
  projectIndexName: string;
  empireUpdate: Partial<GameData>;
}
