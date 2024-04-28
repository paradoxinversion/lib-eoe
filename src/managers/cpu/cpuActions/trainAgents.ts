import { getPeople } from '../../../actions/people';
import { SkillTypes } from '../../../types/interfaces/entities';
import { randomInt } from '../../../utilities';
import Player from '../Player';

const trainAgents = (player: Player) => {
  const agents = getPeople({
    organizationId: player.player.organizationId,
    agentFilter: {
      agentsOnly: true,
    },
  });
  console.debug(player.player.name, 'is training agents');
  agents.forEach((agent) => {
    const skillsPool = Object.keys(agent.skills);
    const skill = skillsPool[randomInt(0, skillsPool.length - 1)];
    const skillIncrease = randomInt(0, 1);
    // agent.skills[skill as SkillTypes] += skillIncrease;
  });
};
export default trainAgents;
