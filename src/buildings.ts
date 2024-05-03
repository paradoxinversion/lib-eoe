import { GameData, GameManager } from './GameManager';
import { Building, Person } from './types/interfaces/entities';
import { getInfrastructure } from './organization';
import { BuildingStatusEffects } from './statusEffects/building';
import { getInfrastructurePercentage } from './actions/infrastructure';

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
    infrastructureCost: 8,
    upkeepCost: 1000,
    maxBeds: 0,
  },
  apartment: {
    buildingType: 'apartment',
    infrastructureCost: 6,
    upkeepCost: 600,
    housingCapacity: 10,
    maxBeds: 0,
  },
  laboratory: {
    buildingType: 'laboratory',
    infrastructureCost: 10,
    upkeepCost: 1500,
    maxBeds: 0,
  },
  office: {
    buildingType: 'office',
    infrastructureCost: 4,
    upkeepCost: 600,
    maxBeds: 0,
  },
  hospital: {
    buildingType: 'hospital',
    infrastructureCost: 10,
    upkeepCost: 1200,
    maxBeds: 10,
  },
};
export type BuildingType = keyof typeof buildingsSchematics;
type BuildingSchematics = { [key in BuildingType]: BuildingSchematic };
/**
 * Get the infrastructure load of all buildings
 * controlled by the org.
 */
