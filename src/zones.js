const getZones = (zoneArray, nationId) => {
    if (nationId){
        return zoneArray.filter((zone) => zone.nationId === nationId);
    }
    return zoneArray;
}

module.exports = {
    getZones
}