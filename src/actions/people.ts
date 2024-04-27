/**
 * People related actions.
 */
import { GameData, GameLog, GameManager } from '../GameManager';
import { getActivityParticipants } from '../plots';
import { PlotManager } from '../plots/PlotManager';
import { SimulatedActivityResolution, simulateActivity } from '../sim/people';
import { PersonStatusEffect } from '../statusEffects/person';
import {
  AgentData,
  Person,
  PersonStandardAttributes,
  PersonIntelAttributes,
} from '../types/interfaces/entities';
import { randomInt } from '../utilities';

interface GetPeopleParams {
  zoneId?: string | null;
  zone?: {
    zoneId?: string | null;
    excludeZones?: string[];
  };
  nationId?: string | null;
  nation?: {
    nationId?: string | null;
    excludeNations?: string[];
  };
  agentFilter?: {
    excludeAgents?: boolean;
    department?: number;
    agentsOnly?: boolean;
    commander?: string;
    excludeParticipants?: boolean;
    excludeDepartments?: number[];
  };
  excludeDeceased?: boolean;
  excludePersonnel?: boolean;
  organizationId?: string | null;
  deceasedOnly?: boolean;
  excludeCaptured?: boolean;
  capturedOnly?: boolean;
  injuredOnly?: boolean;
  hospitalizedOnly?: boolean;
  noHospitalized?: boolean;
  captive?: {
    captiveOnly?: boolean;
    capturedBy?: string;
  };
}

const GetPeopleDefaultParams: GetPeopleParams = {
  zoneId: null,
  zone: {
    zoneId: null,
    excludeZones: [],
  },
  nationId: null,
  nation: {
    nationId: null,
    excludeNations: [],
  },
  agentFilter: {
    excludeAgents: false,
    department: -1,
    agentsOnly: false,
    commander: '',
    excludeParticipants: false,
    excludeDepartments: [],
  },
  excludeDeceased: false,
  excludePersonnel: false,
  organizationId: null,
  deceasedOnly: false,
  excludeCaptured: false,
  capturedOnly: false,
  injuredOnly: false,
  hospitalizedOnly: false,
  noHospitalized: false,
  captive: {
    captiveOnly: false,
    capturedBy: '',
  },
};

/**
 * Get all people in the game that match the given parameters.
 */
