import { GameManager } from '../../GameManager';
import { doCombat } from '../../combat';
import { getAgentsInZone } from '../../organization';

interface PlotAttackZoneOpts {
  zone: {
    id: string;
    organizationId: string;
  };
  participants: string[];
}
/**
 * Attack a zone
 */
export const attackZone = (
  gameManager: GameManager,
  {
    zone: { id: zoneId, organizationId: zoneOrgId },
    participants,
  }: PlotAttackZoneOpts,
) => {
  const { gameData } = gameManager;
  const defendingAgents = getAgentsInZone(gameManager, zoneOrgId, zoneId);
  const attackingAgents = participants.map((agent) => gameData.people[agent]);
  const result = doCombat(attackingAgents, defendingAgents);
  return {
    data: result,
    evil: 10,
  };
};
