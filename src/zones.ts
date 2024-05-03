import { GameData, GameManager } from './GameManager';
import { getPeople } from './actions/people';
import { getBuildings } from './buildings';
import { Zone } from './types/interfaces/entities';
/**
 *
 */
const getZones = (nationId: string) => {
  const { gameData } = GameManager.getInstance();
  const zoneArray = Object.values(gameData.zones);
  if (nationId) {
    return zoneArray.filter((zone) => zone.nationId === nationId);
  }
  return zoneArray;
};

/**
 *
 */
const getZoneWealth = (zone: Zone) => {
  const { gameData } = GameManager.getInstance();
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
const getZonesWealth = (zones: Zone[]) => {
  const { gameData } = GameManager.getInstance();
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
  zoneId: string,
  excludeAgents?: boolean,
  excludeDead?: boolean,
) => {
  const { gameData } = GameManager.getInstance();
  const peopleArray = Object.values(gameData.people);
  const citizens = peopleArray.filter((person) => {
    if (excludeAgents && person.agent) {
      return false;
    }

    if (excludeDead && person.derivedAttributes.health.currentHealth <= 0) {
      return false;
    }

    return person.homeZoneId === zoneId;
  });
  return citizens;
};

interface TransferZoneControlParams {
  zoneId: string;
  organizationId: string;
  nationId: string;
}

const transferZoneControl = ({
  zoneId,
  organizationId,
  nationId,
}: TransferZoneControlParams): Partial<GameData> => {
  const {
    gameData: { zones },
  } = GameManager.getInstance();
  const zone = { ...zones[zoneId] };
  zone.organizationId = organizationId;
  zone.nationId = nationId || zone.nationId;

  const updatedZoneBuildings = getBuildings({
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

  const updatedPeople = getPeople({
    zone: {
      zoneId,
    },
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
