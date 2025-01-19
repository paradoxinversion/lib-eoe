import { GameLogEvent, GameData } from '../../types';
import config from '../../config';

export class GameManager {
  private static instance: GameManager;
  initialized: boolean;
  gameData: GameData;
  constructor() {
    console.log('Game Manager Initialized');

    this.gameData = {
      people: {},
      nations: {},
      governingOrganizations: {},
      zones: {},
      buildings: {},
      gameDate: new Date(config.settings.worldGen.startDate),
      player: {
        empireId: '',
        organizationId: '',
        overlordId: '',
      },
      gameLog: {
        simActions: {
          people: {},
        },
        events: [],
      },
    };
    this.initialized = false;
  }

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }

    return GameManager.instance;
  }

  setInitialized(initialized: boolean) {
    this.initialized = initialized;
  }

  setGameData(gameData: GameData) {
    this.gameData = gameData;
  }

  updateGameData(updatedGameData: Partial<GameData>) {
    // console.log("Update Game Manager:", updatedGameData)
    const update: GameData = {
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
    return this.gameData;
  }

  updateSimActionLog(personId: string, action: string[]) {
    const personalLog = [
      ...(this.gameData.gameLog.simActions.people[personId] || []),
      ...action,
    ];

    // this.gameData.gameLog.simActions.people[personId] = personalLog;
    this.gameData = {
      ...this.gameData,
      gameLog: {
        ...this.gameData.gameLog,
        simActions: {
          people: {
            ...this.gameData.gameLog.simActions.people,
            [personId]: personalLog,
          },
        },
      },
    };

    return this.gameData;
  }

  addGameLogEvent(event: GameLogEvent) {
    this.gameData.gameLog.events = [...this.gameData.gameLog.events, event];
  }
}
