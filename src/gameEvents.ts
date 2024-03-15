import { GameData, GameManager } from './GameManager';
import { generateAgentData } from './generators/game';
import {
  getMaxAgents,
  getAgents,
  getControlledZones,
  calculateAgentSalary,
  getPayroll,
  getEvilEmpire,
  getExpenses,
  getOrgResources,
  takeCaptive,
} from './organization';
import { getZoneCitizens, transferZoneControl } from './zones';
import { Plot, PlotResolution } from './plots';
import {
  GoverningOrganization,
  Person,
  Zone,
} from './types/interfaces/entities';
import { randomInt, Shufflebag } from './utilities';
import { getResourceOutput, getUpkeep, getWealthBonuses } from './buildings';
import { getPeople } from './actions/people';
import { ScienceProjectResult } from './managers/scienceProjects';
interface EvilApplicantParams {
  recruit: Person;
  department: number;
  organizationId: string;
}

/**
 * Set parameters for an Evil Applicant event
 */
function setEvilApplicantParams(
  this: GameEvent,
  { recruit, organizationId, department }: EvilApplicantParams,
) {
  this.params.organizationId = organizationId;
  this.params.department = department;
  this.params.recruit = recruit;
}

/**
 * Set parameters for a Wealth Mod event
 */
function setWealthModParams(this: GameEvent) {
  this.params.modAmount = randomInt(-10, 10);
}

interface CombatEventParams {
  aggressingForce: Person[];
  defendingForce: Person[];
}
/**
 * Set parameters for a combat event
 */
function setCombatParams(
  this: GameEvent,
  { aggressingForce, defendingForce }: CombatEventParams,
) {
  this.params.aggressingForce = aggressingForce;
  this.params.defendingForce = defendingForce;
}

interface AttackZoneParams {
  plot: Plot;
}
/**
 * Set parameters for an Attack Zone Plot Event
 * @param {Object} AttackZonePlotEventParams
 * @param {Plot} AttackZonePlotEventParams.plot
 */
function setAttackZoneParams(this: GameEvent, { plot }: AttackZoneParams) {
  this.params.plot = plot;
}

interface MonthlyReportEventParams {
  income: number;
  expenses: number;
}

/**
 *
 */
function setMonthlyReportParams(
  this: GameEvent,
  { income, expenses }: MonthlyReportEventParams,
) {
  this.params.income = income;
  this.params.expenses = expenses;
}

interface IntruderAlertEventParams {
  intruderId: string;
}

function setIntruderAlertParams(
  this: GameEvent,
  { intruderId }: IntruderAlertEventParams,
) {
  this.params.intruderId = intruderId;
}

interface ReconZoneEventParams {
  plot: Plot;
}

/**
 *
 */
function setReconZoneParams(this: GameEvent, { plot }: ReconZoneEventParams) {
  this.params.plot = plot;
}

interface ProjectCompleteParams {
  projectIndexName: string;
}

function setProjectCompleteParams(this: GameEvent, { projectIndexName }: ProjectCompleteParams) {
  this.params.projectIndexName = projectIndexName;
}

/**
 *
 */
function resolveReconZone(
  this: GameEvent,
  gameManager: GameManager,
  //@ts-ignore
  resolveArgs,
) {
  const gameData = gameManager.gameData;
  const updatedGameData: {
    zones: { [x: string]: Zone };
    governingOrganizations: { [x: string]: GoverningOrganization };
  } = {
    zones: {},
    governingOrganizations: {},
  };
  const updatedZone: Zone = JSON.parse(
    JSON.stringify(gameData.zones[this.params.plot?.plotParams.zoneId!]),
  );
  updatedZone.intelAttributes.intelligenceLevel +=
    this.params.plot?.resolution.data.intelligenceModifier;
  updatedGameData.zones[updatedZone.id] = updatedZone;
  const preupdateEmpire = getEvilEmpire(gameManager);
  const evilEmpire: GoverningOrganization = {
    ...preupdateEmpire,
    totalEvil: preupdateEmpire.totalEvil + 10,
  };
  updatedGameData.governingOrganizations[evilEmpire.id] = evilEmpire;
  this.eventData = {
    type: 'recon-zone',
    resolution: {
      updatedGameData,
    },
  };
  // gameManager.updateGameData()
  return this.eventData;
}

/**
 * Resolve a Standard Report Event
 */
