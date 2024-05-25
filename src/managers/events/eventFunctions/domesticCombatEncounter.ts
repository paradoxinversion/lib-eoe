import { GameManager } from '../../game/GameManager';
import people from '../../../actions/people';
import combat, { CombatResult } from '../../../combat/combat';
import utilities from '../../../utilities';
import GameEvent from '../GameEvent';
import { CombatEventParams } from './combat';

export interface DomesticCombatEncounterEventParams extends CombatEventParams {
  zoneId: string;
}

export type GeneratEventParams = {
  zone: string;
  targetedAgents: string[];
  crowd: CrowdSize;
};
export type CrowdSize = 'small' | 'medium' | 'large';

export const generateEvent = (params: GeneratEventParams) => {
  // Get some citizens
  let maxAttackers = 3;

  if (params.crowd === 'medium') {
    maxAttackers = 6;
  } else if (params.crowd === 'large') {
    maxAttackers = 10;
  }

  const totalAttackers = Math.floor(
    utilities.randomInt(maxAttackers * 0.25, maxAttackers),
  );

  const attackers = [];

  for (let i = 0; i < totalAttackers; i++) {
    const pool = people.getPeople({
      agentFilter: {
        agentsOnly: false,
      },
      zone: {
        zoneId: params.zone,
      },
    });
    const person = pool[utilities.randomInt(0, pool.length - 1)];
    if (person) {
      attackers.push(person);
    }
  }
  // Prepare our defenders
  const defenders = params.targetedAgents.map(
    (agent) => GameManager.getInstance().gameData.people[agent],
  );
  const result = combat.doCombat(attackers, defenders);
  const event = new GameEvent(config, {
    aggressingForce: attackers,
    defendingForce: defenders,
    zoneId: params.zone,
    combatResult: result,
  });
  return event;
};

export const config = {
  name: 'Domestic Combat Encounter',
  getEventText(this: GameEvent) {
    this.eventText = `A domestic Combat encounter has occured!`;
  },
  resolve: () => {},
  icon: 'warning',
  type: 'domesticCombatEncounter',
  forceStop: true,
};
