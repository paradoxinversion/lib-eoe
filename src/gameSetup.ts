import GameManager from './managers/game/GameManager';
import { hireAgent } from './organization';
import generators from './generators/game';

import { generateZoneName } from './generators/names';
import utilities from './utilities';
import settings from './config/config';
import {
  addMultiplePersonnel,
  addResident,
  buildingsSchematics,
  getBuildings,
} from './buildings';
import {
  Building,
  GoverningOrganization,
  Nation,
  Person,
  Zone,
  BuildingType,
  NewGameOptions,
  PlayerOptions,
  HireOrganizationAgentsOptions,
  HireStartingAgentsOptions,
} from './types';
import people from './actions/people';
import Player from './managers/cpu/Player';
import PlayerManager from './managers/cpu/PlayerManager';
import { GoverningOrgStatusEffects } from './types';
import ShufflebagManager from './managers/shufflebag/ShufflebagManager';
import Shufflebag from './managers/shufflebag/Shufflebag';
import ActivityManager from './managers/activities/ActivityManager';
import PlotManager from './managers/plots/PlotManager';
/**
 * The main Shufflebag for building types
 */
const buildingShufflebag = new Shufflebag({
  bank: settings.worldGen.buildings.generationFrequency.bank,
  apartment: settings.worldGen.buildings.generationFrequency.apartment,
  laboratory: settings.worldGen.buildings.generationFrequency.laboratory,
  office: settings.worldGen.buildings.generationFrequency.office,
  hospital: settings.worldGen.buildings.generationFrequency.hospital,
});

/**
 * Attempt to place all citizens in apartments
 */
