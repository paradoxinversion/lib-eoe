/**
 * People related actions.
 */
import { GameData, GameManager } from '../managers/game/GameManager';
import { getActivityParticipants } from '../plots';
import people, { SimulatedActivityResolution } from '../sim/people';
import { PersonStatusEffect } from '../statusEffects/person';
import {
  AgentData,
  AgentDepartment,
  Building,
  Person,
  PersonIntelAttributes,
  PersonStandardAttributes,
} from '../types/interfaces/entities';
import utilities from '../utilities';
import PlotManager from '../managers/plots/PlotManager';
export type ComparisonTypes = 'greater' | 'less' | 'equal';

interface GetPeopleParams {
  limit?: number;
  zone?: {
    zoneId?: string | null;
    excludeZones?: string[];
  };
  nation?: {
    nationId?: string | null;
    excludeNations?: string[];
  };
  agentFilter?: {
    excludeAgents?: boolean;
    department?: AgentDepartment | 'any';
    agentsOnly?: boolean;
    commander?: string;
    excludeParticipants?: boolean;
    excludeDepartments?: AgentDepartment[];
    embeddedOnly?: boolean;
    excludeEmbedded?: boolean;
  };
  personFilter?: {
    excludeDeceased?: boolean;
    excludePersonnel?: boolean;
    deceasedOnly?: boolean;
    organizationId?: string | null;
    excludeCaptured?: boolean;
    capturedOnly?: boolean;
    injuredOnly?: boolean;
    hospitalizedOnly?: boolean;
    noHospitalized?: boolean;
    residentAt?: string;
    excludeResidents?: boolean;
    residentsOnly?: boolean;
    loyaltyFilter?: {
      comparison: ComparisonTypes;
      organizationId: string;
      value: number;
    };
  };

  captive?: {
    captiveOnly?: boolean;
    capturedBy?: string;
  };
}

const GetPeopleDefaultParams: GetPeopleParams = {
  limit: 0,
  zone: {
    zoneId: null,
    excludeZones: [],
  },
  nation: {
    nationId: null,
    excludeNations: [],
  },
  agentFilter: {
    excludeAgents: false,
    department: 'any',
    agentsOnly: false,
    commander: '',
    excludeParticipants: false,
    excludeDepartments: [],
    embeddedOnly: false,
    excludeEmbedded: false,
  },
  personFilter: {
    excludeDeceased: false,
    excludePersonnel: false,
    organizationId: null,
    deceasedOnly: false,
    excludeCaptured: false,
    capturedOnly: false,
    injuredOnly: false,
    hospitalizedOnly: false,
    noHospitalized: false,
    residentAt: '',
    excludeResidents: false,
    residentsOnly: false,
  },
  captive: {
    captiveOnly: false,
    capturedBy: '',
  },
};

/**
 * Get all people in the game that match the given parameters.
 */
const getPeople = (params: GetPeopleParams = {}) => {
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
    (person, index) => {
      // if (options.limit && options.limit > 0 && index >= options.limit) {
      //   return false;
      // }
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

      if (options.personFilter?.excludeCaptured && person.isCaptive) {
        return false;
      }

      if (options.personFilter?.capturedOnly && !person.isCaptive) {
        return false;
      }

      if (options.personFilter?.excludeResidents && person.residentAt) {
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
        options.agentFilter?.department !== 'any' &&
        person.agent?.department !== options.agentFilter?.department
      ) {
        return false;
      }

      if (options.agentFilter?.embeddedOnly && !person.agent?.embeddedAt) {
        return false;
      }

      if (options.agentFilter?.excludeEmbedded && person.agent?.embeddedAt) {
        return false;
      }

      if (options.zone?.zoneId && person.homeZoneId !== options.zone.zoneId) {
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

      if (options.personFilter?.excludePersonnel && person.isPersonnel) {
        return false;
      }

      if (
        options.personFilter?.organizationId &&
        person.agent?.organizationId !== options.personFilter?.organizationId
      ) {
        return false;
      }

      if (options.personFilter?.deceasedOnly && !person.dead) {
        return false;
      }

      if (options.personFilter?.excludeDeceased && person.dead) {
        return false;
      }

      if (
        options.personFilter?.injuredOnly &&
        person.derivedAttributes.health.currentHealth ===
          person.derivedAttributes.health.totalHealth
      ) {
        return false;
      }

      if (options.personFilter?.hospitalizedOnly && !person.hospitalizedAt) {
        return false;
      }

      if (options.personFilter?.noHospitalized && person.hospitalizedAt) {
        return false;
      }

      if (
        options.personFilter?.residentAt &&
        person.residentAt !== options.personFilter?.residentAt
      ) {
        return false;
      }

      if (options.personFilter?.residentsOnly && person.residentAt === null) {
        return false;
      }

      if (options.personFilter?.loyaltyFilter) {
        if (
          options.personFilter.loyaltyFilter.comparison === 'greater' &&
          person.intelAttributes.loyalties[
            options.personFilter.loyaltyFilter.organizationId
          ] < options.personFilter.loyaltyFilter.value
        ) {
          return false;
        }

        if (
          options.personFilter.loyaltyFilter.comparison === 'less' &&
          person.intelAttributes.loyalties[
            options.personFilter.loyaltyFilter.organizationId
          ] > options.personFilter.loyaltyFilter.value
        ) {
          return false;
        }

        if (
          options.personFilter.loyaltyFilter.comparison === 'equal' &&
          person.intelAttributes.loyalties[
            options.personFilter.loyaltyFilter.organizationId
          ] !== options.personFilter.loyaltyFilter.value
        ) {
          return false;
        }
      }

      return true;
    },
  );
};

