const { randomInt } = require("./utilities");

const activityConfig = [
  {
    name: "Training",
    /**
     *
     * @param {import("./typedef").Person[]} participantArray
     */
    fn: (participantArray) => {
      // increase a random stat of each participant
      // return an obj that contains an array of the updated agents
      const updatedAgents = participantArray.reduce(
        (participants, participant) => {
          /**
           * @type {import("./typedef").Person}
           */
          const updatedParticipant = JSON.parse(JSON.stringify(participant));
          const stat = randomInt(0, 2);
          switch (stat) {
            case 0:
              updatedParticipant.combat += 1;
              break;

            case 1:
              updatedParticipant.administration += 1;
              break;

            case 2:
              updatedParticipant.intelligence += 1;
              break;

            default:
              break;
          }
          participants[participant.id] = updatedParticipant;
          return participants;
        },
        {}
      );
      return { people: updatedAgents };
    },
  },
  {
    name: "Foo",
    fn: () => {
      return {
        bar: "baz",
      };
    },
  },
];

class Activity {
  constructor(name, fn) {
    this.name = name;
    this.agents = [];
    this.fn = fn;
  }

  /**
   * Add an agent to the activity
   * @param {import("./typedef").Person} agent
   */
  addAgent(agent) {
    if (!this.agents.includes(agent)) {
      this.agents.push(agent);
    }
  }

  removeAgent(agent) {
    const agentIndex = this.agents.findIndex(agent);
    if (agentIndex != -1) {
      this.agents.splice(agentIndex, 1);
    }
  }

  executeActivity() {
    console.log("executing", this.name);
    const result = this.fn(this.agents);
    if (result.people){
      this.agents = Object.values(result.people)
    }
    return result;
  }
}

class ActivityManager {
  constructor() {
    /**
     * @type {Activity}
     */
    this.activities = [];
  }

  /**
   *
   * @param {Activity[]} activities
   */
  setActivities(activities) {
    this.activities = activities;
  }

  executeActivities() {
    const activitiesResults = this.activities.reduce(
      (activityResults, activity) => {
        const result = activity.executeActivity();
        const output = {
          activity: activity.name,
          result,
        };
        activityResults.push(output);
        return activityResults;
      },
      []
    );
    return activitiesResults;
  }
}

const populateActivities = (activityManager) => {
  const activities = [];
  for (
    let activityParamIndex = 0;
    activityParamIndex < activityConfig.length;
    activityParamIndex++
  ) {
    const activityParameters = activityConfig[activityParamIndex];
    activities.push(
      new Activity(activityParameters.name, activityParameters.fn)
    );
  }
  activityManager.setActivities(activities);
};

module.exports = {
  Activity,
  ActivityManager,
  populateActivities,
};
