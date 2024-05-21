// import { combat } from '../../..';
// import { GameManager } from '../../GameManager';
// import { getPeople } from '../../actions/people';
// import { getZones } from '../../actions/zones';
// import { CombatResult, doCombat } from '../../combat/combat';
// import { Person, Zone } from '../../types/interfaces/entities';
// import { randomInt } from '../../utilities';
// import GameEvent from '../GameEvent';
// import GameEventQueue from '../GameEventQueue';
import people from '../../actions/people';
import { GameManager } from '../../managers/game/GameManager';
import utilities from '../../utilities';
import zones from '../../actions/zones';
import combat from '../../combat';
import GameEvent from '../../managers/events/GameEvent';
import { CombatResult } from '../../combat/combat';
import { Zone } from '../../types/interfaces/entities';
export const generateEvent = () => {
  console.debug('Generating raid event');
  const enemyTotal = utilities.randomInt(1, 5);

  const enemyPool = people.getPeople({
    personFilter: {
      loyaltyFilter: {
        comparison: 'less',
        value: 50,
        organizationId:
          GameManager.getInstance().gameData.player.organizationId,
      },
    },
    agentFilter: {
      excludeAgents: true,
    },
  });

  const enemies = [];
  for (let i = 0; i < enemyTotal; i++) {
    const enemyIndex = utilities.randomInt(0, enemyPool.length - 1);
    const enemy = enemyPool[enemyIndex];
    enemyPool.splice(enemyIndex, 1);
    enemies.push(enemy);
  }
  const zonePool = zones.getZones({
    organizationId: GameManager.getInstance().gameData.player.organizationId,
  });
  const zone = zonePool[utilities.randomInt(0, zonePool.length - 1)];

  const defendingAgents = people.getPeople({
    agentFilter: {
      agentsOnly: true,
    },
    zone: {
      zoneId: zone.id,
    },
  });
  const combatResult = combat.doCombat(enemies, defendingAgents);
  const event = new GameEvent(config, {
    combatResult,
    zone,
  });
  // GameEventQueue.getInstance().addEvent(event);
  return event;
};

export function setParams(
  this: GameEvent,
  { combatResult, zone }: { combatResult: CombatResult; zone: Zone },
) {
  this.params = {
    combatResult,
    zone,
  };
}
export function resolve() {}
export const config = {
  name: 'Raid',
  setParams,
  resolve,
  getEventText(this: GameEvent) {
    this.eventText = `A raid occured!`;
  },
  icon: 'warning',
  type: 'raid',
  forceStop: true,
};
