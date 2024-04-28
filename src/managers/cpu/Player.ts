import { PlayerData as IPlayer } from '../../types/player';
import cpuActionNothing from './cpuActions/nothing';
import trainAgents from './cpuActions/trainAgents';
import { Shufflebag } from '../../utilities';
const actionShuffleBag = Shufflebag({
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
