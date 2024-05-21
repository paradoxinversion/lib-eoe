import { combat } from '../../..';
import { GameManager } from '../../GameManager';
import { getPeople } from '../../actions/people';
import { getZones } from '../../actions/zones';
import { CombatResult, doCombat } from '../../combat';
import { Person, Zone } from '../../types/interfaces/entities';
import { randomInt } from '../../utilities';
import GameEvent from '../GameEvent';
import GameEventQueue from '../GameEventQueue';

export const generateEvent = () => {
  console.debug('Generating raid event');
  const enemyTotal = randomInt(1, 5);

  const enemyPool = getPeople({
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
    const enemyIndex = randomInt(0, enemyPool.length - 1);
    const enemy = enemyPool[enemyIndex];
    enemyPool.splice(enemyIndex, 1);
    enemies.push(enemy);
  }
  const zones = getZones({
    organizationId: GameManager.getInstance().gameData.player.organizationId,
  });
  const zone = zones[randomInt(0, zones.length - 1)];

  const defendingAgents = getPeople({
    agentFilter: {
      agentsOnly: true,
    },
    zone: {
      zoneId: zone.id,
    },
  });
  const combatResult = doCombat(enemies, defendingAgents);
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
