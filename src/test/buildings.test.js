const {
  getInfrastructureLoad,
  getUpkeep,
  getHousingCapacity,
} = require("../buildings");
const { createTestGameManager } = require("./helpers/gameData");

describe("buildings", () => {
  const tgm = createTestGameManager();
  
  test("getInfrastructureLoad", () => {
    expect(
      getInfrastructureLoad(tgm, tgm.gameData.player.organizationId)
    ).toBeInstanceOf(Number);
  });

  test("getUpkeep", () => {
    expect(getUpkeep(tgm, tgm.gameData.player.organizationId)).toBeGreaterThan(
      0
    );
  });

  test("getHousingCapacity", () => {
    const r = getHousingCapacity(tgm, tgm.gameData.player.organizationId);
    expect(r).toBeGreaterThan(
      0
    );
  });
});
