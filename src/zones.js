const GameManager = require("./GameManager");

/**
 * 
 * @param {GameManager} gameManager 
 * @param {string} nationId 
 * @returns {import("./typedef").Zone[]}
 */
const getZones = (gameManager, nationId) => {
    const {gameData} = gameManager;
    const zoneArray = Object.values(gameData.zones);
    if (nationId){
        return zoneArray.filter((zone) => zone.nationId === nationId);
    }
    return zoneArray;
}

/**
 * 
 * @param {GameManager} gameManager 
 * @param {import("./typedef").Zone} zone 
 */
const getZoneWealth = (gameManager, zone) => {
    const {gameData} = gameManager;
    const peopleArray = Object.values(gameData.people);
    peopleArray
        .filter(person => person.homeZoneId === zone.id)
        .reduce((totalWealth, person)=>{
            return totalWealth++
        }, 0)
}

/**
 * 
 * @param {GameManager} gameManager 
 * @param {import("./typedef").Zone[]} zones 
 */
const getZonesWealth = (gameManager, zones) => {
    const {gameData} = gameManager;
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
 * @param {GameManager} gameManager 
 * @param {*} zoneId 
 */
const getZoneCitizens = (gameManager, zoneId, excludeAgents, excludeDead) => {
    const {gameData} = gameManager;
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
module.exports = {
    getZones,
    getZoneWealth,
    getZonesWealth,
    getZonesInfrastructureCost,
    getZoneCitizens
}