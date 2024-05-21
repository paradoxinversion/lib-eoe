import { GameManager } from '../../GameManager';
import {
  getPeople,
  updateCurrentHealth,
  killPerson,
} from '../../actions/people';
import { Person } from '../../types/interfaces/entities';
import { randomInt } from '../../utilities';
import GameEvent, { EventConfig } from '../GameEvent';

export type OccupationalHazardParams = {
  agent: string;
  damage: number;
  lethalPotential: boolean;
};

export const generateOccupationalHazardEvent = () => {
  // for flavor, this may be limited to people working in certain buildings

  // Select a random empire agent
  const agents = getPeople({
    personFilter: {
      organizationId: GameManager.getInstance().gameData.player.organizationId,
      excludeDeceased: true,
    },
    agentFilter: { agentsOnly: true, excludeDepartments: ['overlord'] },
  });

  const agent = agents[Math.floor(Math.random() * agents.length)];
  const lethalPotential = Math.random() < 0.1;
  const currentHealth = agent.derivedAttributes.health.currentHealth;
  const damage =
    lethalPotential ?
      randomInt(1, currentHealth)
    : randomInt(1, currentHealth - 1);
  return new GameEvent(occupationalHazardEventConfig, {
    agent: agent.id,
    damage,
    lethalPotential,
  });
};

export function resolveOccupationalHazardEvent(this: GameEvent) {
  const params = this.params as OccupationalHazardParams;
  const agent = GameManager.getInstance().gameData.people[params.agent];

  // Reduce the agent's health
  const updatedAgent: Person = GameManager.getInstance().updateGameData(
    updateCurrentHealth(agent, -params.damage),
  ).people[agent.id];

  if (agent.derivedAttributes.health.currentHealth <= 0) {
    // Agent has died
    GameManager.getInstance().updateGameData(killPerson(agent));
  }
  this.eventData = {
    type: 'occupational-hazard',
    resolution: {
      updatedGameData: GameManager.getInstance().gameData,
    },
  };

  return this.eventData;
}

export function setOccupationalHazardParams(
  this: GameEvent,
  params: OccupationalHazardParams,
) {
  this.params = params;
}

export const occupationalHazardEventConfig: EventConfig = {
  name: 'Occupational Hazard',
  setParams: setOccupationalHazardParams,
  resolve: resolveOccupationalHazardEvent,
  getEventText(this: GameEvent) {
    this.eventText = 'An agent has been injured';
  },
  icon: 'warning',
  type: 'occupationalHazard',
  forceStop: true,
};
