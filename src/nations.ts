import { GameManager } from "./GameManager";
import { GoverningOrganization } from "./typedef";
import { throwErrorFromArray } from "./utilities";

/**
 * Returns an organization who's nationId matches the one provided.
 * @param {string} nationId - The nationId to search for.
 * @param {import("./typedef").GoverningOrganization[]} orgArray - An array of organizations to search from
 */
const getNationOrganization = (
  orgArray: GoverningOrganization[],
  nationId: string) => {
  const errors = [];
  if (!orgArray) {
    errors.push("'orgArray' is a required parameter.");
  }
  if (orgArray.length === 0) {
    errors.push("'orgArray.length' is 0.");
  }
  if (!nationId) {
    errors.push("'nationId' is a required parameter.");
  }
  throwErrorFromArray(errors);
  return orgArray.find((org) => org.nationId === nationId) || null;
};

const getNationCitizens = (gameManager: GameManager, nationId: string) => {
  const { gameData } = gameManager;
  const peopleArray = Object.values(gameData.people);
  return peopleArray.filter((person) => person.nationId === nationId);
};

export {
  getNationOrganization,
  getNationCitizens,
};
