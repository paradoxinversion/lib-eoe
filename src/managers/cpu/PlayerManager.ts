import Player from './Player';

class PlayerManager {
  private static instance: PlayerManager;
  players: { [key: string]: Player };
  private constructor() {
    console.info('Player Manager Initialized');
    this.players = {};
  }

  public static getInstance(): PlayerManager {
    if (!PlayerManager.instance) {
      PlayerManager.instance = new PlayerManager();
    }

    return PlayerManager.instance;
  }

  public addPlayer(player: Player) {
    this.players[player.player.name] = player;
  }

  public takeTurns() {
    Object.values(this.players).forEach((player) => {
      if (!player.player.cpu) return;

      player.play();
    });
  }
}

export default PlayerManager;
