import { GameManager } from "./GameManager.ts";
const { getInfrastructure } = require("./organization");

const buildingsSchematics = {
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
 * @param {GameManager} gameManager
 * @param {string} organizationId
 */
const getInfrastructureLoad = (gameManager, organizationId) => {
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
 * @param {GameManager} gameManager
 * @param {string} organizationId
 */
const getUpkeep = (gameManager, organizationId) => {
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
 * @param {GameManager} gameManager
 * @param {string} organizationId
 */
const getHousingCapacity = (gameManager, organizationId) => {
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
const getWealthBonuses = (gameManager, organizationId) => {
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
 * @param {GameManager} gameManager
 * @param {string} organizationId
 */
const getOrgLabs = (gameManager, organizationId) => {
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
 * @param {import("./typedef").Person} person
 * @param {import("./typedef").Building} building
 */
const addPersonnel = (person, building) => {
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
 * @param {import("./typedef").Person} person
 * @param {import("./typedef").Building} building
 */
const removePersonnel = (person, building) => {
  const personnelIndex = building.personnel.findIndex(person.id);
  if (personnelIndex !== -1) {
    building.personnel.splice(personnelIndex);
  }
  return building;
};
/**
 * 
 * @param {GameManager} gameManager 
 * @param {*} param1 
 */
const getBuildings = (gameManager, {
  zoneId = null,
  organizationId = null,
  type = null
} = {}) => {
  const b = Object.values(gameManager.gameData.buildings)
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

module.exports = {
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
