import ActivityManager from '../managers/activities/ActivityManager';
import PlayerManager from '../managers/cpu/PlayerManager';
import { GameManager } from '../managers/game/GameManager';
import PlotManager from '../managers/plots/PlotManager';
import { ScienceManager } from '../managers/science/science';

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

export default serializeGameData;
