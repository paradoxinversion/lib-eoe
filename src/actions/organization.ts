import settings from '../config/config';
import buildings, { ResourceOutput } from './buildings';
import generators from '../generators/game';
import { getCodeName } from '../generators/names';
import GameManager from '../managers/game/GameManager';
import { GoverningOrgStatusEffects } from '../types';
import {
  AgentDepartment,
  Building,
  GoverningOrganization,
  Person,
  GameData,
} from '../types';
import utilities from '../utilities';
import infrastructure from './infrastructure';
import people from './people';

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
const getMaxAgents = (organizationId: string) => {
  const { gameData } = GameManager.getInstance();
  const peopleArray = Object.values(gameData.people);
  return peopleArray.reduce((maxAgentValue, currentAgent) => {
    if (
      currentAgent.agent &&
      currentAgent.agent.organizationId === organizationId
    ) {
      return (
        maxAgentValue +
        Math.floor(
          currentAgent.skills.leadership *
            settings.agents.leadershipCommandMultiplier,
        )
      );
    }

    return maxAgentValue;
  }, 0);
};

const getAgentSubordinates = (agent: Person) => {
  const { gameData } = GameManager.getInstance();
  const peopleArray = Object.values(gameData.people);
  return peopleArray.filter(
    (person) => person.agent && person.agent.commanderId === agent.id,
  );
};

const getScience = (organizationId: string) => {
  const { gameData } = GameManager.getInstance();
  const orgLabs = Object.values(gameData.buildings).filter(
    (building) =>
      building.type === 'laboratory' &&
      building.organizationId === organizationId,
  );

  return orgLabs.reduce((tv, lab) => {
    let labIntelBonus = 0;
    (lab as Building).personnel.forEach((personnelId) => {
      labIntelBonus +=
        gameData.people[personnelId].standardAttributes.intelligence;
    });
    return tv + labIntelBonus;
  }, 0);
};

/**
 *
 */
const getInfrastructure = (organizationId: string) => {
  return people
    .getPeople({
      personFilter: {
        organizationId,
      },
      agentFilter: { agentsOnly: true },
    })
    .reduce((infrastructure, currentAgent) => {
      if (
        currentAgent?.agent?.department === 'administrator' ||
        currentAgent?.agent?.department === 'overlord'
      ) {
        return infrastructure + currentAgent.skills.administration;
      }

      return infrastructure;
    }, 0);
};

const getPayroll = (organizationId: string) => {
  return people
    .getPeople({
      personFilter: {
        organizationId,
      },
      agentFilter: { agentsOnly: true },
    })
    .reduce((payroll, currentAgent) => {
      return payroll + (currentAgent?.agent?.salary || 0);
    }, 0);
};

