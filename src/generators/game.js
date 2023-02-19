const { throwErrorFromArray, randomInt } = require("../utilities");
const { v4: uuidv4 } = require('uuid');
const {generateName} = require("../generators/names");

/**
 * 
 * @param {object} generateNationOptions
 * @param {string} [generateNationOptions.name] - The name of the nation.
 * @param {number} [generateNationOptions.size] - The size (amount of zones) of the nation 
 * @returns {import("../typedef").Nation}
 */
const generateNation = ({name="Unnamed Nation", size=1}) => {
    return {
        id: "n_" + uuidv4(),
        name: name,
        size: size
    }
}

/**
 * Generate a number of nations.
 * @param {number} nationsAmt - The amount of nations to generate
 * @param {number} minSize - The minimum amount of zones in the nation
 * @param {number} maxSize - The maximum amount of zones in the nation
 * @returns {Object} An object who's keys are nation id's and values are nation objects
 */
const generateNations = (nationsAmt, minSize, maxSize) => {
    const errors = []
    if (nationsAmt === undefined){
        errors.push("'nationsAmt' is a required parameter.")
    }
    if (minSize === undefined){
        errors.push("'minSize' is a required parameter.")
    }
    if (maxSize === undefined){
        errors.push("'maxSize' is a required parameter.")
    }
    if ( minSize > maxSize || maxSize < minSize){
        errors.push("'minSize' must be less than 'maxSize'.")
    }
    throwErrorFromArray(errors);
    const nations = {}
    for (let nationIndex = 0; nationIndex < nationsAmt; nationIndex++) {
        const newNation = generateNation({
            size: randomInt(1, maxSize),
            name: "Nation " + nationIndex
        });
        nations[newNation.id] = newNation;
    }
    return nations;
}

/**
 * Generate a zone
 * @param {object} generateZoneOptions
 * @param {string} [generateZoneOptions.nationId] - The ID of the nation the zone belongs to
 * @param {string} [generateZoneOptions.name] - The name of the zone.
 * @param {number} [generateZoneOptions.size] - The size (amount of citizens...?) 
 * @returns {import("../typedef").Zone}
 */
const generateZone = ({nationId, name="Unnamed Zone", size=1}) => {
    return {
        id: "z_" + uuidv4(),
        nationId,
        name,
        size,
        wealth: randomInt(1,5)
    }
}

/**
 * Generate a number of zones
 * @param {import("../typedef").Nation} nation 
 */
const generateZones = (zonesAmt) => {
    const zones = {};
    for (let zoneIndex = 0; zoneIndex < zonesAmt; zoneIndex++) {
        const newZone = generateZone({});
        zones[newZone.id] = newZone;
    }
    return zones;
}

/**
 * 
 * @param {object} generatePersonOptions
 * @param {string} generatePersonOptions.nationId - The ID of the nation the Person belongs to
 * @param {string} generatePersonOptions.homeZoneId - The ID of the Zone this Person calls home
 * @param {string} [generatePersonOptions.name] - The name of the person.
 * @param {string} [generatePersonOptions.orgId] - the id of the org this person is an agent of
 * @returns {import("../typedef").Person}
 */
 const generatePerson = ({nationId, homeZoneId, name="Unnamed Person"}) =>{
    const errors = []    
    throwErrorFromArray(errors);
    const loyalty = randomInt(1,100);
    const intelligence = randomInt(1,10);
    const combat = randomInt(1,10);
    const administration = randomInt(1,10);
    const leadership = randomInt(1,10);
    if (name === "Unnamed Person"){
        name = generateName();
    }
    return {
        id: "p_" + uuidv4(),
        nationId,
        homeZoneId,
        name,
        loyalty,
        intelligence,
        combat,
        administration,
        leadership,
        health: 10,
        currentHealth: 10,
        agent: null
    }
 };

 const generatePeople = (peopleAmt) => {
    const people = {};
    for (let personIndex = 0; personIndex < peopleAmt; personIndex++) {
        const person = generatePerson({})
        people[person.id] = person;
    }
    return people;
 }

 /**
  * Generate agent data that can be attached to a person
  * @param {string} organizationId  - The ID of the organization this agent will be associated with
  * @param {number} department - 0 (troop), 1 (administrator), 2 (scientist), or 3 (governing org leader)
  * @returns {import("../typedef").AgentData}
  */
 const generateAgentData = (organizationId, department) => {
    //TODO: Make sure department is a valid number
    return {
        department,
        organizationId
    }
 }

/**
 * 
 * @param {object} generateOrgOptions
 * @param {string} generateOrgOptions.id - The Org's indentifier, prefixed with `z_`
 * @param {string} generateOrgOptions.nationId - The ID of the nation the Org belongs to
 * @param {boolean} [generateOrgOptions.evil] - The ID of the Zone this Org calls home
 * @param {string} [generateOrgOptions.name] - The name of the person.
 * @returns {import("../typedef").Person}
 */
const generateGoverningOrg = ({nationId, evil=false, name="Unnamed Organization"}) =>{
    const errors = []
    if (!nationId){
        errors.push("'nationId' is a required option parameter.")
    }
    throwErrorFromArray(errors);
    return {
        id: "o_" + uuidv4(),
        nationId,
        evil,
        name,
        wealth: 100
    }
}

module.exports = {
    generateNation,
    generateNations,
    generateZone,
    generateZones,
    generatePerson,
    generatePeople,
    generateAgentData,
    generateGoverningOrg
}