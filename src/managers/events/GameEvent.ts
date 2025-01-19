import { EventData, EventConfig, EventParams } from '../../types';

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
