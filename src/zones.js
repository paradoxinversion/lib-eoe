const getZones = (zoneArray, nationId) => {
    if (nationId){
        return zoneArray.filter((zone) => zone.nationId === nationId);
    }
    return zoneArray;
}

/**
 * 
 * @param {import("./typedef").Person[]} peopleArray 
 * @param {import("./typedef").Zone} zone 
 */
const getZoneWealth = (peopleArray, zone) => {
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
const getZonesWealth = (peopleArray, zones) => {
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

module.exports = {
    getZones,
    getZoneWealth,
    getZonesWealth,
    getZonesInfrastructureCost
}