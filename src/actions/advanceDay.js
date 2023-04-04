const { addPlotResolutions, prepareRandomEvents } = require("empire-of-evil/src/gameEvents");
const { GameEventQueue } = require("../gameEvents");
const { ActivityManager, PlotManager } = require("../plots");

/**
 * Determines what events happen at end of turn and returns
 * updated gamedata with those events.
 * @param {import("../typedef").GameData} gameData
 * @param {GameEventQueue} gameEventQueue
 * @param {ActivityManager} activityManager
 * @param {PlotManager} plotManager
 */
const advanceDay = (gameData, gameEventQueue, activityManager, plotManager) => {
  const events = prepareRandomEvents(gameData);

  const activities = activityManager.executeActivities(gameData);
  gameEventQueue.setEvents(events);
  const plotResolutions = plotManager.executePlots(gameData);
  const plotEvents = addPlotResolutions(plotResolutions, gameEventQueue);
  plotManager.clearPlotQueue();
  
  gameEventQueue.addEvents(plotEvents);
  
  /**
   * @type {import("../typedef").UpdatedGameData}
   */
  const updatedGameData = JSON.parse(JSON.stringify(gameData));
  activities.forEach(activity => {
    if (activity.result.updatedGameData){
      updatedGameData.people = {
        ...updatedGameData.people,
        ...activity.result.updatedGameData.people,
      }
    }
  });
  
  const gameDate = new Date(gameData.gameDate);
  gameDate.setDate(gameDate.getDate() + 1);
  updatedGameData.gameDate = gameDate;

  return { updatedGameData, gameEventQueue };
};
module.exports = advanceDay;
