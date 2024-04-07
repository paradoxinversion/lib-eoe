import { getOrganizations } from '../organization';
import { createTestGameManager } from './helpers/gameData';

describe('organizations', () => {
  test('getOrganizations', () => {
    const tgm = createTestGameManager();
    const orgs = getOrganizations(tgm, {});
  });
});
