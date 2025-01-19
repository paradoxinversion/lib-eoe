import { GameManager } from '../managers/game/GameManager';
import { Zone, GameData } from '../types';
import buildings from './buildings';
import people from './people';
export interface GetZonesOptions {
  nationId?: string | null;
  organizationId?: string | null;
}

const getZones = ({
  nationId = null,
  organizationId = null,
}: GetZonesOptions = {}) => {
  return Object.values(GameManager.getInstance().gameData.zones).filter(
    (zone) => {
      if (nationId && zone.nationId !== nationId) {
        return false;
      }

      if (organizationId && zone.organizationId !== organizationId) {
        return false;
      }

      return true;
    },
  );
};

const getRandomZone = (options: GetZonesOptions) => {
  const zones = getZones(options);
  return zones[Math.floor(Math.random() * zones.length)];
};

/**
 *
 */
const getZoneWealth = (zone: Zone) => {
  const { gameData } = GameManager.getInstance();
  const peopleArray = Object.values(gameData.people);
  peopleArray
    .filter((person) => person.homeZoneId === zone.id)
    .reduce((totalWealth) => {
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
      .reduce((totalWealth) => {
        return (totalWealth += 1);
      }, 0));
  }, 0);
};

const getZonesInfrastructureCost = (zones: Zone[]) => {
  return zones.reduce((total) => {
    return (total += 1);
  }, 0);
};

export interface TransferZoneControlParams {
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

  const updatedZoneBuildings = buildings
    .getBuildings({
      zoneId,
    })
    .reduce((prev, building) => {
      return {
        ...prev,
        [building.id]: {
          ...building,
          organizationId,
        },
      };
    }, {});

  const updatedPeople = people
    .getPeople({
      zone: {
        zoneId,
      },
    })
    .reduce((prev, person) => {
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

export default {
  getZones,
  getRandomZone,
  getZoneWealth,
  getZonesWealth,
  transferZoneControl,
  getZonesInfrastructureCost,
};
