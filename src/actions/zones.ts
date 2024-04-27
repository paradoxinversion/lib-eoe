import { GameManager } from '../GameManager';

interface GetZonesOptions {
  nationId?: string | null;
  organizationId?: string | null;
}

export const getZones = ({
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

export const getRandomZone = (options: GetZonesOptions) => {
  const zones = getZones(options);
  return zones[Math.floor(Math.random() * zones.length)];
};
