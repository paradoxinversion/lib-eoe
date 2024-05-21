import {
  Building,
  GoverningOrganization,
  Nation,
  Person,
} from '../../types/interfaces/entities';

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
  },
  residentAt: 'b_8f630bd5-5e39-4e72-870a-99ef3ebb1411',
};

const apartment: Building = {
  id: 'b_2d2461ce-c75c-405d-b8ed-8643ed466b12',
  name: 'Conquest Holdings',
  zoneId: 'z_e3ef7645-f4ff-4e5e-922f-acf7b628f8b6',
  organizationId: 'o_ee174571-83f7-4fc9-84c7-7273b41f00f3',
  type: 'apartment',
  personnel: [
    'p_622f27d4-52c4-478d-bc49-13a6942818c5',
    'p_d5e7601b-4415-4a89-9240-8ac57a4fa451',
    'p_591c45e1-f4cf-4fae-8415-11eb0a8c7251',
    'p_1ce9201d-512b-4ef0-9055-9ec9808cd85c',
  ],
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

const testEntities = {
  people: {
    overlord,
  },
};
export default testEntities;
//
