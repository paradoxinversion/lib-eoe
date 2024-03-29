import {
  AgentData,
  Building,
  GoverningOrganization,
  Nation,
  Person,
  Zone,
} from '../types/interfaces/entities';

import { throwErrorFromArray, randomInt } from '../utilities';
import { generateCompanyName, generateName } from '../generators/names';
import { GoverningOrgStatusEffects } from '../statusEffects/governingOrg';
import { PersonStatusEffect } from '../statusEffects/person';
const { v4: uuidv4 } = require('uuid');

interface GenerateNationOpts {
  /** The name of the nation. */
  name: string;
  /** The size (amount of zones) of the nation */
  size: number;
}

interface GenerateZoneOpts {
  /** The ID of the nation the zone belongs to */
  nationId?: string;
  /** The name of the zone. */
  name?: string;
  /** The size (amount of citizens...?) */
  size?: number;
  organizationId?: string;
  intelligenceLevel?: number;
}

interface GeneratePersonOpts {
  nationId?: string;
  homeZoneId?: string;
  name?: string;
  initIntelligence?: number;
  initCombat?: number;
  initAdministration?: number;
  initLeadership?: number;
  intelligenceLevel?: number;
  initLoyalty?: number;
}

/**
 * Generate a new nation
 */
const generateNation = ({
  name = 'Unnamed Nation',
  size = 1,
}: GenerateNationOpts): Nation => {
  return {
    id: 'n_' + uuidv4(),
    name: name,
    size: size,
    organizationId: '',
  };
};

/**
 * Generate a number of nations.
 */
const generateNations = (
  /** The amount of nations to generate */
  nationsAmt: number,
  /** The minimum amount of zones in the nation */
  minSize: number,
  /** An object who's keys are nation id's and values are nation objects */
  maxSize: number,
): { [x: string]: Nation } => {
  const errors = [];
  if (nationsAmt === undefined) {
    errors.push("'nationsAmt' is a required parameter.");
  }
  if (minSize === undefined) {
    errors.push("'minSize' is a required parameter.");
  }
  if (maxSize === undefined) {
    errors.push("'maxSize' is a required parameter.");
  }
  if (minSize > maxSize || maxSize < minSize) {
    errors.push("'minSize' must be less than 'maxSize'.");
  }
  throwErrorFromArray(errors);
  const nations: { [x: string]: Nation } = {};
  for (let nationIndex = 0; nationIndex < nationsAmt; nationIndex++) {
    const newNation = generateNation({
      size: randomInt(1, maxSize),
      name: 'Nation ' + nationIndex,
    });
    nations[newNation.id] = newNation;
  }
  return nations;
};

/**
 * Generate a zone
 */
const generateZone = ({
  nationId = 'UNSET',
  name = 'Unnamed Zone',
  size = 50,
  organizationId = 'UNSET',
  intelligenceLevel = 25,
}: GenerateZoneOpts): Zone => {
  return {
    id: 'z_' + uuidv4(),
    nationId,
    name,
    size,
    wealth: randomInt(1, 5),
    organizationId,
    intelligenceLevel,
    intelAttributes: {
      intelligenceLevel,
    },
  };
};

/**
 * Generate a number of zones
 */
const generateZones = (
  /** The amount of zones to create */
  zonesAmt: number,
): { [x: string]: Zone } => {
  const zones: { [x: string]: Zone } = {};
  for (let zoneIndex = 0; zoneIndex < zonesAmt; zoneIndex++) {
    const newZone = generateZone({});
    zones[newZone.id] = newZone;
  }
  return zones;
};

const generatePerson = ({
  nationId = 'UNSET',
  homeZoneId = '',
  name = 'Unnamed Person',
  initIntelligence,
  initCombat,
  initAdministration,
  initLeadership,
  initLoyalty,
  intelligenceLevel = 25,
}: GeneratePersonOpts): Person => {
  const errors: string[] = [];
  throwErrorFromArray(errors);

  const loyalty = initLoyalty || randomInt(1, 100);
  const intelligence = initIntelligence || randomInt(1, 10);
  const combat = initCombat || randomInt(1, 10);
  const administration = initAdministration || randomInt(1, 10);
  const leadership = initLeadership || randomInt(1, 10);

  if (name === 'Unnamed Person') {
    name = generateName();
  }

  const statusEffects: PersonStatusEffect[] = [];
  // "Quirks"
  const isConspiracyNut = randomInt(0, 100) > 90;
  const isSanguine = randomInt(0, 100) > 90;
  const isParanoid = randomInt(0, 100) > 90;
  if (isConspiracyNut) {
    statusEffects.push('conspiracy-nut');
  }

  if (isSanguine) {
    statusEffects.push('sanguine');
  }

  if (isParanoid) {
    statusEffects.push('paranoid');
  }
  return {
    id: 'p_' + uuidv4(),
    nationId,
    homeZoneId,
    name,
    dead: false,
    agent: null,
    isPersonnel: false,
    isCaptive: false,
    basicAttributes: {
      combat,
      intelligence,
      leadership,
      administration,
    },
    intelAttributes: {
      intelligenceLevel,
      loyalty,
      loyalties: {
        [homeZoneId]: 20 + loyalty,
      },
    },
    vitalAttributes: {
      health: 10,
      currentHealth: 10,
    },
    wealth: randomInt(50, 500),
    statusEffects,
  };
};

