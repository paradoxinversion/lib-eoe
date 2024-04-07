import { GameData, GameManager } from './GameManager';
import { Building, Person } from './types/interfaces/entities';
import { getInfrastructure } from './organization';
import { BuildingStatusEffects } from './statusEffects/building';

interface BuildingSchematic {
  buildingType: string;
  infrastructureCost: number;
  upkeepCost: number;
  housingCapacity: number;
  maxBeds: number;
}

const buildingsSchematics = {
  bank: {
    buildingType: 'bank',
    infrastructureCost: 2,
    upkeepCost: 2,
    maxBeds: 0,
  },
  apartment: {
    buildingType: 'apartment',
    infrastructureCost: 1,
    upkeepCost: 1,
    housingCapacity: 10,
    maxBeds: 0,
  },
  laboratory: {
    buildingType: 'laboratory',
    infrastructureCost: 3,
    upkeepCost: 3,
    maxBeds: 0,
  },
  office: {
    buildingType: 'office',
    infrastructureCost: 4,
    upkeepCost: 4,
    maxBeds: 0,
  },
  hospital: {
    buildingType: 'hospital',
    infrastructureCost: 5,
    upkeepCost: 5,
    maxBeds: 10,
  },
};
export type BuildingType = keyof typeof buildingsSchematics;
type BuildingSchematics = { [key in BuildingType]: BuildingSchematic };
/**
 * Get the infrastructure load of all buildings
 * controlled by the org.
 */
const getInfrastructureLoad = (
  gameManager: GameManager,
  organizationId: string,
) => {
  const gameData = gameManager.gameData;
  const buildingsArray = Object.values(gameData.buildings);
  return buildingsArray.reduce((totalLoad, building) => {
    if (building.organizationId === organizationId) {
      totalLoad = totalLoad + building.basicAttributes.infrastructureCost;
    }
    return totalLoad;
  }, 0);
};

/**
 * Get the infrastructure load of all buildings
 * controlled by the org.
 */
const getUpkeep = (gameManager: GameManager, organizationId: string) => {
  const { gameData } = gameManager;

  const buildingsArray = Object.values(gameData.buildings);
  return buildingsArray.reduce((totalUpkeep, building) => {
    if (building.organizationId === organizationId) {
      totalUpkeep = totalUpkeep + building.basicAttributes.upkeepCost;
    }
    return totalUpkeep;
  }, 0);
};
/**
 * Get the housing capacity total of all buildings
 * controlled by the org.
 */
const getHousingCapacity = (
  gameManager: GameManager,
  organizationId: string,
) => {
  const gameData = gameManager.gameData;
  const buildingsArray = Object.values(gameData.buildings);
  return buildingsArray.reduce((totalCapacity, building) => {
    if (building.organizationId === organizationId) {
      totalCapacity =
        totalCapacity + building.resourceAttributes.housingCapacity || 0;
    }
    return totalCapacity;
  }, 0);
};
/**
 * Get the wealth total of all buildings
 * controlled by the org.
 */
const getWealthBonuses = (gameManager: GameManager, organizationId: string) => {
  const gameData = gameManager.gameData;
  const maxInfrastructure = getInfrastructure(gameManager, organizationId);
  const infrastructureLoad = getInfrastructureLoad(gameManager, organizationId);
  const overloadPercentage = (100 * infrastructureLoad) / maxInfrastructure;

  const buildingsArray = Object.values(gameData.buildings);
  return buildingsArray.reduce((totalWealth, building) => {
    const buildingBaseWealthBonus = building.resourceAttributes.wealthBonus;
    const overloadReduction =
      (overloadPercentage / 100) * building.resourceAttributes.wealthBonus;

    if (
      building.organizationId === organizationId &&
      infrastructureLoad < maxInfrastructure
    ) {
      return totalWealth + (buildingBaseWealthBonus - overloadReduction);
    }
    return totalWealth;
  }, 0);
};

/**
 * Get the wealth total of all buildings
 * controlled by the org.
 */
const getOrgLabs = (gameManager: GameManager, organizationId: string) => {
  const gameData = gameManager.gameData;
  const buildingsArray = Object.values(gameData.buildings);
  return buildingsArray.filter(
    (building) =>
      building.organizationId === organizationId &&
      building.type === 'laboratory',
  );
};

export const getScienceOutput = (
  gameManager: GameManager,
  building: Building,
) => {
  // Science requires working scientists
  if (building.type !== 'laboratory' || building.personnel.length === 0) {
    return 0;
  }

  const base = building.resourceAttributes.scienceBonus;

  const scientistBonuses = building.personnel.reduce((total, personId) => {
    return (total =
      total +
      gameManager.gameData.people[personId].standardAttributes.intelligence);
  }, 0);

  return base + scientistBonuses;
};

export const getWealthOutput = (
  gameManager: GameManager,
  building: Building,
) => {
  if (building.type !== 'bank' || building.personnel.length === 0) {
    return 0;
  }

  const base = building.resourceAttributes.wealthBonus;

  const personnelBonuses = building.personnel.reduce((total, personId) => {
    return (total =
      total + gameManager.gameData.people[personId].skills.administration);
  }, 0);

  return base + personnelBonuses;
};

