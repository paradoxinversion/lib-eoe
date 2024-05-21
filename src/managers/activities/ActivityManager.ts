import { Person } from '../../types/interfaces/entities';
import Activity, { ActivityParticipants } from './Activity';

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

  /**
   *
   */
  setActivities(activities: Activity[]) {
    this.activities = activities;
  }

  executeActivities() {
    const activitiesResults = this.activities.reduce<
      {
        activity: string;
        result: {
          result: any;
          updatedGameData: { people: { [x: string]: Person } };
        };
      }[]
    >((activityResults, activity) => {
      const result = activity.executeActivity();
      const output = {
        activity: activity.name,
        result,
      };
      activityResults.push(output);
      return activityResults;
    }, []);
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
