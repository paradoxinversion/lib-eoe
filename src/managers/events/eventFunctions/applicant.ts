import { GameManager } from '../../game/GameManager';
import people from '../../../actions/people';
import zones from '../../../actions/zones';
import generators from '../../../generators';

// import { calculateAgentSalary, getMaxAgents } from '../../organization';
import { AgentDepartment, Person, EventConfig } from '../../../types';
import utilities from '../../../utilities';
import GameEvent from '../GameEvent';
import organization from '../../../actions/organization';

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

type EvilApplicantEventParams = {
  recruit: string;
};
/**
 * Create and return a new EVIL Applicant Game Event
 */
export const generateEvilApplicantEvent = (
  params?: EvilApplicantEventParams,
) => {
  let applicant =
    params?.recruit ?
      GameManager.getInstance().gameData.people[params?.recruit]
    : null;

  if (!applicant) {
    const {
      gameData: {
        player: { organizationId },
      },
    } = GameManager.getInstance();
    const playerZonesArray = zones.getZones({
      organizationId: organizationId,
    });
    if (
      people.getPeople({
        personFilter: {
          organizationId: organizationId,
        },
        agentFilter: { agentsOnly: true },
      }).length >= organization.getMaxAgents(organizationId)
    ) {
      return null;
    }

    const potentialRecruits: Person[] = [];
    playerZonesArray.map((zone) => {
      people
        .getPeople({
          zone: { zoneId: zone.id },
          agentFilter: { excludeAgents: true },
        })
        .forEach((person) => {
          potentialRecruits.push(person);
        });
    });

    if (potentialRecruits.length === 0) {
      throw new Error('NoAvailableAgents');
    }
    const recruitIndex = utilities.randomInt(0, potentialRecruits.length - 1);
    applicant = potentialRecruits[recruitIndex];
  }
  const event = new GameEvent(evilApplicantEvilConfig, {
    recruit: applicant,
    organizationId: GameManager.getInstance().gameData.player.organizationId,
    department: 'troop',
  });
  return event;
};

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
      const salary = organization.calculateAgentSalary(updatedAgent);
      const agentData = generators.entityGenerators.generateAgentData(
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
  GameManager.getInstance().addGameLogEvent({
    color: 'Primary',
    date: GameManager.getInstance().gameData.gameDate.toDateString(),
    icon: evilApplicantEvilConfig.icon,
    text: 'Evil Agent Event',
  });
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
  resolve: resolveEvilApplicant,
  getEventText(this: GameEvent) {
    this.eventText = `A citizen, ${(this.params as EvilApplicantParams).recruit?.name}, has applied to become an EVIL Agent.`;
  },
  icon: 'contact-page',
  type: 'recruit',
  forceStop: true,
};
