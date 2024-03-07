// export

import { Building, GoverningOrganization, Nation, Person, Zone } from "./types/interfaces/entities";
import { PlotManager, ActivityManager } from "./plots";

export interface GameData{
  /** A key-value pair object of ids and their associated people */
  people: {
    [x: string]: Person
  },
  /** A key-value pair object of ids and their associated nations */
  nations: {
    [x: string]: Nation
  },
  /** A key-value pair object of ids and their associated organizations */
  governingOrganizations: {
    [x: string]: GoverningOrganization
  },
  /** A key-value pair object of ids and their associated zones */
  zones: {
    [x: string]: Zone
  },
  /** A key-value pair object of ids and their associated buildings */
  buildings: {
    [x: string]: Building
  },
  gameDate: Date,
  player: {
    empireId: string;
    overlordId: string;
    organizationId: string;
  }
}

export class GameManager {
  initialized: boolean;
  plotManager: PlotManager;
  activityManager: ActivityManager;
  gameData: GameData
  
  constructor(eventManager, plotManager, activityManager) {
    this.gameData = {
      people: {},
      nations: {},
      governingOrganizations: {},
      zones: {},
      buildings: {},
      gameDate: ''
    };
    this.eventManager = eventManager;
    this.plotManager = plotManager;
    this.activityManager = activityManager;
    this.initialized = false;
  }

  setInitialized(initialized){
    this.initialized = initialized;
  }

  setGameData(gameData){
    this.gameData = gameData;
  }

  updateGameData(updatedGameData){
    const update: Partial<GameData> = {
      ...this.gameData,
      people: { ...this.gameData.people, ...updatedGameData.people },
      zones: { ...this.gameData.zones, ...updatedGameData.zones },
      nations: { ...this.gameData.nations, ...updatedGameData.nations },
      governingOrganizations: {
        ...this.gameData.governingOrganizations,
        ...updatedGameData.governingOrganizations,
      },
      buildings: { ...this.gameData.buildings, ...updatedGameData.buildings },
      player: { ...this.gameData.player, ...updatedGameData.player },
      gameDate: updatedGameData.gameDate || this.gameData.gameDate,
    };

    this.gameData = update;
  }
}

