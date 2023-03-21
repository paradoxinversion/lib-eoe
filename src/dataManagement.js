const serializeGameData = (gameData, activityManager) => {
    // const data = JSON.stringify(gameData);
    const activitiesData = activityManager.serializeActivities()
    
    /**
     * @type {import("empire-of-evil/src/typedef").SaveData}
     */
    const saveData =  {
      gameData,
      plotData: {
        activities: activitiesData
      }
    }
  
    const data = JSON.stringify(saveData);
    return data;
  }

  module.exports = {
    serializeGameData
  }