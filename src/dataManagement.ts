import { GameData, GameManager } from './GameManager';
import PlayerManager from './managers/cpu/PlayerManager';
import Plot from './plots/Plot';
import { PlayerData } from './types/player';

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
  // scienceData: {
  //   activeProjects: GameManager.getInstance().scienceManager.activeProjects,
  // },
  playerData: PlayerData[];
};
const serializeGameData = () => {
  const { activityManager, plotManager, gameData } = GameManager.getInstance();
  const activitiesData = activityManager.serializeActivities();
  const plotData = plotManager.serializePlots();
  const playerData = PlayerManager.getInstance().serializedPlayers();
  const saveData = {
    gameData,
    plotData: {
      activities: activitiesData,
      plots: plotData,
    },
    scienceData: {
      activeProjects: GameManager.getInstance().scienceManager.activeProjects,
    },
    playerData,
  };

  const data = JSON.stringify(saveData);
  return data;
};

export { serializeGameData };
