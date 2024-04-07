import { GameData, GameManager } from '../../GameManager';
import {
  getPeople,
  updateCurrentHealth,
  updateLoyalty,
} from '../../actions/people';
import { addBuildingStatusEffect, getBuildings } from '../../buildings';
import {
  getOrganizations,
  getRandomOrg,
  takeCaptive,
} from '../../organization';
import { Shufflebag, randomInt } from '../../utilities';
import GameEvent, { EventConfig } from '../GameEvent';

export type PetEventTypes =
  | 'trashKennel'
  | 'boostMorale'
  | 'maul'
  | 'detectIntruder'
  | 'escape';

export interface PetEventParams {
  petEvent: PetEventTypes;
  target?: {
    person: string;
    building: string;
  };
  damage?: number;
  message: string;
}

const petEventShufflebag = Shufflebag({
  trashKennel: 1,
  maul: 1,
  detectIntruder: 1,
  escape: 1,
  boostMorale: 1,
});

export const generatePetEvent = (gameManager: GameManager) => {
  // pets can...
  // - trash their kennels
  // - maul people
  // - detect intruders
  // - escape and run amok

  // Select the event
  const petEvent: PetEventTypes = petEventShufflebag.next() as PetEventTypes;

  // Prepare the gamedata update
  let updatedGameData: Partial<GameData> = {
    people: {},
    buildings: {},
  };
  let targetId: string | undefined;
  let message: string = '';
  switch (petEvent) {
    case 'detectIntruder':
      // get an intruder
      const intruderOrg = getRandomOrg(gameManager, {
        excludePlayer: true,
      });

      // Update this to be random
      const intrudingAgent = getPeople(gameManager, {
        organizationId: intruderOrg.id,
        agentFilter: { agentsOnly: true },
        excludeDeceased: true,
      })[0];

      targetId = intrudingAgent.id;
      gameManager.updateGameData(
        takeCaptive(
          gameManager,
          gameManager.gameData.player.organizationId,
          intrudingAgent,
        ),
      );
      message = `Your pet has captured an intruder from ${intruderOrg.name}`;
      break;
    case 'escape':
      break;
    case 'maul': {
      // Select an empire agent
      const agentPool = getPeople(gameManager, {
        organizationId: gameManager.gameData.player.organizationId,
        agentFilter: { agentsOnly: true, excludeDepartments: [3] },
        excludeDeceased: true,
      });
      const agent = agentPool[randomInt(0, agentPool.length - 1)];
      targetId = agent.id;
      updatedGameData = updateCurrentHealth(agent, -randomInt(1, 10));
      gameManager.updateGameData(updatedGameData);
      message = `Your pet has mauled ${agent.name}`;
      break;
    }
    case 'trashKennel':
      const buildings = getBuildings(gameManager, {
        zoneId:
          gameManager.gameData.people[gameManager.gameData.player.overlordId]
            .homeZoneId,
      });
      const selectedBuilding = buildings[randomInt(0, buildings.length - 1)];
      updatedGameData = {
        ...updatedGameData,
        ...addBuildingStatusEffect(gameManager, selectedBuilding.id, 'trashed'),
      };
      gameManager.updateGameData(updatedGameData);
      message = `Your pet has trashed ${selectedBuilding.name}`;
      break;
    case 'boostMorale':
      const agents = getPeople(gameManager, {
        organizationId: gameManager.gameData.player.organizationId,
        agentFilter: { agentsOnly: true },
        excludeDeceased: true,
      });

      agents.forEach((agent) => {
        // boost morale

        gameManager.updateGameData(
          updateLoyalty(
            agent,
            gameManager.gameData.player.organizationId,
            randomInt(1, 3),
          ),
        );
      });

      updatedGameData = agents.reduce<Partial<GameData>>(
        (gameData, person) => {
          gameData.people![person.id] = person;
          return gameData;
        },
        {
          people: {},
        },
      );
      gameManager.updateGameData(updatedGameData);
      message = `Your pet has boosted the morale of your agents`;
      break;
    default:
      break;
  }

  return new GameEvent(petEventConfig, {
    petEvent,
    updatedGameData,
    targetId,
    message,
  });
};

export function setPetEventParams(this: GameEvent, params: PetEventParams) {
  this.params = params;
}

export function resolvePetEvent(this: GameEvent, gameManager: GameManager) {
  const params = this.params as PetEventParams;

  this.eventData = {
    type: 'pet-event',
    resolution: {
      updatedGameData: {},
    },
  };
}

export const petEventConfig: EventConfig = {
  name: 'Pet Event',
  setParams: setPetEventParams,
  resolve: resolvePetEvent,
  getEventText(this: GameEvent) {
    const params = this.params as PetEventParams;
    return params.message;
  },
  icon: 'warning',
  type: 'petEvent',
  forceStop: true,
};
