const gameGenerators = require("./src/generators/game");
const eventGenerators = require("./src/generators/gameEvents");
const citizens = require("./src/citizens");
const combat = require("./src/combat");
const gameEvents = require("./src/gameEvents");
const nations = require("./src/nations");
const organizations = require("./src/organization");
const utilities = require("./src/utilities");
const zones = require("./src/zones");
const nameGenerators = require("./src/generators/names");
const plots = require("./src/plots");
const buildings = require("./src/buildings");
const gameSetup = require("./src/gameSetup");
const dataManagement = require("./src/dataManagement");
const actions = require("./src/actions");
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
};
