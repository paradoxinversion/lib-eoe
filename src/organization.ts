import { GameData, GameManager } from './GameManager';
import { getPeople, killPerson } from './actions/people';
import {
  ResourceOutput,
  getBuildings,
  getResourceOutput,
  getUpkeep,
} from './buildings';
import { generateAgentData } from './generators/game';
import { GoverningOrganization, Person } from './types/interfaces/entities';
import { throwErrorFromArray } from './utilities';

/**
 * Returns a copy of the recruited person
 */
const recruitAgent = (
  /** The recruiting org's id */
  organizationId: string,
  /** the person being recruited */
  person: Person,
  department = 0,
) => {
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
 */
const getAgents = (
  gameManager: GameManager,
  organizationId: string,
  excludeCorpses = true,
  excludeUnavailable = false,
) => {
  return _getAgents(gameManager, {
    organizationId,
    exclude: {
      corpses: excludeCorpses,
      unavailable: excludeUnavailable,
    },
  });
};

interface GetAgentsPrams {
  organizationId: string;
  filter?: {
    zoneId?: string;
    department?: number;
  };
  exclude?: {
    corpses?: boolean;
    unavailable?: boolean;
    personnel?: boolean;
  };
}

/**
 *
 */
const _getAgents = (gameManager: GameManager, parameters: GetAgentsPrams) => {
  const { gameData } = gameManager;
  if (!parameters.organizationId) {
    console.error('parameters.organizationId is required.');
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
      if (
        parameters.exclude.corpses &&
        person.vitalAttributes.currentHealth <= 0
      ) {
        return false;
      }

      if (parameters.exclude.personnel) {
        return !!!Object.values(gameData.buildings).find((building) =>
          building.personnel.includes(person.id),
        );
      }
    }

    return true;
  });
};

/**
 * Return the agents in a zone.
 * @returns
 */
const getAgentsInZone = (
  gameManager: GameManager,
  organizationId: string,
  zoneId: string,
) => {
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
      person.homeZoneId === zoneId,
  );
};

/**
 * Return the max number of agents an organization can support.
 */
const getMaxAgents = (gameManager: GameManager, organizationId: string) => {
  const { gameData } = gameManager;
  const peopleArray = Object.values(gameData.people);
  return peopleArray.reduce((maxAgentValue, currentAgent) => {
    if (
      currentAgent.agent &&
      currentAgent.agent.organizationId === organizationId
    ) {
      return maxAgentValue + currentAgent.basicAttributes.leadership;
    }

    return maxAgentValue;
  }, 0);
};

const getAgentSubordinates = (gameManager: GameManager, agent: Person) => {
  const { gameData } = gameManager;
  const peopleArray = Object.values(gameData.people);
  return peopleArray.filter(
    (person) => person.agent && person.agent.commanderId === agent.id,
  );
};

const getScience = (gameManager: GameManager, organizationId: string) => {
  const { gameData } = gameManager;
  const orgLabs = Object.values(gameData.buildings).filter(
    (building) =>
      building.type === 'laboratory' &&
      building.organizationId === organizationId,
  );

  return orgLabs.reduce((tv, lab) => {
    let labIntelBonus = 0;
    lab.personnel.forEach((personnelId) => {
      labIntelBonus +=
        gameData.people[personnelId].basicAttributes.intelligence;
    });
    return tv + labIntelBonus;
  }, 0);
};

const getInfrastructure = (
  gameManager: GameManager,
  organizationId: string,
) => {
  return getAgents(gameManager, organizationId).reduce(
    (infrastructure, currentAgent) => {
      if (
        currentAgent?.agent?.department === 1 ||
        currentAgent?.agent?.department === 3
      ) {
        return infrastructure + currentAgent.basicAttributes.administration;
      }

      return infrastructure;
    },
    0,
  );
};

const getPayroll = (gameManager: GameManager, organizationId: string) => {
  return getPeople(gameManager, {
    organizationId,
    agentFilter: { department: -1, agentsOnly: true },
  }).reduce((payroll, currentAgent) => {
    return payroll + (currentAgent?.agent?.salary || 0);
  }, 0);
};

