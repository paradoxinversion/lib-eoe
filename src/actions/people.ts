import { GameData, GameManager } from "../GameManager";
import { AgentData, Person } from "../types/interfaces/entities";

interface GetPeopleParams {
  zoneId?: string | null;
  nationId?: string | null;
  agentFilter?: {
    excludeAgents?: boolean;
    department?: number;
    agentsOnly?: boolean;
    commander?: string;
  };
  excludePersonnel?: boolean;
  organizationId?: string;
}

export const getPeople = (
  gameManager: GameManager,
  {
    excludePersonnel = false,
    zoneId = null,
    nationId = null,
    organizationId = null,
    agentFilter = {
      department: -1,
      excludeAgents: false,
      agentsOnly: false,
      commander: '',
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
    if (agentFilter.commander && person.agent?.commanderId !== agentFilter.commander) {
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

    if (excludePersonnel && person.isPersonnel){
      return false;
    }

    if (organizationId && person.agent?.organizationId !== organizationId){
      return false;
    }

    return true;
  });
};

export const getAgentDepartment = (agentData: AgentData) => {
  if (agentData.department === 0) {
    return 'Henchman';
  } else if (agentData.department === 1) {
    return "Administrator"
  } else if (agentData.department === 2) {
    return "Scientist"
  } else if (agentData.department === 3) {
    return "Chief Commander"
  }
}

export const changeAgentDepartment = (theAgent: Person, department: number): Partial<GameData> => {
  
  const updatedPerson: Person = {
    ...theAgent,
    agent: {
      ...theAgent.agent!,
      department
    }
  }

  return {
    people: {
      [updatedPerson.id]: updatedPerson
    }
  }
}

export const killPerson = (person: Person) => {
  const updatedPerson: Person = {
    ...person,
    dead: true,
    currentHealth: 0,
  }

  return {
    people: {
      [updatedPerson.id]: updatedPerson
    }
  }
}