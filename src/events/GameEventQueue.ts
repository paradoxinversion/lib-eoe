import GameEvent from './GameEvent';

/**
 * Manages game events
 */
class GameEventQueue {
  events: GameEvent[];
  eventIndex: number;
  /**
   * Initialize the GameEventQueue
   * @param {GameEvent[]} events
   */
  constructor(events?: GameEvent[]) {
    /**
     * @type {GameEvent[]}
     */
    this.events = events || [];
    this.eventIndex = 0;
  }

  /**
   * Resolve the current game event with player input (resolveArgs)
   */
  //@ts-ignore
  resolveCurrentEvent(gameManager: GameManager, resolveArgs) {
    const { gameData } = gameManager;
    return this.events[this.eventIndex].resolveEvent(gameManager, resolveArgs);
  }

  /**
   * Set the event index to the next event
   */
  incrementEventIndex() {
    this.eventIndex = this.eventIndex + 1;
  }

  /**
   * Set the events for the queue to handle. This method
   * should not be used to add events to a queue with
   * existing events, as it will replace the contents
   * of the array.
   */
  setEvents(events: GameEvent[]) {
    this.events = events;
  }

  /**
   * Push a new event to the queue.
   */
  addEvent(event: GameEvent) {
    this.events.push(event);
  }

  /**
   * Concatenates an array of events to the queue.
   * This should be used instead of `setEvents`
   * when multiple events should be appended to the
   * queue at once when the array is not empty.
   */
  addEvents(events: GameEvent[]) {
    this.events.concat(events);
  }

  /**
   * Return the current game event
   */
  getCurrentEvent() {
    return this.events[this.eventIndex];
  }

  /**
   * Clear the event queue. This should be done after
   * all events are resolved.
   */
  clearEvents() {
    this.events = [];
    this.eventIndex = 0;
  }
}

export default GameEventQueue;
