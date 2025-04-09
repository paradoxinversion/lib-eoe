import actions from '../actions';
import GameManager from '../managers/game/GameManager';
import { GameData } from '../types';
import testEntities from './helpers/testEntities';

const gameData: GameData = {
  people: {},
  nations: {
    n_1: {
      ...testEntities.templates.nation,
      id: 'n_1',
      organizationId: 'o_1',
      name: 'Test Nation 1',
    },
    n_2: {
      ...testEntities.templates.nation,
      id: 'n_2',
      organizationId: 'o_1',
      name: 'Test Nation 2',
    },
  },
  governingOrganizations: {
    o_1: {
      ...testEntities.templates.organization,
      id: 'o_1',
      name: 'Test Organization 1',
    },
  },
  zones: {
    z_1: {
      ...testEntities.templates.zone,
      id: 'z_1',
      nationId: 'n_1',
    },
  },
  buildings: {
    b_1: {
      ...testEntities.templates.building,
      id: 'b_1',
      zoneId: 'z_1',
      organizationId: 'o_1',
      type: 'bank',
    },
    b_2: {
      ...testEntities.templates.building,
      id: 'b_2',
      zoneId: 'z_1',
      organizationId: 'o_1',
      type: 'apartment',
    },
  },
  gameDate: new Date('1/1/2000'),
  player: {
    empireId: 'n_1',
    organizationId: 'o_1',
    overlordId: '',
  },
  gameLog: {
    simActions: {
      people: {},
    },
    events: [],
  },
};

describe('buildings', () => {
  beforeEach(() => {});

  describe('getBuildings', () => {
    it('should return all buildings in a zone', () => {
      new GameManager();
      GameManager.getInstance().updateGameData(gameData);
      const buildings = actions.buildings.getBuildings();
      console.log(buildings);
      expect(buildings.length).toBe(2);
    });
    it('should return all buildings in a zone', () => {
      new GameManager();
      GameManager.getInstance().updateGameData(gameData);
      const buildings = actions.buildings.getBuildings({ type: 'bank' });
      console.log(buildings);
      expect(buildings.length).toBe(1);
    });
  });
});
