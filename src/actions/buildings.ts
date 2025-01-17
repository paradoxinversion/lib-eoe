import { BuildingType } from '../buildings';
import { GameData, GameManager } from '../managers/game/GameManager';
import { getInfrastructure } from '../organization';
import { BuildingStatusEffects } from '../statusEffects/building';
import { Building, Person } from '../types/interfaces/entities';

const modifyBuildingCurrentHealth = (buildingId: string, amt: number) => {
  const { gameData } = GameManager.getInstance();
  const building = { ...gameData.buildings[buildingId] };
  let update;
  let currentBuildingHealth = (building.structure.currentHealth += amt);
  if (building.structure.currentHealth > building.structure.totalHealth) {
    currentBuildingHealth = building.structure.totalHealth;
  }
  update = {
    buildings: {
      [buildingId]: {
        structure: {
          currentHealth: currentBuildingHealth,
        },
      },
    },
  };

  return update;
};

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

const getScienceOutput = (building: Building) => {
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

const getWealthOutput = (building: Building) => {
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

const getHousingOutput = (building: Building) => {
  if (building.type !== 'apartment' || building.personnel.length === 0) {
    return 0;
  }

  const base = building.resourceAttributes.housingCapacity;

  return base;
};

const getInfrastructureOutput = (building: Building) => {
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

const getResourceOutput = (building: Building): ResourceOutput => {
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
    return updatedGameData;
  }
  if (building.personnel.includes(person?.id)) {
    return updatedGameData;
  }

  if (building.personnel.length === building.basicAttributes.maxPersonnel) {
    return updatedGameData;
  }
  const updatedBuilding = { ...building };
  updatedBuilding.personnel = [...updatedBuilding.personnel, person.id];

  const updatedPerson = { ...person };
  updatedPerson.personnelAt = building.id;
  updatedPerson.isPersonnel = true;
  updatedGameData.buildings[building.id] = updatedBuilding;
  updatedGameData.people[person.id] = updatedPerson;
  // GameManager.getInstance().updateGameData(updatedGameData);
  return updatedGameData;
};

const addMultiplePersonnel = (people: Person[], building: Building) => {
  const updatedGameData: Partial<GameData> = {
    people: {},
    buildings: {},
  };
  let employees: string[] = [];
  people.forEach((person) => {
    if (building.personnel.includes(person.id)) {
      return;
    }

    if (building.personnel.length === building.basicAttributes.maxPersonnel) {
      return;
    }
    employees = [...employees, person.id];
    const updatedBuilding: Building = {
      ...building,
      personnel: employees,
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
  zone?: {
    zoneId: string;
  };
  personnel?: {
    needsPersonnel: boolean;
  };
}
/**
 *
 */
const getBuildings = (params: GetBuildingsParams = {}) => {
  return Object.values(GameManager.getInstance().gameData.buildings).filter(
    (building) => {
      if (params.zoneId && building.zoneId !== params.zoneId) {
        return false;
      }

      if (
        params.organizationId &&
        building.organizationId !== params.organizationId
      ) {
        return false;
      }

      if (params.type && building.type !== params.type) {
        return false;
      }

      if (params.personnel?.needsPersonnel) {
        if (
          building.personnel.length === building.basicAttributes.maxPersonnel
        ) {
          return false;
        }
      }

      return true;
    },
  );
};

const addBuildingStatusEffect = (
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

const removeBuildingStatusEffect = (
  buildingId: string,
  statusEffect: BuildingStatusEffects,
) => {
  const building = GameManager.getInstance().gameData.buildings[
    buildingId
  ] as Building;

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

const admitHospitalPatient = (hospital: string, person: string) => {
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

const handleHospitalOperations = () => {
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

    (hospital as Building).inhabitants.forEach((inhabitantId) => {
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

      const maxGain = Math.floor(
        inhabitant.derivedAttributes.health.totalHealth * 0.1,
      );

      // get the hospital efficiency
      const efficiency =
        (hospital.personnel.length / hospital.basicAttributes.maxPersonnel) *
        100;

      const healthGain = maxGain * efficiency;
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

const dischargeHospitalPatient = (hospital: string, person: string) => {
  const hospitalBuilding =
    GameManager.getInstance().gameData.buildings[hospital];
  const personData = GameManager.getInstance().gameData.people[person];
  const updatedHospital = {
    ...hospitalBuilding,
    inhabitants: (hospitalBuilding as Building).inhabitants.filter(
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

const addInhabitant = (buildingId: string, personId: string) => {
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

const removeInhabitant = (buildingId: string, personId: string) => {
  const building = GameManager.getInstance().gameData.buildings[buildingId];
  const updatedBuilding = {
    ...building,
    inhabitants: (building as Building).inhabitants.filter(
      (inhabitant) => inhabitant !== personId,
    ),
  };

  GameManager.getInstance().updateGameData({
    buildings: { [buildingId]: updatedBuilding },
  });

  return updatedBuilding;
};

const addResident = (buildingId: string, personId: string) => {
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

const removeResident = (buildingId: string, personId: string) => {
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

export default {
  getInfrastructureLoad,
  getHousingCapacity,
  getUpkeep,
  getWealthBonuses,
  getOrgLabs,
  addPersonnel,
  removePersonnel,
  getBuildings,
  modifyBuildingCurrentHealth,
  getResourceOutput,
  getScienceOutput,
  addResident,
  removeResident,
  handleHospitalOperations,
  getInfrastructureOutput,
  getWealthOutput,
  getHousingOutput,
  addInhabitant,
  removeInhabitant,
  dischargeHospitalPatient,
  removeBuildingStatusEffect,
  addMultiplePersonnel,
  addBuildingStatusEffect,
  admitHospitalPatient,
};
