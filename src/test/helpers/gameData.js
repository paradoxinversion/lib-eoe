/**
 * @type {import("../../typedef").Nation}
 */
const testEvilEmpireNation = {
  id: "n_01",
  name: "EVIL Empire",
  size: 1,
};

/**
 * @type {import("../../typedef").Nation}
 */
const testNationA = {
  id: "n_02",
  name: "Test Nation A",
  size: 1,
};

const testOrgEvilEmpire = {
  id: "o_01",
  name: "Evil Empire Org",
  nationId: "n_01",
  evil: true,
  wealth: 100,
};

const testOrgA = {
  id: "o_02",
  name: "Governing Organization A",
  nationId: "n_02",
  evil: false,
  wealth: 100,
};

/**
 * @type {import("../../typedef").GameData}
 */
const testGameData = {
  nations: {
    [testEvilEmpireNation.id]: testEvilEmpireNation,
    [testNationA.id]: testNationA,
  },
  governingOrganizations: {
    [testOrgEvilEmpire.id]: testOrgEvilEmpire,
    [testOrgA.id]: testOrgA,
  },
  zones: {},
  people: {},
  buildings: {},
  // player: {
  //   empireId: ,
  //   overlordId: ,
  //   organizationId: ,
  // }
};
