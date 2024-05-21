import { GameData, GameManager } from './GameManager';
import { getEvilEmpire } from './organization';
import { PlotResolution } from './plots';
// import { Shufflebag } from './utilities';
import Shufflebag from './managers/shufflebag/Shufflebag';
import { getPeople } from './actions/people';
import GameEvent from './events/GameEvent';
import GameEventQueue from './events/GameEventQueue';
import { GoverningOrgStatusEffects } from './statusEffects/governingOrg';
import { generateOccupationalHazardEvent } from './events/eventFunctions/occupationalHazard';
import eventConfig from './events/eventConfig';
import { generateStandardReportEvent } from './events/eventFunctions/standardReport';
import { generateEvilApplicantEvent } from './events/eventFunctions/applicant';
import { generateIntruderAlertEvent } from './events/eventFunctions/intruderAlert';
import { generateAttackZonePlotEvent } from './events/eventFunctions/attackZone';
import { generateReconZoneEvent } from './events/eventFunctions/recon';
import { generateWealthMod } from './events/eventFunctions/wealthMod';
import { generateTemperTantrumEvent } from './events/eventFunctions/temperTantrum';
import { generateMonthlyReportEvent } from './events/eventFunctions/monthlyReport';
import { generatePetEvent } from './events/eventFunctions/petEvent';
import { generateEmbedAgentsEvent } from './events/eventFunctions/embedAgents';
import { generateRecallEmbeddedAgentsEvent } from './events/eventFunctions/recallEmbeddedAgents';
import { generateInciteProtestEvent } from './events/eventFunctions/inciteProtest';
import { raid } from './events/eventFunctions';
import ShufflebagManager from './managers/shufflebag/shufflebagManager';

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
          getPeople({
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
        const people = getPeople({
          nation: {
            nationId: getEvilEmpire().id,
          },
          personFilter: {
            loyaltyFilter: {
              comparison: 'less',
              value: 75,
              organizationId: getEvilEmpire().id,
            },
            excludeCaptured: true,
          },
        });
        if (people.length > 0) {
          event = raid.generateEvent();
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
  //@ts-ignore
  const monthEnd = new Date(new Date(year, month, 1) - 1);
  const day = gd.getDate();

  if (monthEnd.getDate() === day) {
    events.push(generateMonthlyReportEvent());
  }

  return events;
};

export { addPlotResolutions, eventConfig, prepareRandomEvents };
