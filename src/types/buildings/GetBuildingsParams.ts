import { BuildingType } from './BuildingType';

export interface GetBuildingsParams {
  zoneId?: string | null;
  organizationId?: string | null;
  type?: BuildingType | null;
}
