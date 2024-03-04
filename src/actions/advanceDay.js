
import { GameEventQueue, addPlotResolutions, prepareRandomEvents } from "../gameEvents.ts";

import { GameManager } from "../GameManager.ts";
/**
 * Determines what events happen at end of turn and returns
 * updated gamedata with those events.
 * @param {GameManager} gameManager
 */
const advanceDay = (gameManager) => {
  const {
    gameData,
    eventManager: gameEventQueue,
    activityManager,
    plotManager,
  } = gameManager;
  const events = prepareRandomEvents(gameManager);

  const activities = activityManager.executeActivities(gameManager);
  gameEventQueue.setEvents(events);
  const plotResolutions = plotManager.executePlots(gameManager);
  const plotEvents = addPlotResolutions(plotResolutions, gameEventQueue);
  plotManager.clearPlotQueue();

  gameEventQueue.addEvents(plotEvents);

  /**
   * @type {import("../typedef").UpdatedGameData}
   */
  const updatedGameData = JSON.parse(JSON.stringify(gameData));
  activities.forEach((activity) => {
    if (activity.result.updatedGameData) {
      updatedGameData.people = {
        ...updatedGameData.people,
        ...activity.result.updatedGameData.people,
      };
    }
  });

  const gameDate = new Date(gameData.gameDate);
  gameDate.setDate(gameDate.getDate() + 1);
  updatedGameData.gameDate = gameDate;
  gameManager.updateGameData(updatedGameData);
  return { updatedGameData, gameEventQueue };
};
module.exports = advanceDay;
