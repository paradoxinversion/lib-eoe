const { gameSetup } = require("../../..")
const GameManager = require("../../GameManager")
const { GameEventQueue } = require("../../gameEvents")
const { hireStartingAgents } = require("../../gameSetup")
const { handleNewGame } = require("../../gameSetup")
const { PlotManager, ActivityManager } = require("../../plots")

const createTestGameManager = () => {
  const gameManager = new GameManager(new GameEventQueue(), new PlotManager(), new ActivityManager());
  handleNewGame(gameManager);
  hireStartingAgents(gameManager);
  return gameManager;
}

module.exports = {
  createTestGameManager
}