function resolveStandardReport(this: GameEvent) {
  this.eventData = {
    type: 'standard-report',
    resolution: {
      updatedGameData: {},
    },
  };

  return this.eventData;
}

interface EvilApplicantResolveArgs {
  resolutionValue: number;
  data: {
    department: string;
    commander: string;
  };
}

/**
 * Resolve an Evil Applicant Event
 */
function resolveEvilApplicant(
  this: GameEvent,
  gameManager: GameManager,
  resolveArgs: EvilApplicantResolveArgs,
) {
  const { gameData } = gameManager;
  const updatedGameData: { people: { [x: string]: Person } } = {
    people: {},
  };

  switch (resolveArgs.resolutionValue) {
    case 1:
      this.params.department = parseInt(resolveArgs.data.department);

      const updatedAgent: Person = JSON.parse(
        JSON.stringify(gameData.people[this.params.recruit?.id!]),
      );
      const salary = calculateAgentSalary(updatedAgent);
      const agentData = generateAgentData(
        this.params.organizationId!,
        this.params.department,
        salary,
        resolveArgs.data.commander,
      );
      updatedAgent.agent = agentData;
      updatedGameData.people[this.params.recruit?.id!] = updatedAgent;
      break;

    default:
      break;
  }

  this.eventData = {
    type: 'recruit',
    resolution: {
      updatedGameData,
    },
  };
  return this.eventData;
}

/**
 * Resolve a Wealth Modification event
 */
function resolveWealthMod(this: GameEvent, gameManager: GameManager) {
  const { gameData } = gameManager;
  const updatedGameData: {
    governingOrganizations: { [x: string]: GoverningOrganization };
  } = { governingOrganizations: {} };
  const updatedOrg = JSON.parse(
    JSON.stringify(
      gameData.governingOrganizations[gameData.player.organizationId],
    ),
  );
  updatedGameData.governingOrganizations[gameData.player.organizationId] =
    updatedOrg;
  updatedOrg.wealth += this.params.modAmount;

  this.eventData = {
    type: 'cashmod',
    resolution: {
      updatedGameData,
    },
  };

  return this.eventData;
}

/**
 * Resolve an attack zone event.
 */
function resolveAttackZone(this: GameEvent, gameManager: GameManager) {
  const { gameData } = gameManager;
  const updatedGameData: {
    people: { [x: string]: Person };
    zones: { [x: string]: Zone };
  } = {
    people: {},
    zones: {},
  };
  let f: any = {};
  this.params.plot?.resolution.data.characters.attackers.forEach(
    (agent: Person) => {
      updatedGameData.people[agent.id] = agent;
    },
  );
  this.params.plot?.resolution.data.characters.defenders.forEach(
    (agent: Person) => {
      updatedGameData.people[agent.id] = agent;
    },
  );
  if (this.params.plot?.resolution.data.victoryResult === 1) {
    // const updatedZone = JSON.parse(
    //   JSON.stringify(this.params.plot.plotParams.zone)
    // );
    // updatedZone.organizationId = gameData.player.organizationId;
    // updatedZone.nationId = gameData.player.empireId;
    // --

    const updatedZone = {
      ...gameManager.gameData.zones[this.params?.plot?.plotParams?.zone?.id!],
      organizationId: gameData.player.empireId,
      nationId: gameData.player.empireId,
    };
    updatedGameData.zones[updatedZone.id] = updatedZone;
    f = transferZoneControl(gameManager, {
      zoneId: this.params.plot.plotParams?.zone?.id!,
      nationId: gameData.player.empireId,
      organizationId: gameData.player.organizationId,
    });
  }
  const preupdateEmpire = getEvilEmpire(gameManager);
  const evilEmpire: GoverningOrganization = {
    ...preupdateEmpire,
    totalEvil: preupdateEmpire.totalEvil + 10,
  };
  f.governingOrganizations = {};
  f.governingOrganizations[evilEmpire.id] = evilEmpire;
  this.eventData = {
    type: 'attack-zone',
    resolution: {
      updatedGameData: f,
    },
  };

  return this.eventData;
}
function resolveIntruderAlert(this: GameEvent, gameManager: GameManager) {
  const { gameData } = gameManager;

  this.eventData = {
    type: 'intruder-alert',
    resolution: {
      updatedGameData: takeCaptive(
        gameManager,
        gameData.player.organizationId,
        gameData.people[this.params.intruderId!],
      ),
    },
  };

  return this.eventData;
}

