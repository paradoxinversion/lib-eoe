import { GameData } from '../GameManager';
import { EventRequirements } from '../gameEvents';
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
  setParams: Function;
  resolve: Function;
  getEventText: Function;
  icon: string;
  type: string;
  forceStop: boolean;
  requirements?: EventRequirements;
}

/**
 * A GameEvent.
 */
class GameEvent {
  getEventText: Function;
  eventText?: string;
  setParams: Function;
  resolveEvent: Function;
  eventData: EventData;
  eventName: string;
  params:
    | {}
    | ReconZoneEventParams
    | EvilApplicantParams
    | MonthlyReportEventParams
    | AttackZoneParams
    | IntruderAlertEventParams
    | OccupationalHazardParams
    | ProjectCompleteParams
    | ProtestEventParams;
  type: string;
  /**
   * Create a game event using configuration.
   */
  constructor(config: EventConfig, eventSetupData = {}) {
    /**
     * Gets the event text based on params
     */
    this.getEventText = config.getEventText.bind(this);
    /**
     * Set parameters for the event.
     */
    this.setParams = config.setParams.bind(this);
    this.resolveEvent = config.resolve;

    this.eventData = {
      type: '',
      resolution: {},
    };

    this.params = {};
    /** The name of the event */
    this.eventName = config.name;
    this.setParams(eventSetupData);
    this.getEventText();
    this.type = config.type;
  }
}

export default GameEvent;
