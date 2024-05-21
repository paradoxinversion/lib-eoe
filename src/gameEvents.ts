import { GameData, GameManager } from './managers/game/GameManager';
import { getEvilEmpire } from './organization';
import { PlotResolution } from './plots';
import GameEvent from './managers/events/GameEvent';
import GameEventQueue from './managers/events/GameEventQueue';
import { GoverningOrgStatusEffects } from './statusEffects/governingOrg';
import { generateOccupationalHazardEvent } from './managers/events/eventFunctions/occupationalHazard';
import eventConfig from './managers/events/eventConfig';
import { generateEvilApplicantEvent } from './managers/events/eventFunctions/applicant';
import { generateAttackZonePlotEvent } from './managers/events/eventFunctions/attackZone';
import { generateEmbedAgentsEvent } from './managers/events/eventFunctions/embedAgents';
import { generateInciteProtestEvent } from './managers/events/eventFunctions/inciteProtest';
import { generateIntruderAlertEvent } from './managers/events/eventFunctions/intruderAlert';
import { generateMonthlyReportEvent } from './managers/events/eventFunctions/monthlyReport';
import { generatePetEvent } from './managers/events/eventFunctions/petEvent';
import { generateRecallEmbeddedAgentsEvent } from './managers/events/eventFunctions/recallEmbeddedAgents';
import { generateReconZoneEvent } from './managers/events/eventFunctions/recon';
import { generateStandardReportEvent } from './managers/events/eventFunctions/standardReport';
import { generateTemperTantrumEvent } from './managers/events/eventFunctions/temperTantrum';
import { generateWealthMod } from './managers/events/eventFunctions/wealthMod';
import ShufflebagManager from './managers/shufflebag/ShufflebagManager';
import people from './actions/people';
import organization from './actions/organization';
import { generateEvent as generateRaidEvent } from './managers/events/eventFunctions/raid';

export interface EventRequirements {
  personnel?: {
    workingAdmins?: boolean;
    workingScientists?: boolean;
  };
  empireWealth?: {
    min?: number;
    max?: number;
  };
  empireStatuses?: GoverningOrgStatusEffects[];
}

interface EventData {
  type: string;
  resolution: {
    updatedGameData?: Partial<GameData>;
    additionalData?: {
      [x: string]: Object | string | number | boolean;
    };
  };
}

/**
 * Generates events for each plot resolution
 */
const addPlotResolutions = (plotResolutions: PlotResolution[]) => {
  const plotResolutionEvents: GameEvent[] = [];
  plotResolutions.forEach((plotResolution) => {
    let resolutionEvent: GameEvent | null = null;
    switch (plotResolution.plot.plotType) {
      case 'attack-zone':
        resolutionEvent = generateAttackZonePlotEvent(plotResolution.plot);
        break;
      case 'recon-zone':
        resolutionEvent = generateReconZoneEvent(plotResolution.plot);
        break;
      case 'embed-agents':
        resolutionEvent = generateEmbedAgentsEvent(plotResolution.plot);
        break;
      case 'recall-embedded-agents':
        resolutionEvent = generateRecallEmbeddedAgentsEvent(
          plotResolution.plot,
        );
        break;
      case 'incite-protest':
        resolutionEvent = generateInciteProtestEvent(plotResolution.plot);
        break;

      default:
        break;
    }
    if (resolutionEvent) {
      plotResolutionEvents.push(resolutionEvent);
      GameEventQueue.getInstance().addEvent(resolutionEvent);
    }
  });
  return plotResolutionEvents;
};
const eventShufflebag = ShufflebagManager.getInstance().addShufflebag(
  'eventShufflebag',
  {
    EvilApplicantEvent: 5,
    WealthModEvent: 1,
    nothing: 1,
    IntruderAlert: 1,
    AngryAdminEvent: 1,
    OccupationalHazard: 1,
    PetEvent: 1,
    Raid: 10,
  },
);
// const eventShufflebag = new Shufflebag({
//   EvilApplicantEvent: 1,
//   WealthModEvent: 1,
//   nothing: 30,
//   IntruderAlert: 1,
//   AngryAdminEvent: 1,
//   OccupationalHazard: 1,
//   PetEvent: 1,
// });
/**
 * Add a set of random events to the event queue
 */
const prepareRandomEvents = () => {
  console.debug('Preparing random events');
  const { gameData } = GameManager.getInstance();
  const events: GameEvent[] = [];
  for (let potentialEvents = 0; potentialEvents < 1; potentialEvents++) {
    const eventType = eventShufflebag.next();

    let event;
    switch (eventType) {
      case 'EvilApplicantEvent':
        try {
          event = generateEvilApplicantEvent();

          events.push(event!);
        } catch (e) {
          console.log(e);
          break;
        }
        break;

      case 'WealthModEvent':
        event = generateWealthMod();
        events.push(event);
        break;
      case 'OccupationalHazard':
        event = generateOccupationalHazardEvent();
        events.push(event);
        break;
      case 'IntruderAlert':
        event = generateIntruderAlertEvent();
        events.push(event);
        break;
      case 'AngryAdminEvent':
        if (
          people.getPeople({
            personFilter: {
              organizationId: getEvilEmpire().id,
            },
            agentFilter: {
              agentsOnly: true,
              department: 'administrator',
            },
          }).length > 0
        ) {
          event = generateTemperTantrumEvent();
          events.push(event);
        }
        break;

      case 'PetEvent':
        if (getEvilEmpire().statusEffects.includes('pet')) {
          event = generatePetEvent();
          events.push(event);
        }
        break;

      case 'Raid':
        // determine if there are any people to raid
        const raiderPool = people.getPeople({
          nation: {
            nationId: organization.getEvilEmpire().id,
          },
          personFilter: {
            loyaltyFilter: {
              comparison: 'less',
              value: 75,
              organizationId: organization.getEvilEmpire().id,
            },
            excludeCaptured: true,
          },
        });
        if (raiderPool.length > 0) {
          event = generateRaidEvent();
          events.push(event);
        }
        break;

      default:
        break;
    }
  }
  if (events.length === 0) {
    events.push(generateStandardReportEvent());
  }

  // If this is the last day of the month, set the EOM event
  // Get the game date
  const gd = new Date(gameData.gameDate);
  const month = gd.getMonth();
  const year = gd.getFullYear() + 1;
  // @ts-ignore
  const monthEnd = new Date(new Date(year, month, 1) - 1);
  const day = gd.getDate();

  if (monthEnd.getDate() === day) {
    events.push(generateMonthlyReportEvent());
  }

  return events;
};

export { addPlotResolutions, eventConfig, prepareRandomEvents };
