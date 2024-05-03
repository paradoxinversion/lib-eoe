import { GameData, GameManager } from './GameManager';
import { hireAgent } from './organization';
import { getZoneCitizens } from './zones';
import {
  generateGoverningOrg,
  generateNation,
  generatePerson,
  generateZone,
  generateBuilding,
  generateAgentData,
} from './generators/game';

import { generateZoneName, nationNames } from './generators/names';
import { Shufflebag, randomInt } from './utilities';
import settings from './config';
import {
  BuildingType,
  addInhabitant,
  addPersonnel,
  addResident,
  buildingsSchematics,
  getBuildings,
} from './buildings';
import { Building, Person, Zone } from './types/interfaces/entities';
import { getPeople, initializeLoyalty, setLoyalty } from './actions/people';
import { getZones } from './actions/zones';
import Player from './managers/cpu/Player';
import PlayerManager from './managers/cpu/PlayerManager';
import { GoverningOrgStatusEffects } from './statusEffects/governingOrg';
import { nations } from '..';
/**
 * The main Shufflebag for building types
 */
const buildingShufflebag = Shufflebag({
  bank: settings.worldGen.buildings.generationFrequency.bank,
  apartment: settings.worldGen.buildings.generationFrequency.apartment,
  laboratory: settings.worldGen.buildings.generationFrequency.laboratory,
  office: settings.worldGen.buildings.generationFrequency.office,
  hospital: settings.worldGen.buildings.generationFrequency.hospital,
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

export type NewGameOptions = {
  pet?: boolean;
  overlordName?: string;
  takePrisoners: boolean;
};
type PlayerOptions = {
  isCPU: boolean;
  leaderName?: string;
  organizationEffects: GoverningOrgStatusEffects[];
};

const populateResidences = (orgId: string, nationId: string) => {
  console.debug('Populating residences');
  const orgCitizens = getPeople({ nation: { nationId: nationId } });
  let housedPeople = 0;
  // Get all the apartments
  Object.values(getBuildings({ organizationId: orgId }))
    .filter((building) => building.type === 'apartment')
    .forEach((apartment) => {
      for (let i = 0; i < apartment.resourceAttributes.housingCapacity; i++) {
        const person = Object.values(orgCitizens)[housedPeople];
        if (person) {
          addResident(
            apartment.id,
            Object.values(orgCitizens)[housedPeople].id,
          );
          housedPeople++;
        } else {
          console.log('No more people to house');
          break;
        }
      }
    });
  console.debug('Populated residences', housedPeople);
};

const createPlayer = (options: PlayerOptions) => {
  console.debug('Creating player', options);
  const { isCPU } = options;
  const playerName = isCPU ? 'CPU Player' : 'Player';

  const nationParams = {
    name: isCPU ? 'CPU Nation' : 'EVIL Empire',
    size: randomInt(
      settings.worldGen.nations.minSize,
      settings.worldGen.nations.maxSize,
    ),
  };
  const nation = generateNation(nationParams);
  const orgParams = {
    nationId: nation.id,
    evil: isCPU ? false : true,
    name: isCPU ? 'CPU Organization' : 'EVIL Empire',
  };

  const governOrg = generateGoverningOrg(orgParams);
  if (!isCPU) {
    nation;
  }

  options.organizationEffects.forEach((effect) => {
    governOrg.statusEffects.push(effect);
  });

  nation.organizationId = governOrg.id;
  const zones: { [key: string]: Zone } = {};
  const nationSize = isCPU ? nation.size : 1;
  for (let x = 0; x < nationSize; x++) {
    const z = generateZone({
      name: generateZoneName(),
      nationId: nation.id,
      organizationId: governOrg.id,
    });
    zones[z.id] = z;
  }

  const leader = generatePerson({
    homeZoneId: zones[Object.keys(zones)[0]].id,
    name: options.leaderName || isCPU ? 'CPU Leader' : 'EVIL Overlord',
    nationId: nation.id,
    initIntelligence: 10,
    initCombat: 10,
    initLeadership: 20,
    initLoyalty: 100,
    initAdministration: 10,
  });

  leader.agent = generateAgentData(
    governOrg.id,
    'overlord',
    0,
    undefined,
    'OVERLORD',
  );

  const people = {
    [leader.id]: leader,
  };
  const buildings: { [key: string]: Building } = {};
  // In the first zone, create one of each basic building type
  const bank = generateBuilding({
    zoneId: Object.values(zones)[0].id,
    buildingType: 'bank',
    infrastructureCost: buildingsSchematics['bank'].infrastructureCost,
    organizationId: governOrg.id,
    upkeepCost: buildingsSchematics['bank'].infrastructureCost,
  });
  const hospital = generateBuilding({
    zoneId: Object.values(zones)[0].id,
    buildingType: 'hospital',
    infrastructureCost: buildingsSchematics['hospital'].infrastructureCost,
    organizationId: governOrg.id,
    upkeepCost: buildingsSchematics['hospital'].infrastructureCost,
  });
  const laboratory = generateBuilding({
    zoneId: Object.values(zones)[0].id,
    buildingType: 'laboratory',
    infrastructureCost: buildingsSchematics['laboratory'].infrastructureCost,
    organizationId: governOrg.id,
    upkeepCost: buildingsSchematics['laboratory'].infrastructureCost,
  });
  const office = generateBuilding({
    zoneId: Object.values(zones)[0].id,
    buildingType: 'office',
    infrastructureCost: buildingsSchematics['office'].infrastructureCost,
    organizationId: governOrg.id,
    upkeepCost: buildingsSchematics['office'].infrastructureCost,
  });
  const apartment = generateBuilding({
    zoneId: Object.values(zones)[0].id,
    buildingType: 'apartment',
    infrastructureCost: buildingsSchematics['apartment'].infrastructureCost,
    organizationId: governOrg.id,
    upkeepCost: buildingsSchematics['apartment'].infrastructureCost,
  });
  buildings[hospital.id] = hospital;
  buildings[laboratory.id] = laboratory;
  buildings[office.id] = office;
  buildings[apartment.id] = apartment;
  buildings[bank.id] = bank;

  let peopleTotal = 0;
  Object.values(zones).forEach((zone) => {
    for (let personIndex = 0; personIndex < zone.size; personIndex++) {
      const p = generatePerson({
        nationId: nation.id,
        homeZoneId: zone.id,
      });
      if (!options.isCPU) {
        p.intelAttributes.intelligenceLevel = 75;
      }

      people[p.id] = p;
      peopleTotal++;
    }

    const zoneBuildingsAmt =
      peopleTotal * settings.worldGen.buildings.buildingPopulationMultiplier;
    for (
      let buildingIndex = 0;
      buildingIndex < zoneBuildingsAmt;
      buildingIndex++
    ) {
      const buildingType = buildingShufflebag.next();
      const schematic = buildingsSchematics[buildingType as BuildingType];
      const b = generateBuilding({
        zoneId: zone.id,
        buildingType: schematic.buildingType as BuildingType,
        infrastructureCost: schematic.infrastructureCost,
        organizationId: governOrg.id,
        upkeepCost: schematic.upkeepCost,
      });
      buildings[b.id] = b;
    }
  });

  const player = new Player({
    cpu: isCPU,
    organizationId: governOrg.id,
    empireId: nation.id,
    overlordId: leader.id,
    name: playerName,
  });
  GameManager.getInstance().updateGameData({
    nations: {
      [nation.id]: nation,
    },
    people: people,
    zones,
    buildings,
    governingOrganizations: {
      [governOrg.id]: governOrg,
    },
  });
  PlayerManager.getInstance().addPlayer(player);
  if (!isCPU) {
    GameManager.getInstance().updateGameData({
      player: {
        empireId: nation.id,
        overlordId: leader.id,
        organizationId: governOrg.id,
      },
    });
    console.debug('Created Player', {
      nation,
      governOrg,
      leader,
      people,
      buildings,
    });
  }

  populateResidences(governOrg.id, nation.id);
};

const handleNewGameV2 = (options: NewGameOptions) => {
  GameManager.getInstance().updateGameData({
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
    gameLog: {
      simActions: {
        people: {},
      },
      events: [],
    },
  });
  const organizationEffects = [];
  if (options.pet) {
    organizationEffects.push('pet');
  }
  if (options.takePrisoners === false) {
    organizationEffects.push('no-prisoners');
  }
  createPlayer({
    isCPU: false,
    organizationEffects: organizationEffects as GoverningOrgStatusEffects[],
    leaderName: options.overlordName,
  });
  createPlayer({ isCPU: true, organizationEffects: [] });
  console.debug(GameManager.getInstance().gameData);
};

/**
 *
 */
const hireStartingAgents = () => {
  const gameData = GameManager.getInstance().gameData;
  const updatedGameData = { ...gameData };

  const updatedPeople: { [x: string]: Person } = {};
  const playerData = gameData.player;
  Object.values(gameData.governingOrganizations).forEach((org) => {
    if (org.id === playerData.organizationId) {
      const empireZone = getZones({
        organizationId: playerData.organizationId,
      })[0];
      const citizens = getPeople({ zone: { zoneId: empireZone.id } });
      // Start at 1, 0 is the Overlord
      for (let recruitIndex = 1; recruitIndex < 9; recruitIndex++) {
        const recruit = hireAgent(
          citizens[recruitIndex],
          playerData.organizationId,
          'troop',
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

    const orgZones = getZones({ organizationId: org.id });
    const leader = generatePerson({
      homeZoneId: orgZones[0].id,
      nationId: org.nationId,
      initIntelligence: 10,
      initCombat: 10,
      initLeadership: 200,
      initLoyalty: 100,
      initAdministration: 10,
    });

    orgZones.forEach((zone) => {
      const zoneCitizens = getZoneCitizens(zone.id);
      const zoneAgents = Math.floor(zoneCitizens.length * 0.3);
      for (let recruitIndex = 0; recruitIndex < zoneAgents; recruitIndex++) {
        const recruitType = recruitDepartmentShufflebag.next().toString();
        const recruit = zoneCitizens[recruitIndex];
        const agentUpdate = hireAgent(recruit, org.id, 'troop', leader.id);
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

  GameManager.getInstance().updateGameData(updatedGameData);
  initializeLoyalties();
  initializePersonnel();
  return updatedGameData;
};

const initializeLoyalties = () => {
  Object.values(GameManager.getInstance().gameData.people).forEach((person) => {
    const update = initializeLoyalty(person);
    if (update.people[person.id].agent) {
      update.people[person.id].intelAttributes.loyalties = setLoyalty(
        person,
        person.agent?.organizationId!,
        80,
      ).people[person.id].intelAttributes.loyalties;
    }
    GameManager.getInstance().updateGameData(update);
  });
};

const initializePersonnel = () => {
  let updatedGamedata = {
    people: {},
    buildings: {},
  };
  getBuildings({}).forEach((building) => {
    // filter out empire buildings
    if (
      building.organizationId ===
      GameManager.getInstance().gameData.player.organizationId
    ) {
      return;
    }
    const employees = [];

    // Filter out apartments, they have no workers
    if (building.type === 'apartment') {
      return;
    }

    let updatedBuilding = { ...building };
    for (
      let index = 0;
      index < building.basicAttributes.maxPersonnel;
      index++
    ) {
      const people = getPeople({
        personFilter: {
          excludePersonnel: true,
        },
        zone: {
          zoneId: building.zoneId,
        },
        agentFilter: { excludeAgents: true },
      });
      const p = people[randomInt(0, people.length - 1)];
      employees.push(p);
      const addPersonnelResult = addPersonnel(p, updatedBuilding);
      if (addPersonnelResult) {
        const update = GameManager.getInstance().updateGameData({
          people: { ...updatedGamedata.people, ...addPersonnelResult!.people },
          buildings: {
            ...updatedGamedata.buildings,
            ...addPersonnelResult!.buildings,
          },
        });
        updatedBuilding = update.buildings[building.id];
        // console.log(updatedBuilding);
        updatedGamedata = {
          people: { ...updatedGamedata.people, ...update.people },
          buildings: { ...updatedGamedata.buildings, ...update.buildings },
        };
      }
    }
  });
};

const createGameManager = () => new GameManager();

export { handleNewGameV2, hireStartingAgents, createGameManager };
