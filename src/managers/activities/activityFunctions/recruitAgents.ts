import { GameManager } from '../../game/GameManager';
import { getPeople } from '../../../actions/people';
import GameEvent from '../../../events/GameEvent';
import GameEventQueue from '../../../events/GameEventQueue';
import { generateEvilApplicantEvent } from '../../../events/eventFunctions/applicant';
import { Person } from '../../../types/interfaces/entities';

const recruitAgents = (participantArray: string[]) => {
  // Relevant skills/attributes:
  // leadership: helps determine how many agents can be recruited
  // intelligence: helps determine the quality of the agents
  // loyalty: helps determine how effective the attempt at recruitment is
  // For each participant:
  // 1. Determine how many agents they can recruit
  // 2. For each agent, determine the quality of the people they talk to
  // 3. For each person they talk to, determine if they apply
  // 4. If they apply, add an evil applicant event

  const applicants: Person[] = [];
  participantArray.forEach((participant) => {
    const agent = GameManager.getInstance().gameData.people[participant];
    // Use math.ceil to ensure at least one agent can be recruited
    // XXX: For now, we limit to two max, while fixing the bug
    // prevent multiple recruit events from properly resolving
    const maxApplicants = Math.ceil(agent.skills.leadership / 10);
    const agentHomeZone =
      GameManager.getInstance().gameData.zones[agent.homeZoneId];

    console.debug('Recruiting agents in zone', agentHomeZone.name);
    console.debug('Max applicants:', maxApplicants);
    const homeZoneCitizens = getPeople({
      zone: {
        zoneId: agentHomeZone.id,
      },
      agentFilter: {
        excludeAgents: true,
      },
      personFilter: {
        excludeCaptured: true,
      },
    });
    if (homeZoneCitizens.length === 0) {
      console.debug('No citizens available for recruitment');
      return;
    }
    // For now, just grab the first people available
    for (let i = 0; i < maxApplicants; i++) {
      const citizen = homeZoneCitizens[i];
      applicants.push(citizen);
    }
  });

  console.debug('Applicants:', applicants);
  const events: GameEvent[] = [];
  for (const applicant of applicants) {
    // Add an EvilApplicantEvent for each applicant
    const event = generateEvilApplicantEvent({ recruit: applicant.id });
    events.push(event!);
  }

  // Add the events to the queue
  GameEventQueue.getInstance().addEvents(events);

  // No further game data to update, the events should take it from here
};

export default recruitAgents;