function resolveProjectComplete(this: GameEvent, gameManager: GameManager) {
  const { gameData } = gameManager;

  this.eventData = {
    type: 'project-complete',
    resolution: {
      updatedGameData: {},
    },
  };
}
/**
 *
 */
function resolveMonthlyReport(this: GameEvent, gameManager: GameManager) {
  const { gameData } = gameManager;
  const {
    gameData: {
      player: { organizationId },
    },
  } = gameManager;

  const updatedGameData: {
    governingOrganizations: { [x: string]: GoverningOrganization };
  } = {
    governingOrganizations: {},
  };

  const updatedOrg: GoverningOrganization = {
    ...gameData.governingOrganizations[organizationId],
  };
  const expenses = getExpenses(gameManager, organizationId);
  const expensesTotal = Object.values(expenses).reduce(
    (total, currentExpense) => {
      return total + currentExpense;
    },
    0,
  );
  const { wealth } = getOrgResources(gameManager, organizationId);

  const netTotal = wealth - expensesTotal;
  updatedOrg.wealth += netTotal;
  updatedGameData.governingOrganizations[updatedOrg.id] = updatedOrg;
  this.eventData = {
    type: 'monthly-report',
    resolution: {
      updatedGameData,
    },
  };

  return this.eventData;
}

/**
 * Sets `event.params` to an empty object. Should be used for
 * events that take no parameters.
 */
function setEmptyParams(this: GameEvent) {
  this.params = {};
}

interface EventConfig {
  name: string;
  setParams: Function;
  resolve: Function;
  getEventText: Function;
}

/**
 * Event configuration to be used with GameEvents
 */
const eventConfig: { [x: string]: EventConfig } = {
  recruit: {
    name: 'EVIL Applicant',
    setParams: setEvilApplicantParams,
    resolve: resolveEvilApplicant,
    getEventText(this: GameEvent) {
      this.eventText = `A citizen, ${this.params.recruit?.name}, has applied to become an EVIL Agent.`;
    },
  },
  standardReport: {
    name: 'Standard Report',
    setParams: setEmptyParams,
    resolve: resolveStandardReport,
    getEventText(this: GameEvent) {
      this.eventText = `There is nothing special to report.`;
    },
  },
  combat: {
    name: 'Combat',
    setParams: setCombatParams,
    getEventText(this: GameEvent) {
      this.eventText = `Combat has occured!`;
    },
    resolve: () => {},
  },
  wealthMod: {
    name: 'Wealth Change',
    setParams: setWealthModParams,
    resolve: resolveWealthMod,
    getEventText(this: GameEvent) {
      this.eventText = `The Empire's wealth has fluctuated by ${this.params.modAmount}`;
    },
  },
  attackZone: {
    name: 'Attack Zone',
    setParams: setAttackZoneParams,
    resolve: resolveAttackZone,
    getEventText(this: GameEvent) {
      this.eventText = `The Empire has attacked a Zone!`;
    },
  },
  reconZone: {
    name: 'Recon Zone',
    setParams: setReconZoneParams,
    resolve: resolveReconZone,
    getEventText(this: GameEvent) {
      this.eventText = 'Update me';
    },
  },
  monthEndReport: {
    name: 'Monthly Report',
    setParams: setMonthlyReportParams,
    resolve: resolveMonthlyReport,
    getEventText(this: GameEvent) {
      this.eventText = 'The month has ended.';
    },
  },
  intruder: {
    name: 'Intruder Alert!',
    setParams: setIntruderAlertParams,
    resolve: resolveIntruderAlert,
    getEventText(this: GameEvent) {
      this.eventText = 'An intruder has been spotted';
    },
  },
  projectComplete: {
    name: 'Science Project Complete',
    setParams: setProjectCompleteParams,
    resolve: resolveProjectComplete,
    getEventText(this: GameEvent) {
      this.eventText = 'A project has been completed!';
    },
  
  },
};

interface EventData {
  type: string;
  resolution: {
    updatedGameData?: Partial<GameData>;
    additionalData?: {
      [x: string]: Object | string | number | boolean;
    };
  };
}

/**
 * A GameEvent.
 */
