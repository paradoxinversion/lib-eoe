const GameManager = require("./GameManager");
const { doCombat } = require("./combat");
const { getAgentsInZone } = require("./organization");
const { randomInt } = require("./utilities");

const activityConfig = [
  {
    name: "Training",
    type: "training",
    /**
     * @param {GameManager} gameManager
     * @param {string[]} participantArray - An array of id's of participating agents
     */
    fn: (gameManager, participantArray) => {
      const { gameData } = gameManager;
      // increase a random stat of each participant
      // return an obj that contains an array of the updated agents
      const updatedAgents = participantArray.reduce(
        (participants, participant) => {
          /**
           * @type {import("./typedef").Person}
           */
          const updatedParticipant = JSON.parse(
            JSON.stringify(gameData.people[participant])
          );
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
          participants[updatedParticipant.id] = updatedParticipant;
          return participants;
        },
        {}
      );
      return { people: updatedAgents };
    },
  },
  {
    name: "EVIL Education",
    /**
     * @param {GameManager} gameManager
     * @param {string[]} participantArray - An array of id's of participating agents
     */
    fn: (gameManager, participantArray) => {
      const { gameData } = gameManager;
      const updatedAgents = participantArray.reduce(
        (participants, participant) => {
          /**
           * @type {import("./typedef").Person}
           */
          const updatedParticipant = JSON.parse(
            JSON.stringify(gameData.people[participant])
          );
          const loyaltyIncrease = randomInt(1, 4);
          updatedParticipant.loyalty =
            updatedParticipant.loyalty + loyaltyIncrease;
          participants[updatedParticipant.id] = updatedParticipant;
          return participants;
        },
        {}
      );
      return { people: updatedAgents };
    },
  },
];
/**
 * @param {GameManager} gameManager
 * @param {Object} plotArgs
 * @param {import("./typedef").Zone} plotArgs.zone
 * @param {string[]} plotArgs.participants
 * @returns {import("./typedef").PlotResolution}
 */
const plotAttackZone = (
  gameManager,
  { zone: { id: zoneId, organizationId: zoneOrgId }, participants }
) => {
  const { gameData } = gameManager;
  const defendingAgents = getAgentsInZone(gameManager, zoneOrgId, zoneId);
  const attackingAgents = participants.map((agent) => gameData.people[agent]);
  const result = doCombat(attackingAgents, defendingAgents);
  return {
    data: result,
  };
};

/**
 *
 * @param {GameManager} gameManager
 * @param {Object} plotArgs
 * @param {import("./typedef").string} plotArgs.zoneId
 * @param {string[]} plotArgs.participants
 */
const plotRecon = (gameManager, { zoneId, participants }) => {
  const { gameData } = gameManager;
  const zone = gameData.zones[zoneId];
  const participantIntelligence = Object.values(gameData.people)
    .filter((participant) => participants.some((p) => p.id === participant.id))
    .reduce((total, currentParticipant) => {
      return total + currentParticipant.intelligence;
    }, 0);

  const zoneDefenderIntelligence = getAgentsInZone(
    gameManager,
    zone.organizationId,
    zone.id
  ).reduce((total, currentParticipant) => {
    return total + currentParticipant.intelligence;
  }, 0);

  /**
   * Can be positive or negative
   */
  let intelMod = 0;
  let success = false;
  if (participantIntelligence > zoneDefenderIntelligence) {
    intelMod = randomInt(5, 10);
    success = true;
  }

  return {
    data: {
      intelligenceModifier: intelMod,
      success,
    },
  };
};

const plotConfig = {
  /**
   * @type {import("./typedef").PlotConfiguration}
   */
  "attack-zone": {
    name: "Attack Zone",
    type: "attack-zone",
    fn: plotAttackZone,
  },
  /**
   * @type {import("./typedef").PlotConfiguration}
   */
  "recon-zone": {
    name: "Recon",
    type: "recon-zone",
    fn: plotRecon,
  },
};

class Activity {
  constructor(name, fn) {
    /**
     * @type {string[]}
     */
    this.name = name;

    /**
     * @type {string[]}
     */
    this.agents = [];
    /**
     * @type {Function}
     */
    this.fn = fn;
  }

  /**
   * Sets agents for this task. Overwrites the current list.
   * @param {string[]} agents
   */
  setAgents(agents) {
    this.agents = agents;
  }
  /**
   * Add an agent to the activity
   * @param {string} agent - The id of the agent participating
   */
  addAgent(gameManager, agent) {
    const { gameData } = gameManager;
    let updatedGameData = {
      people: {},
    };
    if (!this.agents.includes(agent)) {
      this.agents.push(agent);
      const updatedAgent = JSON.parse(JSON.stringify(gameData.people[agent]));
      updatedGameData.people[updatedAgent.id] = updatedAgent;
    }
    return updatedGameData;
  }

