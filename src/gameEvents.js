const { generateAgentData } = require("./generators/game");
const { getMaxAgents, getAgents, getControlledZones } = require("./organization");
const { getZoneCitizens } = require("./zones");
const { Plot } = require("./plots");
const { randomInt } = require("./utilities");

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
 * Resolve a Standard Report Event
 * @param {import("./typedef").GameData} gameData 
 * @returns 
 */
function resolveStandardReport(gameData){
  this.eventData = {
    type: "standard-report",
    updatedGameData: gameData,
  };
  return this.eventData;
}

/**
 * Resolve an Evil Applicant Event
 * @param {import("./typedef").GameData} gamedata 
 * @param {*} resolveArgs 
 */
function resolveEvilApplicant(gameData, resolveArgs){
  let result;
  const updatedGameData = {
    people: {},
  };
  switch (resolveArgs.resolutionValue) {
    case 1:
      this.params.department = parseInt(resolveArgs.data.department);
      result = generateAgentData(
        this.params.organizationId,
        this.params.department,
        resolveArgs.data.commander
      );
      const updatedAgent = JSON.parse(JSON.stringify(gameData.people[this.params.recruit.id]));
      updatedAgent.agent = result;
      updatedGameData.people[this.params.recruit.id] = updatedAgent;
      break;

    default:
      break;
  }

  this.eventData = {
    type: "recruit",
    result,
    updatedGameData,
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
    result: this.params.modAmount,
    updatedGameData,
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
    result: this.plotResolution,
    updatedGameData,
  };
  console.log(this.eventData);
  return this.eventData;
}

/**
 * Sets `event.params` to an empty object. Should be used for 
 * events that take no parameters.
 */
function setEmptyParams(){
  this.params = {};
}
const eventConfig = {
  recruit: {
      name: "EVIL Applicant",
      setParams: setEvilApplicantParams,
      /**
       * @type {import("./typedef").EventOrPlotRequirements}
       */
      requirements: {
        people: {
          eoeCitizenAvailable: true
        }
      },
      resolve: resolveEvilApplicant,
      getEventText(){
        this.eventText = `A citizen, ${this.params.recruit.name}, has applied to become an EVIL Agent.`
      }
  },
  standardReport: {
      name: "Standard Report",
      setParams: setEmptyParams,
      requirements: {},
      resolve: resolveStandardReport,
      getEventText(){
        this.eventText = `There is nothing special to report.`
      }
  },
  combat: {
      name: "Combat",
      setParams: setCombatParams,
      requirements: {},
      getEventText(){
        this.eventText = `Combat has occured!`
      }
  },
  wealthMod: {
      name: "Wealth Change",
      setParams: setWealthModParams,
      requirements: {},
      resolve: resolveWealthMod,
      getEventText(){
        this.eventText = `The Empire's wealth has fluctuated by ${this.params.modAmount}`
      }
  },
  attackZone: {
      name: "Attack Zone",
      setParams: setAttackZoneParams,
      requirements: {},
      resolve: resolveAttackZone,
      getEventText(){
        this.eventText = `The Empire has attacked a Zone!`
      }
  }
}

/**
 * A base GameEvent.
 */
class GameEvent {
  eventData;
  /**
   * @type {import("./typedef").EventOrPlotRequirements}
   */
  requirements;
  params;
  /**
   * Create a game event
   * @param {import("./typedef").EventConfigOptions} eventConfig
   * @param {Object} eventSetupData - An object of arbitrary data pertinent to event setup
   */
  constructor(eventConfig, eventSetupData = {}) {
    this.setParams = eventConfig.setParams.bind(this);
    this.getEventText = eventConfig.getEventText.bind(this);
    this.params = {}
    this.setParams(eventSetupData);
    this.getEventText();
    this.eventName = eventConfig.name;
    this.requirements = eventConfig.requirements;
    this.resolveEvent = eventConfig.resolve;
  }

  /**
   * Fires the inital logic of the event
   */
  executeEvent() {}

  /**
   * Finish the event, running any finalization steps as needed.
   * This is the step at which data input by the player should be
   * considered/handled by subclasses.
   * @returns {object}
   */
  resolveEvent() {
    console.log("Resolve Event: ", this.eventName, this.eventData)
    return this.eventData;
  }
}

const generateStandardReportEvent = () => {
  // return new StandardReportEvent();
  const config = eventConfig.standardReport;
  return new GameEvent(config);
};

const generateWealthMod = () => {
  const config = eventConfig.wealthMod;
  return new GameEvent(config);
};

/**
 *
 * @param {Plot} plot
 * @returns
 */
const generateAttackZonePlotEvent = (plot) => {
  const config = eventConfig.attackZone;
  return new GameEvent(config, {
    plot
  });
};
/**
 *
 * @param {import("./typedef").Person[]} peopleArray
 * @param {*} playerOrganizationId
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

  // const event = new EvilApplicantEvent(selectedAgent, gameData.player.organizationId, 0);
  const event = new GameEvent(eventConfig.recruit, {
    recruit: selectedAgent,
    organizationId: gameData.player.organizationId,
    department: 0
  })
  return event;
};

/**
 * Generates events for each plot resolution
 * @param {*} plotResolutions
 * @param {*} eventQueue
 * @returns
 */
const addPlotResolutions = (plotResolutions, eventQueue) => {
  const plotResolutionEvents = [];
  plotResolutions.forEach((plotResolution) => {
    let resolutionEvent;
    switch (plotResolution.plot.plotType) {
      case "attack-zone":
        resolutionEvent = generateAttackZonePlotEvent(plotResolution.plot);
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

class GameEventQueue {
  /**
   * Initialize the GameEventQueue
   * @param {GameEvent[]} events
   */
  constructor(events) {
    this.events = events || [];
    this.eventIndex = 0;
  }

  /**
   * Fire the game event.
   */
  executeCurrentEvent() {
    const currentEvent = this.events[this.eventIndex];
    currentEvent.executeEvent();
  }

  /**
   * Resolve the current game event with player input (resolveArgs)
   * @param {*} gamedata
   * @param {*} resolveArgs
   * @returns
   */
  resolveCurrentEvent(gamedata, resolveArgs) {
    return this.events[this.eventIndex].resolveEvent(gamedata, resolveArgs);
  }

  /**
   * Set the event index to the next event
   */
  incrementEventIndex() {
    this.eventIndex = this.eventIndex + 1;
    console.log("Event Index: ", this.eventIndex);
  }

  /**
   * Set the events for the queue to handle
   * @param {*} events
   */
  setEvents(events) {
    this.events = events;
  }
  addEvent(event) {
    this.events.push(event);
  }
  addEvents(events) {
    this.events.concat(events);
  }
  /**
   * Return the current game event
   * @returns
   */
  getCurrentEvent() {
    return this.events[this.eventIndex];
  }

  /**
   * Clear the event queue
   */
  clearEvents() {
    this.events = [];
  }
}

module.exports = {
  GameEventQueue,
  generateStandardReportEvent,
  generateEvilApplicantEvent,
  generateWealthMod,
  generateAttackZonePlotEvent,
  addPlotResolutions,
  eventConfig
};