const getControlledZones = (
  gameManager: GameManager,
  organizationId: string,
) => {
  const { gameData } = gameManager;

  const zonesArray = Object.values(gameData.zones);
  return zonesArray.filter((zone) => zone.organizationId === organizationId);
};

const hireAgent = (
  newAgent: Person,
  organizationId: string,
  department: number,
  commanderId: string,
  salary?: number,
) => {
  if (newAgent.agent) {
    console.log(`${newAgent.name} is already an agent.`);
    return null;
  }

  const calculatedSalary = calculateAgentSalary(newAgent);
  const agentData = generateAgentData(
    organizationId,
    department,
    salary || calculatedSalary,
    commanderId,
  );
  newAgent.agent = agentData;
  return newAgent;
};

const fireAgent = (agent: Person) => {
  const updatedAgent = { ...agent };
  updatedAgent.agent = null;
  return {
    people: {
      [updatedAgent.id]: updatedAgent,
    },
  };
};

const terminateAgent = (agent: Person): Partial<GameData> => {
  const updatedGameData = killPerson(agent);
  updatedGameData.people[agent.id].agent = null;

  // TODO: Should have a positive impact on org's EVIL value
  return updatedGameData;
};

const calculateAgentSalary = (agent: Person) => {
  return (
    agent.basicAttributes.administration +
    agent.basicAttributes.combat +
    agent.basicAttributes.intelligence +
    agent.basicAttributes.leadership
  );
};

const getEvilEmpire = (gameManager: GameManager) => {
  return gameManager.gameData.governingOrganizations[
    gameManager.gameData.player.organizationId
  ];
};

const getOrgResources = (
  gameManager: GameManager,
  orgId: string,
): ResourceOutput => {
  const orgBuildings = getBuildings(gameManager, { organizationId: orgId });
  const resources = orgBuildings.reduce(
    (prev, curr): ResourceOutput => {
      const output = getResourceOutput(gameManager, curr);
      return {
        housing: prev.housing + output.housing,
        wealth: prev.wealth + output.wealth,
        science: prev.science + output.science,
        infrastructure: prev.infrastructure + output.infrastructure,
      };
    },
    {
      housing: 0,
      wealth: 0,
      science: 0,
      infrastructure: 0,
    },
  );

  return resources;
};

const getExpenses = (gameManager: GameManager, orgId: string) => {
  return {
    payroll: getPayroll(gameManager, orgId),
    upkeep: getUpkeep(gameManager, orgId),
  };
};

const takeCaptive = (
  gameManager: GameManager,
  orgId: string,
  captive: Person,
) => {
  const org = gameManager.gameData.governingOrganizations[orgId];
  if (org.captives.includes(captive.id)) {
    return {};
  }

  if (captive.isCaptive) {
    console.log(captive.name, 'is already captive');
    return {};
  }

  const updatedGo = { ...org };
  const captivesList = [...updatedGo.captives, captive.id];
  updatedGo.captives = captivesList;
  const update: Partial<GameData> = {
    people: {
      [captive.id]: {
        ...captive,
        isCaptive: true,
      },
    },
    governingOrganizations: {
      [org.id]: updatedGo,
    },
  };
  return update;
};

const releaseCaptive = (
  gameManager: GameManager,
  orgId: string,
  captive: Person,
) => {
  const org = gameManager.gameData.governingOrganizations[orgId];
  if (!org.captives.includes(captive.id)) {
    return {};
  }

  if (!captive.isCaptive) {
    console.log(captive.name, 'is not captive');
    return {};
  }

  const updatedGo = { ...org };
  updatedGo.captives = updatedGo.captives.filter((id) => id !== captive.id);
  const update: Partial<GameData> = {
    people: {
      [captive.id]: {
        ...captive,
        isCaptive: false,
      },
    },
    governingOrganizations: {
      [org.id]: updatedGo,
    },
  };
  return update;
};

export {
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
  getEvilEmpire,
  getOrgResources,
  getExpenses,
  takeCaptive,
  releaseCaptive,
};
