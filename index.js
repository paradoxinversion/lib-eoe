import * as gameGenerators from './src/generators/game.ts';
const eventGenerators = require("./src/generators/gameEvents");
const citizens = require("./src/citizens");
const combat = require("./src/combat");
import * as gameEvents from './src/gameEvents.ts'
const nations = require("./src/nations");
const organizations = require("./src/organization");
const utilities = require("./src/utilities");
const zones = require("./src/zones");
const nameGenerators = require("./src/generators/names");
import * as plots from './src/plots.ts'
const buildings = require("./src/buildings");
const gameSetup = require("./src/gameSetup");
const dataManagement = require("./src/dataManagement");
const actions = require("./src/actions");
import { GameManager } from "./src/GameManager.ts";

module.exports = {
  gameGenerators,
  eventGenerators,
  citizens,
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
