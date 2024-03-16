/**
 * People related actions.
 */
import { GameData, GameLog, GameManager } from '../GameManager';
import { getActivityParticipants } from '../plots';
import { SimulatedActivityResolution, simulateActivity } from '../sim/people';
import {
  AgentData,
  Person,
  PersonBasicAttributes,
  PersonIntelAttributes,
  PersonVitalAttributes,
} from '../types/interfaces/entities';
import { randomInt } from '../utilities';

interface GetPeopleParams {
  zoneId?: string | null;
  nationId?: string | null;
  agentFilter?: {
    excludeAgents?: boolean;
    department?: number;
    agentsOnly?: boolean;
    commander?: string;
    excludeParticipants?: boolean;
  };
  excludeDeceased?: boolean;
  excludePersonnel?: boolean;
  organizationId?: string | null;
  deceasedOnly?: boolean;
}

/**
 * Get all people in the game that match the given parameters.
 */
export const getPeople = (
  gameManager: GameManager,
  {
    /** Exclude people working in buildings */
    excludePersonnel = false,
    /** The zone to filter by */
    zoneId = null,
    /** The nation to filter by */
    nationId = null,
    /** The organization to filter by */
    organizationId = null,
    /** Only include deceased people */
    deceasedOnly = false,
    /** Exclude deceased people */
    excludeDeceased = false,
    /** Filter agents */
    agentFilter = {
      /** Filter agent by Department */
      department: -1,
      /** Exclude agents */
      excludeAgents: false,
      agentsOnly: false,
      commander: '',
      excludeParticipants: false,
    },
  }: GetPeopleParams = {},
) => {
  return Object.values(gameManager.gameData.people).filter((person) => {
    if (
      agentFilter.excludeParticipants &&
      getActivityParticipants(gameManager).some(
        (p) => p.participant.id === person.id,
      )
    ) {
      return false;
    }
    if (agentFilter.agentsOnly && person.agent === null) {
      return false;
    }
    if (agentFilter.excludeAgents && person.agent) {
      return false;
    }
    if (
      agentFilter.commander &&
      person.agent?.commanderId !== agentFilter.commander
    ) {
      return false;
    }
    if (
      agentFilter.department !== -1 &&
      person.agent?.department !== agentFilter.department
    ) {
      return false;
    }
    if (zoneId && person.homeZoneId !== zoneId) {
      return false;
    }

    if (nationId && person.nationId !== nationId) {
      return false;
    }

    if (excludePersonnel && person.isPersonnel) {
      return false;
    }

    if (organizationId && person.agent?.organizationId !== organizationId) {
      return false;
    }

    if (deceasedOnly && !person.dead) {
      return false;
    }

    if (excludeDeceased && person.dead) {
      return false;
    }

    return true;
  });
};

export const getAgentDepartment = (agentData: AgentData) => {
  if (agentData.department === 0) {
    return 'Henchman';
  } else if (agentData.department === 1) {
    return 'Administrator';
  } else if (agentData.department === 2) {
    return 'Scientist';
  } else if (agentData.department === 3) {
    return 'Chief Commander';
  }
};

export const changeAgentDepartment = (
  theAgent: Person,
  department: number,
): Partial<GameData> => {
  const updatedPerson: Person = {
    ...theAgent,
    agent: {
      ...theAgent.agent!,
      department,
    },
  };

  return {
    people: {
      [updatedPerson.id]: updatedPerson,
    },
  };
};

export const killPerson = (person: Person) => {
  const updatedPerson: Person = {
    ...person,
    dead: true,
    vitalAttributes: {
      ...person.vitalAttributes,
      currentHealth: 0,
    },
  };

  return {
    people: {
      [updatedPerson.id]: updatedPerson,
    },
  };
};

export const updateBasicAttribute = (
  person: Person,
  attribute: keyof PersonBasicAttributes,
  modAmt: number,
) => {
  const updatedPerson: Person = {
    ...person,
    basicAttributes: {
      ...person.basicAttributes,
      [attribute]: person.basicAttributes[attribute] + modAmt,
    },
  };

  return {
    people: {
      [updatedPerson.id]: updatedPerson,
    },
  };
};

export const updateIntelAttribute = (
  person: Person,
  attribute: keyof PersonIntelAttributes,
  modAmt: number,
) => {
  const updatedPerson: Person = {
    ...person,
    intelAttributes: {
      ...person.intelAttributes,
      [attribute]: (person.intelAttributes[attribute] as number) + modAmt,
    },
  };

  return {
    people: {
      [updatedPerson.id]: updatedPerson,
    },
  };
};

export const updateLoyalty = (
  person: Person,
  orgId: string,
  modAmt: number,
) => {
  const updatedPerson: Person = {
    ...person,
    intelAttributes: {
      ...person.intelAttributes,
      loyalties: {
        [orgId]: (person.intelAttributes.loyalties[orgId] as number) + modAmt,
      },
    },
  };

  return {
    people: {
      [updatedPerson.id]: updatedPerson,
    },
  };
};

export const setLoyalty = (person: Person, orgId: string, amt: number) => {
  const updatedPerson: Person = {
    ...person,
    intelAttributes: {
      ...person.intelAttributes,
      loyalties: {
        [orgId]: amt,
      },
    },
  };

  return {
    people: {
      [updatedPerson.id]: updatedPerson,
    },
  };
};

export const initializeLoyalty = (person: Person, gameManager: GameManager) => {
  const homeZone = gameManager.gameData.zones[person.homeZoneId];
  const zoneOwner =
    gameManager.gameData.governingOrganizations[homeZone.organizationId];
  const loyalties: { [x: string]: number } = {};
  Object.values(gameManager.gameData.governingOrganizations).forEach((go) => {
    if (go.id === zoneOwner.id) {
      loyalties[go.id] = 20 + randomInt(0, 80);
    } else {
      loyalties[go.id] = randomInt(0, 70);
    }
  });
  const updatedPerson: Person = {
    ...person,
    intelAttributes: {
      ...person.intelAttributes,
      loyalties,
    },
  };

  return {
    people: {
      [updatedPerson.id]: updatedPerson,
    },
  };
};
export const updateVitalAttribute = (
  person: Person,
  attribute: keyof PersonVitalAttributes,
  modAmt: number,
) => {
  const updatedPerson: Person = {
    ...person,
    vitalAttributes: {
      ...person.vitalAttributes,
      [attribute]: person.vitalAttributes[attribute] + modAmt,
    },
  };

  return {
    people: {
      [updatedPerson.id]: updatedPerson,
    },
  };
};

/**
 * Simulate the the person does on a given day.
 */
export const simulateDay = (gameManager: GameManager, person: Person) => {
  const completedActivities: string[] = [];
  const updates: SimulatedActivityResolution[] = [];
  for (let index = 0; index < 4; index++) {
    updates.push(simulateActivity(gameManager, person, completedActivities)!);
  }
  const update = updates.reduce<Partial<GameData>>(
    (ugd, curr) => {
      if (curr) {
        return {
          people: {
            ...ugd.people,
            ...curr.updatedGamedata?.people,
          },
        };
      }
      return ugd;
    },
    {
      people: {},
    },
  );

  const activityNames = completedActivities.map((activity) => activity);

  return { updatedGameData: update, updatedLog: activityNames };
};
