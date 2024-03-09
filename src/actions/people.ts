import { GameManager } from "../GameManager";

interface GetPeopleParams {
  zoneId?: string | null;
  nationId?: string | null;
  agentFilter?: {
    excludeAgents?: boolean;
    department?: number;
    agentsOnly?: boolean;
  };
  /**
   * 0: No filter; 1: Only Agents; 2: No Agents
   */
  // agentFilter?: 0|1|2|null
}

export const getPeople = (
  gameManager: GameManager,
  {
    zoneId = null,
    nationId = null,
    agentFilter = {
      department: -1,
      excludeAgents: false,
      agentsOnly: false,
    },
  }: GetPeopleParams={}
) => {
  return Object.values(gameManager.gameData.people).filter((person) => {
    if (agentFilter.agentsOnly && person.agent === null) {
      return false;
    }
    if (agentFilter.excludeAgents && person.agent) {
      return false;
    }
    if (
      agentFilter.department !== -1 &&
      person.agent?.department !== agentFilter.department
    ) {
      return false;
    }
    if (zoneId && person.homeZoneId !== zoneId) {
      return false;
    }

    if (nationId && person.nationId !== nationId) {
      return false;
    }

    return true;
  });
};