  /**
   * Remove an agent from the activity
   * @param {string} agent - The id of the agent to remove
   */
  removeAgent(gameManager, agent) {
    const { gameData } = gameManager;
    let updatedGameData = {
      people: {},
    };
    const agentIndex = this.agents.findIndex(agent);
    if (agentIndex != -1) {
      this.agents.splice(agentIndex, 1);
      const updatedAgent = JSON.parse(JSON.stringify(gameData.people[agent]));
      updatedGameData.people[updatedAgent.id] = updatedAgent;
    }
    return updatedGameData;
  }

  /**
   *
   * @param {GameManager} gameManager
   * @returns
   */
  executeActivity(gameManager) {
    const result = this.fn(gameManager, this.agents);
    const updatedGameData = {
      people: {},
    };
    Object.values(result.people).forEach((person) => {
      updatedGameData.people[person.id] = person;
    });
    return { result, updatedGameData };
  }
}

class Plot {
  constructor(name, plotType, plotParams) {
    this.name = name;
    this.plotParams = plotParams;
    this.plotType = plotType;
    this.resolution = {};
  }

  /**
   * Execute a plot, returning the plot's ResolutionValue.
   * @param {gameManager} gameManager
   * @returns {import("./typedef").PlotResolution}
   */
  executePlot(gameManager) {
    /**
     * @type {import("./typedef").PlotResolution}
     */
    const result = plotConfig[this.plotType].fn(gameManager, this.plotParams);
    this.resolution = result;
    return result;
  }
}

class ActivityManager {
  constructor() {
    // TODO: Make this a map?
    /**
     * @type {Activity[]}
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

  executeActivities(gameManager) {
    const activitiesResults = this.activities.reduce(
      (activityResults, activity) => {
        const result = activity.executeActivity(gameManager);
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

  /**
   * Return a JSON compatible collection of activities
   * and their participants
   */
  serializeActivities() {
    const activities = this.activities.reduce(
      (serializedActivities, activity) => {
        const currentActivity = {
          name: activity.name,
          agents: activity.agents,
        };
        serializedActivities[activity.name] = currentActivity;
        return serializedActivities;
      },
      {}
    );

    return activities;
  }
}

class PlotManager {
  constructor() {
    /**
     * @type {Plot[]}
     */
    this.plotQueue = [];
    this.currentPlot = 0;
    this.plots = [];
    this.plotResolutions = [];
  }

  /**
   * Set the game plots (not individual playerp lots)
   * @param {Plot} plots
   */
  setPlots(plots) {
    this.plots = plots;
  }

  /**
   * Remove all plots
   */
  clearPlots() {
    this.plots = [];
  }

  /**
   * Add a plot to the queue
   * @param {Plot} plot
   */
  addPlot(plot) {
    this.plotQueue.push(plot);
  }

  /**
   * Replaces the current plot queue with the parameter array
   * @param {Plot[]} plotQueue
   */
  setPlotQueue(plotQueue) {
    this.plotQueue = plotQueue;
  }

  /**
   * Remove all plots from the plot queue
   */
  clearPlotQueue() {
    this.plotQueue = [];
    this.plotResolutions = [];
  }

  /**
   * Execute a plot, returning...
   * @param {Plot} plot
   * @param {GameManager} gameManager
   * @returns {import("./typedef").PlotResolution}
   */
  executePlot(plot, gameManager) {
    return plot.executePlot(gameManager);
  }

  /**
   * Executes all plots in the queue. Adds each resolution
   * to the plot's `plotResolutions` property. Returns
   * the resolutions.
   * @param {GameManager} gameManager
   * @returns {import("./typedef").PlotResolution[]} The
   */
  executePlots(gameManager) {
    this.plotQueue.forEach((plot) => {
      this.plotResolutions.push({
        plot,
        resolution: this.executePlot(plot, gameManager),
      });
    });
    return this.plotResolutions;
  }

  /**
   * Return a JSON compatible collection of activities
   * and their participants
   */
  serializePlots() {
    const plots = this.plotQueue.reduce((serializedPlots, plot) => {
      serializedPlots.push(plot);
      return serializedPlots;
    }, []);

    return plots;
  }
}

/**
 * 
 * @param {GameManager} gameManager 
 */
const populateActivities = (gameManager) => {
  const { activityManager } = gameManager;
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

const populatePlots = (gameManager) => {
  const { plotManager } = gameManager;
  const plots = [];
  const plotConfigArray = Object.values(plotConfig);
  for (let plotIndex = 0; plotIndex < plotConfigArray.length; plotIndex++) {
    const element = plotConfigArray[plotIndex];
    plots.push(element);
  }
  plotManager.setPlots(plots);
};

/**
 *
 * @param {GameManager} gameManager
 */
const getActivityParticipants = (gameManager) => {
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
    []
  );
  return p;
};

module.exports = {
  Activity,
  ActivityManager,
  populateActivities,
  Plot,
  PlotManager,
  populatePlots,
  plotConfig,
  getActivityParticipants,
};
