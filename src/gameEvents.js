const { doCombat } = require("./combat");
const { generatePeople, generateAgentData } = require("./generators/game");
const { getMaxAgents, getAgents, getControlledZones } = require("./organization");
const { getZoneCitizens } = require("./zones");
const { Plot } = require("./plots");
const { throwErrorFromArray, randomInt } = require("./utilities");

/**
 * A base GameEvent.
 */
class GameEvent {
  eventData;
  /**
   * @type {import("./typedef").EventOrPlotRequirements}
   */
  requirements;
  /**
   * Create a game event
   */
  constructor() {
    this.eventName = "Uninitialized GameEvent";
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

class StandardReportEvent extends GameEvent {
  constructor() {
    super();
    this.eventName = "Standard Report";
    this.eventText = "Nothing to report.";
  }

  executeEvent() {
    this.eventData = {};
  }
  /**
   * Returns an updated version of gamedata and some metadata
   * @param {import("./typedef").GameData} gameData
   * @param {object} resolveArgs
   * @param {number} resolveArgs.resolutionValue - 0 Deny Applicant; 1 Accept Applicant
   * @param {object} resolveArgs.data
   * @param {number} resolveArgs.data.department - The department the recruit will be an agent in
   */
  resolveEvent(gameData, resolveArgs) {
    this.eventData = {
      type: "standard-report",
      updatedGameData: gameData,
    };
    return super.resolveEvent();
  }
}

/**
 * A combat event.
 * @extends GameEvent
 */
class CombatEvent extends GameEvent {
  constructor(aggressingForce, defendingForce) {
    super();
    this.eventName = "Combat";
    this.aggressingForce = aggressingForce;
    this.defendingForce = defendingForce;
  }

  executeEvent() {
    const errors = [];
    if (this.eventData) {
      errors.push("Combat event has already been executed");
    }
    throwErrorFromArray(errors);
    this.eventData = {
      type: "combat",
      result: doCombat(this.aggressingForce, this.defendingForce),
    };
  }
}

/**
 * A recruitment event
 * @extends GameEvent
 */
class EvilApplicantEvent extends GameEvent {
  /**
   * Create a recruitment event
   * @param {import("./typedef").Person} recruit
   * @param {string} organizationId
   * @param {number} department
   */
  constructor(recruit, organizationId, department = 0) {
    super();
    this.eventName = "EVIL Applicant";
    this.recruit = recruit;
    this.organizationId = organizationId;
    this.department = department;
    this.eventText = `${recruit.name} has applied to be an EVIL Agent!`;
  }

  executeEvent() {}

  /**
   * Returns an updated version of gamedata and some metadata
   * @param {import("./typedef").GameData} gameData
   * @param {object} resolveArgs
   * @param {number} resolveArgs.resolutionValue - 0 Deny Applicant; 1 Accept Applicant
   * @param {object} resolveArgs.data
   * @param {number} resolveArgs.data.department - The department the recruit will be an agent in
   * @param {string} resolveArgs.data.commander
   */
  resolveEvent(gameData, resolveArgs) {
    let result;
    const updatedGameData = {
      people: {},
    };
    switch (resolveArgs.resolutionValue) {
      case 1:
        this.department = parseInt(resolveArgs.data.department);
        result = generateAgentData(
          this.organizationId,
          this.department,
          resolveArgs.data.commander
        );
        const updatedAgent = JSON.parse(JSON.stringify(gameData.people[this.recruit.id]));
        updatedAgent.agent = result;
        updatedGameData.people[this.recruit.id] = updatedAgent;
        break;

      default:
        break;
    }

    this.eventData = {
      type: "recruit",
      result,
      updatedGameData,
    };
    return super.resolveEvent();
  }
}

class WealthModificationEvent extends GameEvent {
  constructor(amount) {
    super();
    this.eventName = "Wealth Change";
    this.modAmount = amount;
    this.eventText = `The empire has ${
      amount > 0 ? "gained" : "lost"
    } ${amount}$!`;
  }

  resolveEvent(gameData) {
    const updatedGameData = { governingOrganizations: {} };
    const updatedOrg = JSON.parse(JSON.stringify(gameData.governingOrganizations[gameData.player.organizationId]));
    updatedGameData.governingOrganizations[gameData.player.organizationId] = updatedOrg;
    updatedOrg.wealth += this.modAmount;
    this.eventData = {
      type: "cashmod",
      result: this.modAmount,
      updatedGameData,
    };
    return super.resolveEvent();
  }
}

class AttackZonePlotEvent extends GameEvent {
  constructor(plot) {
    super();
    this.eventName = "Attack Zone";
    this.eventText = `The empire has attacked a zone`;
    this.plot = plot;
  }

  resolveEvent(gameData, resolveArgs) {
    const updatedGameData = {
      people: {},
      zones: {},
    };
    this.plot.resolution.data.characters.attackers.forEach((agent) => {
      updatedGameData.people[agent.id] = agent;
    });
    this.plot.resolution.data.characters.defenders.forEach((agent) => {
      updatedGameData.people[agent.id] = agent;
    });
    if (this.plot.resolution.data.victoryResult === 1) {
      const updatedZone = JSON.parse(JSON.stringify(this.plot.plotParams.zone));
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
    return super.resolveEvent();
  }
}

const generateStandardReportEvent = () => {
  return new StandardReportEvent();
};

const generateWealthMod = () => {
  return new WealthModificationEvent(randomInt(-10, 10));
};

/**
 *
 * @param {Plot} plot
 * @returns
 */
const generateAttackZonePlotEvent = (plot) => {
  return new AttackZonePlotEvent(plot);
};
/**
 *
 * @param {import("./typedef").Person[]} peopleArray
 * @param {*} playerOrganizationId
 */
const generateEvilApplicantEvent = (
  gameData
) => {
  const peopleArray = Object.values(gameData.people);
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
    console.log("NAA")
    throw new Error("NoAvailableAgents")
  }
  const recruitIndex = randomInt(0, potentialRecruits.length - 1);
  const selectedAgent = potentialRecruits[recruitIndex];

  const event = new EvilApplicantEvent(selectedAgent, gameData.player.organizationId, 0);
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
  StandardReportEvent,
  CombatEvent,
  EvilApplicantEvent,
  GameEventQueue,
  generateStandardReportEvent,
  generateEvilApplicantEvent,
  generateWealthMod,
  generateAttackZonePlotEvent,
  addPlotResolutions,
};
