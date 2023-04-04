const { generateAgentData } = require("./generators/game");
const { getMaxAgents, getAgents, getControlledZones, calculateAgentSalary, getPayroll } = require("./organization");
const { getZoneCitizens } = require("./zones");
const { Plot } = require("./plots");
const { randomInt, Shufflebag } = require("./utilities");
const { getUpkeep, getWealthBonuses } = require("./buildings");

/**
 * Set parameters for an Evil Applicant event
 * @param {Object} EvilApplicantParams
 * @param {import("./typedef").Person} EvilApplicantParams.recruit - A Person from the EOE who is not an agent
 * @param {string} EvilApplicantParams.organizationId - The EOE organizationId
 * @param {number} EvilApplicantParams.department - The default department for the Agent
 */
function setEvilApplicantParams({recruit, organizationId, department}){
  this.params.organizationId = organizationId;
  this.params.department = department;
  this.params.recruit = recruit;
}

/**
 * Set parameters for a Wealth Mod event
 */
function setWealthModParams(){
  this.params.modAmount = randomInt(-10,10);
}

/**
* Set parameters for a combat event
* @param {Object} CombatEventParams
* @param {import("./typedef").Person[]} CombatEventParams.aggressingForce 
* @param {import("./typedef").Person[]} CombatEventParams.defendingForce 
*/
function setCombatParams({aggressingForce, defendingForce}){
  this.params.aggressingForce = aggressingForce;
  this.params.defendingForce = defendingForce;
}

/**
 * Set parameters for an Attack Zone Plot Event
 * @param {Object} AttackZonePlotEventParams 
 * @param {Plot} AttackZonePlotEventParams.plot
 */
function setAttackZoneParams({plot}){
  this.params.plot = plot;
}

/**
 * 
 * @param {Object} MonthlyReportEventParams 
 * @param {Object.<string, number>} MonthlyReportEventParams.income
 * @param {Object.<string, number>} MonthlyReportEventParams.expenses
 */
function setMonthlyReportParams ({income, expenses}){
  this.params.income = income;
  this.params.expenses = expenses;
}

/**
 * 
 * @param {Object} ReconZoneEventParams
 * @param {Zone} ReconZoneEventParams.zone 
 * @param {import("./typedef").Person[]} ReconZoneEventParams.participants
 */
function setReconZoneParams({zone, participants, plot}){
  this.params.plot = plot;
  // this.params.zone = zone;
  // this.params.participants = participants;
}

function resolveReconZone(gameData, resolveArgs){
  const updatedGameData = {
    zones: {}
  }

  /**
   * @type {import("./typedef").Zone}
   */
  const updatedZone = JSON.parse(JSON.stringify(this.params.plot.plotParams.zone));
  updatedZone.intelligenceLevel += this.params.plot.resolution.data.intelligenceModifier;
  updatedGameData[updatedZone.id] = updatedZone
  this.eventData = {
    type: "recon-zone",
    resolution: {
      updatedGameData
    }
  }
  return this.eventData;
}

/**
 * Resolve a Standard Report Event
 * @returns 
 */
function resolveStandardReport(){
  this.eventData = {
    type: "standard-report",
    resolution: {
      updatedGameData: {},
    }
  };

  return this.eventData;
}

/**
 * Resolve an Evil Applicant Event
 * @param {import("./typedef").GameData} gamedata 
 * @param {*} resolveArgs 
 */
function resolveEvilApplicant(gameData, resolveArgs){
  const updatedGameData = {
    people: {},
  };

  switch (resolveArgs.resolutionValue) {
    case 1:
      this.params.department = parseInt(resolveArgs.data.department);

      /**
       * @type {import("./typedef").Person}
       */
      const updatedAgent = JSON.parse(JSON.stringify(gameData.people[this.params.recruit.id]));
      const salary = calculateAgentSalary(updatedAgent);
      const agentData = generateAgentData(
        this.params.organizationId,
        this.params.department,
        resolveArgs.data.commander,
        salary
      );
      updatedAgent.agent = agentData;
      updatedGameData.people[this.params.recruit.id] = updatedAgent;
      break;

    default:
      break;
  }

  this.eventData = {
    type: "recruit",
    resolution: {
      updatedGameData
    }
  };

  return this.eventData;
}

/**
 * Resolve a Wealth Modification event
 * @param {import("./typedef").GameData} gameData 
 * @returns 
 */
function resolveWealthMod(gameData){
  const updatedGameData = { governingOrganizations: {} };
  const updatedOrg = JSON.parse(JSON.stringify(gameData.governingOrganizations[gameData.player.organizationId]));
  updatedGameData.governingOrganizations[gameData.player.organizationId] = updatedOrg;
  updatedOrg.wealth += this.params.modAmount;

  this.eventData = {
    type: "cashmod",
    resolution: {
      updatedGameData
    }
  };
  
  return this.eventData;
}

/**
 * Resolve an attack zone event.
 * @param {import("./typedef").GameData} gameData 
 * @returns 
 */