class GameEvent {
  getEventText: Function;
  eventText?: string;
  setParams: Function;
  resolveEvent: Function;
  eventData: EventData;
  eventName: string;
  params: {
    plot?: Plot;
    organizationId?: string;
    department?: number;
    recruit?: Person;
    modAmount?: number;

    aggressingForce?: Person[];
    defendingForce?: Person[];

    income?: number;
    expenses?: number;
    intruderId?: string;
    projectIndexName?: string;
  };
  /**
   * Create a game event using configuration.
   * @param config
   * @param eventSetupData - An object of arbitrary data pertinent to event setup
   */
  constructor(config: EventConfig, eventSetupData = {}) {
    /**
     * Gets the event text based on params
     */
    this.getEventText = config.getEventText.bind(this);
    /**
     * Set parameters for the event.
     */
    this.setParams = config.setParams.bind(this);
    /**
     */
    this.resolveEvent = config.resolve;

    this.eventData = {
      type: '',
      resolution: {},
    };

    this.params = {};
    /**
     * The name of the event
     */
    this.eventName = config.name;
    this.setParams(eventSetupData);
    this.getEventText();
  }
}

/**
 * Create and return a new Standard Report Game Event
 */
const generateStandardReportEvent = () => {
  return new GameEvent(eventConfig.standardReport);
};

const generateProjectCompleteEvent = (projectResult: ScienceProjectResult) => {
  return new GameEvent(eventConfig.projectComplete, {
    projectIndexName: projectResult.indexName,
  });
}

const generateMonthlyReportEvent = (gameManager: GameManager) => {
  const { gameData } = gameManager;
  const { organizationId } = gameData.player;
  const upkeep = getUpkeep(gameManager, organizationId);
  const payroll = getPayroll(gameManager, organizationId);
  return new GameEvent(eventConfig.monthEndReport, {
    expenses: {
      payroll,
      upkeep,
    },
    income: {
      buildingWealth: getOrgResources(gameManager, organizationId).wealth,
    },
  });
};

/**
 * Create and return a new Wealth Mod Game Event
 */
const generateWealthMod = () => {
  return new GameEvent(eventConfig.wealthMod);
};

/**
 * Create and return a new Attack Zone Plot Event
 */
const generateAttackZonePlotEvent = (plot: Plot) => {
  return new GameEvent(eventConfig.attackZone, {
    plot,
  });
};

const generateReconZoneEvent = (plot: Plot) => {
  return new GameEvent(eventConfig.reconZone, { plot });
};

const generateIntruderAlertEvent = (gameManager: GameManager) => {
  // Determine which nation this intruder is from
  const possibleNations = Object.values(
    gameManager.gameData.governingOrganizations,
  ).filter((org) => !org.evil);
  const org = possibleNations[randomInt(0, possibleNations.length - 1)];
  const orgAgents = getPeople(gameManager, {
    // excludePersonnel: true,
    organizationId: org.id,
    agentFilter: {
      department: -1,
      agentsOnly: true,
    },
  });
  const agent = orgAgents[randomInt(0, orgAgents.length - 1)];
  const event = new GameEvent(eventConfig.intruder, {
    intruderId: agent.id,
  });
  return event;
};

/**
 * Create and return a new EVIL Applicant Game Event
 */
const generateEvilApplicantEvent = (gameManager: GameManager) => {
  const { gameData } = gameManager;
  const playerZonesArray = getControlledZones(
    gameManager,
    gameData.player.organizationId,
  );
  if (
    getAgents(gameManager, gameData.player.organizationId).length >=
    getMaxAgents(gameManager, gameData.player.organizationId)
  ) {
    return null;
  }

  const potentialRecruits: Person[] = [];
  playerZonesArray.map((zone) => {
    getZoneCitizens(gameManager, zone.id, true).forEach((person) => {
      potentialRecruits.push(person);
    });
  });

  if (potentialRecruits.length === 0) {
    throw new Error('NoAvailableAgents');
  }
  const recruitIndex = randomInt(0, potentialRecruits.length - 1);
  const selectedAgent = potentialRecruits[recruitIndex];

  const event = new GameEvent(eventConfig.recruit, {
    recruit: selectedAgent,
    organizationId: gameData.player.organizationId,
    department: 0,
  });
  return event;
};

/**
 * Generates events for each plot resolution
 */
