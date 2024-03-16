/**
 * advanceDay.ts
 *
 */
import {
  addPlotResolutions,
  generateProjectCompleteEvent,
  prepareRandomEvents,
} from '../gameEvents';
import { GameManager } from '../GameManager';
import { getOrgResources, modifyOrgScience } from '../organization';
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

  // Handle science projects
  const scienceProjectStatuses = [...gameManager.scienceManager.activeProjects];

  scienceProjectStatuses.forEach((projectStatus) => {
    const project =
      gameManager.scienceManager.PROJECTS[projectStatus.indexName];
    const result = project.progressHandler(gameManager, projectStatus);
    if (result.complete) {
      const completeResult = gameManager.scienceManager.completeProject(
        gameManager,
        projectStatus.indexName,
      );

      gameEventQueue.addEvent(generateProjectCompleteEvent(completeResult));
    }
  });

  // Handle resource (daily) gain
  const scienceGain = getOrgResources(
    gameManager,
    gameData.player.organizationId,
  ).science;
  const scienceUpdate = modifyOrgScience(
    gameManager,
    gameData.player.organizationId,
    scienceGain,
  );
  updatedGameData.governingOrganizations =
    scienceUpdate.governingOrganizations!;

  // Handle the date
  const gameDate = new Date(gameData.gameDate);
  gameDate.setDate(gameDate.getDate() + 1);
  updatedGameData.gameDate = gameDate;

  // Finalize the updates
  gameManager.updateGameData(updatedGameData);
  return { updatedGameData, gameEventQueue };
};
