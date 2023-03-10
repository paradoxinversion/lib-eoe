const { doCombat } = require("./combat");
const { generatePeople, generateAgentData } = require("./generators/game");
const { getMaxAgents, getAgents } = require("./organization");
const { throwErrorFromArray, randomInt } = require("./utilities");

/**
 * A base GameEvent.
 */
class GameEvent {
    eventData;

    /**
     * Create a game event
     */
    constructor(){
        this.eventName = "Uninitialized GameEvent";
    }

    /**
     * Fires the inital logic of the event
     */
    executeEvent(){

    }

    /**
     * Finish the event, running any finalization steps as needed.
     * This is the step at which data input by the player should be
     * considered/handled by subclasses.
     * @returns {object}
     */
    resolveEvent(){
        return this.eventData;
    }
}

class StandardReportEvent extends GameEvent {
    constructor(){
        super();
        this.eventName = "Standard Report";
        this.eventText = "Nothing to report.";
    }

    executeEvent(){
        this.eventData = {};
    }
    /**
     * Returns an updated version of gamedata and some metadata
     * @param {object} resolveArgs 
     * @param {number} resolveArgs.resolutionValue - 0 Deny Applicant; 1 Accept Applicant
     * @param {object} resolveArgs.data
     * @param {number} resolveArgs.data.department - The department the recruit will be an agent in
     */
    resolveEvent(gameData, resolveArgs){
        this.eventData = {
            type: "standard-report",
            updatedGameData: gameData
        }
        return super.resolveEvent();
    }
}

/**
 * A combat event.
 * @extends GameEvent
 */
class CombatEvent extends GameEvent {
    constructor(aggressingForce, defendingForce){
        super();
        this.eventName = "Combat";
        this.aggressingForce = aggressingForce;
        this.defendingForce = defendingForce;
    }

    executeEvent(){
        const errors = []
        if (this.eventData){
            errors.push("Combat event has already been executed")
        }
        throwErrorFromArray(errors);
        this.eventData = {
            type: "combat",
            result: doCombat(this.aggressingForce, this.defendingForce)
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
    constructor(recruit, organizationId, department = 0){
        super();
        this.eventName = "EVIL Applicant";
        this.recruit = recruit;
        this.organizationId = organizationId;
        this.department = department;
        this.eventText = `${recruit.name} has applied to be an EVIL Agent!`;
    }

    
    executeEvent(){
    }
    
    /**
     * Returns an updated version of gamedata and some metadata
     * @param {object} resolveArgs 
     * @param {number} resolveArgs.resolutionValue - 0 Deny Applicant; 1 Accept Applicant
     * @param {object} resolveArgs.data
     * @param {number} resolveArgs.data.department - The department the recruit will be an agent in
     */
    resolveEvent(gameData, resolveArgs){
        let result;
        let updatedGameData = JSON.parse(JSON.stringify(gameData));
        switch (resolveArgs.resolutionValue) {
            case 1:
                this.department = parseInt(resolveArgs.data.department);
                result = generateAgentData(this.organizationId, this.department);
                updatedGameData.people[this.recruit.id].agent = result;
                break;

            default:
                break;
        }

        this.eventData = {
            type: "recruit",
            result,
            updatedGameData
        }
        return super.resolveEvent();
    }
}

class WealthModificationEvent extends GameEvent {
    constructor(amount){
        super();
        this.eventName = "Wealth Change";
        this.modAmount = amount;
        this.eventText = `The empire has ${amount > 0 ? "gained" : "lost"} ${amount}$!`
    }

    resolveEvent(gameData){
        let updatedGameData = JSON.parse(JSON.stringify(gameData));
        updatedGameData.governingOrganizations[gameData.player.organizationId].wealth += this.modAmount;
        // mod cash here
        this.eventData = {
            type: "cashmod",
            result: this.modAmount,
            updatedGameData
        }
        return super.resolveEvent();
    }
}

const generateStandardReportEvent = () => {
    return new StandardReportEvent();
}

const generateWealthMod = () => {
    return new WealthModificationEvent(randomInt(-10,10))
}

/**
 * 
 * @param {import("./typedef").Person[]} peopleArray 
 * @param {*} playerOrganizationId 
 */
const generateEvilApplicantEvent = (peopleArray, playerOrganizationId) => {
    if (peopleArray.length === 0){
        return null;
    }

    if (getAgents(peopleArray, playerOrganizationId).length >= getMaxAgents(peopleArray, playerOrganizationId)){
        return null;
    }

    const recruitIndex = randomInt(0, peopleArray.length);
    const selectedAgent = peopleArray[recruitIndex];

    const event = new EvilApplicantEvent(selectedAgent, playerOrganizationId, 0);
    return event;
}

class GameEventQueue {
    /**
     * Initialize the GameEventQueue
     * @param {GameEvent[]} events 
     */
    constructor(events){
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
    resolveCurrentEvent(gamedata, resolveArgs){
        return this.events[this.eventIndex].resolveEvent(gamedata, resolveArgs);
    }

    /**
     * Set the event index to the next event
     */
    incrementEventIndex () {
        this.eventIndex = this.eventIndex + 1;
        console.log("Event Index: ", this.eventIndex)
    }

    /**
     * Set the events for the queue to handle
     * @param {*} events 
     */
    setEvents(events){
        this.events = events;
    }

    /**
     * Return the current game event
     * @returns 
     */
    getCurrentEvent(){
        return this.events[this.eventIndex];
    }

    /**
     * Clear the event queue
     */
    clearEvents(){
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
}