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
const populateActivities = () => {
  const { activityManager } = GameManager.getInstance();
  const activities = [];
  for (
    let activityParamIndex = 0;
    activityParamIndex < activityConfig.length;
    activityParamIndex++
  ) {
    const activityParameters = activityConfig[activityParamIndex];
    activities.push(
      new Activity(
        activityParameters.name,
        activityParameters.type,
        activityParameters.costPerParticipant,
        activityParameters.fn,
        activityParameters.description,
      ),
    );
  }
  activityManager.setActivities(activities);
};

const populatePlots = () => {
  const { plotManager } = GameManager.getInstance();
  const plots = [];
  const plotConfigArray = Object.values(plotConfig);
  for (let plotIndex = 0; plotIndex < plotConfigArray.length; plotIndex++) {
    const element = plotConfigArray[plotIndex];
    plots.push(element);
  }
  plotManager.setPlots(plots);
};

const getActivityParticipants = () => {
  const { activityManager, gameData } = GameManager.getInstance();
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
