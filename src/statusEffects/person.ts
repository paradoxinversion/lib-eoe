const personStatusEffects = {
  paranoid: {
    name: 'Paranoid',
    description:
      'The person people thinks (aside from us) are out to get them.',
      requires: [],
      prohibits: []
  },
  ['conspiracy-nut']: {
    name: 'Conspiracy Nut',
    description:
      'The person has an unhealthy obsession with conspiracy theories.',
    requires: [],
    prohibits: []
  },
  sanguine: {
    name: 'Sanguine',
    description: 'The person is always optimistic.',
    requires: [],
      prohibits: []
  },
  ['artistically-inclined']: {
    name: 'Artisically Inclined',
    description: 'The person is artistically inclined.',
    requires: [],
      prohibits: []
  },
  clever: {
    name: 'Clever',
    description: 'The person is clever.',
    requires: [],
      prohibits: []
  },
  pacifist: {
    name: 'Pacificist',
    description: 'The person is a pacifist.',
    requires: [],
      prohibits: []
  },
  righteous: {
    name: 'Righteous',
    description: 'The person is is exceptionally good.',
    requires: [],
    prohibits: []
  },
  
};

export type PersonStatusEffect = keyof typeof personStatusEffects;
export default personStatusEffects;
