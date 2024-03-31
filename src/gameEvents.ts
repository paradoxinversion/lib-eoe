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
import { PlotResolution } from './plots';
import {
  Building,
  GoverningOrganization,
  Person,
  Zone,
} from './types/interfaces/entities';
import { randomInt, Shufflebag } from './utilities';
import { getResourceOutput, getUpkeep, getWealthBonuses } from './buildings';
import { getPeople } from './actions/people';
import { ScienceProjectResult } from './managers/scienceProjects';
import GameEvent, { EventConfig } from './events/GameEvent';
import GameEventQueue from './events/GameEventQueue';
import Plot, { PlotResult } from './plots/Plot';
import { PlotReconParams } from './plots/plotFunctions/recon';
import {
  EvilApplicantParams,
  setEvilApplicantParams,
} from './events/eventFunctions/applicant';
import {
  WealthModEventParams,
  setWealthModParams,
} from './events/eventFunctions/wealthMod';
import { setReconEventParams } from './events/eventFunctions/recon';

export interface CombatEventParams {
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
  this.params = {
    aggressingForce,
    defendingForce,
  };
}

export interface AttackZoneParams {
  plot: Plot;
}
/**
 * Set parameters for an Attack Zone Plot Event
 * @param {Object} AttackZonePlotEventParams
 * @param {Plot} AttackZonePlotEventParams.plot
 */
function setAttackZoneParams(this: GameEvent, { plot }: AttackZoneParams) {
  this.params = {
    plot,
  };
}

export interface MonthlyReportEventParams {
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
  this.params = {
    income,
    expenses,
  };
}

export interface IntruderAlertEventParams {
  intruderId: string;
}

function setIntruderAlertParams(
  this: GameEvent,
  { intruderId }: IntruderAlertEventParams,
) {
  this.params = {
    intruderId,
  };
}

export interface ReconZoneEventParams {
  plot: Plot;
}

export interface ProjectCompleteParams {
  projectIndexName: string;
  empireUpdate: Partial<GameData>;
}

function setProjectCompleteParams(
  this: GameEvent,
  { projectIndexName, empireUpdate }: ProjectCompleteParams,
) {
  this.params = {
    projectIndexName,
    empireUpdate,
  };
}

/**
 *
 */
function resolveReconZone(this: GameEvent) {
  const params = this.params as ReconZoneEventParams;
  const resolution = params.plot.resolution as PlotResult;
  this.eventData = {
    type: 'recon-zone',
    resolution: {
      updatedGameData: resolution.updatedGameData,
    },
  };
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
  const params = this.params as EvilApplicantParams;

  switch (resolveArgs.resolutionValue) {
    case 1:
      const department = parseInt(resolveArgs.data.department);
      params.department = parseInt(resolveArgs.data.department);

      const updatedAgent: Person = JSON.parse(
        JSON.stringify(gameData.people[params.recruit?.id!]),
      );
      const salary = calculateAgentSalary(updatedAgent);
      const agentData = generateAgentData(
        params.organizationId!,
        params.department,
        salary,
        resolveArgs.data.commander,
      );
      updatedAgent.agent = agentData;
      updatedGameData.people[params.recruit?.id!] = updatedAgent;
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
  const params = this.params as WealthModEventParams;
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
  updatedOrg.wealth += params.modAmount;

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
  const params = this.params as AttackZoneParams;
  const result = params.plot.resolution as PlotResult;
  this.eventData = {
    type: 'attack-zone',
    resolution: {
      updatedGameData: result.updatedGameData,
    },
  };

  return this.eventData;
}
function resolveIntruderAlert(this: GameEvent, gameManager: GameManager) {
  const { gameData } = gameManager;
  const params = this.params as IntruderAlertEventParams;
  this.eventData = {
    type: 'intruder-alert',
    resolution: {
      updatedGameData: takeCaptive(
        gameManager,
        gameData.player.organizationId,
        gameData.people[params.intruderId!],
      ),
    },
  };

  return this.eventData;
}

function resolveProjectComplete(this: GameEvent, gameManager: GameManager) {
  const { gameData } = gameManager;
  const params = this.params as ProjectCompleteParams;
  this.eventData = {
    type: 'project-complete',
    resolution: {
      updatedGameData: params.empireUpdate,
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

/**
 * Event configuration to be used with GameEvents
 */
const eventConfig: { [x: string]: EventConfig } = {
  recruit: {
    name: 'EVIL Applicant',
    setParams: setEvilApplicantParams,
    resolve: resolveEvilApplicant,
    getEventText(this: GameEvent) {
      this.eventText = `A citizen, ${(this.params as EvilApplicantParams).recruit?.name}, has applied to become an EVIL Agent.`;
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
      this.eventText = `The Empire's wealth has fluctuated by ${(this.params as WealthModEventParams).modAmount}`;
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
    setParams: setReconEventParams,
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
 * Create and return a new Standard Report Game Event
 */
const generateStandardReportEvent = () => {
  return new GameEvent(eventConfig.standardReport);
};

const generateProjectCompleteEvent = (projectResult: ScienceProjectResult) => {
  return new GameEvent(eventConfig.projectComplete, {
    projectIndexName: projectResult.indexName,
    empireUpdate: projectResult.updatedGameData,
  });
};

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
  generateStandardReportEvent,
  generateEvilApplicantEvent,
  generateWealthMod,
  generateAttackZonePlotEvent,
  addPlotResolutions,
  eventConfig,
  prepareRandomEvents,
  generateMonthlyReportEvent,
  generateIntruderAlertEvent,
  generateProjectCompleteEvent,
};
