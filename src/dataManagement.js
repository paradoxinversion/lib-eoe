const { ActivityManager, PlotManager } = require("./plots");

/**
 * 
 * @param {import("./typedef").GameData} gameData 
 * @param {ActivityManager} activityManager 
 * @param {PlotManager} plotManager 
 * @returns 
 */
const serializeGameData = (gameData, activityManager, plotManager) => {
    debugger;
    const activitiesData = activityManager.serializeActivities()
    const plotData = plotManager.serializePlots();
    
    /**
     * @type {import("empire-of-evil/src/typedef").SaveData}
     */
    const saveData =  {
      gameData,
      plotData: {
        activities: activitiesData,
        plots: plotData
      }
    }
  
    const data = JSON.stringify(saveData);
    return data;
  }

  module.exports = {
    serializeGameData
  }