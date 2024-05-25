import { GameManager } from '../../game/GameManager';
import people from '../../../actions/people';
import organization from '../../../actions/organization';
import utilities from '../../../utilities';
import GameEvent from '../GameEvent';

export interface IntruderAlertEventParams {
  intruderId: string;
}

export const generateIntruderAlertEvent = () => {
  // Determine which nation this intruder is from
  const possibleNations = Object.values(
    GameManager.getInstance().gameData.governingOrganizations,
  ).filter((org) => !org.evil);
  const org =
    possibleNations[utilities.randomInt(0, possibleNations.length - 1)];
  const orgAgents = people.getPeople({
    personFilter: {
      organizationId: org.id,
    },
    agentFilter: {
      agentsOnly: true,
    },
  });
  const agent = orgAgents[utilities.randomInt(0, orgAgents.length - 1)];
  const event = new GameEvent(intruderAlertEventConfig, {
    intruderId: agent.id,
  });
  return event;
};

function resolveIntruderAlert(this: GameEvent) {
  const { gameData } = GameManager.getInstance();
  const params = this.params as IntruderAlertEventParams;
  const updatedGameData = organization.takeCaptive(
    gameData.player.organizationId,
    gameData.people[params.intruderId!],
  );
  GameManager.getInstance().updateGameData(updatedGameData);
  GameManager.getInstance().addGameLogEvent({
    color: 'Primary',
    date: GameManager.getInstance().gameData.gameDate.toDateString(),
    icon: intruderAlertEventConfig.icon,
    text: 'Intruder Alert',
  });
  this.eventData = {
    type: 'intruder-alert',
    resolution: {
      updatedGameData,
    },
  };

  return this.eventData;
}

export const intruderAlertEventConfig = {
  name: 'Intruder Alert!',
  resolve: resolveIntruderAlert,
  getEventText(this: GameEvent) {
    this.eventText = 'An intruder has been spotted';
  },
  icon: 'warning',
  type: 'intruder',
  forceStop: true,
};
