import { getPeople } from '../../../actions/people';
import Player from '../Player';

const trainAgents = (player: Player) => {
  const agents = getPeople({
    organizationId: player.player.organizationId,
    agentFilter: {
      agentsOnly: true,
    },
  });
  console.debug(player.player.name, 'is training agents');
};
export default trainAgents;
