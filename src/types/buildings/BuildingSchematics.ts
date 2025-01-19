import { BuildingSchematic } from './BuildingSchematic';
import { BuildingType } from './BuildingType';

export type BuildingSchematics = { [key in BuildingType]: BuildingSchematic };
