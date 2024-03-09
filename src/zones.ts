import { GameManager } from "./GameManager";
import { getPeople } from "./actions/people";
import { getBuildings } from "./buildings";
import { Zone } from "./types/interfaces/entities";
/**
 *
 */
const getZones = (gameManager: GameManager, nationId: string) => {
  const { gameData } = gameManager;
  const zoneArray = Object.values(gameData.zones);
  if (nationId) {
    return zoneArray.filter((zone) => zone.nationId === nationId);
  }
  return zoneArray;
};

/**
 *
 * @param {GameManager} gameManager
 * @param {import("./typedef").Zone} zone
 */
const getZoneWealth = (gameManager: GameManager, zone: Zone) => {
  const { gameData } = gameManager;
  const peopleArray = Object.values(gameData.people);
  peopleArray
    .filter((person) => person.homeZoneId === zone.id)
    .reduce((totalWealth, person) => {
      return totalWealth++;
    }, 0);
};

/**
 *
 */
const getZonesWealth = (gameManager: GameManager, zones: Zone[]) => {
  const { gameData } = gameManager;
  const peopleArray = Object.values(gameData.people);
  return zones.reduce((total, zone) => {
    return (total += peopleArray
      .filter((person) => person.homeZoneId === zone.id)
      .reduce((totalWealth, person) => {
        return (totalWealth += 1);
      }, 0));
  }, 0);
};

const getZonesInfrastructureCost = (zones: Zone[]) => {
  return zones.reduce((total, zone) => {
    return (total += 1);
  }, 0);
};

/**
 *
 */
const getZoneCitizens = (
  gameManager: GameManager,
  zoneId: string,
  excludeAgents?: boolean,
  excludeDead?: boolean
) => {
  const { gameData } = gameManager;
  const peopleArray = Object.values(gameData.people);
  const citizens = peopleArray.filter((person) => {
    if (excludeAgents && person.agent) {
      return false;
    }

    if (excludeDead && person.currentHealth <= 0) {
      return false;
    }

    return person.homeZoneId === zoneId;
  });
  return citizens;
};

interface TransferZoneControlParams{
  zoneId: string;
  organizationId: string;
  nationId: string;
}

const transferZoneControl = (
  gameManager: GameManager,
  { zoneId, organizationId, nationId }: TransferZoneControlParams
) => {
  const {
    gameData: { zones },
  } = gameManager;
  const zone = { ...zones[zoneId] };
  zone.organizationId = organizationId;
  zone.nationId = nationId || zone.nationId;

  const updatedZoneBuildings = getBuildings(gameManager, {
    zoneId,
  }).reduce((prev, building) => {
    return {
      ...prev,
      [building.id]: {
        ...building,
        organizationId,
      },
    };
  }, {});

  const updatedPeople = getPeople(gameManager, {
    zoneId,
  }).reduce((prev, person) => {
    return {
      ...prev,
      [person.id]: {
        ...person,
        nationId,
      },
    };
  }, {});

  return {
    zones: {
      [zoneId]: zone,
    },
    people: updatedPeople,
    buildings: updatedZoneBuildings,
  };
};
export {
  getZones,
  getZoneWealth,
  getZonesWealth,
  getZonesInfrastructureCost,
  getZoneCitizens,
  transferZoneControl,
};
