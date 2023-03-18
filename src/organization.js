const { generateAgentData } = require("./generators/game");
const { throwErrorFromArray } = require("./utilities");

/**
 * Returns a copy of the recruited person
 * @param {string} organizationId - The recruiting org's id
 * @param {import("./typedef").Person} person - the person being recruited
 * @returns {import("./typedef").Person} The updated person
 */
const recruitAgent = (organizationId, person, department=0) => {
    return {
        ...person,
        agent: {
            organizationId,
            department
        }
    }
}

/**
 * 
 * @param {import("./typedef").Person[]} peopleArray 
 * @param {string} organizationId 
 * @returns {import("./typedef").Person[]}
 */
const getAgents = (gameData, organizationId, excludeCorpses = true) => {
    const errors = [];
    if (!organizationId){
        errors.push("'organizationId' is a required parameter")
    }
    throwErrorFromArray(errors);
    return Object.values(gameData.people).filter((person) => {
        if (excludeCorpses && person.currentHealth <= 0){
            return false;
        }
        return person.agent && person.agent.organizationId === organizationId
    })
}

/**
 * Return the agents in a zone.
 * @param {import("./typedef").GameData} gameData 
 * @param {string} organizationId 
 * @param {string} zoneId 
 * @returns 
 */
const getAgentsInZone = (gameData, organizationId, zoneId) => {
    const peopleArray = Object.values(gameData.people);
    const errors = [];
    if (!organizationId){
        errors.push("'organizationId' is a required parameter")
    }
    if (!zoneId){
        errors.push("'zoneId' is a required parameter")
    }
    throwErrorFromArray(errors);
    return peopleArray.filter((person) => person.agent && person.agent.organizationId === organizationId && person.homeZoneId === zoneId);
}

/**
 * Return the max number of agents an organization can support.
 * @param {import("./typedef").Person[]} peopleArray - An array of all people
 * @param {string} organizationId
 */
const getMaxAgents = (gameData, organizationId) => {
    const peopleArray = Object.values(gameData.people);
    return peopleArray.reduce((maxAgentValue, currentAgent) => {
        if (currentAgent.agent && currentAgent.agent.organizationId === organizationId){

            return maxAgentValue + currentAgent.leadership
        }

        return maxAgentValue;
    }, 0);
}

/**
 * 
 * @param {import("./typedef").GameData} gameData 
 * @param {import("./typedef").Person} agent 
 */
const getAgentSubordinates = (gameData, agent) => {
    const peopleArray = Object.values(gameData.people);
    return peopleArray.filter((person)=> person.agent && person.agent.commanderId === agent.id)
}

/**
 * Return the science value of an org.
 * @param {import("./typedef").Person[]} peopleArray - An array of all people
 * @param {string} organizationId
 */
const getScience = (gameData, organizationId) => {
    return getAgents(gameData, organizationId).reduce((science, currentAgent) => {
        if (currentAgent.agent.department === 2){
            return science + currentAgent.intelligence
        }

        return science;
    }, 0);
}

/**
 * Return the infra value of an org.
 * @param {import("./typedef").Person[]} peopleArray - An array of all people
 * @param {string} organizationId
 */
const getInfrastructure = (gameData, organizationId) => {
    return getAgents(gameData, organizationId).reduce((infrastructure, currentAgent) => {
        if (currentAgent.agent.department === 1 || currentAgent.agent.department === 3){
            return infrastructure + currentAgent.administration
        }

        return infrastructure;
    }, 0);
}

const getPayroll = (gameData, organizationId) => {
    return getAgents(gameData, organizationId).reduce((payroll, currentAgent) => {
       
        return payroll + currentAgent.agent.salary;
    }, 0);
}

/**
 * 
 * @param {import("./typedef").GameData} gameData 
 * @param {string} organizationId 
 */
const getControlledZones = (gameData, organizationId) => {
    /**
     * @type {import("./typedef").Zone[]}
     */
    const zonesArray = Object.values(gameData.zones);
    return zonesArray.filter(zone => zone.organizationId === organizationId);
}

/**
 * 
 * @param {import("./typedef").Person} agent 
 * @param {string} organizationId 
 * @param {number} department 
 * @param {string} commanderId 
 * @param {number} salary 
 * @returns 
 */
const hireAgent = (agent, organizationId, department, commanderId, salary) => {
    if (agent.agent){
        console.log(`${agent.name} is already an agent.`)
        return null;
    }
    const agentData = generateAgentData(organizationId, department, commanderId, salary);
    agent.agent = agentData;
    return agent;
}

module.exports = {
    recruitAgent,
    getAgents,
    getMaxAgents,
    getScience,
    getInfrastructure,
    getPayroll,
    getAgentSubordinates,
    getControlledZones,
    hireAgent,
    getAgentsInZone
}