const personStatusEffects = {
  paranoid: {
    name: 'Paranoid',
    description:
      'The person people thinks (aside from us) are out to get them.',
  },
  ['conspiracy-nut']: {
    name: 'Conspiracy Nut',
    description:
      'The person has an unhealthy obsession with conspiracy theories.',
  },
  sanguine: {
    name: 'Sanguine',
    description: 'The person is always optimistic.',
  },
  ['artistically-inclined']: {
    name: 'Artisically Inclined',
    description: 'The person is artistically inclined.',
  },
  clever: {
    name: 'Clever',
    description: 'The person is clever.',
  },
  pacifist: {
    name: 'Pacificist',
    description: 'The person is a pacifist.',
  },
  righteous: {
    name: 'Righteous',
    description: 'The person is is exceptionally good.',
  },
  
};

export type PersonStatusEffect = keyof typeof personStatusEffects;
export default personStatusEffects;
