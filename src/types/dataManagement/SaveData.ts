import { PlayerData } from '../player';
import { GameData } from '../managers/game/GameData';
import Plot from '../../managers/plots/Plot';
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
