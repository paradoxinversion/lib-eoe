/**
 * advanceDay.ts
 *
 */
import ActivityManager from '../managers/activities/ActivityManager';
import { handleHospitalOperations } from '../buildings';
import {
  addPlotResolutions,
  eventConfig,
  prepareRandomEvents,
} from '../gameEvents';
import PlayerManager from '../managers/cpu/PlayerManager';
import { ScienceManager } from '../managers/science/science';
import { ScienceProject } from '../managers/science/types';
import {
  getOrgIncome,
  getOrgResources,
  modifyOrgScience,
} from '../organization';
import { Person } from '../types/interfaces/entities';
import { getPeople, simulateDay, SimulateDayResolution } from './people';
import { generateProjectCompleteEvent } from '../managers/events/eventFunctions/projectComplete';
import { GameManager } from '../managers/game/GameManager';

const handleSimActions = () => {
  console.debug('Handling sim actions');
  let actions: { [personId: string]: SimulateDayResolution } = {};
  getPeople({
    personFilter: {
      excludeDeceased: true,
    },
    agentFilter: { excludeDepartments: ['overlord'] },
  }).forEach((person) => {
    const simResults = simulateDay(person);
    actions[person.id] = {
      ...actions,
      ...simResults,
    };
  });
  console.debug('Sim actions:', actions);
};

const handleActivities = () => {
  const activities = ActivityManager.getInstance().executeActivities();
  const updatedGameData: { people: { [personId: string]: Person } } = {
    people: {},
  };
  activities.forEach((activity) => {
    if (activity.result.updatedGameData) {
      updatedGameData.people = {
        ...updatedGameData.people,
        ...activity.result.updatedGameData.people,
      };
    }
  });

  return activities;
};

/**
 * Determines what events happen at end of turn and returns
 * updated gamedata with those events.
 */
const advanceDay = () => {
  const {
    gameData,
    eventManager: gameEventQueue,
    activityManager,
    plotManager,
  } = GameManager.getInstance();
  const updatedGameData = { ...gameData };
  // Execute daily actions for People
  // getPeople({
  //   personFilter: {
  //     excludeDeceased: true,
  //   },
  //   agentFilter: { excludeDepartments: ['overlord'] },
  // }).forEach((person) => {
  //   const simResults = simulateDay(person);
  //   GameManager.getInstance().updateGameData(simResults.updatedGameData);
  //   GameManager.getInstance().updateSimActionLog(
  //     person.id,
  //     simResults.updatedLog,
  //   );
  // });
  handleSimActions();

  // Activities may spawn events, so we need to handle them first
  const activities = activityManager.executeActivities();
  activities.forEach((activity) => {
    if (activity.result.updatedGameData) {
      updatedGameData.people = {
        ...updatedGameData.people,
        ...activity.result.updatedGameData.people,
      };
    }
  });

  const plotResolutions = plotManager.executePlots();

  // Setup Events
  const randomEvents = prepareRandomEvents();
  gameEventQueue.addEvents(randomEvents);
  const plotEvents = addPlotResolutions(plotResolutions);
  gameEventQueue.addEvents(plotEvents);

  plotManager.clearPlotQueue();
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
    const result =
      ScienceManager.getInstance().handleProjectProgress(projectStatus);

    ScienceManager.getInstance().updateActiveProject(
      result,
      projectStatus.indexName as ScienceProject,
    );

    if (result.complete && result.daysRemaining === 0) {
      const completeResult = ScienceManager.getInstance().completeProject(
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

  // Everyone who is alive should regain 1 hp
  getPeople({
    personFilter: {
      excludeDeceased: true,
    },
  }).forEach((person) => {
    GameManager.getInstance().updateGameData({
      people: {
        [person.id]: {
          ...person,
          derivedAttributes: {
            ...person.derivedAttributes,
            health: {
              ...person.derivedAttributes.health,
              currentHealth: person.derivedAttributes.health.currentHealth + 1,
            },
          },
        },
      },
    });
  });

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

/**
 * Advance multiple days until a stop event is reached
 */
const advanceDays = (days: number) => {
  for (let i = 0; i < days; i++) {
    const { updatedGameData, gameEventQueue, stop } = advanceDay();
    if (stop) {
      return updatedGameData;
    }
  }
};

export default {
  advanceDay,
  advanceDays,
};
