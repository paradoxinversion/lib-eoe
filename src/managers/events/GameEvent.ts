import { GameData } from '../game/GameManager';
import { EventRequirements } from '../../gameEvents';
import { EvilApplicantParams } from './eventFunctions/applicant';
import { AttackZoneParams } from './eventFunctions/attackZone';
import { IntruderAlertEventParams } from './eventFunctions/intruderAlert';
import { MonthlyReportEventParams } from './eventFunctions/monthlyReport';
import { OccupationalHazardParams } from './eventFunctions/occupationalHazard';
import { ProjectCompleteParams } from './eventFunctions/projectComplete';
import { ProtestEventParams } from './eventFunctions/protest';
import { ReconZoneEventParams } from './eventFunctions/recon';
export interface EventData {
  type: string;
  resolution: {
    updatedGameData?: Partial<GameData>;
    additionalData?: {
      [x: string]: Object | string | number | boolean;
    };
  };
}

export interface EventConfig {
  name: string;
  resolve: Function;
  getEventText: Function;
  icon: string;
  type: string;
  forceStop: boolean;
  requirements?: EventRequirements;
}

export type EventParams =
  | ReconZoneEventParams
  | EvilApplicantParams
  | MonthlyReportEventParams
  | AttackZoneParams
  | IntruderAlertEventParams
  | OccupationalHazardParams
  | ProjectCompleteParams
  | ProtestEventParams
  | NonNullable<unknown>
  | undefined;

/**
 * A GameEvent.
 *
 * Game Events are considered to have happened in the past, and are resolved in the present.
 */
class GameEvent {
  /** A camel-cased version of the GameEvent's name */
  type: string;
  /** The event name shown to the player in the UI */
  eventName: string;
  /** Parameters necessary to set up the event */
  params: EventParams;
  eventData: EventData;
  getEventText: Function;
  eventText?: string;
  resolveEvent: Function;
  /**
   * Create a game event using configuration.
   */
  constructor(
    config: EventConfig,
    eventSetupData: EventParams,
    eventText?: string,
  ) {
    /**
     * Gets the event text based on params
     */
    this.getEventText = config.getEventText.bind(this);
    /**
     * Set parameters for the event.
     */
    // this.setParams = config.setParams.bind(this);
    this.resolveEvent = config.resolve;

    this.eventData = {
      type: '',
      resolution: {},
    };

    this.params = eventSetupData;

    /** The name of the event */
    this.eventName = config.name;
    // this.setParams(eventSetupData);
    this.getEventText();
    this.type = config.type;
    this.eventText = eventText;
  }
}

export default GameEvent;
