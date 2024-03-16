import { GameData } from '../GameManager';
import {
  EvilApplicantParams,
  CombatEventParams,
  MonthlyReportEventParams,
  ReconZoneEventParams,
  AttackZoneParams,
  IntruderAlertEventParams,
  ProjectCompleteParams,
} from '../gameEvents';

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
  params: {
    evilApplicant?: EvilApplicantParams;
    wealthMod?: {
      modAmount: number;
    };
    combat?: CombatEventParams;
    monthlyReport?: MonthlyReportEventParams;
    reconZone?: ReconZoneEventParams;
    attackZone?: AttackZoneParams;
    intruderAlert?: IntruderAlertEventParams;
    projectComplete?: ProjectCompleteParams;
  };
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
  }
}

export default GameEvent;
