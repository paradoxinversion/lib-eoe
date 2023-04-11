const { generateNation, generateZone } = require("../generators/game");
const { throwErrorFromArray, randomInt } = require("../utilities");

describe("utilities", () => {
  test("throwErrorFromArray", () => {
    expect(() => throwErrorFromArray(["Foo", "Bar", "Baz"])).toThrow(
      "Foo Bar Baz"
    );
    expect(() => throwErrorFromArray()).not.toThrow();
  });
  test("randomInt", () => {
    expect(randomInt()).toBeGreaterThanOrEqual(0);
    expect(randomInt()).toBeLessThanOrEqual(100);
    expect(randomInt(5, 10)).toBeGreaterThanOrEqual(5);
    expect(randomInt(5, 10)).toBeLessThanOrEqual(10);
  });
});
