/**
 * 
 * @param {import("./typedef").GameData} gameData 
 * @param {string} nationId 
 * @returns {import("./typedef").Zone[]}
 */
const getZones = (gameData, nationId) => {
    const zoneArray = Object.values(gameData.zones);
    if (nationId){
        return zoneArray.filter((zone) => zone.nationId === nationId);
    }
    return zoneArray;
}

/**
 * 
 * @param {import("./typedef").GameData} gameData 
 * @param {import("./typedef").Zone} zone 
 */
const getZoneWealth = (gameData, zone) => {
    const peopleArray = Object.values(gameData.people);
    peopleArray
        .filter(person => person.homeZoneId === zone.id)
        .reduce((totalWealth, person)=>{
            return totalWealth++
        }, 0)
}

/**
 * 
 * @param {import("./typedef").Person[]} peopleArray 
 * @param {import("./typedef").Zone[]} zones 
 */
const getZonesWealth = (gameData, zones) => {
    const peopleArray = Object.values(gameData.people);
    return zones.reduce((total, zone) =>{
        return total += peopleArray
            .filter(person => person.homeZoneId === zone.id)
            .reduce((totalWealth, person)=>{
                return totalWealth += 1
            }, 0)
    }, 0)
}

const getZonesInfrastructureCost = (zones) => {
    return zones.reduce((total, zone) =>{
        return total += 1;
    }, 0)
}

/**
 * 
 * @param {import("./typedef").GameData} gameData 
 * @param {*} zoneId 
 */
const getZoneCitizens = (gameData, zoneId, excludeAgents, excludeDead) => {
    const peopleArray = Object.values(gameData.people);
    const citizens =  peopleArray.filter(person => {

        if (excludeAgents && person.agent){
            return false;
        }

        if (excludeDead && person.currentHealth <= 0){
            return false;
        }
        
        return person.homeZoneId === zoneId;
    });
    return citizens;
}

const getZoneNationAgents = (gameData, zoneId) => {
    const peopleArray = Object.values(gameData.people);
    return peopleArray.filter(person => person.homeZoneId === zoneId && person.agent);
}

module.exports = {
    getZones,
    getZoneWealth,
    getZonesWealth,
    getZonesInfrastructureCost,
    getZoneCitizens
}