const hireAgent = (
  newAgent: Person,
  organizationId: string,
  department: AgentDepartment,
  commanderId: string,
  salary?: number,
) => {
  if (newAgent.agent) {
    console.log(`${newAgent.name} is already an agent.`);
    return null;
  }

  const calculatedSalary = calculateAgentSalary(newAgent);
  const agentData = generators.generateAgentData(
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
  const updatedGameData = people.killPerson(agent);
  updatedGameData.people[agent.id].agent = null;

  // TODO: Should have a positive impact on org's EVIL value
  return updatedGameData;
};

const calculateAgentSalary = (agent: Person) => {
  return (
    1000 +
    agent.skills.administration +
    agent.standardAttributes.intelligence +
    agent.skills.leadership
  );
};

const getEvilEmpire = () => {
  return GameManager.getInstance().gameData.governingOrganizations[
    GameManager.getInstance().gameData.player.organizationId
  ];
};

const getOrgResources = (orgId: string): ResourceOutput => {
  const orgBuildings = buildings.getBuildings({ organizationId: orgId });
  const resources = orgBuildings.reduce(
    (prev, curr): ResourceOutput => {
      const output = buildings.getResourceOutput(curr);
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

const getExpenses = (orgId: string) => {
  return {
    payroll: getPayroll(orgId),
    upkeep: buildings.getUpkeep(orgId),
  };
};

const takeCaptive = (orgId: string, captive: Person) => {
  const org = GameManager.getInstance().gameData.governingOrganizations[orgId];
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
  GameManager.getInstance().updateGameData(update);
  return update;
};

const releaseCaptive = (orgId: string, captive: Person) => {
  const org = GameManager.getInstance().gameData.governingOrganizations[orgId];
  if (!org.captives.includes(captive.id)) {
    return {};
  }

  if (!captive.isCaptive) {
    console.log(captive.name, 'is not captive');
    return {};
  }

  const updatedGo = { ...org };
  updatedGo.captives = (updatedGo as GoverningOrganization).captives.filter(
    (id) => id !== captive.id,
  );
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

const modifyOrgWealth = (orgId: string, amount: number): Partial<GameData> => {
  const org = GameManager.getInstance().gameData.governingOrganizations[orgId];
  const updatedGo = { ...org };
  updatedGo.wealth += amount;
  return {
    governingOrganizations: {
      [org.id]: updatedGo,
    },
  };
};

const modifyOrgScience = (orgId: string, amount: number): Partial<GameData> => {
  const org = GameManager.getInstance().gameData.governingOrganizations[orgId];
  const updatedGo = { ...org };
  updatedGo.science += amount;
  return {
    governingOrganizations: {
      [org.id]: updatedGo,
    },
  };
};

const applyStatusEffect = (
  statusEffect: GoverningOrgStatusEffects,
  orgId: string,
) => {
  const org = GameManager.getInstance().gameData.governingOrganizations[orgId];
  const updatedGo = { ...org };
  updatedGo.statusEffects = [...updatedGo.statusEffects, statusEffect];
  const ugd = {
    governingOrganizations: {
      [org.id]: updatedGo,
    },
  };
  GameManager.getInstance().updateGameData(ugd);
  return ugd;
};

const getOrgIncome = () => {
  const empireResources = getOrgResources(
    GameManager.getInstance().gameData.player.organizationId,
  );
  const infrastructurePercentage = infrastructure.getInfrastructurePercentage(
    GameManager.getInstance().gameData.player.organizationId,
  );
  return (empireResources.wealth * infrastructurePercentage) / 100;
};

const getOrgScienceOutput = () => {
  const empireResources = getOrgResources(
    GameManager.getInstance().gameData.player.organizationId,
  );
  const infrastructurePercentage = infrastructure.getInfrastructurePercentage(
    GameManager.getInstance().gameData.player.organizationId,
  );
  return (empireResources.science * infrastructurePercentage) / 100;
};

export interface GetOrganizationsOptions {
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

const getOrganizations = (options: GetOrganizationsOptions) => {
  const opts = { ...defaultGetOrganizationsOptions, ...options };

  return Object.values(
    GameManager.getInstance().gameData.governingOrganizations,
  ).filter((org) => {
    if (
      opts.exclude?.player === true &&
      org.id === GameManager.getInstance().gameData.player.organizationId
    ) {
      return false;
    }
    return true;
  });
};

export interface GetRandomOrgOptions {
  excludePlayer?: boolean;
}

const getRandomOrg = (options: GetRandomOrgOptions): GoverningOrganization => {
  const pool = getOrganizations({
    exclude: { player: options.excludePlayer },
  });
  return pool[utilities.randomInt(0, pool.length - 1)];
};

const updateOrgWealth = (orgId: string, amt: number) => {
  const org = GameManager.getInstance().gameData.governingOrganizations[orgId];
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
  GameManager.getInstance().updateGameData(updatedGameData);
  return updatedGameData;
};

const updateEvil = (amount: number) => {
  const org = getEvilEmpire();
  const updatedGo: GoverningOrganization = {
    ...org,
    totalEvil: org.totalEvil + amount,
  };
  GameManager.getInstance().updateGameData({
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

const setOrgOpinion = (orgId: string, targetOrgId: string, opinion: number) => {
  const org = GameManager.getInstance().gameData.governingOrganizations[orgId];
  const updatedGo = { ...org };
  updatedGo.opinions[targetOrgId] = opinion;

  GameManager.getInstance().updateGameData({
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

export default {
  updateOrgWealth,
  updateEvil,
  getOrgIncome,
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
  modifyOrgScience,
  modifyOrgWealth,
  applyStatusEffect,
  getOrgScienceOutput,
  getOrganizations,
  getRandomOrg,
  setOrgOpinion,
};
