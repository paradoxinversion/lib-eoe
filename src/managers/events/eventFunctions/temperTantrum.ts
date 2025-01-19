import { GameManager } from '../../game/GameManager';
import people from '../../../actions/people';
import buildings from '../../../actions/buildings';
import organization from '../../../actions/organization';
import utilities from '../../../utilities';
import GameEvent from '../GameEvent';
import { TemperTantrumParams } from '../../../types';

export const generateTemperTantrumEvent = () => {
  return new GameEvent(temperTantrumEventConfig, {
    adminRemains: utilities.randomInt(0, 1) === 1,
  });
};

function resolveTemperTantrum(this: GameEvent) {
  const pool = people.getPeople({
    personFilter: {
      organizationId: organization.getEvilEmpire().id,
    },
    agentFilter: {
      department: 'administrator',
      agentsOnly: true,
    },
  });
  const admin = { ...pool[utilities.randomInt(0, pool.length - 1)] };

  if (admin.personnelAt) {
    const update = buildings.removePersonnel(
      admin,
      GameManager.getInstance().gameData.buildings[admin.personnelAt],
    );

    GameManager.getInstance().updateGameData(update);
  }
  admin.agent = null;
  GameManager.getInstance().updateGameData({
    people: {
      [admin.id]: admin,
    },
  });
  return GameManager.getInstance().gameData;
}

export const temperTantrumEventConfig = {
  name: 'Angry Admin',
  resolve: resolveTemperTantrum,
  getEventText(this: GameEvent) {
    this.eventText = 'An admin is angry';
  },
  icon: 'info',
  type: 'temperTantrum',
  forceStop: true,
};
