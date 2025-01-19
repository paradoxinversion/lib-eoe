import { GameLogEvent } from './GameLogEvent';

export interface GameLog {
  /** Logs of actions non-agent citizens have taken */
  simActions: {
    /** Map of people to an array of their actions */
    people: {
      /** An array of the names of the actions a person has taken over the course of the game */
      [x: string]: string[];
    };
  };
  events: GameLogEvent[];
}
