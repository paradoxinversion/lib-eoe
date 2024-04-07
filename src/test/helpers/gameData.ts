import { GameManager } from '../../GameManager';
import ActivityManager from '../../activities/ActivityManager';
import GameEventQueue from '../../events/GameEventQueue';
import { handleNewGame, hireStartingAgents } from '../../gameSetup';
import { ScienceManager } from '../../managers/science';
import { SCIENCE_PROJECTS } from '../../managers/scienceProjects';
import { PlotManager } from '../../plots/PlotManager';

export const createTestGameManager = () => {
  const gameManager = new GameManager(
    new GameEventQueue(),
    new PlotManager(),
    new ActivityManager(),
    new ScienceManager(SCIENCE_PROJECTS),
  );
  handleNewGame(gameManager, {});
  hireStartingAgents(gameManager);
  return gameManager;
};
