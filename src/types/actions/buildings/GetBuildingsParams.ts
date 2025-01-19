import { BuildingType } from '../../buildings';

export interface GetBuildingsParams {
  zoneId?: string | null;
  organizationId?: string | null;
  type?: BuildingType | null;
  zone?: {
    zoneId: string;
  };
  personnel?: {
    needsPersonnel: boolean;
  };
}
