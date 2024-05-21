import PlayerManager from '../managers/cpu/PlayerManager';
import { GameManager } from '../managers/game/GameManager';

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

export default serializeGameData;
