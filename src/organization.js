const GameManager = require("./GameManager");
const { generateAgentData } = require("./generators/game");
const { getActivityParticipants } = require("./plots");
const { throwErrorFromArray } = require("./utilities");

/**
 * Returns a copy of the recruited person
 * @param {string} organizationId - The recruiting org's id
 * @param {import("./typedef").Person} person - the person being recruited
 * @returns {import("./typedef").Person} The updated person
 */
const recruitAgent = (organizationId, person, department = 0) => {
  return {
    ...person,
    agent: {
      organizationId,
      department,
    },
  };
};

/**
 *
 * @param {GameManager} gameManager
 * @param {string} organizationId
 * @param {Object}
 * @returns {import("./typedef").Person[]}
 */
const getAgents = (
  gameManager,
  organizationId,
  excludeCorpses = true,
  excludeUnavailable = false
) => {
  return _getAgents(gameManager, {
    organizationId,
    exclude: {
      corpses: excludeCorpses,
      unavailable: excludeUnavailable,
    },
  });
};

/**
 *
 * @param {GameManager} gameManager
 * @param {Object} parameters
 * @param {string} parameters.organizationId - The id of the org to retrieve agents for
 * @param {Object} [parameters.filter]
 * @param {string} [parameters.filter.zoneId] - Limit returned agents to the zoneId
 * @param {number} [parameters.filter.department] - Limit returned agents to the department
 * @param {Object} [parameters.exclude]
 * @param {boolean} [parameters.exclude.corpses] - Exclude dead agents from the return array
 * @param {boolean} [parameters.exclude.unavailable] - Exclude agents that are engaged in plots or activities from the return array
 * @param {boolean} [parameters.exclude.personnel] - Exclude agents that are marked as building personnel
 */
const _getAgents = (gameManager, parameters) => {
  const { gameData } = gameManager;
  if (!parameters.organizationId) {
    console.error("parameters.organizationId is required.");
  }

  return Object.values(gameData.people).filter((person) => {
    if (!person.agent) {
      return false;
    }

    if (person.agent.organizationId !== parameters.organizationId) {
      return false;
    }

    if (parameters.filter) {
      if (parameters.filter.department !== undefined) {
        if (parameters.filter.department !== person.agent.department) {
          return false;
        }
      }

      if (
        parameters.filter.zoneId &&
        parameters.filter.zoneId !== person.homeZoneId
      ) {
        return false;
      }
    }

    if (parameters.exclude) {
      if (parameters.exclude.corpses && person.currentHealth <= 0) {
        return false;
      }
      if (
        parameters.exclude.unavailable &&
        !person.agent.availableForAssignment
      ) {
        return false;
      }

      if (parameters.exclude.personnel) {
        return !!!Object.values(gameData.buildings).find((building) =>
          building.personnel.includes(person.id)
        );
      }
    }

    return true;
  });
};

/**
 * Return the agents in a zone.
 * @param {GameManager} gameManager
 * @param {string} organizationId
 * @param {string} zoneId
 * @returns
 */
const getAgentsInZone = (gameManager, organizationId, zoneId) => {
  const { gameData } = gameManager;
  const peopleArray = Object.values(gameData.people);
  const errors = [];
  if (!organizationId) {
    errors.push("'organizationId' is a required parameter");
  }
  if (!zoneId) {
    errors.push("'zoneId' is a required parameter");
  }
  throwErrorFromArray(errors);
  return peopleArray.filter(
    (person) =>
      person.agent &&
      person.agent.organizationId === organizationId &&
      person.homeZoneId === zoneId
  );
};

/**
 * Return the max number of agents an organization can support.
 * @param {GameManager} gameManager - An array of all people
 * @param {string} organizationId
 */
const getMaxAgents = (gameManager, organizationId) => {
  const { gameData } = gameManager;
  const peopleArray = Object.values(gameData.people);
  return peopleArray.reduce((maxAgentValue, currentAgent) => {
    if (
      currentAgent.agent &&
      currentAgent.agent.organizationId === organizationId
    ) {
      return maxAgentValue + currentAgent.leadership;
    }

    return maxAgentValue;
  }, 0);
};

/**
 *
 * @param {GameManager} gameManager
 * @param {import("./typedef").Person} agent
 */
const getAgentSubordinates = (gameManager, agent) => {
  const { gameData } = gameManager;
  const peopleArray = Object.values(gameData.people);
  return peopleArray.filter(
    (person) => person.agent && person.agent.commanderId === agent.id
  );
};

/**
 * Return the science value of an org.
 * @param {GameManager} gameManager - An array of all people
 * @param {string} organizationId
 */
const getScience = (gameManager, organizationId) => {
  const { gameData } = gameManager;
  const orgLabs = Object.values(gameData.buildings).filter(
    (building) =>
      building.type === "laboratory" &&
      building.organizationId === organizationId
  );

  return orgLabs.reduce((tv, lab) => {
    let labIntelBonus = 0;
    lab.personnel.forEach((personnelId) => {
      labIntelBonus += gameData.people[personnelId].intelligence;
    });
    return tv + labIntelBonus;
  }, 0);
};

/**
 * Return the infra value of an org.
 * @param {GameManager} gameManager - An array of all people
 * @param {string} organizationId
 */
const getInfrastructure = (gameManager, organizationId) => {
  return getAgents(gameManager, organizationId).reduce(
    (infrastructure, currentAgent) => {
      if (
        currentAgent.agent.department === 1 ||
        currentAgent.agent.department === 3
      ) {
        return infrastructure + currentAgent.administration;
      }

      return infrastructure;
    },
    0
  );
};

const getPayroll = (gameManager, organizationId) => {
  return getAgents(gameManager, organizationId).reduce(
    (payroll, currentAgent) => {
      return payroll + currentAgent.agent.salary;
    },
    0
  );
};

/**
 *
 * @param {GameManager} gameManager
 * @param {string} organizationId
 */
const getControlledZones = (gameManager, organizationId) => {
  const { gameData } = gameManager;
  /**
   * @type {import("./typedef").Zone[]}
   */
  const zonesArray = Object.values(gameData.zones);
  return zonesArray.filter((zone) => zone.organizationId === organizationId);
};

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
  if (agent.agent) {
    console.log(`${agent.name} is already an agent.`);
    return null;
  }
  const agentData = generateAgentData(
    organizationId,
    department,
    commanderId,
    salary
  );
  agent.agent = agentData;
  return agent;
};

const fireAgent = (agent) => {
  const updatedAgent = JSON.parse(JSON.stringify(agent));
  updatedAgent.agent = undefined;
  return {
    people: {
      [updatedAgent.id]: updatedAgent,
    },
  };
};

/**
 *
 * @param {import("./typedef").Person} agent
 */
const terminateAgent = (agent) => {
  const updatedAgent = JSON.parse(JSON.stringify(agent));
  updatedAgent.agent = undefined;
  updatedAgent.currentHealth = 0;

  // TODO: Should have a positive impact on org's EVIL value
  return {
    people: {
      [updatedAgent.id]: updatedAgent,
    },
  };
};

/**
 *
 * @param {import("./typedef").Person} agent
 */
const calculateAgentSalary = (agent) => {
  return (
    agent.administration + agent.combat + agent.intelligence + agent.leadership
  );
};

module.exports = {
  recruitAgent,
  getAgents,
  _getAgents,
  getMaxAgents,
  getScience,
  getInfrastructure,
  getPayroll,
  getAgentSubordinates,
  getControlledZones,
  hireAgent,
  getAgentsInZone,
  calculateAgentSalary,
  fireAgent,
  terminateAgent,
};
