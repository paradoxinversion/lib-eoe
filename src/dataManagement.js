const { ActivityManager, PlotManager } = require("./plots");

/**
 *
 * @param {GameManager} gameManager
 * @param {ActivityManager} activityManager
 * @param {PlotManager} plotManager
 * @returns
 */
const serializeGameData = (gameManager) => {
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

module.exports = {
  serializeGameData,
};