function resolveAttackZone(gameData){
  const updatedGameData = {
    people: {},
    zones: {},
  };
  this.params.plot.resolution.data.characters.attackers.forEach((agent) => {
    updatedGameData.people[agent.id] = agent;
  });
  this.params.plot.resolution.data.characters.defenders.forEach((agent) => {
    updatedGameData.people[agent.id] = agent;
  });
  if (this.params.plot.resolution.data.victoryResult === 1) {
    const updatedZone = JSON.parse(JSON.stringify(this.params.plot.plotParams.zone));
    updatedZone.organizationId = gameData.player.organizationId;
    updatedZone.nationId = gameData.player.empireId;
    updatedGameData.zones[updatedZone.id] = updatedZone;
  }

  this.eventData = {
    type: "attack-zone",
    updatedGameData,
  };

  return this.eventData;
}

/**
 * 
 * @param {import("./typedef").GameData} gameData 
 */
function resolveMonthlyReport(gameData){
  /**
   * @type {import("./typedef").UpdatedGameData}
   */
  const updatedGameData = {
    governingOrganizations: {}
  };

  /**
   * @type {import("./typedef").GoverningOrganization}
   */
  const updatedOrg = JSON.parse(JSON.stringify(gameData.governingOrganizations[gameData.player.organizationId]))
  const expenses = Object.values(this.params.expenses).reduce((total, currentExpense) => {
    return total + currentExpense;
  }, 0);
  const income = Object.values(this.params.income).reduce((total, currentIncome) => {
    return total + currentIncome;
  }, 0);
  const netTotal = income - expenses;
  updatedOrg.wealth += netTotal;
  updatedGameData.governingOrganizations[updatedOrg.id] = updatedOrg;
  this.eventData = {
    type: "monthly-report",
    resolution: {
      updatedGameData
    }
  };

  return this.eventData;
}

/**
 * Sets `event.params` to an empty object. Should be used for 
 * events that take no parameters.
 */
function setEmptyParams(){
  this.params = {};
}

/**
 * Event configuration to be used with GameEvents
 * @type {import("./typedef").EventConfig}
 */
const eventConfig = {
  recruit: {
      name: "EVIL Applicant",
      setParams: setEvilApplicantParams,
      resolve: resolveEvilApplicant,
      getEventText(){
        this.eventText = `A citizen, ${this.params.recruit.name}, has applied to become an EVIL Agent.`
      }
  },
  standardReport: {
      name: "Standard Report",
      setParams: setEmptyParams,
      resolve: resolveStandardReport,
      getEventText(){
        this.eventText = `There is nothing special to report.`
      }
  },
  combat: {
      name: "Combat",
      setParams: setCombatParams,
      getEventText(){
        this.eventText = `Combat has occured!`
      }
  },
  wealthMod: {
      name: "Wealth Change",
      setParams: setWealthModParams,
      resolve: resolveWealthMod,
      getEventText(){
        this.eventText = `The Empire's wealth has fluctuated by ${this.params.modAmount}`
      }
  },
  attackZone: {
      name: "Attack Zone",
      setParams: setAttackZoneParams,
      resolve: resolveAttackZone,
      getEventText(){
        this.eventText = `The Empire has attacked a Zone!`
      }
  },
  reconZone: {
    name: "Recon Zone",
    setParams: setReconZoneParams,
    resolve: resolveReconZone,
    getEventText(){
      this.eventText = "Update me"
    }
  },
  monthEndReport: {
    name: "Monthly Report",
    setParams: setMonthlyReportParams,
    resolve: resolveMonthlyReport,
    getEventText(){
      this.eventText = "The month has ended."
    }
  }
}

/**
 * A GameEvent.
 */
