import { Person } from "./types/interfaces/entities";

/**
 * Returns a list of people who are citizens of a supplied nation
 * (ie, their `nationId` matches the parameter `nationId`.)
 */
const getCitizens = (peopleArray: Person[], nationId: string, excludeAgents: boolean) => {
  if (nationId) {
    return peopleArray.filter((person) => {
      if (excludeAgents && person.agent) {
        return false;
      }
      return person.nationId === nationId;
    });
  }
  return peopleArray;
};

export {
  getCitizens,
};
