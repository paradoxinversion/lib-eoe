import { GameManager } from '../../GameManager';
import { getPeople } from '../../actions/people';
import { getZones } from '../../actions/zones';
import { generateAgentData } from '../../generators/game';
import { calculateAgentSalary, getMaxAgents } from '../../organization';
import { AgentDepartment, Person } from '../../types/interfaces/entities';
import { randomInt } from '../../utilities';
import { getZoneCitizens } from '../../zones';
import GameEvent, { EventConfig } from '../GameEvent';

export interface EvilApplicantParams {
  recruit: Person;
  department: AgentDepartment;
  organizationId: string;
}

export interface EvilApplicantResolveArgs {
  resolutionValue: number;
  data: {
    department: string;
    commander: string;
  };
}

/**
 * Create and return a new EVIL Applicant Game Event
 */
export const generateEvilApplicantEvent = () => {
  const { gameData } = GameManager.getInstance();
  const playerZonesArray = getZones({
    organizationId: gameData.player.organizationId,
  });
  if (
    getPeople({
      personFilter: {
        organizationId: gameData.player.organizationId,
      },
      agentFilter: { agentsOnly: true },
    }).length >= getMaxAgents(gameData.player.organizationId)
  ) {
    return null;
  }

  const potentialRecruits: Person[] = [];
  playerZonesArray.map((zone) => {
    getZoneCitizens(zone.id, true).forEach((person) => {
      potentialRecruits.push(person);
    });
  });

  if (potentialRecruits.length === 0) {
    throw new Error('NoAvailableAgents');
  }
  const recruitIndex = randomInt(0, potentialRecruits.length - 1);
  const selectedAgent = potentialRecruits[recruitIndex];

  const event = new GameEvent(evilApplicantEvilConfig, {
    recruit: selectedAgent,
    organizationId: gameData.player.organizationId,
    department: 0,
  });
  return event;
};

/**
 * Set parameters for an Evil Applicant event
 */
export function setEvilApplicantParams(
  this: GameEvent,
  { recruit, organizationId, department }: EvilApplicantParams,
) {
  this.params = {
    recruit,
    department,
    organizationId,
  };
}

/**
 * Resolve an Evil Applicant Event
 */
export function resolveEvilApplicant(
  this: GameEvent,
  resolveArgs: EvilApplicantResolveArgs,
) {
  const { gameData } = GameManager.getInstance();
  const updatedGameData: { people: { [x: string]: Person } } = {
    people: {},
  };
  const params = this.params as EvilApplicantParams;

  switch (resolveArgs.resolutionValue) {
    case 1:
      params.department = resolveArgs.data.department as AgentDepartment;

      const updatedAgent: Person = { ...gameData.people[params.recruit?.id!] };
      const salary = calculateAgentSalary(updatedAgent);
      const agentData = generateAgentData(
        params.organizationId!,
        params.department,
        salary,
        resolveArgs.data.commander,
      );
      updatedAgent.agent = agentData;
      updatedGameData.people[params.recruit?.id!] = updatedAgent;
      break;

    default:
      break;
  }
  GameManager.getInstance().updateGameData(updatedGameData);
  this.eventData = {
    type: 'recruit',
    resolution: {
      updatedGameData,
    },
  };
  return this.eventData;
}

export const evilApplicantEvilConfig: EventConfig = {
  name: 'EVIL Applicant',
  setParams: setEvilApplicantParams,
  resolve: resolveEvilApplicant,
  getEventText(this: GameEvent) {
    this.eventText = `A citizen, ${(this.params as EvilApplicantParams).recruit?.name}, has applied to become an EVIL Agent.`;
  },
  icon: 'contact-page',
  type: 'recruit',
  forceStop: true,
};
