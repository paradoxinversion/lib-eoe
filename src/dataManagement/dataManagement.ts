import { GameData, GameManager } from '../managers/game/GameManager';
import PlayerManager from '../managers/cpu/PlayerManager';
import Plot from '../managers/plots/Plot';
import { PlayerData } from '../types/player';
import ActivityManager from '../managers/activities/ActivityManager';
import PlotManager from '../managers/plots/PlotManager';
import { ScienceManager } from '../managers/science/science';

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
const serializeGameData = () => {
  const { gameData } = GameManager.getInstance();
  const activitiesData = ActivityManager.getInstance().serializeActivities();
  const plotData = PlotManager.getInstance().serializePlots();
  const playerData = PlayerManager.getInstance().serializedPlayers();
  const saveData = {
    gameData,
    plotData: {
      activities: activitiesData,
      plots: plotData,
    },
    scienceData: {
      activeProjects: ScienceManager.getInstance().activeProjects,
    },
    playerData,
  };

  const data = JSON.stringify(saveData);
  return data;
};

export default { serializeGameData };
