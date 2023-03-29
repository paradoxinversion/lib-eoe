const {
  getInfrastructureLoad,
  getUpkeep,
  getHousingCapacity,
  buildingsSchematics,
} = require("../buildings");
const { handleNewGame } = require("../gameSetup");
const { generateBuilding } = require("../generators/game");

describe("nations", () => {
  const eoeOrgId = "g_eoe";
  const apartment = generateBuilding({
    zoneId: "z_0",
    buildingType: buildingsSchematics.apartment,
    organizationId: eoeOrgId,
    infrastructureCost: 1,
    upkeepCost: 1,
  });

  const bank = generateBuilding({
    zoneId: "z_0",
    buildingType: buildingsSchematics.bank,
    organizationId: eoeOrgId,
    infrastructureCost: 2,
    upkeepCost: 2,
  });

  const lab = generateBuilding({
    zoneId: "z_0",
    buildingType: buildingsSchematics.laboratory,
    organizationId: eoeOrgId,
    infrastructureCost: 3,
    upkeepCost: 3,
  });
  /**
   * @type {import("../typedef").GameData}
   */
  const gameData = {
    governingOrganizations: {
      o_eoe: {
        id: eoeOrgId,
      },
    },
    buildings: {
      [apartment.id]: {
        id: apartment.id,
        infrastructureCost: apartment.infrastructureCost,
        organizationId: apartment.organizationId,
        upkeepCost: apartment.upkeepCost,
      },
      [bank.id]: {
        id: bank.id,
        infrastructureCost: bank.infrastructureCost,
        organizationId: bank.organizationId,
        upkeepCost: bank.upkeepCost,
      },
      [lab.id]: {
        id: lab.id,
        infrastructureCost: lab.infrastructureCost,
        organizationId: lab.organizationId,
        upkeepCost: lab.upkeepCost,
      },
    },
    player: {
      organizationId: eoeOrgId,
    },
  };
  test("getInfrastructureLoad", () => {
    expect(
      getInfrastructureLoad(gameData, gameData.player.organizationId)
    ).toBe(6);
  });

  test("getUpkeep", () => {
    expect(getUpkeep(gameData, gameData.player.organizationId)).toBeGreaterThan(0);
  });

  test("getHousingCapacity", () => {
    expect(getHousingCapacity(gameData, gameData.player.organizationId)).toBe(
      10
    );
  });
});
