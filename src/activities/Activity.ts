import { GameManager } from '../GameManager';
import { Person } from '../types/interfaces/entities';

export interface ActivityParticipants {
  name: string;
  agents: string[];
}
/**
 * Activities are ongoing tasks that agents can participate in.
 */
export default class Activity {
  /** The na,e of the Activity */
  name: string;
  /** Array of IDs belonging to participating agents */
  agents: string[];
  /** Execution function for this activity */
  fn: Function;

  constructor(name: string, executionFn: Function) {
    this.name = name;
    this.agents = [];
    this.fn = executionFn;
  }

  /**
   * Sets agents for this task. Overwrites the current list.
   */
  setAgents(agents: string[]) {
    this.agents = agents;
  }
  /**
   * Add an agent to the activity
   */
  addAgent(gameManager: GameManager, agent: string) {
    const { gameData } = gameManager;
    let updatedGameData: { people: { [x: string]: Person } } = {
      people: {},
    };
    if (!this.agents.includes(agent)) {
      this.agents = [...this.agents, agent];
      const updatedAgent: Person = JSON.parse(
        JSON.stringify(gameData.people[agent]),
      );
      updatedGameData.people[updatedAgent.id] = updatedAgent;
    }
    return updatedGameData;
  }

  /**
   * Remove an agent from the activity
   */
  removeAgent(gameManager: GameManager, agentId: string) {
    const { gameData } = gameManager;
    let updatedGameData: { people: { [x: string]: Person } } = {
      people: {},
    };
    const agentIndex = this.agents.findIndex((agent) => agent === agentId);
    if (agentIndex != -1) {
      this.agents.splice(agentIndex, 1);
      const updatedAgent: Person = JSON.parse(
        JSON.stringify(gameData.people[agentId]),
      );
      updatedGameData.people[updatedAgent.id] = updatedAgent;
    }
    return updatedGameData;
  }

  /**
   * Execute this activity
   */
  executeActivity(gameManager: GameManager) {
    const result = this.fn(gameManager, this.agents);
    const updatedGameData: { people: { [x: string]: Person } } = {
      people: {},
    };
    if (result) {
      Object.values<Person>(result.people).forEach((person: Person) => {
        updatedGameData.people[person.id] = person;
      });
    }
    return { result, updatedGameData };
  }
}
