import {
  GameEventQueue,
  addPlotResolutions,
  prepareRandomEvents,
} from '../gameEvents';

import { GameManager } from '../GameManager';
import { getOrgResources } from '../organization';
import { Activity, ActivityResult } from '../plots';
import { getPeople, simulateDay } from './people';
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
  // Run actions for people
  getPeople(gameManager, {
    excludeDeceased: true,
    agentFilter: { excludeAgents: true },
  }).forEach((person) => {
    gameManager.updateGameData(simulateDay(gameManager, person));
  });
  // Response with events
  const events = prepareRandomEvents(gameManager);

  const activities = activityManager.executeActivities(gameManager);
  gameEventQueue.setEvents(events);
  const plotResolutions = plotManager.executePlots(gameManager);
  const plotEvents = addPlotResolutions(plotResolutions, gameEventQueue);
  plotManager.clearPlotQueue();

  gameEventQueue.addEvents(plotEvents);

  const updatedGameData = { ...gameData };
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
