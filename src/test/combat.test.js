const {
  createInitiative,
  generateInitiative,
  getPossibleTargets,
  doCombat,
} = require("../combat");

describe("combat", () => {
  const attackingForce = [
    {
      name: "A1",
      health: 15,
      currentHealth: 15,
      combat: Math.floor(Math.random() * 10),
    },
    {
      name: "A2",
      health: 10,
      currentHealth: 0,
      combat: Math.floor(Math.random() * 10),
    },
  ];

  const defendingForce = [
    {
      name: "D1",
      health: 15,
      currentHealth: 15,
      combat: Math.floor(Math.random() * 10),
    },
    {
      name: "D2",
      health: 15,
      currentHealth: 15,
      combat: Math.floor(Math.random() * 10),
    },
    {
      name: "D3",
      health: 15,
      currentHealth: 0,
      combat: Math.floor(Math.random() * 10),
    },
  ];
  test("createInitiative", () => {
    expect(createInitiative(1, false, 0)).toStrictEqual({
      attackingForce: false,
      initiative: 1,
      characterIndex: 0,
    });
  });

  test("generateInitiative", () => {
    expect(generateInitiative(attackingForce, defendingForce)).toHaveLength(3);
  });

  test("getPossibleTargets", () => {
    expect(getPossibleTargets(attackingForce)).toHaveLength(1);
    expect(getPossibleTargets(defendingForce)).toHaveLength(2);
  });

  test("doCombat", () => {
    const combatResult = doCombat(attackingForce, defendingForce);
    expect(Number.isInteger(combatResult.rounds)).toBe(true);
    expect(combatResult.combatLog.length).toBeGreaterThan(1);
    expect(combatResult.characters.attackers).toBeDefined();
    expect(combatResult.characters.defenders).toBeDefined();
    expect(combatResult.characters.attackers).toHaveLength(
      attackingForce.length
    );
    expect(combatResult.characters.defenders).toHaveLength(
      defendingForce.length
    );
  });
});
