import { GameData, GameManager } from './GameManager';
import { getControlledZones, hireAgent } from './organization';
import { getZoneCitizens } from './zones';

import {
  generateAgentData,
  generateGoverningOrg,
  generateNation,
  generateNations,
  generatePerson,
  generateZone,
  generateBuilding,
  generateZones,
} from './generators/game';

import { nationNames, generateZoneName } from './generators/names';
import { Shufflebag, randomInt } from './utilities';
import settings from './config';
import { addPersonnel, buildingsSchematics, getBuildings } from './buildings';
import { GameEventQueue } from './gameEvents';
import { PlotManager, ActivityManager } from './plots';
import { Person } from './types/interfaces/entities';
import {
  getPeople,
  initializeLoyalty,
  setLoyalty,
  updateLoyalty,
} from './actions/people';
import { ScienceManager } from './managers/science';
import { SCIENCE_PROJECTS } from './managers/scienceProjects';
/**
 * The main Shufflebag for building types
 */
const buildingShufflebag = Shufflebag({
  bank: 2,
  apartment: 1,
  laboratory: 1,
  office: 1,
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
  }, {}),
);

/**
 * Sets up a new EOE game, spawning Nations, Orgs,
 * Zones, and People, including the EVIL Empire.
 */
const handleNewGame = (gameManager: GameManager) => {
  const newGameData: GameData = {
    nations: {},
    governingOrganizations: {},
    zones: {},
    people: {},
    player: {
      empireId: '',
      overlordId: '',
      organizationId: '',
    },
    buildings: {},
    gameDate: new Date('2000-1-1'),
  };

  // Create the EVIL Empire nation
  const evilEmpireNation = generateNation({
    name: 'EVIL Empire',
    size: 1,
  });
  newGameData.nations[evilEmpireNation.id] = evilEmpireNation;
  const evilEmpireOrg = generateGoverningOrg({
    nationId: evilEmpireNation.id,
    evil: true,
    name: 'EVIL Empire',
  });
  newGameData.governingOrganizations[evilEmpireOrg.id] = evilEmpireOrg;

  evilEmpireNation.organizationId = evilEmpireOrg.id;
  const evilZone = generateZone({
    nationId: evilEmpireNation.id,
    name: 'Evil HQ',
    size: 50,
    organizationId: evilEmpireOrg.id,
  });
  evilZone.intelAttributes.intelligenceLevel = 100;
  newGameData.zones[evilZone.id] = evilZone;

  const evilOverlord = generatePerson({
    nationId: evilEmpireNation.id,
    homeZoneId: evilZone.id,
    name: 'EVIL Overlord',
    initIntelligence: 10,
    initCombat: 10,
    initLeadership: 20,
    initLoyalty: 100,
    initAdministration: 10,
  });
  evilOverlord.intelAttributes.loyalties = setLoyalty(
    evilOverlord,
    evilEmpireOrg.id,
    100,
  ).people[evilOverlord.id].intelAttributes.loyalties;
  console.log(evilOverlord.intelAttributes.loyalties);
  evilOverlord.intelAttributes.intelligenceLevel = 100;

  evilOverlord.agent = generateAgentData(evilEmpireOrg.id, 3, 0);

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
    for (let personIndex = 0; personIndex < zone.size; personIndex++) {
      const p = generatePerson({
        nationId: zone.nationId,
        homeZoneId: zone.id,
      });

      if (zone.id === evilZone.id) {
        p.intelAttributes.intelligenceLevel = 75;
      }

      newGameData.people[p.id] = p;
    }
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
 */
const hireStartingAgents = (gameManager: GameManager) => {
  const gameData = gameManager.gameData;
  const updatedGameData = { ...gameData };

  const updatedPeople: { [x: string]: Person } = {};
  const playerData = gameManager.gameData.player;
  Object.values(gameData.governingOrganizations).forEach((org) => {
    if (org.id === playerData.organizationId) {
      const empireZone = getControlledZones(
        gameManager,
        playerData.organizationId,
      )[0];
      const citizens = getPeople(gameManager, { zoneId: empireZone.id });
      // Start at 1, 0 is the Overlord
      for (let recruitIndex = 1; recruitIndex < 9; recruitIndex++) {
        const recruit = hireAgent(
          citizens[recruitIndex],
          playerData.organizationId,
          1,
          playerData.overlordId,
        );
        recruit!.intelAttributes.intelligenceLevel = 100;
        recruit!.intelAttributes.loyalty = 80;
        if (recruit !== null) {
          updatedPeople[recruit.id] = recruit;
        }
      }
      return;
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

    const leaderAgent = generateAgentData(org.id, 1, 10);
    leader.agent = leaderAgent;
    updatedPeople[leader.id] = leader;
    orgZones.forEach((zone) => {
      const zoneCitizens = getZoneCitizens(gameManager, zone.id);
      for (let recruitIndex = 0; recruitIndex < 3; recruitIndex++) {
        const recruitType = recruitDepartmentShufflebag.next().toString();
        const recruit = zoneCitizens[recruitIndex];
        const agentUpdate = hireAgent(recruit, org.id, 1, leader.id);
        if (agentUpdate !== null) {
          updatedPeople[recruit.id] = agentUpdate;
        }
      }
    });
  });
  updatedGameData.people = {
    ...gameData.people,
    ...updatedPeople,
  };

  gameManager.updateGameData(updatedGameData);
  initializeLoyalties(gameManager);
  initializePersonnel(gameManager);
  return updatedGameData;
};

const initializeLoyalties = (gameManager: GameManager) => {
  Object.values(gameManager.gameData.people).forEach((person) => {
    const update = initializeLoyalty(person, gameManager);
    if (update.people[person.id].agent) {
      update.people[person.id].intelAttributes.loyalties = setLoyalty(
        person,
        person.agent?.organizationId!,
        80,
      ).people[person.id].intelAttributes.loyalties;
    }
    gameManager.updateGameData(update);
  });
};

const initializePersonnel = (gameManager: GameManager) => {
  let updatedGamedata = {
    people: {},
    buildings: {},
  };
  getBuildings(gameManager, {}).forEach((building) => {
    // filter out empire buildings
    if (
      building.organizationId === gameManager.gameData.player.organizationId
    ) {
      return;
    }

    // Filter out apartments, they have no workers
    if (building.type === 'apartment') {
      return;
    }

    for (
      let index = 0;
      index < building.basicAttributes.maxPersonnel;
      index++
    ) {
      const people = getPeople(gameManager, {
        excludePersonnel: true,
        zoneId: building.zoneId,
        agentFilter: { excludeAgents: true },
      });
      const p = people[randomInt(0, people.length - 1)];
      gameManager.updateGameData(addPersonnel(p, building) || {});
    }
  });
};

const createGameManager = () =>
  new GameManager(
    new GameEventQueue(),
    new PlotManager(),
    new ActivityManager(),
    new ScienceManager(SCIENCE_PROJECTS),
  );

export { handleNewGame, hireStartingAgents, createGameManager };
