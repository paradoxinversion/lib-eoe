const { recruitAgent } = require("../organization");

describe("organizations", () => {
  test("recruitAgent", () => {
    expect(recruitAgent("o_9999", {}).agent.department).toBe(0);
    expect(recruitAgent("o_9999", {}, 2).agent.department).toBe(2);
  });
});
