import {
  Person,
  Nation,
  Zone,
  GoverningOrganization,
  Building,
} from '../../entities';
import { GameLog } from './GameLog';

export interface GameData {
  /** A key-value pair object of ids and their associated people */
  people: {
    [x: string]: Person;
  };
  /** A key-value pair object of ids and their associated nations */
  nations: {
    [x: string]: Nation;
  };
  /** A key-value pair object of ids and their associated organizations */
  governingOrganizations: {
    [x: string]: GoverningOrganization;
  };
  /** A key-value pair object of ids and their associated zones */
  zones: {
    [x: string]: Zone;
  };
  /** A key-value pair object of ids and their associated buildings */
  buildings: {
    [x: string]: Building;
  };
  gameDate: Date;
  player: {
    empireId: string;
    overlordId: string;
    organizationId: string;
  };
  /** Various game log info */
  gameLog: GameLog;
}
