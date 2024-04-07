const statusEffects = {
  trashed: {
    name: 'trashed',
    description: 'The building has been trashed.',
    requires: [],
    prohibits: [],
  },
};

export default statusEffects;
export type BuildingStatusEffects = keyof typeof statusEffects;
