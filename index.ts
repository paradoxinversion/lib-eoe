import * as gameGenerators from './src/generators/game';
import * as combat from './src/combat/combat';
import * as gameEvents from './src/gameEvents';
import * as nations from './src/actions/nations';
import * as organizations from './src/organization';
import * as utilities from './src/utilities';
import * as zones from './src/zones';
import * as nameGenerators from './src/generators/names';
import * as plots from './src/plots';
import * as buildings from './src/buildings';
import * as gameSetup from './src/gameSetup';
import * as dataManagement from './src/dataManagement/dataManagement';
import actions from './src/actions';
import * as managers from './src/managers';
import { GameManager } from './src/managers/game/GameManager';
import generators from './src/generators';
import shufflebag from './src/managers/shufflebag';
import statusEffects from './src/statusEffects';
import config from './config';
import settings from './config/config';

const empireOfEvil = {
  settings,
  entities: {
    organizations,
    nations,
    zones,
    buildings,
  },
  generators,
  plots,
  actions,
  managers,
};

export {
  gameGenerators,
  // eventGenerators,
  combat,
  gameEvents,
  nations,
  organizations,
  utilities,
  zones,
  nameGenerators,
  plots,
  buildings,
  gameSetup,
  dataManagement,
  actions,
  GameManager,
};
