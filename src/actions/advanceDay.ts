/**
 * advanceDay.ts
 *
 */
import ActivityManager from '../managers/activities/ActivityManager';
import { handleHospitalOperations as medicalPhase } from '../buildings';
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
import people, { SimulateDayResolution } from './people';
import { generateProjectCompleteEvent } from '../managers/events/eventFunctions/projectComplete';
import { GameManager } from '../managers/game/GameManager';
import GameEventQueue from '../managers/events/GameEventQueue';
import PlotManager from '../managers/plots/PlotManager';
import { PlotResolution } from '../plots';

const simActionsPhase = () => {
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

const activitiesPhase = () => {
  ActivityManager.getInstance().executeActivities();
};

const plotsPhase = () => {
  const plotResults = PlotManager.getInstance().executePlots();
  console.debug('Plot results:', plotResults);
  PlotManager.getInstance().clearPlotQueue();
  return plotResults;
};

const eventPhase = (plotResults: PlotResolution[]) => {
  GameEventQueue.getInstance().addEvents(prepareRandomEvents());

  GameEventQueue.getInstance().addEvents(addPlotResolutions(plotResults));
};

const researchPhase = () => {
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
};

const resourceGainPhase = () => {
  const empire =
    GameManager.getInstance().gameData.governingOrganizations[
      GameManager.getInstance().gameData.player.organizationId
    ];
  const scienceGain = getOrgResources(empire.id).science;

  const scienceUpdate = modifyOrgScience(empire.id, scienceGain);

  GameManager.getInstance().updateGameData(scienceUpdate);

  const orgWealthGain = Math.trunc(getOrgIncome());

  GameManager.getInstance().updateGameData({
    governingOrganizations: {
      [empire.id]: {
        ...empire,
        wealth: empire.wealth + orgWealthGain,
      },
    },
  });
};

const updateDate = () => {
  const gameDate = new Date(GameManager.getInstance().gameData.gameDate);
  gameDate.setDate(gameDate.getDate() + 1);

  GameManager.getInstance().updateGameData({ gameDate: gameDate });
};

const healingPhase = () => {
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
};
/**
 * Determines what events happen at end of turn and returns
 * updated gamedata with those events.
 */
const advanceDay = () => {
  simActionsPhase();

  // Activities may spawn events, so we need to handle them first
  activitiesPhase();

  const plotResults = plotsPhase();
  eventPhase(plotResults);

  researchPhase();

  resourceGainPhase();

  // Take AI turns
  PlayerManager.getInstance().takeTurns();

  // Handle the date
  medicalPhase();
  healingPhase();
  updateDate();

  // Finalize the updates
  // GameManager.getInstance().updateGameData(updatedGameData);
  return {
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
    const { stop } = advanceDay();
    if (stop) {
      return;
    }
  }
};

export default {
  advanceDay,
  advanceDays,
};
