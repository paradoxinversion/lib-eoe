import Shufflebag from '../shufflebag/Shufflebag';
import { PlayerData as IPlayer } from '../../types';
import cpuActionNothing from './cpuActions/nothing';
import trainAgents from './cpuActions/trainAgents';
import { GameManager } from '../game/GameManager';
import actions from '../../actions';
const actionShuffleBag = new Shufflebag({
  nothing: 1,
  trainAgents: 1,
});

class Player {
  player: IPlayer;
  constructor(player: IPlayer) {
    this.player = player;
    console.debug('Initialized Player', this.player);
  }

  play() {
    // CPU logic
    const cpuOrg =
      GameManager.getInstance().gameData.governingOrganizations[
        this.player.organizationId
      ];
    // First determine what type of action the player will take

    // Staffing
    // Check if any buildings need personnel
    const buildingsWithStaffOpenings = actions.buildings.getBuildings({
      organizationId: this.player.organizationId,
      personnel: {
        needsPersonnel: true,
      },
    });

    // For now, cpu will hire civilians to fill the positions
    if (buildingsWithStaffOpenings.length > 0) {
      const civs = actions.people.getPeople({
        nation: { nationId: this.player.empireId },
        personFilter: {
          excludePersonnel: true,
        },
        agentFilter: {
          excludeAgents: true,
        },
      });
    }

    // if (cpuOrg.opinions)
    console.debug('CPU Turn');
    const cpuAction = '';

    switch (actionShuffleBag.next()) {
      case 'nothing':
        cpuActionNothing(this);
        break;
      case 'trainAgents':
        trainAgents(this);
        break;
      default:
        cpuActionNothing(this);
        break;
    }
  }

  serialize() {
    return this.player;
  }
}

export default Player;
