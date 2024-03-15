import { GameManager } from "./GameManager";

/**
 *
 * @returns
 */
const serializeGameData = (gameManager: GameManager) => {
  const { activityManager, plotManager, gameData } = gameManager;
  const activitiesData = activityManager.serializeActivities();
  const plotData = plotManager.serializePlots();

  const saveData = {
    gameData,
    plotData: {
      activities: activitiesData,
      plots: plotData,
    },
    scienceData: {
      activeProjects: gameManager.scienceManager.activeProjects,
    }
  };

  const data = JSON.stringify(saveData);
  return data;
};

export {
  serializeGameData,
};