export const getPeople = (params: GetPeopleParams = {}) => {
  const options: GetPeopleParams = {
    ...GetPeopleDefaultParams,
    ...params,
    agentFilter: {
      ...GetPeopleDefaultParams.agentFilter,
      ...params.agentFilter,
    },
    captive: {
      ...GetPeopleDefaultParams.captive,
      ...params.captive,
    },
  };
  return Object.values(GameManager.getInstance().gameData.people).filter(
    (person) => {
      let capturingOrg = null;
      if (options.captive?.capturedBy) {
        capturingOrg =
          GameManager.getInstance().gameData.governingOrganizations[
            options.captive.capturedBy
          ];
      }
      if (options.captive?.captiveOnly && !person.isCaptive) {
        return false;
      }

      if (
        options.captive?.capturedBy &&
        !capturingOrg?.captives.includes(person.id)
      ) {
        return false;
      }

      if (options.excludeCaptured && person.isCaptive) {
        return false;
      }

      if (options.capturedOnly && !person.isCaptive) {
        return false;
      }

      if (
        (options.agentFilter?.excludeParticipants &&
          getActivityParticipants().some(
            (p) => p.participant.id === person.id,
          )) ||
        PlotManager.getInstance().plotQueue.some((p) =>
          p.standardParams.participants.some((p) => p === person.id),
        )
      ) {
        return false;
      }

      if (options.agentFilter?.agentsOnly && person.agent === null) {
        return false;
      }

      if (options.agentFilter?.excludeAgents && person.agent) {
        return false;
      }
      if (
        options.agentFilter?.excludeDepartments &&
        options.agentFilter?.excludeDepartments.includes(
          person.agent?.department!,
        )
      ) {
        return false;
      }
      if (
        options.agentFilter?.commander &&
        person.agent?.commanderId !== options.agentFilter?.commander
      ) {
        return false;
      }

      if (
        options.agentFilter?.department !== -1 &&
        person.agent?.department !== options.agentFilter?.department
      ) {
        return false;
      }
      if (options.zoneId && person.homeZoneId !== options.zoneId) {
        return false;
      }

      if (options.nationId && person.nationId !== options.nationId) {
        return false;
      }
      if (
        options.nation?.nationId &&
        person.nationId !== options.nation.nationId
      ) {
        return false;
      }

      if (
        options.nation?.excludeNations &&
        options.nation.excludeNations.includes(person.nationId)
      ) {
        return false;
      }

      if (options.excludePersonnel && person.isPersonnel) {
        return false;
      }

      if (
        options.organizationId &&
        person.agent?.organizationId !== options.organizationId
      ) {
        return false;
      }

      if (options.deceasedOnly && !person.dead) {
        return false;
      }

      if (options.excludeDeceased && person.dead) {
        return false;
      }

      if (
        options.injuredOnly &&
        person.derivedAttributes.health.currentHealth ===
          person.derivedAttributes.health.totalHealth
      ) {
        return false;
      }

      if (options.hospitalizedOnly && !person.hospitalizedAt) {
        return false;
      }

      if (options.noHospitalized && person.hospitalizedAt) {
        return false;
      }

      return true;
    },
  );
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
    derivedAttributes: {
      ...person.derivedAttributes,
      health: {
        ...person.derivedAttributes.health,
        currentHealth: 0,
      },
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
  attribute: keyof PersonStandardAttributes,
  modAmt: number,
) => {
  const updatedPerson: Person = {
    ...person,
    standardAttributes: {
      ...person.standardAttributes,
      [attribute]: person.standardAttributes[attribute] + modAmt,
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

export const initializeLoyalty = (person: Person) => {
  const homeZone = GameManager.getInstance().gameData.zones[person.homeZoneId];
  const zoneOwner =
    GameManager.getInstance().gameData.governingOrganizations[
      homeZone.organizationId
    ];
  const loyalties: { [x: string]: number } = {};
  Object.values(
    GameManager.getInstance().gameData.governingOrganizations,
  ).forEach((go) => {
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

export const updateCurrentHealth = (person: Person, modAmt: number) => {
  const updatedPerson: Person = {
    ...person,
    derivedAttributes: {
      ...person.derivedAttributes,
      health: {
        ...person.derivedAttributes.health,
        currentHealth: person.derivedAttributes.health.currentHealth + modAmt,
      },
    },
  };

  return {
    people: {
      [updatedPerson.id]: updatedPerson,
    },
  };
};

export const addPersonStatusEffect = (
  person: Person,
  statusEffect: PersonStatusEffect,
  duration: number = -1,
): Partial<GameData> => {
  const updatedPerson: Person = {
    ...person,
    statusEffects: {
      ...person.statusEffects,
      [statusEffect]: duration,
    },
  };

  GameManager.getInstance().updateGameData({
    people: {
      [updatedPerson.id]: updatedPerson,
    },
  });

  return {
    people: {
      [updatedPerson.id]: updatedPerson,
    },
  };
};

export const removePersonStatusEffect = (
  person: Person,
  statusEffect: PersonStatusEffect,
) => {
  const updatedPerson: Person = {
    ...person,
    statusEffects: {
      ...person.statusEffects,
    },
  };
  delete updatedPerson.statusEffects[statusEffect];

  GameManager.getInstance().updateGameData({
    people: {
      [updatedPerson.id]: updatedPerson,
    },
  });

  return {
    people: {
      [updatedPerson.id]: updatedPerson,
    },
  };
};

/**
 * Simulate the the person does on a given day.
 */
export const simulateDay = (person: Person) => {
  const completedActivities: string[] = [];
  const updates: SimulatedActivityResolution[] = [];
  for (let index = 0; index < 4; index++) {
    updates.push(simulateActivity(person, completedActivities)!);
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

export const setCodename = (personId: string, codename: string) => {
  const person = GameManager.getInstance().gameData.people[personId];
  const updatedPerson = {
    ...person,
    agent: {
      ...person.agent!,
      codename,
    },
  };

  GameManager.getInstance().updateGameData({
    people: {
      [updatedPerson.id]: updatedPerson,
    },
  });

  return {
    people: {
      [updatedPerson.id]: updatedPerson,
    },
  };
};
