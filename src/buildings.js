const buildingsSchematics = {
    bank: {
        buildingType: "bank",
        infrastructureCost: 2,
        upkeepCost: 2,
    },
    apartment: {
        buildingType: "apartment",
        infrastructureCost: 1,
        upkeepCost: 1
    },
    laboratory: {
        buildingType: "laboratory",
        infrastructureCost: 3,
        upkeepCost: 3
    }
}

/**
 * Get the infrastructure load of all buildings
 * controlled by the org.
 * @param {import("./typedef").Building[]} buildingsArray 
 * @param {string} organizationId 
 */
const getInfrastructureLoad = (buildingsArray, organizationId) => {
    return buildingsArray.reduce((totalLoad, building) => {
        if (building.organizationId === organizationId){
            totalLoad = totalLoad + building.infrastructureCost;
        }
        return totalLoad;
    }, 0);
}

/**
 * Get the infrastructure load of all buildings
 * controlled by the org.
 * @param {import("./typedef").Building[]} buildingsArray 
 * @param {string} organizationId 
 */
const getUpkeep = (buildingsArray, organizationId) => {
    return buildingsArray.reduce((totalUpkeep, building) => {
        if (building.organizationId === organizationId){
            totalUpkeep = totalUpkeep + building.upkeepCost;
        }
        return totalUpkeep;
    }, 0);
}
/**
 * Get the housing capacity total of all buildings
 * controlled by the org.
 * @param {import("./typedef").Building[]} buildingsArray 
 * @param {string} organizationId 
 */
const getHousingCapacity = (buildingsArray, organizationId) => {
    return buildingsArray.reduce((totalCapacity, building) => {
        if (building.organizationId === organizationId){
            totalCapacity = totalCapacity + building.housingCapacity;
        }
        return totalCapacity;
    }, 0);
}
/**
 * Get the wealth total of all buildings
 * controlled by the org.
 * @param {import("./typedef").Building[]} buildingsArray 
 * @param {string} organizationId 
 */
const getWealthBonuses = (buildingsArray, organizationId) => {
    return buildingsArray.reduce((totalWealth, building) => {
        if (building.organizationId === organizationId){
            totalWealth = totalWealth + building.wealthBonus;
        }
        return totalWealth;
    }, 0);
}

/**
 * Get the wealth total of all buildings
 * controlled by the org.
 * @param {import("./typedef").Building[]} buildingsArray 
 * @param {string} organizationId 
 */
const getOrgLabs = (buildingsArray, organizationId) => {
    return buildingsArray.filter(building => building.organizationId === organizationId && building.type === "laboratory")
}

/**
 * 
 * @param {import("./typedef").Building} building 
 */
// const addPersonnel = (building, person) => {
//     /**
//      * @type {import("./typedef").Building}
//      */
//     const updatedBuilding = JSON.parse(JSON.stringify(building));
//     updatedBuilding.personnel.push(person)
// }

module.exports = {
    buildingsSchematics,
    getInfrastructureLoad,
    getHousingCapacity,
    getUpkeep,
    getWealthBonuses,
    getOrgLabs
}