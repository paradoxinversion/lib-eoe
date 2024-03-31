import { GameData, GameManager } from './GameManager';
import { Person } from './types/interfaces/entities';
import Plot from './plots/Plot';
import plotConfig from './plots/plotConfig';
import Activity from './activities/Activity';
import activityConfig from './activities/activityConfig';
export interface PlotResolution {
  plot: Plot;
  resolution: any;
}
export interface ActivityResult {
  activity: string;
  result: {
    updatedGameData: Partial<GameData>;
  };
}

/**
 *
 */
const populateActivities = (gameManager: GameManager) => {
  const { activityManager } = gameManager;
  const activities = [];
  for (
    let activityParamIndex = 0;
    activityParamIndex < activityConfig.length;
    activityParamIndex++
  ) {
    const activityParameters = activityConfig[activityParamIndex];
    activities.push(
      new Activity(activityParameters.name, activityParameters.fn),
    );
  }
  activityManager.setActivities(activities);
};

const populatePlots = (gameManager: GameManager) => {
  const { plotManager } = gameManager;
  const plots = [];
  const plotConfigArray = Object.values(plotConfig);
  for (let plotIndex = 0; plotIndex < plotConfigArray.length; plotIndex++) {
    const element = plotConfigArray[plotIndex];
    plots.push(element);
  }
  plotManager.setPlots(plots);
};

const getActivityParticipants = (gameManager: GameManager) => {
  const { activityManager, gameData } = gameManager;
  const p = activityManager.activities.reduce(
    (participants, currentActivity) => {
      currentActivity.agents.forEach((agent) => {
        participants.push({
          participant: gameData.people[agent],
          activity: currentActivity.name,
        });
      });
      return participants;
    },
    [] as {
      participant: Person;
      activity: string;
    }[],
  );
  return p;
};

export { populateActivities, populatePlots, getActivityParticipants };
