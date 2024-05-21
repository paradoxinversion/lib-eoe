import { updateEvil, updateOrgWealth } from '../../organization';
import { Person } from '../../types/interfaces/entities';
import { GameManager } from '../game/GameManager';
import activityConfig from './activityConfig';

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
  type: string;
  costPerParticipant: number;
  description?: string;

  constructor(
    name: string,
    type: string,
    costPerParticipant: number,
    executionFn: Function,
    description?: string,
  ) {
    this.name = name;
    this.agents = [];
    this.fn = executionFn;
    this.type = type;
    this.costPerParticipant = costPerParticipant;
    this.description = description;
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
  addAgent(agent: string) {
    const { gameData } = GameManager.getInstance();
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
  removeAgent(agentId: string) {
    const { gameData } = GameManager.getInstance();
    let updatedGameData: { people: { [x: string]: Person } } = {
      people: {},
    };
    const agentIndex = this.agents.findIndex((agent) => agent === agentId);
    if (agentIndex != -1) {
      const agents = [...this.agents];
      agents.splice(agentIndex, 1);
      this.agents = agents;
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
  executeActivity() {
    const result = this.fn(this.agents);

    const updatedGameData: { people: { [x: string]: Person } } = {
      people: {},
    };

    if (result) {
      // Update empire wealth
      updateOrgWealth(
        GameManager.getInstance().gameData.player.organizationId,
        -this.costPerParticipant * this.agents.length,
      );
      Object.values<Person>(result.people).forEach((person: Person) => {
        updatedGameData.people[person.id] = person;
      });
    }
    return { result, updatedGameData };
  }
}
