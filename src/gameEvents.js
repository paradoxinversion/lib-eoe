const { doCombat } = require("./combat");
const { generatePeople, generateAgentData } = require("./generators/game");
const { throwErrorFromArray } = require("./utilities");

/**
 * A base GameEvent.
 */
class GameEvent {
    eventData;
    constructor(){
        this.eventName = "Uninitialized GameEvent";
    }

    /**
     * Fires the logic of the event
     */
    executeEvent(){

    }

    /**
     * Finish the event, running any finalization steps as needed
     */
    resolveEvent(){
        return this.eventData;
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

    resolveEvent(){
        return this.eventData;
    }
}

/**
 * A recruitment event
 * @extends GameEvent
 */
class RecruitEvent extends GameEvent {
    /**
     * 
     * @param {import("./typedef").Person} recruit 
     */
    constructor(recruit, organizationId, department = 0){
        this.eventName = "Agent Recruited";
        this.recruit = recruit;
        this.organizationId = organizationId;
        this.department = department;
    }

    resolveEvent(){
        generateAgentData(this.organizationId, this.department)
    }
}

module.exports = {
    CombatEvent,
    RecruitEvent
}