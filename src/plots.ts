import { GameData, GameManager } from './managers/game/GameManager';
import { Person } from './types/interfaces/entities';
import Plot from './managers/plots/Plot';
import ActivityManager from './managers/activities/ActivityManager';
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

const getActivityParticipants = () => {
  const { gameData } = GameManager.getInstance();
  const p = ActivityManager.getInstance().activities.reduce(
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

export { getActivityParticipants };
