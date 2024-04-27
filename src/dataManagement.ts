import { GameManager } from './GameManager';

/**
 *
 * @returns
 */
const serializeGameData = () => {
  const { activityManager, plotManager, gameData } = GameManager.getInstance();
  const activitiesData = activityManager.serializeActivities();
  const plotData = plotManager.serializePlots();

  const saveData = {
    gameData,
    plotData: {
      activities: activitiesData,
      plots: plotData,
    },
    scienceData: {
      activeProjects: GameManager.getInstance().scienceManager.activeProjects,
    },
  };

  const data = JSON.stringify(saveData);
  return data;
};

export { serializeGameData };