const addPlotResolutions = (
  plotResolutions: PlotResolution[],
  eventQueue: GameEventQueue,
) => {
  const plotResolutionEvents: GameEvent[] = [];
  plotResolutions.forEach((plotResolution) => {
    let resolutionEvent: GameEvent | null = null;
    switch (plotResolution.plot.plotType) {
      case 'attack-zone':
        resolutionEvent = generateAttackZonePlotEvent(plotResolution.plot);
        break;
      case 'recon-zone':
        resolutionEvent = generateReconZoneEvent(plotResolution.plot);
        break;

      default:
        break;
    }
    if (resolutionEvent) {
      plotResolutionEvents.push(resolutionEvent);
      eventQueue.addEvent(resolutionEvent);
    }
  });
  return plotResolutionEvents;
};

/**
 * Manages game events
 */
class GameEventQueue {
  events: GameEvent[];
  eventIndex: number;
  /**
   * Initialize the GameEventQueue
   * @param {GameEvent[]} events
   */
  constructor(events?: GameEvent[]) {
    /**
     * @type {GameEvent[]}
     */
    this.events = events || [];
    this.eventIndex = 0;
  }

  /**
   * Resolve the current game event with player input (resolveArgs)
   */
  //@ts-ignore
  resolveCurrentEvent(gameManager: GameManager, resolveArgs) {
    const { gameData } = gameManager;
    return this.events[this.eventIndex].resolveEvent(gameManager, resolveArgs);
  }

  /**
   * Set the event index to the next event
   */
  incrementEventIndex() {
    this.eventIndex = this.eventIndex + 1;
  }

  /**
   * Set the events for the queue to handle. This method
   * should not be used to add events to a queue with
   * existing events, as it will replace the contents
   * of the array.
   */
  setEvents(events: GameEvent[]) {
    this.events = events;
  }

  /**
   * Push a new event to the queue.
   */
  addEvent(event: GameEvent) {
    this.events.push(event);
  }

  /**
   * Concatenates an array of events to the queue.
   * This should be used instead of `setEvents`
   * when multiple events should be appended to the
   * queue at once when the array is not empty.
   */
  addEvents(events: GameEvent[]) {
    this.events.concat(events);
  }

  /**
   * Return the current game event
   */
  getCurrentEvent() {
    return this.events[this.eventIndex];
  }

  /**
   * Clear the event queue. This should be done after
   * all events are resolved.
   */
  clearEvents() {
    this.events = [];
    this.eventIndex = 0;
  }
}

const eventShufflebag = Shufflebag({
  EvilApplicantEvent: 1,
  WealthModEvent: 2,
  nothing: 3,
  IntruderAlert: 1,
});
/**
 * Add a set of random events to the event queue
 */
const prepareRandomEvents = (gameManager: GameManager) => {
  const { gameData } = gameManager;
  const events: GameEvent[] = [];
  for (let potentialEvents = 0; potentialEvents < 1; potentialEvents++) {
    const eventType = eventShufflebag.next();

    let event;
    switch (eventType) {
      case 'EvilApplicantEvent':
        try {
          event = generateEvilApplicantEvent(gameManager);

          events.push(event!);
        } catch (e) {
          console.log(e);
          break;
        }
        break;

      case 'WealthModEvent':
        event = generateWealthMod();
        events.push(event);
        break;
      case 'IntruderAlert':
        event = generateIntruderAlertEvent(gameManager);
        events.push(event);
        break;
      default:
        break;
    }
  }
  if (events.length === 0) {
    events.push(generateStandardReportEvent());
  }

  // If this is the last day of the month, set the EOM event
  // Get the game date
  const gd = new Date(gameData.gameDate);
  const month = gd.getMonth();
  const year = gd.getFullYear() + 1;
  //@ts-ignore
  const monthEnd = new Date(new Date(year, month, 1) - 1);
  const day = gd.getDate();

  if (monthEnd.getDate() === day) {
    events.push(generateMonthlyReportEvent(gameManager));
  }

  return events;
};

export {
  GameEventQueue,
  generateStandardReportEvent,
  generateEvilApplicantEvent,
  generateWealthMod,
  generateAttackZonePlotEvent,
  addPlotResolutions,
  eventConfig,
  prepareRandomEvents,
  generateMonthlyReportEvent,
  generateIntruderAlertEvent,
  generateProjectCompleteEvent
};
