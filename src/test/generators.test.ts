import game from '../generators/game';
import { AgentDepartment } from '../types/interfaces/entities';

describe('generators', () => {
  describe('game', () => {
    describe('generateNation', () => {
      test('generateNation', () => {
        const args = {
          id: 1,
          name: 'Test',
          size: 10,
        };
        expect(game.generateNation(args).size).toBe(args.size);
        expect(game.generateNation(args).name).toBe(args.name);
      });
    });

    test('generateZone', () => {
      const args1 = {
        nationId: 'n_1',
      };

      const args2 = {
        name: 'Test Zone',
        nationId: 'n_1',
        size: 10,
      };

      // expect(() => generateZone({})).toThrow();
      expect(game.generateZone(args1).id.startsWith('z_')).toBe(true);
      expect(game.generateZone(args1).wealth).toBeGreaterThan(0);
      expect(game.generateZone(args1).name).toBe('Unnamed Zone');
      expect(game.generateZone(args2).size).toBe(args2.size);
      expect(game.generateZone(args2).name).toBe(args2.name);
    });

    test('generateZones', () => {
      const zones = game.generateZones(5);
      expect(Object.keys(zones)).toHaveLength(5);
    });

    test('generatePerson', () => {
      const args1 = {
        nationId: 'n_1',
        homeZoneId: 'z_1',
      };
      const args2 = {
        name: 'Test Person',
        nationId: 'n_1',
        homeZoneId: 'z_1',
      };
      // expect(() => generatePerson({})).toThrowError();
      expect(game.generatePerson(args1).id.startsWith('p_')).toBe(true);
      expect(game.generatePerson(args1).skills.administration).toBeDefined();
      expect(
        game.generatePerson(args1).standardAttributes.intelligence,
      ).toBeDefined();
      expect(game.generatePerson(args1).skills.combat).toBeDefined();
      expect(game.generatePerson(args2).name).toBe(args2.name);
    });

    test('generatePeople', () => {
      const people = game.generatePeople(5);
      expect(Object.keys(people)).toHaveLength(5);
    });

    test('generateAgentData', () => {
      const commanderId = 'p_1';
      const orgId = 'p_2';
      const department: AgentDepartment = 'troop';
      const salary = 10;
      const agentData = game.generateAgentData(
        orgId,
        department,
        salary,
        commanderId,
      );
      expect(agentData).toStrictEqual({
        commanderId,
        department,
        organizationId: orgId,
        salary,
      });
    });

    test('generateGoverningOrg', () => {
      const args = {
        nationId: 'n_1',
      };

      const args2 = {
        name: 'Test Organization',
        nationId: 'n_1',
        evil: true,
      };
      expect(game.generateGoverningOrg(args).name).toBe('Unnamed Organization');
      expect(game.generateGoverningOrg(args).evil).toBe(false);

      expect(game.generateGoverningOrg(args2).name).toBe(args2.name);
      expect(game.generateGoverningOrg(args2).evil).toBe(args2.evil);
    });

    test('generateBuilding', () => {
      const zoneId = 'z_1';
      // const buildingType = ;
      const organizationId = 'o_1';
      const infrastructureCost = 1;
      const upkeepCost = 2;

      expect(
        game.generateBuilding({
          zoneId,
          buildingType: 'apartment',
          organizationId,
          infrastructureCost,
          upkeepCost,
        }).basicAttributes.maxPersonnel,
      ).toEqual(4);
    });
  });
});
