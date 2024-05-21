import { GameData } from '../managers/game/GameManager';
import Plot from '../plots/Plot';
import { PlayerData } from '../types/player';

export type SaveData = {
  gameData: GameData;
  plotData: {
    activities: {
      [key: string]: {
        name: string;
        agents: string[];
      };
    };
    plots: Plot[];
  };
  scienceData: {
    activeProjects: any;
  };
  // scienceData: {
  //   activeProjects: GameManager.getInstance().scienceManager.activeProjects,
  // },
  playerData: PlayerData[];
};
