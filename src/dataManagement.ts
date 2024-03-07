import { GameManager } from "./GameManager";

/**
 *
 * @returns
 */
const serializeGameData = (gameManager: GameManager) => {
  const { activityManager, plotManager, gameData } = gameManager;
  const activitiesData = activityManager.serializeActivities();
  const plotData = plotManager.serializePlots();

  /**
   * @type {import("empire-of-evil/src/typedef").SaveData}
   */
  const saveData = {
    gameData,
    plotData: {
      activities: activitiesData,
      plots: plotData,
    },
  };

  const data = JSON.stringify(saveData);
  return data;
};

export {
  serializeGameData,
};