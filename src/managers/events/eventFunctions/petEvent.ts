import { GameData, GameManager } from '../../game/GameManager';
import people from '../../../actions/people';
import buildings from '../../../actions/buildings';
import organization from '../../../actions/organization';
import Shufflebag from '../../shufflebag/Shufflebag';
import utilities from '../../../utilities';
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

const petEventShufflebag = new Shufflebag({
  trashKennel: 1,
  maul: 1,
  detectIntruder: 1,
  escape: 1,
  boostMorale: 1,
});

export const generatePetEvent = () => {
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
      const intruderOrg = organization.getRandomOrg({
        excludePlayer: true,
      });

      // Update this to be random
      const intrudingAgent = people.getPeople({
        personFilter: {
          organizationId: intruderOrg.id,
          excludeDeceased: true,
        },
        agentFilter: { agentsOnly: true },
      })[0];

      targetId = intrudingAgent.id;
      GameManager.getInstance().updateGameData(
        organization.takeCaptive(
          GameManager.getInstance().gameData.player.organizationId,
          intrudingAgent,
        ),
      );
      message = `Your pet has captured an intruder from ${intruderOrg.name}`;
      break;
    case 'escape':
      break;
    case 'maul': {
      // Select an empire agent
      const agentPool = people.getPeople({
        personFilter: {
          organizationId:
            GameManager.getInstance().gameData.player.organizationId,
          excludeDeceased: true,
        },
        agentFilter: { agentsOnly: true, excludeDepartments: ['overlord'] },
      });
      const agent = agentPool[utilities.randomInt(0, agentPool.length - 1)];
      targetId = agent.id;
      updatedGameData = people.updateCurrentHealth(
        agent,
        -utilities.randomInt(1, 10),
      );
      GameManager.getInstance().updateGameData(updatedGameData);
      message = `Your pet has mauled ${agent.name}`;
      break;
    }
    case 'trashKennel':
      const buildingPool = buildings.getBuildings({
        zoneId:
          GameManager.getInstance().gameData.people[
            GameManager.getInstance().gameData.player.overlordId
          ].homeZoneId,
      });
      const selectedBuilding =
        buildingPool[utilities.randomInt(0, buildingPool.length - 1)];
      updatedGameData = {
        ...updatedGameData,
        ...buildings.addBuildingStatusEffect(selectedBuilding.id, 'trashed'),
      };
      GameManager.getInstance().updateGameData(updatedGameData);
      message = `Your pet has trashed ${selectedBuilding.name}`;
      break;
    case 'boostMorale':
      const agents = people.getPeople({
        personFilter: {
          organizationId:
            GameManager.getInstance().gameData.player.organizationId,
          excludeDeceased: true,
        },
        agentFilter: { agentsOnly: true },
      });

      agents.forEach((agent) => {
        // boost morale

        GameManager.getInstance().updateGameData(
          people.updateLoyalty(
            agent,
            GameManager.getInstance().gameData.player.organizationId,
            utilities.randomInt(1, 3),
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
      GameManager.getInstance().updateGameData(updatedGameData);
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

export function resolvePetEvent(this: GameEvent) {
  const params = this.params as PetEventParams;
  GameManager.getInstance().addGameLogEvent({
    color: 'Primary',
    date: GameManager.getInstance().gameData.gameDate.toDateString(),
    icon: petEventConfig.icon,
    text: 'Pet Evemt',
  });
  this.eventData = {
    type: 'pet-event',
    resolution: {
      updatedGameData: {},
    },
  };
}

export const petEventConfig: EventConfig = {
  name: 'Pet Event',
  resolve: resolvePetEvent,
  getEventText(this: GameEvent) {
    const params = this.params as PetEventParams;
    return params.message;
  },
  icon: 'warning',
  type: 'petEvent',
  forceStop: true,
};
