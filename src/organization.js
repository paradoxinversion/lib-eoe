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

const getAgents = (peopleArray, organizationId) => {
    const errors = [];
    if (!organizationId){
        errors.push("'organizationId' is a required parameter")
    }
    throwErrorFromArray(errors);

    return peopleArray.filter((person) => person.agent && person.agent.organizationId === organizationId);
}

/**
 * 
 * @param {import("./typedef").Person[]} peopleArray 
 */
const getMaxAgents = (peopleArray, organizationId) => {
    return peopleArray.reduce((maxAgentValue, currentAgent) => {
        if (currentAgent.agent.organizationId === organizationId){

            return maxAgentValue + currentAgent.leadership
        }

        return maxAgentValue;
    }, 0);
}

module.exports = {
    recruitAgent,
    getAgents,
    getMaxAgents
}