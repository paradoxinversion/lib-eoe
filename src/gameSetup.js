import { GameManager } from "./GameManager.ts";
const { getControlledZones, hireAgent } = require("./organization");
const { getZoneCitizens } = require("./zones");

import {
  generateAgentData,
  generateGoverningOrg,
  generateNation,
  generateNations,
  generatePerson,
  generateZone,
  generateBuilding,
  generateZones,
} from './generators/game.ts'

const { nationNames, generateZoneName } = require("./generators/names");
const { Shufflebag, randomInt } = require("./utilities");
const settings = require("./config");
const { buildingsSchematics } = require("./buildings");
import { GameEventQueue } from "./gameEvents.ts";
import { PlotManager, ActivityManager } from "./plots.ts";
/**
 * The main Shufflebag for building types
 */
const buildingShufflebag = Shufflebag({
  bank: 1,
  apartment: 1,
  laboratory: 1,
});

/**
 * The main Shufflebag for recruit departments.
 * This is used to determine what recruits are
 * enlisted by none EOE nations.
 */
const recruitDepartmentShufflebag = Shufflebag({
  0: 1,
  1: 1,
  2: 1,
});

/**
 * The main Shufflebag for nation names,
 */
const nationNameShuffleBag = Shufflebag(
  nationNames.reduce((nameMap, name) => {
    return {
      ...nameMap,
      [name]: 1,
    };
  }, {})
);

/**
 * Sets up a new EOE game, spawning Nations, Orgs,
 * Zones, and People, including the EVIL Empire.
 * @param {GameManager} gameManager
 * @returns {import("./typedef").GameData} An object containing game data
 */
const handleNewGame = (gameManager) => {
  /**
   * @type {import("./typedef").GameData}
   */
  const newGameData = {
    nations: {},
    governingOrganizations: {},
    zones: {},
    people: {},
    player: {},
    buildings: {},
    gameDate: new Date("2000-1-1"),
  };

  // Create the EVIL Empire nation
  const evilEmpireNation = generateNation({
    name: "EVIL Empire",
    size: 1,
  });
  newGameData.nations[evilEmpireNation.id] = evilEmpireNation;
  const evilEmpireOrg = generateGoverningOrg({
    nationId: evilEmpireNation.id,
    evil: true,
    name: "EVIL Empire",
  });
  newGameData.governingOrganizations[evilEmpireOrg.id] = evilEmpireOrg;

  evilEmpireNation.organizationId = evilEmpireOrg.id;
  const evilZone = generateZone({
    nationId: evilEmpireNation.id,
    name: "Evil HQ",
    size: 10,
    organizationId: evilEmpireOrg.id,
  });
  newGameData.zones[evilZone.id] = evilZone;

  const evilOverlord = generatePerson({
    nationId: evilEmpireNation.id,
    homeZoneId: evilZone.id,
    name: "EVIL Overlord",
    initIntelligence: 10,
    initCombat: 10,
    initLeadership: 10,
    initLoyalty: 100,
    initAdministration: 10,
  });

  evilOverlord.agent = generateAgentData(evilEmpireOrg.id, 3, null, 0);

  newGameData.people[evilOverlord.id] = evilOverlord;

  newGameData.player.empireId = evilEmpireNation.id;
  newGameData.player.overlordId = evilOverlord.id;
  newGameData.player.organizationId = evilEmpireOrg.id;

  // Generate initial nations
  newGameData.nations = {
    ...newGameData.nations,
    ...generateNations(settings.NATIONS_AMT, 1, 10),
  };

  // For each nation that is not the EOE, create a gov org and name
  Object.values(newGameData.nations).forEach((nation) => {
    if (nation.id !== evilEmpireNation.id) {
      nation.name = nationNameShuffleBag.next();
      const newOrg = generateGoverningOrg({
        nationId: nation.id,
      });
      nation.organizationId = newOrg.id;
      newGameData.governingOrganizations[newOrg.id] = newOrg;
    }
  });

  // For each nation that is not the EOE, create zones
  Object.values(newGameData.nations).forEach((nation) => {
    if (nation.id !== evilEmpireNation.id) {
      const newZones = generateZones(nation.size);

      Object.values(newZones).forEach((zone) => {
        zone.name = generateZoneName();
        newGameData.zones[zone.id] = {
          ...zone,
          nationId: nation.id,
          organizationId: nation.organizationId,
        };
      });
    }
  });

  // For each zone, create people
  Object.values(newGameData.zones).forEach((zone) => {
    // if (zone.nationId !== evilEmpireNation.id) {
    for (let personIndex = 0; personIndex < zone.size; personIndex++) {
      const p = generatePerson({
        nationId: zone.nationId,
        homeZoneId: zone.id,
      });
      newGameData.people[p.id] = p;
    }
    // }
  });

  // For each zone, create Buildings
  // DO create these for the empire
  Object.values(newGameData.zones).forEach((zone) => {
    // determine how many buildings are in this zone
    const zoneBuildingsAmt = randomInt(5, 10);
    for (
      let buildingIndex = 0;
      buildingIndex < zoneBuildingsAmt;
      buildingIndex++
    ) {
      const buildingType = buildingShufflebag.next();
      const schematic = buildingsSchematics[buildingType];
      const b = generateBuilding({
        zoneId: zone.id,
        buildingType: schematic.buildingType,
        infrastructureCost: schematic.infrastructureCost,
        organizationId: newGameData.nations[zone.nationId].organizationId,
        upkeepCost: schematic.upkeepCost,
      });
      newGameData.buildings[b.id] = b;
    }
  });
  gameManager.updateGameData(newGameData);

};

/**
 *
 * @param {GameManager} gameManager
 */
const hireStartingAgents = (gameManager) => {
  const gameData = gameManager.gameData;
  /**
   * @type {import("./typedef").UpdatedGameData}
   */
  const updatedGameData = JSON.parse(JSON.stringify(gameData));
  /**
   * @type {Object.<string, import("./typedef").Person>}
   */
  const updatedPeople = {};

  Object.values(gameData.governingOrganizations).forEach((org) => {
    if (org.id === gameData.player.organizationId) {
      return null;
    }

    const orgZones = getControlledZones(gameManager, org.id);
    const leader = generatePerson({
      homeZoneId: orgZones[0].id,
      nationId: org.nationId,
      initIntelligence: 10,
      initCombat: 10,
      initLeadership: 200,
      initLoyalty: 100,
      initAdministration: 10,
    });

    const leaderAgent = generateAgentData(org.id, 3);
    leader.agent = leaderAgent;
    updatedPeople[leader.id] = leader;
    orgZones.forEach((zone) => {
      const zoneCitizens = getZoneCitizens(gameManager, zone.id);
      for (let recruitIndex = 0; recruitIndex < 3; recruitIndex++) {
        const recruitType = recruitDepartmentShufflebag.next().toString();
        const recruit = zoneCitizens[recruitIndex];
        updatedPeople[recruit.id] = hireAgent(
          recruit,
          org.id,
          recruitType,
          leader.id,
          1
        );
      }
    });
  });
  updatedGameData.people = {
    ...gameData.people,
    ...updatedPeople,
  };
  
  gameManager.updateGameData(updatedGameData)
  return updatedGameData;
};

const createGameManager = () =>
  new GameManager(
    new GameEventQueue(),
    new PlotManager(),
    new ActivityManager()
  );

module.exports = {
  handleNewGame,
  hireStartingAgents,
  createGameManager
};
