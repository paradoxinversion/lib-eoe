import { GameManager } from '../../GameManager';
import { getPeople } from '../../actions/people';
import { removePersonnel } from '../../buildings';
import { getEvilEmpire } from '../../organization';
import { randomInt } from '../../utilities';
import GameEvent from '../GameEvent';

interface TemperTantrumParams {
  adminRemains: boolean;
}
export const generateTemperTantrumEvent = () => {
  return new GameEvent(temperTantrumEventConfig);
};
function setTemperTantrumParams(this: GameEvent) {
  this.params = {
    adminRemains: randomInt(0, 1) === 1,
  };
}

function resolveTemperTantrum(this: GameEvent, gameManager: GameManager) {
  const pool = getPeople(gameManager, {
    organizationId: getEvilEmpire(gameManager).id,
    agentFilter: {
      department: 1,
      agentsOnly: true,
    },
  });
  const admin = { ...pool[randomInt(0, pool.length - 1)] };

  if (admin.personnelAt) {
    const update = removePersonnel(
      admin,
      gameManager.gameData.buildings[admin.personnelAt],
    );

    gameManager.updateGameData(update);
  }
  admin.agent = null;
  gameManager.updateGameData({
    people: {
      [admin.id]: admin,
    },
  });
  return gameManager.gameData;
}

export const temperTantrumEventConfig = {
  name: 'Angry Admin',
  setParams: setTemperTantrumParams,
  resolve: resolveTemperTantrum,
  getEventText(this: GameEvent) {
    this.eventText = 'An admin is angry';
  },
  icon: 'info',
  type: 'temperTantrum',
  forceStop: true,
};
