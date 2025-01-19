import { GameManager } from '../../game/GameManager';
import people from '../../../actions/people';
import { Person, EventConfig, OccupationalHazardParams } from '../../../types';
import utilities from '../../../utilities';
import GameEvent from '../GameEvent';

export const generateOccupationalHazardEvent = () => {
  // for flavor, this may be limited to people working in certain buildings

  // Select a random empire agent
  const agents = people.getPeople({
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
      utilities.randomInt(1, currentHealth)
    : utilities.randomInt(1, currentHealth - 1);
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
    people.updateCurrentHealth(agent, -params.damage),
  ).people[agent.id];

  if (agent.derivedAttributes.health.currentHealth <= 0) {
    // Agent has died
    GameManager.getInstance().updateGameData(people.killPerson(agent));
  }
  GameManager.getInstance().addGameLogEvent({
    color: 'Primary',
    date: GameManager.getInstance().gameData.gameDate.toDateString(),
    icon: occupationalHazardEventConfig.icon,
    text: 'An Agent has been injured',
  });
  this.eventData = {
    type: 'occupational-hazard',
    resolution: {
      updatedGameData: GameManager.getInstance().gameData,
    },
  };

  return this.eventData;
}

export const occupationalHazardEventConfig: EventConfig = {
  name: 'Occupational Hazard',
  resolve: resolveOccupationalHazardEvent,
  getEventText(this: GameEvent) {
    this.eventText = 'An agent has been injured';
  },
  icon: 'warning',
  type: 'occupationalHazard',
  forceStop: true,
};
