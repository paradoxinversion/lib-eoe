/**
 * advanceDay.ts
 *
 */
import { generateProjectCompleteEvent } from '../events/eventFunctions/projectComplete';
import {
  addPlotResolutions,
  eventConfig,
  prepareRandomEvents,
} from '../gameEvents';
import { GameManager } from '../GameManager';
import { ScienceProject } from '../managers/science/types';
import { getOrgResources, modifyOrgScience } from '../organization';
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
  const updatedGameData = { ...gameData };
  // Run actions for people
  getPeople(gameManager, {
    excludeDeceased: true,
    agentFilter: { excludeDepartments: [3] },
  }).forEach((person) => {
    const simResults = simulateDay(gameManager, person);
    gameManager.updateGameData(simResults.updatedGameData);
    gameManager.updateSimActionLog(person.id, simResults.updatedLog);
    console.log(simResults.updatedLog);
  });
  // Response with events
  const events = prepareRandomEvents(gameManager);

  const activities = activityManager.executeActivities(gameManager);
  gameEventQueue.setEvents(events);
  const plotResolutions = plotManager.executePlots(gameManager);
  const plotEvents = addPlotResolutions(plotResolutions, gameEventQueue);
  plotManager.clearPlotQueue();

  gameEventQueue.addEvents(plotEvents);

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
      gameManager.scienceManager.PROJECT_DEFINITIONS[
        projectStatus.indexName as ScienceProject
      ];
    const result = gameManager.scienceManager.handleProjectProgress(
      gameManager,
      projectStatus,
    );
    gameManager.scienceManager.updateActiveProject(
      result,
      projectStatus.indexName as ScienceProject,
    );
    console.log(result);
    if (result.complete && result.daysRemaining === 0) {
      const completeResult = gameManager.scienceManager.completeProject(
        gameManager,
        projectStatus.indexName as ScienceProject,
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
  return {
    updatedGameData,
    gameEventQueue,
    stop: gameEventQueue.events.some(
      (event) => eventConfig[event.type].forceStop,
    ),
  };
};

export const advanceDays = (gameManager: GameManager, days: number) => {
  for (let i = 0; i < days; i++) {
    const { updatedGameData, gameEventQueue, stop } = advanceDay(gameManager);
    if (stop) {
      return updatedGameData;
    }
  }
};