export const getHousingOutput = (
  gameManager: GameManager,
  building: Building,
) => {
  if (building.type !== 'apartment' || building.personnel.length === 0) {
    return 0;
  }

  const base = building.resourceAttributes.housingCapacity;

  return base;
};

export const getInfrastructureOutput = (
  gameManager: GameManager,
  building: Building,
) => {
  if (building.type !== 'office' || building.personnel.length === 0) {
    return 0;
  }

  const base = 0;

  const personnelBonuses = building.personnel.reduce((total, personId) => {
    return (total =
      total + gameManager.gameData.people[personId].skills.administration);
  }, 0);

  return base + personnelBonuses;
};

export interface ResourceOutput {
  science: number;
  wealth: number;
  housing: number;
  infrastructure: number;
}

export const getResourceOutput = (
  gameManager: GameManager,
  building: Building,
): ResourceOutput => {
  return {
    science: getScienceOutput(gameManager, building),
    wealth: getWealthOutput(gameManager, building),
    housing: getHousingOutput(gameManager, building),
    infrastructure: getInfrastructureOutput(gameManager, building),
  };
};

/**
 *
 */
const addPersonnel = (person: Person, building: Building) => {
  const updatedGameData: {
    people: { [x: string]: Person };
    buildings: { [x: string]: Building };
  } = {
    people: {},
    buildings: {},
  };

  if (building.personnel.includes(person.id)) {
    return;
  }

  if (building.personnel.length === building.basicAttributes.maxPersonnel) {
    return;
  }
  const updatedBuilding = { ...building };
  updatedBuilding.personnel = [...updatedBuilding.personnel, person.id];

  const updatedPerson = { ...person };
  updatedPerson.personnelAt = building.id;
  updatedPerson.isPersonnel = true;
  updatedGameData.buildings[building.id] = updatedBuilding;
  updatedGameData.people[person.id] = updatedPerson;
  return updatedGameData;
};

export const addMultiplePersonnel = (people: Person[], building: Building) => {
  const updatedGameData: Partial<GameData> = {
    people: {},
    buildings: {},
  };

  people.forEach((person) => {
    if (building.personnel.includes(person.id)) {
      return;
    }

    if (building.personnel.length === building.basicAttributes.maxPersonnel) {
      return;
    }
    const updatedBuilding: Building = {
      ...building,
      personnel: [...building.personnel, person.id],
    };

    const updatedPerson: Person = {
      ...person,
      personnelAt: building.id,
      isPersonnel: true,
    };
    updatedGameData.buildings![building.id] = updatedBuilding;
    updatedGameData.people![person.id] = updatedPerson;
  });
  return updatedGameData;
};

/**
 *
 */
const removePersonnel = (person: Person, building: Building) => {
  const updatedPerson: Person = {
    ...person,
    isPersonnel: false,
    personnelAt: null,
  };
  const personnelIndex = building.personnel.findIndex(
    (personnel) => personnel === person.id,
  );
  const updatedGameData: Partial<GameData> = {
    people: { [updatedPerson.id]: updatedPerson },
    buildings: {},
  };
  if (personnelIndex !== -1) {
    // building.personnel.splice(personnelIndex, 1);
    const bCopy = { ...building };
    updatedGameData.buildings![bCopy.id] = {
      ...bCopy,
      personnel: bCopy.personnel.filter((person, index) => {
        if (index === personnelIndex) {
          return false;
        }
        return true;
      }),
    };
  }

  return updatedGameData;
};

interface GetBuildingsParams {
  zoneId?: string | null;
  organizationId?: string | null;
  type?: BuildingType | null;
}
/**
 *
 */
const getBuildings = (
  gameManager: GameManager,
  {
    zoneId = null,
    organizationId = null,
    type = null,
  }: GetBuildingsParams = {},
) => {
  return Object.values(gameManager.gameData.buildings).filter((building) => {
    if (zoneId && building.zoneId !== zoneId) {
      return false;
    }

    if (organizationId && building.organizationId !== organizationId) {
      return false;
    }

    if (type && building.type !== type) {
      return false;
    }

    return true;
  });
};

export const addBuildingStatusEffect = (
  gameManager: GameManager,
  buildingId: string,
  statusEffect: BuildingStatusEffects,
) => {
  const building = { ...gameManager.gameData.buildings[buildingId] };
  if (!building.statusEffects.includes(statusEffect)) {
    building.statusEffects = [...building.statusEffects, statusEffect];
  }
  const updatedGameData = { buildings: { [buildingId]: building } };
  gameManager.updateGameData(updatedGameData);

  return updatedGameData;
};

export const removeBuildingStatusEffect = (
  gameManager: GameManager,
  buildingId: string,
  statusEffect: BuildingStatusEffects,
) => {
  const building = gameManager.gameData.buildings[buildingId];
  if (building.statusEffects.includes(statusEffect)) {
    building.statusEffects = building.statusEffects.filter(
      (effect) => effect !== statusEffect,
    );
  }
  gameManager.updateGameData({ buildings: { [buildingId]: building } });
  return building;
};

export {
  buildingsSchematics,
  getInfrastructureLoad,
  getHousingCapacity,
  getUpkeep,
  getWealthBonuses,
  getOrgLabs,
  addPersonnel,
  removePersonnel,
  getBuildings,
};