const populateResidences = (orgId: string, nationId: string) => {
  console.debug('Populating residences');
  const orgCitizens = people.getPeople({ nation: { nationId: nationId } });
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
      if (building.type !== 'apartment') {
        // We want the 'freshest' version of the building
        const employees = [];
        for (let i = 0; i < building.basicAttributes.maxPersonnel; i++) {
          // Make sure we're excluding agents that have already been hired
          const agents = people.getPeople({
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
      const citizens = people.getPeople({
        zone: { zoneId: building.zoneId },
        agentFilter: { excludeAgents: true },
        personFilter: { excludePersonnel: true },
      });
      for (
        let personnelIndex = 0;
        personnelIndex < building.basicAttributes.maxPersonnel;
        personnelIndex++
      ) {
        const p = citizens[utilities.randomInt(0, citizens.length - 1)];
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

const prepareNation = (options: PlayerOptions) => {
  console.debug('Preparing nation');
  const { isCPU } = options;
  const nationParams = {
    name: isCPU ? 'CPU Nation' : 'EVIL Empire',
    size: utilities.randomInt(
      settings.worldGen.nations.minSize,
      settings.worldGen.nations.maxSize,
    ),
  };
  const nation = generators.generateNation(nationParams);

  return nation;
};

const prepareGoverningOrg = (options: PlayerOptions, nation: Nation) => {
  const { isCPU } = options;
  const orgParams = {
    nationId: nation.id,
    evil: isCPU ? false : true,
    name: isCPU ? 'CPU Organization' : 'EVIL Empire',
  };

  const governOrg = generators.generateGoverningOrg(orgParams);
  if (!isCPU) {
    nation;
  }

  options.organizationEffects.forEach((effect) => {
    governOrg.statusEffects.push(effect);
  });
  return governOrg;
};

const prepareZones = (
  options: PlayerOptions,
  nation: Nation,
  governOrg: GoverningOrganization,
) => {
  const { isCPU } = options;
  const zones: { [key: string]: Zone } = {};
  const nationSize = isCPU ? nation.size : 1;
  for (let x = 0; x < nationSize; x++) {
    const z = generators.generateZone({
      name: generateZoneName(),
      nationId: nation.id,
      organizationId: governOrg.id,
    });
    zones[z.id] = z;
  }
  return zones;
};

const prepareLeader = (
  options: PlayerOptions,
  governOrg: GoverningOrganization,
  nation: Nation,
  zones: { [zoneId: string]: Zone },
) => {
  const { isCPU } = options;
  const leaderName =
    options.leaderName || (isCPU ? 'CPU Leader' : 'EVIL Overlord');

  const leader = generators.generatePerson({
    homeZoneId: zones[Object.keys(zones)[0]].id,
    name: leaderName,
    nationId: nation.id,
    initIntelligence: 10,
    initCombat: 10,
    initLeadership: 20,
    initLoyalty: 100,
    initAdministration: 10,
  });

  leader.agent = generators.generateAgentData(
    governOrg.id,
    'overlord',
    0,
    undefined,
    'OVERLORD',
  );
  return leader;
};

const prepareGuaranteedBuildings = (
  options: PlayerOptions,
  governOrg: GoverningOrganization,
  zones: { [zoneId: string]: Zone },
) => {
  const buildings: { [key: string]: Building } = {};
  // In the first zone, create one of each basic building type
  const bank = generators.generateBuilding({
    zoneId: Object.values(zones)[0].id,
    buildingType: 'bank',
    infrastructureCost: buildingsSchematics['bank'].infrastructureCost,
    organizationId: governOrg.id,
    upkeepCost: buildingsSchematics['bank'].infrastructureCost,
  });
  const hospital = generators.generateBuilding({
    zoneId: Object.values(zones)[0].id,
    buildingType: 'hospital',
    infrastructureCost: buildingsSchematics['hospital'].infrastructureCost,
    organizationId: governOrg.id,
    upkeepCost: buildingsSchematics['hospital'].infrastructureCost,
  });
  const laboratory = generators.generateBuilding({
    zoneId: Object.values(zones)[0].id,
    buildingType: 'laboratory',
    infrastructureCost: buildingsSchematics['laboratory'].infrastructureCost,
    organizationId: governOrg.id,
    upkeepCost: buildingsSchematics['laboratory'].infrastructureCost,
  });
  const office = generators.generateBuilding({
    zoneId: Object.values(zones)[0].id,
    buildingType: 'office',
    infrastructureCost: buildingsSchematics['office'].infrastructureCost,
    organizationId: governOrg.id,
    upkeepCost: buildingsSchematics['office'].infrastructureCost,
  });
  const apartment = generators.generateBuilding({
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

  return buildings;
};
const createPlayer = (options: PlayerOptions) => {
  console.debug('Creating player', options);
  const { isCPU } = options;
  const playerName = isCPU ? 'CPU Player' : 'Player';

  const nation = prepareNation(options);
  const governOrg = prepareGoverningOrg(options, nation);
  nation.organizationId = governOrg.id;

  const zones = prepareZones(options, nation, governOrg);

  // const leaderName =
  //   options.leaderName || (isCPU ? 'CPU Leader' : 'EVIL Overlord');

  // const leader = generators.generatePerson({
  //   homeZoneId: zones[Object.keys(zones)[0]].id,
  //   name: leaderName,
  //   nationId: nation.id,
  //   initIntelligence: 10,
  //   initCombat: 10,
  //   initLeadership: 20,
  //   initLoyalty: 100,
  //   initAdministration: 10,
  // });

  // leader.agent = generateAgentData(
  //   governOrg.id,
  //   'overlord',
  //   0,
  //   undefined,
  //   'OVERLORD',
  // );
  const leader = prepareLeader(options, governOrg, nation, zones);
  const people = {
    [leader.id]: leader,
  };
  // const buildings: { [key: string]: Building } = {};
  // // In the first zone, create one of each basic building type
  // const bank = generators.generateBuilding({
  //   zoneId: Object.values(zones)[0].id,
  //   buildingType: 'bank',
  //   infrastructureCost: buildingsSchematics['bank'].infrastructureCost,
  //   organizationId: governOrg.id,
  //   upkeepCost: buildingsSchematics['bank'].infrastructureCost,
  // });
  // const hospital = generators.generateBuilding({
  //   zoneId: Object.values(zones)[0].id,
  //   buildingType: 'hospital',
  //   infrastructureCost: buildingsSchematics['hospital'].infrastructureCost,
  //   organizationId: governOrg.id,
  //   upkeepCost: buildingsSchematics['hospital'].infrastructureCost,
  // });
  // const laboratory = generators.generateBuilding({
  //   zoneId: Object.values(zones)[0].id,
  //   buildingType: 'laboratory',
  //   infrastructureCost: buildingsSchematics['laboratory'].infrastructureCost,
  //   organizationId: governOrg.id,
  //   upkeepCost: buildingsSchematics['laboratory'].infrastructureCost,
  // });
  // const office = generators.generateBuilding({
  //   zoneId: Object.values(zones)[0].id,
  //   buildingType: 'office',
  //   infrastructureCost: buildingsSchematics['office'].infrastructureCost,
  //   organizationId: governOrg.id,
  //   upkeepCost: buildingsSchematics['office'].infrastructureCost,
  // });
  // const apartment = generators.generateBuilding({
  //   zoneId: Object.values(zones)[0].id,
  //   buildingType: 'apartment',
  //   infrastructureCost: buildingsSchematics['apartment'].infrastructureCost,
  //   organizationId: governOrg.id,
  //   upkeepCost: buildingsSchematics['apartment'].infrastructureCost,
  // });
  // buildings[hospital.id] = hospital;
  // buildings[laboratory.id] = laboratory;
  // buildings[office.id] = office;
  // buildings[apartment.id] = apartment;
  // buildings[bank.id] = bank;
  const buildings = prepareGuaranteedBuildings(options, governOrg, zones);
  let peopleTotal = 0;
  Object.values(zones).forEach((zone) => {
    for (let personIndex = 0; personIndex < zone.size; personIndex++) {
      const p = generators.generatePerson({
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
      const b = generators.generateBuilding({
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
  console.log(GameManager.getInstance().gameData);
  initializeOrgOpinions();
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
  const leader = people.getPeople({
    personFilter: { organizationId: orgId },
    agentFilter: { department: 'overlord' },
  })[0];

  // NOTE: The people.getPeople invocations below should ensure we don't get people who are
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
          const citizens = people.getPeople({
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
      const citizens = people.getPeople({
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
  console.debug('Game Data', GameManager.getInstance().gameData);
};

// const initializeLoyalties = () => {
//   Object.values(GameManager.getInstance().gameData.people).forEach((person) => {
//     const update = initializeLoyalty(person);
//     if (update.people[person.id].agent) {
//       update.people[person.id].intelAttributes.loyalties = people.setLoyalty(
//         person,
//         person.agent?.organizationId!,
//         80,
//       ).people[person.id].intelAttributes.loyalties;
//     }
//     GameManager.getInstance().updateGameData(update);
//   });
// };

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

const newGameDefaultOptions: NewGameOptions = {
  pet: false,
  overlordName: 'EVIL Overlord',
  takePrisoners: true,
  startWithFullStaff: false,
};

const newGame = (options?: NewGameOptions) => {
  options = { ...newGameDefaultOptions, ...options };
  ShufflebagManager.getInstance().addShufflebag(
    'skillBaseShufflebag',
    settings.shufflebags.skillBaseShufflebag,
  );

  handleNewGame(options);
  ActivityManager.getInstance().populateActivities();
  PlotManager.getInstance().populatePlots();
  GameManager.getInstance().setInitialized(true);
  GameManager.getInstance().addGameLogEvent({
    color: 'Primary',
    date: GameManager.getInstance().gameData.gameDate.toDateString(),
    icon: 'info',
    text: 'Your empire has been established.',
  });
};

export default { createGameManager, newGame };
