import {
  AgentData,
  AgentDepartment,
  Building,
  GoverningOrganization,
  Nation,
  Person,
  Zone,
} from '../types/interfaces/entities';

import utilities from '../utilities';
import { generateCompanyName, generateName } from '../generators/names';
import { GoverningOrgStatusEffects } from '../statusEffects/governingOrg';
import { BuildingType } from '../buildings';
import settings from '../../config/config';
import ShufflebagManager from '../managers/shufflebag/ShufflebagManager';
// const { v4: uuidv4 } = require('uuid');
import { v4 as uuidv4 } from 'uuid';

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
 * Generate a zone
 */
const generateZone = ({
  nationId = 'UNSET',
  name = 'Unnamed Zone',
  size = utilities.randomInt(
    settings.worldGen.zones.minSize,
    settings.worldGen.zones.maxSize,
  ),
  organizationId = 'UNSET',
  intelligenceLevel = settings.worldGen.zones.defaultIntelligenceLevel,
}: GenerateZoneOpts): Zone => {
  return {
    id: 'z_' + uuidv4(),
    nationId,
    name,
    size,
    wealth: utilities.randomInt(
      settings.worldGen.zones.minWealth,
      settings.worldGen.zones.maxWealth,
    ),
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

const getSkillBase = () => {
  const rank =
    ShufflebagManager.getInstance().shuffleBags['skillBaseShufflebag'].next();
  switch (rank) {
    case 'Expert':
      return utilities.randomInt(80, 100);
    case 'Professional':
      return utilities.randomInt(60, 80);
    case 'Skilled':
      return utilities.randomInt(40, 60);
    case 'Novice':
      return utilities.randomInt(20, 40);
    case 'Amateur':
      return utilities.randomInt(0, 20);
    default:
      return utilities.randomInt(0, 20);
  }
};

const getAttributeBase = () => {
  const rank =
    ShufflebagManager.getInstance().shuffleBags[
      'attributeBaseShufflebag'
    ].next();
  switch (rank) {
    case 'Professional':
      return utilities.randomInt(8, 9);
    case 'Skilled':
      return utilities.randomInt(6, 7);
    case 'Novice':
      return utilities.randomInt(4, 5);
    case 'Amateur':
      return utilities.randomInt(2, 3);
    default:
      return utilities.randomInt(0, 1);
  }
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
  intelligenceLevel = settings.worldGen.people.defaultIntelligenceLevel,
}: GeneratePersonOpts): Person => {
  if (name === 'Unnamed Person') {
    name = generateName();
  }

  // Standard Attributes
  const strength = utilities.randomInt(
    settings.worldGen.people.attributeMin,
    settings.worldGen.people.attributeMax,
  );
  const constitution = utilities.randomInt(
    settings.worldGen.people.attributeMin,
    settings.worldGen.people.attributeMax,
  );
  const agility = utilities.randomInt(
    settings.worldGen.people.attributeMin,
    settings.worldGen.people.attributeMax,
  );
  const intelligence =
    initIntelligence ||
    utilities.randomInt(
      settings.worldGen.people.attributeMin,
      settings.worldGen.people.attributeMax,
    );

  const loyalty = initLoyalty || utilities.randomInt(1, 100);
  const combat = initCombat || utilities.randomInt(1, 10);

  // Derived Attriibutes
  const totalHealth =
    constitution * 5 + strength * 2 + utilities.randomInt(1, 10);
  const defense = constitution * 2 + utilities.randomInt(1, 10);
  const evasion = agility * 2 + utilities.randomInt(1, 10);

  // "Quirks"
  const statusEffects: { [x: string]: number } = {};
  const isConspiracyNut = utilities.randomInt(0, 100) > 90;
  const isSanguine = utilities.randomInt(0, 100) > 90;
  const isParanoid = utilities.randomInt(0, 100) > 90;
  if (isConspiracyNut) {
    // statusEffects.push('conspiracy-nut');
    statusEffects['conspiracy-nut'] = -1;
  }

  if (isSanguine) {
    statusEffects['sanguine'] = -1;
  }

  if (isParanoid) {
    statusEffects['paranoid'] = -1;
  }

  // Skills
  const espionage = getSkillBase();

  const disguise = getSkillBase();

  const science = getSkillBase();

  const administration = initAdministration || getSkillBase();

  const leadership = initLeadership || getSkillBase();

  const security = getSkillBase();

  const medicine = getSkillBase();

  return {
    id: 'p_' + uuidv4(),
    nationId,
    homeZoneId,
    name,
    dead: false,
    agent: null,
    isPersonnel: false,
    isCaptive: false,
    personnelAt: '',
    hospitalizedAt: null,
    standardAttributes: {
      strength,
      intelligence,
      constitution,
      agility,
      empathy: utilities.randomInt(1, 10),
    },
    derivedAttributes: {
      health: {
        currentHealth: totalHealth,
        totalHealth,
      },
      defense,
      evasion,
    },
    intelAttributes: {
      intelligenceLevel,
      loyalty,
      loyalties: {
        [homeZoneId]: 20 + loyalty,
      },
    },
    wealth: utilities.randomInt(50, 500),
    statusEffects,
    skills: {
      espionage,
      disguise,
      science,
      administration,
      leadership,
      combat,
      security,
      medicine,
      persuasion: getSkillBase(),
    },
    residentAt: null,
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
  department: AgentDepartment,
  /** The id of the Agent that is directly superior to this one */
  /** the agent's monthly pay */
  salary: number,
  commanderId?: string,
  codeName?: string,
): AgentData => {
  return {
    department,
    organizationId,
    salary,
    commanderId: commanderId || '',
    codename: codeName || '',
    embeddedAt: null,
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
  const statusEffects: GoverningOrgStatusEffects[] = [];
  return {
    id: 'o_' + uuidv4(),
    nationId,
    evil,
    name,
    wealth: 50000,
    science: 0,
    infrastructure: 0,
    totalEvil: 0,
    captives: [],
    statusEffects,
    opinions: {},
  };
};
interface GenerateBuildingOpts {
  zoneId: string;
  buildingType: BuildingType;
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
  let wealthBonus = 0;
  let housingCapacity = 0;
  let maxPersonnel = 4;
  let infrastructureBonus = 0;
  let beds = 0;
  switch (buildingType) {
    case 'bank':
      wealthBonus = utilities.randomInt(
        settings.worldGen.buildings.minWealthBonus,
        settings.worldGen.buildings.maxWealthBonus,
      );
      break;

    case 'apartment':
      housingCapacity = utilities.randomInt(
        settings.worldGen.buildings.minHousingCapacity,
        settings.worldGen.buildings.maxHousingCapacity,
      );
      break;

    case 'laboratory':
      maxPersonnel = utilities.randomInt(
        settings.worldGen.buildings.minSize,
        settings.worldGen.buildings.maxSize,
      );
      break;
    case 'office':
      infrastructureBonus = utilities.randomInt(
        settings.worldGen.buildings.minInfrastuctureBonus,
        settings.worldGen.buildings.maxInfrastuctureBonus,
      );
      break;
    case 'hospital':
      beds = utilities.randomInt(
        settings.worldGen.buildings.minHospitalBeds,
        settings.worldGen.buildings.maxHospitalBeds,
      );
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
      hospitalBeds: beds,
    },
    intelAttributes: {
      intelligenceLevel: 25,
    },
    statusEffects: [],
    inhabitants: [],
    structure: {
      currentHealth: 50,
      totalHealth: 50,
    },
  };
};

export default {
  generateNation,
  generateZone,
  generateZones,
  generatePerson,
  generatePeople,
  generateAgentData,
  generateGoverningOrg,
  generateBuilding,
};