/**
 * Generate an amount of people
 */
const generatePeople = (peopleAmt: number): { [x: string]: Person } => {
  const people: { [x: string]: Person } = {};
  for (let personIndex = 0; personIndex < peopleAmt; personIndex++) {
    const person = generatePerson({});
    people[person.id] = person;
  }
  return people;
};

/**
 * Generate agent data that can be attached to a person
 */
const generateAgentData = (
  /** The ID of the organization this agent will be associated with */
  organizationId: string,
  /** 0 (troop), 1 (administrator), 2 (scientist), or 3 (governing org leader) */
  department: number,
  /** The id of the Agent that is directly superior to this one */
  /** the agent's monthly pay */
  salary: number,
  commanderId?: string,
): AgentData => {
  return {
    department,
    organizationId,
    salary,
    commanderId: commanderId || '',
  };
};

interface GenerateGoverningOrgOpts {
  /** The ID of the nation the Org belongs to */
  nationId: string;
  evil?: boolean;
  name?: string;
}

/**
 * Gnerate a Governning Organization
 */
const generateGoverningOrg = ({
  nationId,
  evil = false,
  name = 'Unnamed Organization',
}: GenerateGoverningOrgOpts): GoverningOrganization => {
  const errors = [];
  if (!nationId) {
    errors.push("'nationId' is a required option parameter.");
  }
  throwErrorFromArray(errors);
  const statusEffects: GoverningOrgStatusEffects[] = [];
  return {
    id: 'o_' + uuidv4(),
    nationId,
    evil,
    name,
    wealth: 100,
    science: 0,
    infrastructure: 0,
    totalEvil: 0,
    captives: [],
    statusEffects,
  };
};
interface GenerateBuildingOpts {
  zoneId: string;
  buildingType: string;
  organizationId: string;
  infrastructureCost: number;
  upkeepCost: number;
}
const generateBuilding = ({
  zoneId,
  buildingType,
  organizationId,
  infrastructureCost,
  upkeepCost,
}: GenerateBuildingOpts): Building => {
  const errors = [];
  if (!zoneId) {
    errors.push("'zoneId' is a required option parameter.");
  }

  if (!buildingType) {
    errors.push("'buildingType' is a required option parameter.");
  }

  if (!organizationId) {
    errors.push("'organizationId' is a required option parameter.");
  }

  if (!infrastructureCost) {
    errors.push("'infrastructureCost' is a required option parameter.");
  }

  if (!upkeepCost) {
    errors.push("'upkeepCost' is a required option parameter.");
  }
  throwErrorFromArray(errors);
  let wealthBonus = 0;
  let housingCapacity = 0;
  let maxPersonnel = 4;
  let infrastructureBonus = 0;
  switch (buildingType) {
    case 'bank':
      wealthBonus = randomInt(50, 200);
      break;

    case 'apartment':
      housingCapacity = randomInt(10, 20);
      break;

    case 'laboratory':
      maxPersonnel = randomInt(1, 5);
      break;
    case 'office':
      infrastructureBonus = randomInt(15, 30);
      break;
    default:
      break;
  }
  return {
    id: 'b_' + uuidv4(),
    name: generateCompanyName(),
    zoneId,
    organizationId,
    type: buildingType,
    personnel: [],
    basicAttributes: {
      upkeepCost,
      infrastructureCost,
      maxPersonnel,
    },
    resourceAttributes: {
      wealthBonus,
      housingCapacity,
      scienceBonus: 1,
      infrastructure: infrastructureBonus,
    },
    intelAttributes: {
      intelligenceLevel: 25,
    },
  };
};

export {
  generateNation,
  generateNations,
  generateZone,
  generateZones,
  generatePerson,
  generatePeople,
  generateAgentData,
  generateGoverningOrg,
  generateBuilding,
};
