const { getNationOrganization, getNationCitizens } = require("../nations");
const { handleNewGame } = require("../gameSetup");
describe("nations", () => {
  describe("getNationOrganization", () => {
    test("foo", () => {
      const testOrgs = [
        {
          id: "o_0",
          nationId: "n_0",
          name: "T0",
        },
        {
          id: "o_1",
          nationId: "n_1",
          name: "T1",
        },
        {
          id: "o_2",
          nationId: "n_2",
          name: "T2",
        },
      ];
      expect(() => getNationOrganization()).toThrow();
      expect(() => getNationOrganization([])).toThrow();
      expect(() => getNationOrganization([], 1)).toThrow();
      expect(getNationOrganization(testOrgs, 1)).toBe(null);
      expect(getNationOrganization(testOrgs, "n_1")).not.toBe(null);
    });
  });

  describe("getNationCitizens", () => {
    const gameData = handleNewGame();
    test("it works", () => {
        const citizens = getNationCitizens(gameData, gameData.player.empireId);
        expect(citizens.length).toBeGreaterThan(0);
    })
  })
});
