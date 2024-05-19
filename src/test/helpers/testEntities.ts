import { Person } from '../../types/interfaces/entities';

const overlord: Person = {
  id: 'p_9bf9c767-087b-46ad-9867-0e1006de3f6f',
  nationId: 'n_5aec54af-8e77-4cad-950f-950ad53f888b',
  homeZoneId: 'z_5532f0fd-06ab-4df8-93cb-206a478e6478',
  name: 'EVIL Overlord',
  dead: false,
  agent: {
    department: 'overlord',
    organizationId: 'o_aed7216d-dafe-4ed7-b6cf-7d48c8c61757',
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
      'o_aed7216d-dafe-4ed7-b6cf-7d48c8c61757': 80,
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

const testEntities = {
  people: {
    overlord,
  },
};
export default testEntities;
//
