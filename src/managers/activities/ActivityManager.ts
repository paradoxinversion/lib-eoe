import { Person } from '../../types/interfaces/entities';
import { GameManager } from '../game/GameManager';
import Activity, { ActivityParticipants } from './Activity';
import activityConfig from './activityConfig';
import { ActivityLog } from './types';

export default class ActivityManager {
  private static instance: ActivityManager;
  activities: Activity[];
  constructor() {
    console.info('ActivityManager Initialized');
    // TODO: Make this a map?
    this.activities = [];
  }

  public static getInstance(): ActivityManager {
    if (!ActivityManager.instance) {
      ActivityManager.instance = new ActivityManager();
    }

    return ActivityManager.instance;
  }
  populateActivities() {
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
    ActivityManager.getInstance().setActivities(activities);
  }

  /**
   * Return a list of all participants in all activities
   */
  getActivityParticipants() {
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
  }
  /**
   *
   */
  setActivities(activities: Activity[]) {
    this.activities = activities;
  }

  executeActivities() {
    const activitiesResults: {
      activity: string;
      result: {
        result: any;
        updatedGameData: { people: { [x: string]: Person } };
      };
      log: ActivityLog;
    }[] = [];
    this.activities.forEach((activity) => {
      if (activity.agents.length === 0) {
        return;
      }
      const activityData = activity.executeActivity();
      const output = {
        activity: activity.name,
        result: activityData,
        log: activity.logActivity(),
      };
      activitiesResults.push(output);
    });
    return activitiesResults;
  }

  /**
   * Return a JSON compatible collection of activities
   * and their participants
   */
  serializeActivities() {
    const activities = this.activities.reduce(
      (
        serializedActivities: { [x: string]: ActivityParticipants },
        activity,
      ) => {
        const currentActivity = {
          name: activity.name,
          agents: activity.agents,
        };
        serializedActivities[activity.name] = currentActivity;
        return serializedActivities;
      },
      {},
    );

    return activities;
  }
}
