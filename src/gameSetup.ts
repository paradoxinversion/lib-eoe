import { GameManager } from './GameManager';
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
  addMultiplePersonnel,
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
import { populateActivities, populatePlots } from './plots';
import ShufflebagManager from './shufflebag/shufflebagManager';
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

export type NewGameOptions = {
  pet?: boolean;
  overlordName?: string;
  takePrisoners: boolean;
  /**
   * If true, staff buildings with empire agents.
   * */
  startWithFullStaff: boolean;
};

type PlayerOptions = {
  isCPU: boolean;
  leaderName?: string;
  organizationEffects: GoverningOrgStatusEffects[];
  fullStaff: boolean;
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

const prepareBuildingPersonnel = (options: HireStartingAgentsOptions) => {
  const buildings = getBuildings();
  const updatedBuildings: { [index: string]: Building } = {};
  if (options.fullStaffDetail) {
    // If we're fully staffing, loop over every building except apartments
    for (let i = 0; i < buildings.length; i++) {
      const building =
        GameManager.getInstance().gameData.buildings[buildings[i].id];
      // const building = buildings[i];
      if (building.type !== 'apartment') {
        // We want the 'freshest' version of the building
        const employees = [];
        for (let i = 0; i < building.basicAttributes.maxPersonnel; i++) {
          // Make sure we're excluding agents that have already been hired
          const agents = getPeople({
            personFilter: {
              excludePersonnel: true,
            },
            zone: {
              zoneId: building.zoneId,
            },
            agentFilter: { agentsOnly: true, excludeDepartments: ['overlord'] },
          });
          const newPersonnel = agents[i];
          if (newPersonnel) {
            // If we have a valid agent, we need to set them to the appropriate dep't
            // NOTE: This makes no attempt to match agent skill with position
            switch (building.type) {
              case 'office':
              case 'bank':
                newPersonnel.agent!.department = 'administrator';
                break;
              case 'hospital':
                newPersonnel.agent!.department = 'doctor';
                break;
              case 'laboratory':
                newPersonnel.agent!.department = 'scientist';
                break;
              default:
                break;
            }
            employees.push(newPersonnel);
          }
        }

        console.log('Building personnel', employees);
        const result = addMultiplePersonnel(employees, building);
        console.log('Added personnel', result);
        GameManager.getInstance().updateGameData(result);
      }
    }
    console.log('Updated buildings', updatedBuildings);
  } else {
    for (
      let buildingIndex = 0;
      buildingIndex < buildings.length;
      buildingIndex++
    ) {
      const building = buildings[buildingIndex];
      const employees = [];
      const citizens = getPeople({
        zone: { zoneId: building.zoneId },
        agentFilter: { excludeAgents: true },
        personFilter: { excludePersonnel: true },
      });
      for (
        let personnelIndex = 0;
        personnelIndex < building.basicAttributes.maxPersonnel;
        personnelIndex++
      ) {
        const p = citizens[randomInt(0, citizens.length - 1)];
        if (p) {
          employees.push(p);
        }
      }
      const result = addMultiplePersonnel(employees, building);
      console.log('Added personnel', result);
      GameManager.getInstance().updateGameData(result);
    }
  }
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

  const leaderName =
    options.leaderName || (isCPU ? 'CPU Leader' : 'EVIL Overlord');

  const leader = generatePerson({
    homeZoneId: zones[Object.keys(zones)[0]].id,
    name: leaderName,
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
  hireOrganizationAgents({
    fullStaffDetail: options.fullStaff,
    orgId: governOrg.id,
    staffIsOrg: options.fullStaff, // CPU Nations are staffed by citizens
  });
  prepareBuildingPersonnel({
    fullStaffDetail: options.fullStaff,
  });
};

const handleNewGame = (options: NewGameOptions) => {
  console.debug('Starting new game');
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
    fullStaff: options.startWithFullStaff,
  });

  createPlayer({ isCPU: true, organizationEffects: [], fullStaff: false });
  console.debug(GameManager.getInstance().gameData);
  initializeOrgOpinions();
};

type HireOrganizationAgentsOptions = {
  orgId: string;
  fullStaffDetail: boolean;
  /**
   * Agents of the organization will staff all possible building
   * positions if true.
   */
  staffIsOrg: boolean;
};

const hireOrganizationAgents = (options: HireOrganizationAgentsOptions) => {
  const hireInitial = (recruit: Person, leader: Person) => {
    const agent = hireAgent(
      recruit,
      leader.agent?.organizationId!,
      'troop',
      leader.id,
    );
    recruit!.intelAttributes.intelligenceLevel = 100;
    recruit!.intelAttributes.loyalty = 80;
    if (agent !== null) {
      console.debug('Hired agent', { agent, recruit });
      GameManager.getInstance().updateGameData({
        people: {
          [recruit.id]: recruit,
        },
      });
    }
  };
  console.debug('Hiring organization agents');
  const { orgId } = options;

  // If fullStaffDetail, the total agents should be the same available jobs
  let targetAgents = 0;

  if (options.fullStaffDetail) {
    targetAgents = getBuildings({
      organizationId: orgId,
    }).reduce((total, building) => {
      // All buildings except for apartments have personnel
      if (building.type !== 'apartment') {
        return total + building.basicAttributes.maxPersonnel;
      }
      return total;
    }, 0);
  } else {
    targetAgents = settings.worldGen.startingAgents.defaultStartAmount;
  }
  console.debug('Target agents', targetAgents);

  // Now we have our target agents, we need to hire them
  // Get the leader of the organization
  // We'll need to assign them as the commander of the agents
  const leader = getPeople({
    personFilter: { organizationId: orgId },
    agentFilter: { department: 'overlord' },
  })[0];

  // NOTE: The getPeople invocations below should ensure we don't get people who are
  // already agents at the cost of a performance hit... it's worth it for now
  if (options.fullStaffDetail) {
    // If we're doing full staff detail, we need to hire agents for all buildings
    // They'll be assigned to *some* building later on
    getBuildings({
      organizationId: orgId,
    }).forEach((building) => {
      // Make sure we're not hiring for apartments
      if (building.type !== 'apartment') {
        for (let i = 0; i < building.basicAttributes.maxPersonnel; i++) {
          const citizens = getPeople({
            zone: { zoneId: building.zoneId },
            agentFilter: { excludeAgents: true },
          });
          if (citizens[i]) {
            hireInitial(citizens[i], leader);
          }
        }
      }
    });
  } else {
    // If we're not doing full staff detail, we'll just hire the target amount from
    // entire nation pool
    for (let i = 0; i < targetAgents; i++) {
      const citizens = getPeople({
        nation: {
          nationId: leader.nationId,
        },
        agentFilter: { excludeAgents: true },
      });
      if (citizens[i]) {
        hireInitial(citizens[i], leader);
      }
    }
  }

  console.debug('Done hiring organization agents');
};

type HireStartingAgentsOptions = {
  fullStaffDetail: boolean;
};

/**
 * Hires starting agents for the EoE
 */
const hireStartingAgents = (options: HireStartingAgentsOptions) => {
  const gameData = GameManager.getInstance().gameData;
  const updatedGameData = { ...gameData };

  const updatedPeople: { [x: string]: Person } = {};
  const playerData = gameData.player;
  Object.values(gameData.governingOrganizations).forEach((org) => {
    if (org.id === playerData.organizationId) {
      // Get the empire zone
      const empireZone = getZones({
        organizationId: playerData.organizationId,
      })[0];

      // Get the citizens of the empire
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
  initializeOrgOpinions();
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

const initializeOrgOpinions = () => {
  const organizations = {
    ...GameManager.getInstance().gameData.governingOrganizations,
  };

  // We're first going to loop over all of our organizations
  // For each, we'll loop over all other organizations and set
  // the opinion from the origination org's perspective.
  Object.values(organizations).forEach((organization) => {
    const opinions: { [organizationId: string]: number } = {};
    Object.values(organizations).forEach((otherOrg) => {
      if (otherOrg.id !== organization.id) {
        // For now, we'll say other orgs are neutral to each other
        // but distrustful of the EoE
        if (otherOrg.evil) {
          opinions[otherOrg.id] = -10;
        } else {
          opinions[otherOrg.id] = 0;
        }
      }
    });
    organization.opinions = opinions;
    console.debug('Initialized opinions for', organization.name, opinions);
  });

  GameManager.getInstance().updateGameData({
    governingOrganizations: organizations,
  });
};

const createGameManager = () => new GameManager();

const newGame = (options: NewGameOptions) => {
  ShufflebagManager.getInstance().addShufflebag(
    'skillBaseShufflebag',
    settings.shufflebags.skillBaseShufflebag,
  );

  handleNewGame(options);
  populateActivities();
  populatePlots();
  GameManager.getInstance().setInitialized(true);
};

export { hireStartingAgents, createGameManager, newGame };
