import * as buildings from './building';
import * as governingOrg from './governingOrg';
import * as person from './person';

const statusEffects = {
  buildings: buildings.default,
  governingOrg: governingOrg.default,
  person: person.default,
};

export default statusEffects;