const getInfrastructureLoad = (organizationId: string) => {
  const gameData = GameManager.getInstance().gameData;
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
const getUpkeep = (organizationId: string) => {
  const { gameData } = GameManager.getInstance();

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
const getHousingCapacity = (organizationId: string) => {
  const gameData = GameManager.getInstance().gameData;
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
const getWealthBonuses = (organizationId: string) => {
  const gameData = GameManager.getInstance().gameData;
  const maxInfrastructure = getInfrastructure(organizationId);
  const infrastructureLoad = getInfrastructureLoad(organizationId);
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
const getOrgLabs = (organizationId: string) => {
  const gameData = GameManager.getInstance().gameData;
  const buildingsArray = Object.values(gameData.buildings);
  return buildingsArray.filter(
    (building) =>
      building.organizationId === organizationId &&
      building.type === 'laboratory',
  );
};

export const getScienceOutput = (building: Building) => {
  // Science requires working scientists
  if (building.type !== 'laboratory' || building.personnel.length === 0) {
    return 0;
  }

  const base = building.resourceAttributes.scienceBonus;

  const scientistBonuses = building.personnel.reduce((total, personId) => {
    return (total =
      total +
      GameManager.getInstance().gameData.people[personId].standardAttributes
        .intelligence);
  }, 0);

  return base + scientistBonuses;
};

export const getWealthOutput = (building: Building) => {
  if (building.type !== 'bank' || building.personnel.length === 0) {
    return 0;
  }

  const base = building.resourceAttributes.wealthBonus;
  const efficiency =
    building.personnel.length / building.basicAttributes.maxPersonnel;
  const personnelBonusesBase = building.personnel.reduce((total, personId) => {
    return (total =
      total +
      GameManager.getInstance().gameData.people[personId].skills
        .administration);
  }, 0);
  return (base + personnelBonusesBase / 4) * efficiency;
};

export const getHousingOutput = (building: Building) => {
  if (building.type !== 'apartment' || building.personnel.length === 0) {
    return 0;
  }

  const base = building.resourceAttributes.housingCapacity;

  return base;
};

export const getInfrastructureOutput = (building: Building) => {
  if (building.type !== 'office' || building.personnel.length === 0) {
    return 0;
  }

  const base = 0;

  const personnelBonuses = building.personnel.reduce((total, personId) => {
    return (total =
      total +
      GameManager.getInstance().gameData.people[personId].skills
        .administration);
  }, 0);

  return base + personnelBonuses;
};

export interface ResourceOutput {
  science: number;
  wealth: number;
  housing: number;
  infrastructure: number;
}

export const getResourceOutput = (building: Building): ResourceOutput => {
  return {
    science: getScienceOutput(building),
    wealth: getWealthOutput(building),
    housing: getHousingOutput(building),
    infrastructure: getInfrastructureOutput(building),
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
  if (!person) {
    return;
  }
  if (building.personnel.includes(person?.id)) {
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
const getBuildings = ({
  zoneId = null,
  organizationId = null,
  type = null,
}: GetBuildingsParams = {}) => {
  return Object.values(GameManager.getInstance().gameData.buildings).filter(
    (building) => {
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
    },
  );
};

export const addBuildingStatusEffect = (
  buildingId: string,
  statusEffect: BuildingStatusEffects,
) => {
  const building = {
    ...GameManager.getInstance().gameData.buildings[buildingId],
  };
  if (!building.statusEffects.includes(statusEffect)) {
    building.statusEffects = [...building.statusEffects, statusEffect];
  }
  const updatedGameData = { buildings: { [buildingId]: building } };
  GameManager.getInstance().updateGameData(updatedGameData);

  return updatedGameData;
};

export const removeBuildingStatusEffect = (
  buildingId: string,
  statusEffect: BuildingStatusEffects,
) => {
  const building = GameManager.getInstance().gameData.buildings[buildingId];
  if (building.statusEffects.includes(statusEffect)) {
    building.statusEffects = building.statusEffects.filter(
      (effect) => effect !== statusEffect,
    );
  }
  GameManager.getInstance().updateGameData({
    buildings: { [buildingId]: building },
  });
  return building;
};

export const admitHospitalPatient = (hospital: string, person: string) => {
  const hospitalBuilding =
    GameManager.getInstance().gameData.buildings[hospital];
  const personData = GameManager.getInstance().gameData.people[person];
  if (hospitalBuilding.type !== 'hospital') {
    return;
  }

  if (
    hospitalBuilding.inhabitants.length >=
    hospitalBuilding.resourceAttributes.hospitalBeds
  ) {
    return;
  }

  const updatedHospital = {
    ...hospitalBuilding,
    inhabitants: [...hospitalBuilding.inhabitants, person],
  };
  GameManager.getInstance().updateGameData({
    buildings: { [hospital]: updatedHospital },
    people: { [person]: { ...personData, hospitalizedAt: hospital } },
  });
};

export const handleHospitalOperations = () => {
  // All hospitals handle their operations at once
  const hospitals = getBuildings({ type: 'hospital' });
  const updatedPeople: {
    [x: string]: {
      derivedAttributes: {
        health: {
          currentHealth: number;
        };
      };
    };
  } = {};

  hospitals.forEach((hospital) => {
    if (hospital.inhabitants.length === 0) {
      return;
    }

    hospital.inhabitants.forEach((inhabitantId) => {
      const inhabitant =
        GameManager.getInstance().gameData.people[inhabitantId];
      const {
        derivedAttributes: {
          health: { currentHealth, totalHealth },
        },
      } = inhabitant;

      if (currentHealth === totalHealth) {
        // direct discharge
        dischargeHospitalPatient(hospital.id, inhabitantId);
      }
      const healthGain = 1 * hospital.personnel.length || 1;
      const updatedInhabitant = {
        derivedAttributes: {
          health: {
            currentHealth:
              (
                healthGain + inhabitant.derivedAttributes.health.currentHealth >
                totalHealth
              ) ?
                totalHealth
              : healthGain + inhabitant.derivedAttributes.health.currentHealth,
          },
        },
      };

      updatedPeople[inhabitantId] = updatedInhabitant;
      if (
        updatedInhabitant.derivedAttributes.health.currentHealth === totalHealth
      ) {
        // direct discharge
        // dischargeHospitalPatient(gameManager, hospital.id, inhabitantId);
      }
    });
  });

  return updatedPeople;
};

export const dischargeHospitalPatient = (hospital: string, person: string) => {
  const hospitalBuilding =
    GameManager.getInstance().gameData.buildings[hospital];
  const personData = GameManager.getInstance().gameData.people[person];
  const updatedHospital = {
    ...hospitalBuilding,
    inhabitants: hospitalBuilding.inhabitants.filter(
      (inhabitant) => inhabitant !== personData.id,
    ),
  };

  const updatedPerson = {
    ...personData,
    hospitalizedAt: null,
  };

  GameManager.getInstance().updateGameData({
    buildings: { [hospitalBuilding.id]: updatedHospital },
    people: { [personData.id]: updatedPerson },
  });

  return updatedHospital;
};

export const addInhabitant = (buildingId: string, personId: string) => {
  const building = GameManager.getInstance().gameData.buildings[buildingId];
  const updatedBuilding = {
    ...building,
    inhabitants: [...building.inhabitants, personId],
  };

  GameManager.getInstance().updateGameData({
    buildings: { [buildingId]: updatedBuilding },
  });

  return updatedBuilding;
};

export const removeInhabitant = (buildingId: string, personId: string) => {
  const building = GameManager.getInstance().gameData.buildings[buildingId];
  const updatedBuilding = {
    ...building,
    inhabitants: building.inhabitants.filter(
      (inhabitant) => inhabitant !== personId,
    ),
  };

  GameManager.getInstance().updateGameData({
    buildings: { [buildingId]: updatedBuilding },
  });

  return updatedBuilding;
};

export const addResident = (buildingId: string, personId: string) => {
  addInhabitant(buildingId, personId);
  const person = GameManager.getInstance().gameData.people[personId];
  const updatedPerson: Person = {
    ...person,
    residentAt: buildingId,
  };
  GameManager.getInstance().updateGameData({
    people: { [personId]: updatedPerson },
  });
};

export const removeResident = (buildingId: string, personId: string) => {
  removeInhabitant(buildingId, personId);
  const person = GameManager.getInstance().gameData.people[personId];
  const updatedPerson: Person = {
    ...person,
    residentAt: null,
  };

  GameManager.getInstance().updateGameData({
    people: { [personId]: updatedPerson },
  });
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
