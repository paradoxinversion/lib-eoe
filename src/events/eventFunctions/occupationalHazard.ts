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

export const generateOccupationalHazardEvent = (gameManager: GameManager) => {
  // for flavor, this may be limited to people working in certain buildings

  // Select a random empire agent
  const agents = getPeople(gameManager, {
    organizationId: gameManager.gameData.player.organizationId,
    agentFilter: { agentsOnly: true, excludeDepartments: [3] },
    excludeDeceased: true,
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

export function resolveOccupationalHazardEvent(
  this: GameEvent,
  gameManager: GameManager,
) {
  const params = this.params as OccupationalHazardParams;
  const agent = gameManager.gameData.people[params.agent];

  // Reduce the agent's health
  const updatedAgent: Person = gameManager.updateGameData(
    updateCurrentHealth(agent, -params.damage),
  ).people[agent.id];

  if (agent.derivedAttributes.health.currentHealth <= 0) {
    // Agent has died
    gameManager.updateGameData(killPerson(agent));
  }
  this.eventData = {
    type: 'occupational-hazard',
    resolution: {
      updatedGameData: gameManager.gameData,
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
