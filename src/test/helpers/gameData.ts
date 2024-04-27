import { GameManager } from '../../GameManager';
import ActivityManager from '../../activities/ActivityManager';
import GameEventQueue from '../../events/GameEventQueue';
import { handleNewGame, hireStartingAgents } from '../../gameSetup';
import { ScienceManager } from '../../managers/science/science';
import { SCIENCE_PROJECTS } from '../../managers/science/scienceProjects';
import { PlotManager } from '../../plots/PlotManager';

export const createTestGameManager = () => {
  const gameManager = new GameManager();
  handleNewGame(gameManager, {});
  hireStartingAgents(gameManager);
  return gameManager;
};
