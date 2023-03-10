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
 * @param {*} peopleArray 
 * @param {*} organizationId 
 * @returns {import("./typedef").Person[]}
 */
const getAgents = (peopleArray, organizationId) => {
    const errors = [];
    if (!organizationId){
        errors.push("'organizationId' is a required parameter")
    }
    throwErrorFromArray(errors);

    return peopleArray.filter((person) => person.agent && person.agent.organizationId === organizationId);
}

/**
 * Return the max number of agents an organization can support.
 * @param {import("./typedef").Person[]} peopleArray - An array of all people
 */
const getMaxAgents = (peopleArray, organizationId) => {
    return peopleArray.reduce((maxAgentValue, currentAgent) => {
        if (currentAgent.agent && currentAgent.agent.organizationId === organizationId){

            return maxAgentValue + currentAgent.leadership
        }

        return maxAgentValue;
    }, 0);
}

const getScience = (peopleArray, organizationId) => {
    return getAgents(peopleArray, organizationId).reduce((science, currentAgent) => {
        if (currentAgent.agent.department === 2){
            return science + currentAgent.intelligence
        }

        return science;
    }, 0);
}

const getInfrastructure = (peopleArray, organizationId) => {
    
    return getAgents(peopleArray, organizationId).reduce((science, currentAgent) => {
        if (currentAgent.agent.department === 1){
            return science + currentAgent.administration
        }

        return science;
    }, 0);
}

module.exports = {
    recruitAgent,
    getAgents,
    getMaxAgents,
    getScience,
    getInfrastructure
}