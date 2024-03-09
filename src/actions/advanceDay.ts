
import { GameEventQueue, addPlotResolutions, prepareRandomEvents } from "../gameEvents";

import { GameManager } from "../GameManager";
import { Activity, ActivityResult } from "../plots";
/**
 * Determines what events happen at end of turn and returns
 * updated gamedata with those events.
 */
export const advanceDay = (gameManager: GameManager) => {
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