const getAgentDepartment = (agentData: AgentData) => {
  if (agentData.department === 'troop') {
    return 'Henchman';
  } else if (agentData.department === 'administrator') {
    return 'Administrator';
  } else if (agentData.department === 'scientist') {
    return 'Scientist';
  } else if (agentData.department === 'overlord') {
    return 'Chief Commander';
  } else {
    return 'Doctor';
  }
};

const changeAgentDepartment = (
  theAgent: Person,
  department: AgentDepartment,
): Partial<GameData> => {
  const updatedPerson: Person = {
    ...theAgent,
    agent: {
      ...theAgent.agent!,
      department,
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

const killPerson = (person: Person) => {
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

const updateBasicAttribute = (
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

const updateIntelAttribute = (
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

const updateLoyalty = (person: Person, orgId: string, modAmt: number) => {
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

const setLoyalty = (person: Person, orgId: string, amt: number) => {
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

const initializeLoyalty = (person: Person) => {
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
      loyalties[go.id] = 20 + utilities.randomInt(0, 80);
    } else {
      loyalties[go.id] = utilities.randomInt(0, 70);
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

const updateCurrentHealth = (person: Person, modAmt: number) => {
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

const addPersonStatusEffect = (
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

const removePersonStatusEffect = (
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
const simulateDay = (person: Person) => {
  const completedActivities: string[] = [];
  const activityResolutions: SimulatedActivityResolution[] = [];
  for (let index = 0; index < 4; index++) {
    activityResolutions.push(
      people.simulateActivity(person, completedActivities)!,
    );
  }
  // const update = updates.reduce<Partial<GameData>>(
  //   (ugd, curr) => {
  //     if (curr) {
  //       return {
  //         people: {
  //           ...ugd.people,
  //           ...curr.updatedGamedata?.people,
  //         },
  //       };
  //     }
  //     return ugd;
  //   },
  //   {
  //     people: {},
  //   },
  // );

  const activityNames = completedActivities.map((activity) => activity);

  return { activityResolutions, updatedLog: activityNames };
};

export type SimulateDayResolution = ReturnType<typeof simulateDay>;

const setCodename = (personId: string, codename: string) => {
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

const relocatePerson = (person: Person, zoneId: string) => {
  console.debug('Relocating person', person.id, 'to zone', zoneId);
  const residence =
    person.residentAt ?
      GameManager.getInstance().gameData.buildings[person.residentAt]
    : null;
  const updatedPerson = {
    ...person,
    homeZoneId: zoneId,
    residentAt: null,
  };

  if (residence) {
    const building = GameManager.getInstance().gameData.buildings[residence.id];
    const updatedBuilding = {
      ...building,
      residents: (building as Building).inhabitants.filter(
        (r) => r !== person.id,
      ),
    };
    GameManager.getInstance().updateGameData({
      buildings: {
        [updatedBuilding.id]: updatedBuilding,
      },
    });
  }

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

export default {
  getPeople,
  getAgentDepartment,
  changeAgentDepartment,
  updateBasicAttribute,
  updateIntelAttribute,
  killPerson,
  relocatePerson,
  setCodename,
  simulateDay,
  addPersonStatusEffect,
  removePersonStatusEffect,
  updateCurrentHealth,
  initializeLoyalty,
  setLoyalty,
  updateLoyalty,
};
