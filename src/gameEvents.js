const { doCombat } = require("./combat");
const { generatePeople, generateAgentData } = require("./generators/game");
const { throwErrorFromArray } = require("./utilities");

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
    constructor(aggressingForce, defendingForce){
        super();
        this.eventName = "Standard Report";
    }

    executeEvent(){
        this.eventData = {
            result: "All is well"
        };
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
        this.eventText = "";
    }

    
    executeEvent(){
        this.eventText = `${this.recruit.name} has applied to be an EVIL Agent!`;
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

class GameEventQueue {
    /**
     * 
     * @param {GameEvent[]} events 
     */
    constructor(events){
        this.events = events || [];
        this.eventIndex = 0;
    }

    executeCurrentEvent() {
        
        const currentEvent = this.events[this.eventIndex];
        currentEvent.executeEvent();

    }

    resolveCurrentEvent(gamedata, resolveArgs){
        return this.events[this.eventIndex].resolveEvent(gamedata, resolveArgs);
    }

    incrementEventIndex () {
        this.eventIndex = this.eventIndex + 1;
        console.log("Event Index: ", this.eventIndex)
    }

    setEvents(events){
        this.events = events;
    }

    getCurrentEvent(){
        return this.events[this.eventIndex];
    }
}


module.exports = {
    StandardReportEvent,
    CombatEvent,
    EvilApplicantEvent,
    GameEventQueue
}