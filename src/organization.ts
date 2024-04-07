import { GameData, GameManager } from './GameManager';
import { getPeople, killPerson } from './actions/people';
import {
  ResourceOutput,
  getBuildings,
  getResourceOutput,
  getUpkeep,
} from './buildings';
import { generateAgentData } from './generators/game';
import { getCodeName } from './generators/names';
import { GoverningOrgStatusEffects } from './statusEffects/governingOrg';
import { GoverningOrganization, Person } from './types/interfaces/entities';
import { randomInt, throwErrorFromArray } from './utilities';

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
      codename: getCodeName(),
    },
  };
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
      return maxAgentValue + currentAgent.skills.leadership;
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
        gameData.people[personnelId].standardAttributes.intelligence;
    });
    return tv + labIntelBonus;
  }, 0);
};

const getInfrastructure = (
  gameManager: GameManager,
  organizationId: string,
) => {
  return getPeople(gameManager, {
    organizationId,
    agentFilter: { agentsOnly: true },
  }).reduce((infrastructure, currentAgent) => {
    if (
      currentAgent?.agent?.department === 1 ||
      currentAgent?.agent?.department === 3
    ) {
      return infrastructure + currentAgent.skills.administration;
    }

    return infrastructure;
  }, 0);
};

const getPayroll = (gameManager: GameManager, organizationId: string) => {
  return getPeople(gameManager, {
    organizationId,
    agentFilter: { department: -1, agentsOnly: true },
  }).reduce((payroll, currentAgent) => {
    return payroll + (currentAgent?.agent?.salary || 0);
  }, 0);
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
    agent.skills.administration +
    agent.standardAttributes.intelligence +
    agent.skills.leadership
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

export const modifyOrgWealth = (
  gameManager: GameManager,
  orgId: string,
  amount: number,
): Partial<GameData> => {
  const org = gameManager.gameData.governingOrganizations[orgId];
  const updatedGo = { ...org };
  updatedGo.wealth += amount;
  return {
    governingOrganizations: {
      [org.id]: updatedGo,
    },
  };
};

export const modifyOrgScience = (
  gameManager: GameManager,
  orgId: string,
  amount: number,
): Partial<GameData> => {
  const org = gameManager.gameData.governingOrganizations[orgId];
  const updatedGo = { ...org };
  updatedGo.science += amount;
  return {
    governingOrganizations: {
      [org.id]: updatedGo,
    },
  };
};

export const applyStatusEffect = (
  gameManager: GameManager,
  statusEffect: GoverningOrgStatusEffects,
  orgId: string,
) => {
  const org = getEvilEmpire(gameManager);
  const updatedGo = { ...org };
  updatedGo.statusEffects = [...updatedGo.statusEffects, statusEffect];
  return {
    governingOrganizations: {
      [org.id]: updatedGo,
    },
  };
};

interface GetOrganizationsOptions {
  exclude?: {
    player?: boolean;
  };
  statusFilter?: {
    hasStatus?: GoverningOrgStatusEffects;
    doesNotHaveStatus?: GoverningOrgStatusEffects;
    hasStatuses?: GoverningOrgStatusEffects[];
    doesNotHaveStatuses?: GoverningOrgStatusEffects[];
  };
}

const defaultGetOrganizationsOptions: GetOrganizationsOptions = {
  exclude: {
    player: false,
  },
};

export const getOrganizations = (
  gameManager: GameManager,
  options: GetOrganizationsOptions,
) => {
  const opts = { ...defaultGetOrganizationsOptions, ...options };

  return Object.values(gameManager.gameData.governingOrganizations).filter(
    (org) => {
      if (
        opts.exclude?.player === true &&
        org.id === gameManager.gameData.player.organizationId
      ) {
        return false;
      }
      return true;
    },
  );
};

export interface GetRandomOrgOptions {
  excludePlayer?: boolean;
}

export const getRandomOrg = (
  gameManager: GameManager,
  options: GetRandomOrgOptions,
): GoverningOrganization => {
  const pool = getOrganizations(gameManager, {
    exclude: { player: options.excludePlayer },
  });
  return pool[randomInt(0, pool.length - 1)];
};

export const updateOrgWealth = (
  gameManager: GameManager,
  orgId: string,
  amt: number,
) => {
  const org = gameManager.gameData.governingOrganizations[orgId];
  console.log(
    `${amt > 0 ? 'Increaing' : 'Reducing'} wealth for ${org} by ${amt}`,
  );
  const updatedGameData: Partial<GameData> = {
    governingOrganizations: {
      [orgId]: {
        ...org,
        wealth: org.wealth + amt,
      },
    },
  };
  gameManager.updateGameData(updatedGameData);
  return updatedGameData;
};

export const updateEvil = (gameManager: GameManager, amount: number) => {
  const org = getEvilEmpire(gameManager);
  const updatedGo: GoverningOrganization = {
    ...org,
    totalEvil: org.totalEvil + amount,
  };
  gameManager.updateGameData({
    governingOrganizations: {
      [org.id]: updatedGo,
    },
  });
  return {
    governingOrganizations: {
      [org.id]: updatedGo,
    },
  };
};

export {
  recruitAgent,
  getMaxAgents,
  getScience,
  getInfrastructure,
  getPayroll,
  getAgentSubordinates,
  hireAgent,
  calculateAgentSalary,
  fireAgent,
  terminateAgent,
  getEvilEmpire,
  getOrgResources,
  getExpenses,
  takeCaptive,
  releaseCaptive,
};
