
/**
 * Returns a list of people who are citizens of a supplied nation
 * (ie, their `nationId` matches the parameter `nationId`.)
 * @param {import("./typedef").Person[]} peopleArray - An array containing all game citizens to be included in this query
 * @param {string} [nationId] - The id of the nation the returned citizens are citizens of
 * @returns {import("./typedef").Person[]} An array of people who belong to the nation with the given nation id
 */
const getCitizens = (peopleArray, nationId) => {
    if (nationId){
        return peopleArray.filter((person) => person.nationId === nationId);
    }
    return peopleArray;
}

module.exports = {
    getCitizens
}