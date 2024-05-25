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
import people, { SimulateDayResolution } from './people';
import { generateProjectCompleteEvent } from '../managers/events/eventFunctions/projectComplete';
import { GameData, GameManager } from '../managers/game/GameManager';
import GameEventQueue from '../managers/events/GameEventQueue';
import PlotManager from '../managers/plots/PlotManager';

const handleSimActions = () => {
  console.debug('Handling sim actions');
  const actions: { [personId: string]: SimulateDayResolution } = {};
  people
    .getPeople({
      personFilter: {
        excludeDeceased: true,
      },
      agentFilter: { excludeDepartments: ['overlord'] },
    })
    .forEach((person) => {
      const simResults = people.simulateDay(person);
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
  // const { gameData } = GameManager.getInstance();
  const updatedGameData: Partial<GameData> = {
    people: {},
    governingOrganizations: {},
  };

  handleSimActions();

  // Activities may spawn events, so we need to handle them first
  ActivityManager.getInstance().executeActivities();

  // Setup Events
  GameEventQueue.getInstance().addEvents(prepareRandomEvents());

  GameEventQueue.getInstance().addEvents(
    addPlotResolutions(PlotManager.getInstance().executePlots()),
  );
  PlotManager.getInstance().clearPlotQueue();
  // handle healing in hospitals
  handleHospitalOperations();

  // Handle science projects
  const scienceProjectStatuses = [
    ...ScienceManager.getInstance().activeProjects,
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

      GameEventQueue.getInstance().addEvent(
        generateProjectCompleteEvent(completeResult),
      );
    }
  });

  // Handle resource (daily) gain
  const scienceGain = getOrgResources(
    GameManager.getInstance().gameData.player.organizationId,
  ).science;

  const scienceUpdate = modifyOrgScience(
    GameManager.getInstance().gameData.player.organizationId,
    scienceGain,
  );

  updatedGameData.governingOrganizations =
    scienceUpdate.governingOrganizations!;
  GameManager.getInstance().updateGameData(scienceUpdate);

  const orgWealthGain = Math.trunc(getOrgIncome());
  updatedGameData.governingOrganizations[
    GameManager.getInstance().gameData.player.organizationId
  ].wealth += orgWealthGain;

  GameManager.getInstance().updateGameData({
    governingOrganizations: {
      [GameManager.getInstance().gameData.player.organizationId]: {
        ...GameManager.getInstance().gameData.governingOrganizations[
          GameManager.getInstance().gameData.player.organizationId
        ],
        wealth: orgWealthGain,
      },
    },
  });

  PlayerManager.getInstance().takeTurns();
  // Handle the date
  const gameDate = new Date(GameManager.getInstance().gameData.gameDate);
  gameDate.setDate(gameDate.getDate() + 1);
  updatedGameData.gameDate = gameDate;
  GameManager.getInstance().updateGameData({ gameDate: gameDate });

  // Everyone who is alive should regain 1 hp
  people
    .getPeople({
      personFilter: {
        excludeDeceased: true,
      },
    })
    .forEach((person) => {
      GameManager.getInstance().updateGameData({
        people: {
          [person.id]: {
            ...person,
            derivedAttributes: {
              ...person.derivedAttributes,
              health: {
                ...person.derivedAttributes.health,
                currentHealth:
                  person.derivedAttributes.health.currentHealth + 1,
              },
            },
          },
        },
      });
    });

  // Finalize the updates
  // GameManager.getInstance().updateGameData(updatedGameData);
  return {
    updatedGameData,
    stop: GameEventQueue.getInstance().events.some(
      (event) => eventConfig[event.type].forceStop,
    ),
  };
};

/**
 * Advance multiple days until a stop event is reached
 */
const advanceDays = (days: number) => {
  for (let i = 0; i < days; i++) {
    const { updatedGameData, stop } = advanceDay();
    if (stop) {
      return updatedGameData;
    }
  }
};

export default {
  advanceDay,
  advanceDays,
};
