class GameManager{
    constructor(gameData, eventManager, plotManager, activityManager){
        /** @type {import("./typedef").GameData} */
        this.gameData = gameData;
        this.eventManager = eventManager;
        this.plotManager = plotManager;
        this.activityManager = activityManager;
    }
}

module.exports = GameManager;
