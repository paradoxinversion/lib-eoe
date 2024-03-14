import { GameData, GameManager } from './GameManager';
import {
  Person,
  PersonBasicAttributes,
  Zone,
} from './types/interfaces/entities';
import { doCombat } from './combat';
import { getAgentsInZone } from './organization';
import { randomInt } from './utilities';
import { citizens, zones } from '..';
import { people } from './actions';
import {
  updateBasicAttribute,
  updateIntelAttribute,
  updateLoyalty,
} from './actions/people';

interface ActivityConfig {
  /** The name of the activity (to be shown to the user) */
  name: string;
  /** The activity's type */
  type: string;
  /** The function to handle the execution of the activity */
  fn: Function;
}

interface UpdatedAgentMap {
  [x: string]: Person;
}

const activityConfig: ActivityConfig[] = [
  {
    name: 'Training',
    type: 'training',
    fn: (gameManager: GameManager, participantArray: string[]) => {
      const { gameData } = gameManager;

      const updatedAgents: UpdatedAgentMap = participantArray.reduce(
        (participants: { [x: string]: Person }, participantId) => {
          const particpantObject: Person = {
            ...gameData.people[participantId],
          };
          const basicAttributes = Object.keys(particpantObject.basicAttributes);
          const attributeKey = randomInt(0, basicAttributes.length);
          const updatedGameData = updateBasicAttribute(
            particpantObject,
            basicAttributes[attributeKey] as keyof PersonBasicAttributes,
            1,
          );

          participants[particpantObject.id] =
            updatedGameData.people[particpantObject.id];
          return participants;
        },
        {},
      );

      return { people: updatedAgents };
    },
  },
  {
    name: 'EVIL Education',
    type: 'evil-educaton',
    fn: (gameManager: GameManager, participantArray: string[]) => {
      const { gameData } = gameManager;
      const updatedAgents: UpdatedAgentMap = participantArray.reduce(
        (participants: { [x: string]: Person }, participant) => {
          const updatedParticipant: Person = {
            ...gameData.people[participant],
          };
          const loyaltyIncrease = randomInt(1, 4);
          const updatedGameData = updateLoyalty(
            updatedParticipant,
            updatedParticipant.agent?.organizationId!,
            loyaltyIncrease,
          );
          participants[updatedParticipant.id] =
            updatedGameData.people[updatedParticipant.id];
          return participants;
        },
        {},
      );
      return { people: updatedAgents };
    },
  },
  {
    name: 'Peace Patrol',
    type: 'peace-patrol',
    fn: (gameManager: GameManager, participantArray: string[]) => {
      const updatedGameData: { people: { [x: string]: Person } } = {
        people: {},
      };
      participantArray.forEach((participant) => {
        const agent = gameManager.gameData.people[participant];
        const agentHomeZone = gameManager.gameData.zones[agent.homeZoneId];
        const homeZoneCitizens = zones.getZoneCitizens(
          gameManager,
          agentHomeZone.id,
          true,
          true,
        );
        const citizen = {
          ...homeZoneCitizens[randomInt(0, homeZoneCitizens.length) - 1],
        };
        const updatedGameData = updateIntelAttribute(citizen, 'loyalty', 2);
        updatedGameData.people[citizen.id] = updatedGameData.people[citizen.id];
      });
    },
  },
];

interface PlotAttackZoneOpts {
  zone: {
    id: string;
    organizationId: string;
  };
  participants: string[];
}
/**
 * Attack a zone
 */
const plotAttackZone = (
  gameManager: GameManager,
  {
    zone: { id: zoneId, organizationId: zoneOrgId },
    participants,
  }: PlotAttackZoneOpts,
) => {
  const { gameData } = gameManager;
  const defendingAgents = getAgentsInZone(gameManager, zoneOrgId, zoneId);
  const attackingAgents = participants.map((agent) => gameData.people[agent]);
  const result = doCombat(attackingAgents, defendingAgents);
  return {
    data: result,
    evil: 10,
  };
};

interface PlotReconParams {
  zoneId: string;
  participants: string[];
}

const plotRecon = (
  gameManager: GameManager,
  { zoneId, participants }: PlotReconParams,
) => {
  const { gameData } = gameManager;
  const zone = gameData.zones[zoneId];
  const participantIntelligence = Object.values(gameData.people)
    .filter((participant) => participants.some((p) => p === participant.id))
    .reduce((total, currentParticipant) => {
      return total + currentParticipant.basicAttributes.intelligence;
    }, 0);

  const zoneDefenderIntelligence = getAgentsInZone(
    gameManager,
    zone.organizationId,
    zone.id,
  ).reduce((total, currentParticipant) => {
    return total + currentParticipant.basicAttributes.intelligence;
  }, 0);

  /**
   * Can be positive or negative
   */
  let intelMod = 0;
  let success = false;
  if (participantIntelligence > zoneDefenderIntelligence / 2) {
    intelMod = randomInt(5, 10);
    success = true;
  }

  if (intelMod > 100) {
    intelMod = 100;
  }

  const evil = 5;
  return {
    data: {
      intelligenceModifier: intelMod,
      success,
      evil: 5,
    },
  };
};

