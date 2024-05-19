/**
 * Governing Org Status Effects
 */

const statusEffects = {
  'centralized-telecommunications': {
    name: 'centralized-telecommunications',
    description: 'The nation has centralized telecommunications.',
    requires: [],
    prohibits: [],
  },
  'hyperrefractive-materials': {
    name: 'hyperrefractive-materials',
    description: 'The nation has hyperrefractive materials.',
    requires: [],
    prohibits: [],
  },
  'fraudulent-activity': {
    name: 'fraudulent-activity',
    description: 'The nation is capable of producing fraudulent documents.',
    requires: [],
    prohibits: [],
  },
  counterfeiter: {
    name: 'counterfeiter',
    description: 'The nation is capable of counterfeiting.',
    requires: ['fraudulent-activity'],
    prohibits: [],
  },
  'basic-bombs': {
    name: 'basic-bombs',
    description:
      'The nation can create basic explosives (without agents killing themselves).',
    requires: [],
    prohibits: [],
  },
  'explosive-eggheads': {
    name: 'explosive-eggheads',
    description:
      "The nation can create advanced explosives (mostly) only damage what they're intended to.",
    requires: ['basic-bombs'],
    prohibits: [],
  },
  'rocket-scientists': {
    name: 'rocket-scientists',
    description: 'The nation can create rockets.',
    requires: ['basic-bombs'],
    prohibits: [],
  },
  'carrier-pigeons': {
    name: 'carrier-pigeons',
    description: 'The nation can utilize carrier pigeons.',
    requires: [],
    prohibits: [],
  },
  'courier-pigeons': {
    name: 'courier-pigeons',
    description: 'The nation can utilize courier pigeons.',
    requires: ['carrier-pigeons'],
    prohibits: [],
  },
  'missile-pigeons': {
    name: 'missile-pigeons',
    description: 'The nation can utilize pigeon guided missiles.',
    requires: ['carrier-pigeons', 'rocket-scientists'],
    prohibits: [],
  },
  'pigeon-missiles': {
    name: 'pigeon-missiles',
    description: 'The nation can utilize missile guided pigeons.',
    requires: ['carrier-pigeons', 'rocket-scientists'],
    prohibits: [],
  },
  'encryption-protocols': {
    name: 'encryption-protocols',
    description: 'The nation has encryption protocols.',
    requires: [],
    prohibits: [],
  },
  'clear-visors': {
    name: 'clear-visors',
    description: 'The org utilizes clear helmet visors.',
    requires: [],
    prohibits: [],
  },
  pet: {
    name: 'pet',
    description: 'The evil overlord has a pet.',
    requires: [],
    prohibits: [],
  },
  'no-prisoners': {
    name: 'no-prisoners',
    description:
      'The nation takes no prisoners. People that would be taken captive are instead killed.',
    requires: [],
    prohibits: [],
  },
  'miniaturized-locomotion': {
    name: 'miniaturized-locomotion',
    description: 'The nation has miniaturized locomotion.',
    requires: [],
    prohibits: [],
  },
  'micro-flight-control': {
    name: 'micro-flight-control',
    description: 'The nation has drone technology.',
    requires: ['miniaturized-locomotion'],
    prohibits: [],
  },
  'empire-intranet': {
    name: 'empire-intranet',
    description:
      "Empire Intranet will allow us to closer monitor our citizen's online habits and secrets.",
    requires: ['centralized-telecommunications'],
    prohibits: [],
  },
  'evil-broadcast-company': {
    name: 'evil-broadcast-company',
    description:
      "Three words: EVIL Broadcast Company. It's like the BBC, but EVIL.",
    requires: ['centralized-telecommunications', 'empire-intranet'],
    prohibits: [],
  },
  'free-internet': {
    name: 'free-internet',
    description: '',
    requires: [],
    prohibits: ['empire-intranet'],
  },
};

export type GoverningOrgStatusEffects = keyof typeof statusEffects;
export default statusEffects;