class GameEvent {
  /**
   * Create a game event using configuration. 
   * @param {import("./typedef").EventConfigOptions} config
   * @param {Object} eventSetupData - An object of arbitrary data pertinent to event setup
   */
  constructor(config, eventSetupData = {}) {
    /**
     * Gets the event text based on params
     * @type {Function}
     */
    this.getEventText = config.getEventText.bind(this);
    /**
     * Set parameters for the event.
     * @type {Function}
    */
    this.setParams = config.setParams.bind(this);
    /**
     * @type {Function}
     */
    this.resolveEvent = config.resolve;
    /**
     * @type {import("./typedef").EventData}
     */
    this.eventData = {};
    /**
     * @type {Object.<string, Object>} 
     */
    this.params = {}
    /**
     * The name of the event
     * @type {string}
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

const generateMonthlyReportEvent = (gameData) => {
  const {organizationId} = gameData.player;
  const upkeep = getUpkeep(gameData, organizationId);
  const payroll = getPayroll(gameData, organizationId);
  const totalExpenses = upkeep + payroll;
  const buildingWealth = getWealthBonuses(gameData, organizationId);
  return new GameEvent(eventConfig.monthEndReport, { 
    expenses: {
      payroll,
      upkeep
    },
    income: {
      buildingWealth
    }
  })
}

/**
 * Create and return a new Wealth Mod Game Event
 */
const generateWealthMod = () => {
  return new GameEvent(eventConfig.wealthMod);
};

/**
 * Create and return a new Attack Zone Plot Event
 * @param {Plot} plot
 */
const generateAttackZonePlotEvent = (plot) => {
  return new GameEvent(eventConfig.attackZone, {
    plot
  });
};

const generateReconZoneEvent = (plot) => {
  return new GameEvent(eventConfig.reconZone, {plot})
}

/**
 * Create and return a new EVIL Applicant Game Event
 * @param {import("./typedef").GameData} gameData
 */
const generateEvilApplicantEvent = (
  gameData
) => {
  const playerZonesArray = getControlledZones(gameData, gameData.player.organizationId)
  if (
    getAgents(gameData, gameData.player.organizationId).length >=
    getMaxAgents(gameData, gameData.player.organizationId)
  ) {
    return null;
  }

  /**
   * @type {import("./typedef").Person[]}
   */
  const potentialRecruits = [];
  playerZonesArray.map(zone => {
    getZoneCitizens(gameData, zone.id, true).forEach(person => {
        potentialRecruits.push(person);
    })
  });

  if (potentialRecruits.length === 0){
    throw new Error("NoAvailableAgents")
  }
  const recruitIndex = randomInt(0, potentialRecruits.length - 1);
  const selectedAgent = potentialRecruits[recruitIndex];

  const event = new GameEvent(eventConfig.recruit, {
    recruit: selectedAgent,
    organizationId: gameData.player.organizationId,
    department: 0
  })
  return event;
};

/**
 * Generates events for each plot resolution
 * @param {import("./typedef").PlotResolution[]} plotResolutions
 * @param {GameEventQueue} eventQueue
 */
const addPlotResolutions = (plotResolutions, eventQueue) => {
  /**
   * @type {GameEvent[]}
   */
  const plotResolutionEvents = [];
  plotResolutions.forEach((plotResolution) => {
    /**
     * @type {GameEvent}
     */
    let resolutionEvent;
    switch (plotResolution.plot.plotType) {
      case "attack-zone":
        resolutionEvent = generateAttackZonePlotEvent(plotResolution.plot);
        break;
      case "recon-zone":
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
  /**
   * Initialize the GameEventQueue
   * @param {GameEvent[]} events
   */
  constructor(events) {
    /**
     * @type {GameEvent[]}
     */
    this.events = events || [];
    this.eventIndex = 0;
  }

  /**
   * Resolve the current game event with player input (resolveArgs)
   * @param {import("./typedef").GameData} gamedata
   * @param {import("./typedef").EventResolveArgs} resolveArgs
   */
  resolveCurrentEvent(gamedata, resolveArgs) {
    return this.events[this.eventIndex].resolveEvent(gamedata, resolveArgs);
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
   * @param {GameEvent[]} events
   */
  setEvents(events) {
    this.events = events;
  }

  /**
   * Push a new event to the queue.
   * @param {GameEvent} event 
   */
  addEvent(event) {
    this.events.push(event);
  }

  /**
   * Concatenates an array of events to the queue.
   * This should be used instead of `setEvents`
   * when multiple events should be appended to the 
   * queue at once when the array is not empty.
   * @param {GameEvent[]} events 
   */
  addEvents(events) {
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
  WealthModEvent: 1,
  nothing: 1,
});
/**
 * Add a set of random events to the event queue
 */
const prepareRandomEvents = (gameData) => {
  const events = [];
  for (let potentialEvents = 0; potentialEvents < 1; potentialEvents++) {
    const eventType = eventShufflebag.next();

    /**
     * @type {GameEvent}
     */
    let event;
    switch (eventType) {
      case "EvilApplicantEvent":
        try{
          event = generateEvilApplicantEvent(
            gameData
          );
          
          events.push(event);
        }catch(e){
          console.log(e)
          break;
        }
        break;

      case "WealthModEvent":
        event = generateWealthMod();
        events.push(event);
        break;
  
      default:
        break;
    }
    
  }
  if (events.length === 0){
    events.push(generateStandardReportEvent())
  }

  // If this is the last day of the month, set the EOM event
  // Get the game date
  const gd = new Date(gameData.gameDate);
  const month = gd.getMonth();
  const year = gd.getFullYear() + 1;
  const monthEnd = new Date((new Date(year, month, 1)) - 1);
  const day = gd.getDate();
  
  if (monthEnd === day){
    events.push(generateMonthlyReportEvent(gameData))
  }

  return events;
};



module.exports = {
  GameEventQueue,
  generateStandardReportEvent,
  generateEvilApplicantEvent,
  generateWealthMod,
  generateAttackZonePlotEvent,
  addPlotResolutions,
  eventConfig,
  prepareRandomEvents,
  generateMonthlyReport: generateMonthlyReportEvent
};
