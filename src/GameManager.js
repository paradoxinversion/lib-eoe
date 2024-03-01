class GameManager {
  constructor(eventManager, plotManager, activityManager) {
    /** @type {import("./typedef").GameData} */
    this.gameData = {};
    this.eventManager = eventManager;
    this.plotManager = plotManager;
    this.activityManager = activityManager;
    this.initialized = false;
  }

  setInitialized(initialized){
    console.log("WOO")
    this.initialized = initialized;
  }

  setGameData(gameData){
    this.gameData = gameData;
  }

  updateGameData(updatedGameData){
    /** @type {import("./typedef").GameData} */
    const update = {
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
      gameDate: updatedGameData.gameDate || gameData.gameDate,
    };

    this.gameData = update;
  }
}

module.exports = GameManager;
