import { GameManager } from '../../GameManager';
import settings from '../../config/config';
import testEntities from '../helpers/testEntities';

describe('GameManager', () => {
  test('GameManager', () => {
    // get a fresh game manager instance
    const gm = GameManager.getInstance();
    expect(gm.initialized).toBe(false);
    expect(gm.gameData.gameDate).toStrictEqual(
      new Date(settings.worldGen.startDate),
    );
  });
  test('GameManager.updateGameData', () => {
    // get a fresh game manager instance

    const gm = GameManager.getInstance();
    gm.initialized = true;
    gm.updateGameData({
      people: {
        [testEntities.people.overlord.id]: testEntities.people.overlord,
      },
    });
    expect(gm.gameData.people[testEntities.people.overlord.id]).toBeDefined();
    const updatedName = 'Updated Name';
    gm.updateGameData({
      people: {
        [testEntities.people.overlord.id]: {
          ...testEntities.people.overlord,
          name: updatedName,
        },
      },
    });
    expect(
      gm.gameData.people[testEntities.people.overlord.id].name,
    ).toStrictEqual(updatedName);
  });
});
