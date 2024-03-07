import { GameManager } from "./GameManager";
import { Building, Person } from "./types/interfaces/entities";
import { getInfrastructure } from "./organization";

interface BuildingSchematic{
  buildingType: string;
  infrastructureCost: number;
  upkeepCost: number;
  housingCapacity?: number;
}

const buildingsSchematics: {[x: string]: BuildingSchematic} = {
  bank: {
    buildingType: "bank",
    infrastructureCost: 2,
    upkeepCost: 2,
  },
  apartment: {
    buildingType: "apartment",
    infrastructureCost: 1,
    upkeepCost: 1,
    housingCapacity: 10,
  },
  laboratory: {
    buildingType: "laboratory",
    infrastructureCost: 3,
    upkeepCost: 3,
  },
};

/**
 * Get the infrastructure load of all buildings
 * controlled by the org.
 */
const getInfrastructureLoad = (gameManager: GameManager, organizationId: string) => {
  const gameData = gameManager.gameData;
  const buildingsArray = Object.values(gameData.buildings);
  return buildingsArray.reduce((totalLoad, building) => {
    if (building.organizationId === organizationId) {
      totalLoad = totalLoad + building.infrastructureCost;
    }
    return totalLoad;
  }, 0);
};

/**
 * Get the infrastructure load of all buildings
 * controlled by the org.
 */
const getUpkeep = (gameManager: GameManager, organizationId: string) => {
  const {gameData} = gameManager;

  const buildingsArray = Object.values(gameData.buildings);
  return buildingsArray.reduce((totalUpkeep, building) => {
    if (building.organizationId === organizationId) {
      totalUpkeep = totalUpkeep + building.upkeepCost;
    }
    return totalUpkeep;
  }, 0);
};
/**
 * Get the housing capacity total of all buildings
 * controlled by the org.
 */
const getHousingCapacity = (gameManager: GameManager, organizationId: string) => {
  const gameData = gameManager.gameData;
  const buildingsArray = Object.values(gameData.buildings);
  return buildingsArray.reduce((totalCapacity, building) => {
    console.log(building)
    if (building.organizationId === organizationId) {
      totalCapacity = totalCapacity + building.housingCapacity || 0;
    }
    return totalCapacity;
  }, 0);
};
/**
 * Get the wealth total of all buildings
 * controlled by the org.
 * @param {GameManager} gameManager
 * @param {string} organizationId
 */
const getWealthBonuses = (gameManager: GameManager, organizationId: string) => {
  const gameData = gameManager.gameData;
  const maxInfrastructure = getInfrastructure(gameManager, organizationId);
  const infrastructureLoad = getInfrastructureLoad(gameManager, organizationId);
  const overloadPercentage = (100 * infrastructureLoad) / maxInfrastructure;

  /**
   * @type {import("./typedef").Building[]}
   */
  const buildingsArray = Object.values(gameData.buildings);
  return buildingsArray.reduce((totalWealth, building) => {
    const buildingBaseWealthBonus = building.wealthBonus;
    const overloadReduction = parseInt(
      (overloadPercentage / 100) * building.wealthBonus
    );

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
      building.type === "laboratory"
  );
};

/**
 *
 */
const addPersonnel = (person: Person, building: Building) => {
  const updatedGameData = {
    people: {},
    buildings: {},
  };

  if (building.personnel.includes(person.id)) {
    return;
  }

  if (building.personnel.length === building.maxPersonnel) {
    return;
  }

  building.personnel.push(person.id);

  const updatedPerson = JSON.parse(JSON.stringify(person));
  updatedPerson.isPersonnel = true;
  updatedGameData.buildings[building.id] = building;
  updatedGameData.people[person.id] = person;
  return updatedGameData;
};

/**
 *
 */
const removePersonnel = (person: Person, building: Building) => {
  const personnelIndex = building.personnel.findIndex((personnel) => personnel === person.id);
  if (personnelIndex !== -1) {
    building.personnel.splice(personnelIndex);
  }
  return building;
};

interface GetBuildingsParams{
  zoneId?: string;
  organizationId?: string;
  type?: string;
}
/**
 * 
 */
const getBuildings = (gameManager: GameManager, {
  zoneId = null,
  organizationId = null,
  type = null
}: GetBuildingsParams = {}) => {
  return Object.values(gameManager.gameData.buildings)
    .filter(building => {
      if (zoneId && building.zoneId !== zoneId){
        return false;
      }

      if (organizationId && building.organizationId !== organizationId){
        return false;
      }

      if (type && building.type !== type){
        return false;
      }

      return true;
    })
}

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
