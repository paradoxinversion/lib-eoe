import { GameManager } from '../GameManager';

interface GetZonesProps {
  nationId?: string | null;
  organizationId?: string | null;
}

export const getZones = ({
  nationId = null,
  organizationId = null,
}: GetZonesProps = {}) => {
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
