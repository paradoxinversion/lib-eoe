import { buildingsSchematics } from "../buildings";
import {
  generateNation,
  generateZone,
  generatePerson,
  generateGoverningOrg,
  generateNations,
  generateZones,
  generatePeople,
  generateAgentData,
  generateBuilding,
} from "../generators/game"

describe("generators", () => {
  describe("game", () => {
    test("generateNation", () => {
      const args = {
        id: 1,
        name: "Test",
        size: 10,
      };
      expect(generateNation({}).size).toBe(1);
      expect(generateNation({}).id.startsWith("n_")).toBe(true);
      expect(generateNation(args).size).toBe(args.size);
      expect(generateNation(args).name).toBe(args.name);
    });

    test("generateNations", () => {
      const nations = generateNations(5, 3, 10);

      expect(Object.keys(nations)).toHaveLength(5);
      expect(() => generateNations()).toThrow();
      expect(() => generateNations(5)).toThrow();
      expect(() => generateNations(5, 3)).toThrow();
      expect(() => generateNations(5, 3, 2)).toThrow();
    });

    test("generateZone", () => {
      const args1 = {
        nationId: "n_1",
      };

      const args2 = {
        name: "Test Zone",
        nationId: "n_1",
        size: 10,
      };

      // expect(() => generateZone({})).toThrow();
      expect(generateZone(args1).id.startsWith("z_")).toBe(true);
      expect(generateZone(args1).wealth).toBeGreaterThan(0);
      expect(generateZone(args1).name).toBe("Unnamed Zone");
      expect(generateZone(args2).size).toBe(args2.size);
      expect(generateZone(args2).name).toBe(args2.name);
    });

    test("generateZones", () => {
      const zones = generateZones(5);
      expect(Object.keys(zones)).toHaveLength(5);
    });

    test("generatePerson", () => {
      const args1 = {
        nationId: "n_1",
        homeZoneId: "z_1",
      };
      const args2 = {
        name: "Test Person",
        nationId: "n_1",
        homeZoneId: "z_1",
      };
      // expect(() => generatePerson({})).toThrowError();
      expect(generatePerson(args1).id.startsWith("p_")).toBe(true);
      expect(generatePerson(args1).administration).toBeDefined();
      expect(generatePerson(args1).intelligence).toBeDefined();
      expect(generatePerson(args1).combat).toBeDefined();
      expect(generatePerson(args2).name).toBe(args2.name);
    });

    test("generatePeople", () => {
      const people = generatePeople(5);
      expect(Object.keys(people)).toHaveLength(5);
    });

    test("generateAgentData", () => {
      const commanderId = "p_1";
      const orgId = "p_2";
      const department = 1;
      const salary = 10;
      const agentData = generateAgentData(
        orgId,
        department,
        commanderId,
        salary
      );
      expect(agentData).toStrictEqual({
        commanderId,
        department,
        organizationId: orgId,
        salary,
      });
    });

    test("generateGoverningOrg", () => {
      const args = {
        nationId: "n_1",
      };

      const args2 = {
        name: "Test Organization",
        nationId: "n_1",
        evil: true,
      };
      expect(() => generateGoverningOrg({})).toThrowError();
      expect(generateGoverningOrg(args).name).toBe("Unnamed Organization");
      expect(generateGoverningOrg(args).evil).toBe(false);

      expect(generateGoverningOrg(args2).name).toBe(args2.name);
      expect(generateGoverningOrg(args2).evil).toBe(args2.evil);
    });

    test("generateBuilding", () => {
      const zoneId = "z_1";
      // const buildingType = ;
      const organizationId = "o_1";
      const infrastructureCost = 1;
      const upkeepCost = 2;

      expect(
        generateBuilding({
          zoneId,
          buildingType: buildingsSchematics.apartment,
          organizationId,
          infrastructureCost,
          upkeepCost,
        }).maxPersonnel
      ).toEqual(4);
      expect(() => generateBuilding({})).toThrow();
      expect(() => generateBuilding({ zoneId })).toThrow();
      expect(() =>
        generateBuilding({
          zoneId,
          buildingType: buildingsSchematics.apartment.buildingType,
        })
      ).toThrow();
      expect(() =>
        generateBuilding({
          zoneId,
          buildingType: buildingsSchematics.apartment.buildingType,
          organizationId,
        })
      ).toThrow();
      expect(() =>
        generateBuilding({
          zoneId,
          buildingType: buildingsSchematics.apartment.buildingType,
          organizationId,
          infrastructureCost,
        })
      ).toThrow();
      expect(() =>
        generateBuilding({
          zoneId,
          buildingType: buildingsSchematics.apartment.buildingType,
          organizationId,
          infrastructureCost,
        })
      ).toThrow();
      expect(
        generateBuilding({
          zoneId,
          buildingType: buildingsSchematics.apartment.buildingType,
          organizationId,
          infrastructureCost,
          upkeepCost,
        }).housingCapacity
      ).toBeGreaterThan(0);
    });
  });
});
