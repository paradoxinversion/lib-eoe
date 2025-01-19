import {
  Building,
  GoverningOrganization,
  Nation,
  Person,
  Zone,
} from '../../types/entities';

const evilEmpireOrgId = 'o_879d5c4a-d08b-43d2-af5b-b192babf7e71';
const evilEmpireNationId = 'n_223c06ae-14e6-4b70-9926-53bf1e6b10c7';
const cpuOrgId = 'o_879d5c4a-d08b-43d2-af5b-b192babf7e72';
const cpuNationId = 'n_223c06ae-14e6-4b70-9926-53bf1e6b10c8';
const evilEmpireOrg: GoverningOrganization = {
  id: evilEmpireOrgId,
  nationId: evilEmpireNationId,
  evil: true,
  name: 'EVIL Empire',
  wealth: 50000,
  science: 0,
  infrastructure: 0,
  totalEvil: 0,
  captives: [],
  statusEffects: [],
  opinions: {
    [cpuNationId]: 0,
  },
};

const CPUOrg: GoverningOrganization = {
  id: evilEmpireOrgId,
  nationId: evilEmpireNationId,
  evil: true,
  name: 'EVIL Empire',
  wealth: 50000,
  science: 0,
  infrastructure: 0,
  totalEvil: 0,
  captives: [],
  statusEffects: [],
  opinions: {
    [evilEmpireNationId]: 0,
  },
};

const evilEmpireNation: Nation = {
  id: evilEmpireNationId,
  name: 'EVIL Empire',
  size: 3,
  organizationId: evilEmpireOrg.id,
};

const evilOverlordId = 'p_9bf9c767-087b-46ad-9867-0e1006de3f6f';

const overlord: Person = {
  id: evilOverlordId,
  nationId: evilEmpireNationId,
  homeZoneId: 'z_5532f0fd-06ab-4df8-93cb-206a478e6478',
  name: 'EVIL Overlord',
  dead: false,
  agent: {
    department: 'overlord',
    organizationId: evilEmpireOrgId,
    salary: 0,
    commanderId: '',
    codename: 'OVERLORD',
    embeddedAt: null,
  },
  isPersonnel: false,
  isCaptive: false,
  personnelAt: '',
  hospitalizedAt: null,
  standardAttributes: {
    strength: 5,
    intelligence: 10,
    constitution: 7,
    agility: 2,
    empathy: 1,
  },
  derivedAttributes: {
    health: {
      currentHealth: 53,
      totalHealth: 53,
    },
    defense: 20,
    evasion: 13,
  },
  intelAttributes: {
    intelligenceLevel: 25,
    loyalty: 100,
    loyalties: {
      [evilEmpireOrgId]: 80,
      [cpuOrgId]: 0,
    },
  },
  wealth: 368,
  statusEffects: {
    'conspiracy-nut': -1,
  },
  skills: {
    espionage: 4,
    disguise: 34,
    science: 29,
    administration: 10,
    leadership: 20,
    combat: 10,
    security: 58,
    medicine: 55,
    persuasion: 10,
  },
  residentAt: 'b_8f630bd5-5e39-4e72-870a-99ef3ebb1411',
};

const buildingTemplate: Building = {
  id: 'b_',
  name: 'Test Building',
  zoneId: 'z_',
  organizationId: 'o_',
  type: 'apartment',
  personnel: [],
  basicAttributes: {
    upkeepCost: 600,
    infrastructureCost: 6,
    maxPersonnel: 4,
  },
  resourceAttributes: {
    wealthBonus: 0,
    housingCapacity: 47,
    scienceBonus: 1,
    infrastructure: 0,
    hospitalBeds: 0,
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

const governingOrgTemplate: GoverningOrganization = {
  id: 'o_',
  nationId: 'n_',
  evil: false,
  name: '',
  wealth: 50000,
  science: 0,
  infrastructure: 0,
  totalEvil: 0,
  captives: [],
  statusEffects: [],
  opinions: {
    o_: -10,
  },
};

const nationTemplate: Nation = {
  id: 'n_',
  name: '',
  size: 5,
  organizationId: 'o_',
};

const personTemplate: Person = {
  id: 'p_',
  nationId: 'n_',
  homeZoneId: 'z_',
  name: '',
  dead: false,
  agent: null,
  isPersonnel: false,
  isCaptive: false,
  personnelAt: '',
  hospitalizedAt: null,
  standardAttributes: {
    strength: 4,
    intelligence: 1,
    constitution: 8,
    agility: 10,
    empathy: 4,
  },
  derivedAttributes: {
    health: {
      currentHealth: 58,
      totalHealth: 58,
    },
    defense: 26,
    evasion: 22,
  },
  intelAttributes: {
    intelligenceLevel: 75,
    loyalty: 5,
    loyalties: {
      z_: 25,
    },
  },
  wealth: 312,
  statusEffects: {},
  skills: {
    espionage: 61,
    disguise: 20,
    science: 14,
    administration: 32,
    leadership: 12,
    combat: 6,
    security: 25,
    medicine: 53,
    persuasion: 10,
  },
  residentAt: 'b_',
};

const zoneTemplate: Zone = {
  id: 'z_',
  nationId: 'n_',
  name: 'Crimson River',
  size: 68,
  wealth: 2,
  organizationId: 'o_',
  intelligenceLevel: 25,
  intelAttributes: {
    intelligenceLevel: 25,
  },
};
const testEntities = {
  people: {
    overlord,
  },
  templates: {
    building: buildingTemplate,
    organization: governingOrgTemplate,
    nation: nationTemplate,
    person: personTemplate,
    zone: zoneTemplate,
  },
};
export default testEntities;
//
