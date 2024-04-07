import { GameManager } from '../../GameManager';
import { getPeople } from '../../actions/people';
import { takeCaptive } from '../../organization';
import { randomInt } from '../../utilities';
import GameEvent from '../GameEvent';

export interface IntruderAlertEventParams {
  intruderId: string;
}

export const generateIntruderAlertEvent = (gameManager: GameManager) => {
  // Determine which nation this intruder is from
  const possibleNations = Object.values(
    gameManager.gameData.governingOrganizations,
  ).filter((org) => !org.evil);
  const org = possibleNations[randomInt(0, possibleNations.length - 1)];
  const orgAgents = getPeople(gameManager, {
    organizationId: org.id,
    agentFilter: {
      department: -1,
      agentsOnly: true,
    },
  });
  const agent = orgAgents[randomInt(0, orgAgents.length - 1)];
  const event = new GameEvent(intruderAlertEventConfig, {
    intruderId: agent.id,
  });
  return event;
};

function setIntruderAlertParams(
  this: GameEvent,
  { intruderId }: IntruderAlertEventParams,
) {
  this.params = {
    intruderId,
  };
}

function resolveIntruderAlert(this: GameEvent, gameManager: GameManager) {
  const { gameData } = gameManager;
  const params = this.params as IntruderAlertEventParams;
  const updatedGameData = takeCaptive(
    gameManager,
    gameData.player.organizationId,
    gameData.people[params.intruderId!],
  );
  gameManager.updateGameData(updatedGameData);
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
  setParams: setIntruderAlertParams,
  resolve: resolveIntruderAlert,
  getEventText(this: GameEvent) {
    this.eventText = 'An intruder has been spotted';
  },
  icon: 'warning',
  type: 'intruder',
  forceStop: true,
};