const plotConfig: { [x: string]: ActivityConfig } = {
  'attack-zone': {
    name: 'Attack Zone',
    type: 'attack-zone',
    fn: plotAttackZone,
  },
  'recon-zone': {
    name: 'Recon',
    type: 'recon-zone',
    fn: plotRecon,
  },
};

class Activity {
  name: string;
  /** Array of IDs belonging to participating agents */
  agents: string[];
  /** Execution function for this activity */
  fn: Function;

  constructor(name: string, executionFn: Function) {
    this.name = name;
    this.agents = [];
    this.fn = executionFn;
  }

  /**
   * Sets agents for this task. Overwrites the current list.
   */
  setAgents(agents: string[]) {
    this.agents = agents;
  }
  /**
   * Add an agent to the activity
   */
  addAgent(gameManager: GameManager, agent: string) {
    const { gameData } = gameManager;
    let updatedGameData: { people: { [x: string]: Person } } = {
      people: {},
    };
    if (!this.agents.includes(agent)) {
      this.agents = [...this.agents, agent];
      const updatedAgent: Person = JSON.parse(
        JSON.stringify(gameData.people[agent]),
      );
      updatedGameData.people[updatedAgent.id] = updatedAgent;
    }
    return updatedGameData;
  }

  /**
   * Remove an agent from the activity
   */
  removeAgent(gameManager: GameManager, agentId: string) {
    const { gameData } = gameManager;
    let updatedGameData: { people: { [x: string]: Person } } = {
      people: {},
    };
    const agentIndex = this.agents.findIndex((agent) => agent === agentId);
    if (agentIndex != -1) {
      this.agents.splice(agentIndex, 1);
      const updatedAgent: Person = JSON.parse(
        JSON.stringify(gameData.people[agentId]),
      );
      updatedGameData.people[updatedAgent.id] = updatedAgent;
    }
    return updatedGameData;
  }

  /**
   * Execute this activity
   */
  executeActivity(gameManager: GameManager) {
    const result = this.fn(gameManager, this.agents);
    const updatedGameData: { people: { [x: string]: Person } } = {
      people: {},
    };
    if (result) {
      Object.values<Person>(result.people).forEach((person: Person) => {
        updatedGameData.people[person.id] = person;
      });
    }
    return { result, updatedGameData };
  }
}

export interface PlotResolution {
  plot: Plot;
  resolution: any;
}
export interface PlotParams {
  zoneId?: string;
  zone?: Zone;
  plotParams: {
    zoneId?: string;
    zone?: Zone;
  };
}
class Plot {
  name: string;
  plotParams: PlotParams;
  plotType: string;
  resolution: {
    plot?: Plot;
    data?: any;
  };
  type?: string;
  constructor(name: string, plotType: string, plotParams: PlotParams) {
    this.name = name;
    this.plotParams = plotParams;
    this.plotType = plotType;
    this.resolution = {};
  }

  /**
   * Execute a plot, returning the plot's ResolutionValue.
   */
  executePlot(gameManager: GameManager) {
    const result = plotConfig[this.plotType].fn(gameManager, this.plotParams);
    this.resolution = result;
    return result;
  }
}

export interface ActivityResult {
  activity: string;
  result: {
    updatedGameData: Partial<GameData>;
  };
}

interface ActivityParticipants {
  name: string;
  agents: string[];
}

class ActivityManager {
  activities: Activity[];
  constructor() {
    // TODO: Make this a map?
    this.activities = [];
  }

  /**
   *
   */
  setActivities(activities: Activity[]) {
    this.activities = activities;
  }

  executeActivities(gameManager: GameManager) {
    const activitiesResults = this.activities.reduce<
      {
        activity: string;
        result: {
          result: any;
          updatedGameData: { people: { [x: string]: Person } };
        };
      }[]
    >((activityResults, activity) => {
      const result = activity.executeActivity(gameManager);
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

class PlotManager {
  plotQueue: Plot[];
  currentPlot: number;
  plots: ActivityConfig[];
  plotResolutions: PlotResolution[];
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
   */
  setPlots(plots: ActivityConfig[]) {
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
  addPlot(plot: Plot) {
    this.plotQueue.push(plot);
  }

  /**
   * Replaces the current plot queue with the parameter array
   * @param {Plot[]} plotQueue
   */
  setPlotQueue(plotQueue: Plot[]) {
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
   */
  executePlot(plot: Plot, gameManager: GameManager): PlotResolution {
    return plot.executePlot(gameManager);
  }

  /**
   * Executes all plots in the queue. Adds each resolution
   * to the plot's `plotResolutions` property. Returns
   * the resolutions.
   */
  executePlots(gameManager: GameManager): PlotResolution[] {
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
    const plots = this.plotQueue.reduce((serializedPlots: Plot[], plot) => {
      serializedPlots.push(plot);
      return serializedPlots;
    }, []);

    return plots;
  }
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
  const p = activityManager.activities.reduce<
    { participant: Person; activity: string }[]
  >((participants, currentActivity) => {
    currentActivity.agents.forEach((agent) => {
      participants.push({
        participant: gameData.people[agent],
        activity: currentActivity.name,
      });
    });
    return participants;
  }, []);
  return p;
};

export {
  Activity,
  ActivityManager,
  populateActivities,
  Plot,
  PlotManager,
  populatePlots,
  plotConfig,
  getActivityParticipants,
};
