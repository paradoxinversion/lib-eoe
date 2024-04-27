/**
 * advanceDay.ts
 *
 */
import { getBuildings, handleHospitalOperations } from '../buildings';
import { generateProjectCompleteEvent } from '../events/eventFunctions/projectComplete';
import {
  addPlotResolutions,
  eventConfig,
  prepareRandomEvents,
} from '../gameEvents';
import { GameManager } from '../GameManager';
import PlayerManager from '../managers/cpu/PlayerManager';
import { ScienceProject } from '../managers/science/types';
import {
  getOrgIncome,
  getOrgResources,
  modifyOrgScience,
} from '../organization';
import { getPeople, simulateDay } from './people';
/**
 * Determines what events happen at end of turn and returns
 * updated gamedata with those events.
 */
export const advanceDay = () => {
  const {
    gameData,
    eventManager: gameEventQueue,
    activityManager,
    plotManager,
  } = GameManager.getInstance();
  const updatedGameData = { ...gameData };
  // Run actions for people
  getPeople({
    excludeDeceased: true,
    agentFilter: { excludeDepartments: [3] },
  }).forEach((person) => {
    const simResults = simulateDay(person);
    GameManager.getInstance().updateGameData(simResults.updatedGameData);
    GameManager.getInstance().updateSimActionLog(
      person.id,
      simResults.updatedLog,
    );
    // console.log(simResults.updatedLog);
  });

  // Response with events
  const events = prepareRandomEvents();

  const activities = activityManager.executeActivities();
  gameEventQueue.setEvents(events);
  const plotResolutions = plotManager.executePlots();
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

  // handle healing in hospitals
  const hospitalUpdates = handleHospitalOperations();
  Object.entries(hospitalUpdates).forEach(([personId, person]) => {
    updatedGameData.people[personId] = {
      ...updatedGameData.people[personId],
      derivedAttributes: {
        ...updatedGameData.people[personId].derivedAttributes,
        health: {
          ...updatedGameData.people[personId].derivedAttributes.health,
          currentHealth: person.derivedAttributes.health.currentHealth,
        },
      },
    };
  });
  // Handle science projects
  const scienceProjectStatuses = [
    ...GameManager.getInstance().scienceManager.activeProjects,
  ];

  scienceProjectStatuses.forEach((projectStatus) => {
    const project =
      GameManager.getInstance().scienceManager.PROJECT_DEFINITIONS[
        projectStatus.indexName as ScienceProject
      ];
    const result =
      GameManager.getInstance().scienceManager.handleProjectProgress(
        projectStatus,
      );

    GameManager.getInstance().scienceManager.updateActiveProject(
      result,
      projectStatus.indexName as ScienceProject,
    );

    if (result.complete && result.daysRemaining === 0) {
      const completeResult =
        GameManager.getInstance().scienceManager.completeProject(
          projectStatus.indexName as ScienceProject,
        );

      gameEventQueue.addEvent(generateProjectCompleteEvent(completeResult));
    }
  });

  // Handle resource (daily) gain
  const scienceGain = getOrgResources(gameData.player.organizationId).science;

  const scienceUpdate = modifyOrgScience(
    gameData.player.organizationId,
    scienceGain,
  );

  updatedGameData.governingOrganizations =
    scienceUpdate.governingOrganizations!;
  const orgWealthGain = Math.trunc(getOrgIncome());
  updatedGameData.governingOrganizations[
    GameManager.getInstance().gameData.player.organizationId
  ].wealth += orgWealthGain;

  PlayerManager.getInstance().takeTurns();
  // Handle the date
  const gameDate = new Date(gameData.gameDate);
  gameDate.setDate(gameDate.getDate() + 1);
  updatedGameData.gameDate = gameDate;

  // Finalize the updates
  GameManager.getInstance().updateGameData(updatedGameData);
  return {
    updatedGameData,
    gameEventQueue,
    stop: gameEventQueue.events.some(
      (event) => eventConfig[event.type].forceStop,
    ),
  };
};

export const advanceDays = (days: number) => {
  for (let i = 0; i < days; i++) {
    const { updatedGameData, gameEventQueue, stop } = advanceDay();
    if (stop) {
      return updatedGameData;
    }
  }
};
