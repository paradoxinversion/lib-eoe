import GameManager from '../../game/GameManager';
import people from '../../../actions/people';
import zones from '../../../actions/zones';
import { ProtestEventParams, Zone } from '../../../types';
import GameEvent from '../GameEvent';

export const generateProtestEvent = () => {
  const zone = zones.getRandomZone({
    organizationId: GameManager.getInstance().gameData.player.organizationId,
  });

  // get a random amount of people from the zone with low loyalty
  const citizenPool = people
    .getPeople({
      zone: {
        zoneId: zone.id,
      },
      agentFilter: {
        excludeAgents: true,
      },
    })
    .filter(
      (person) => person.intelAttributes.loyalties[zone.organizationId] < 50,
    );

  const protestorAmount = Math.floor(Math.random() * 0.25);
  const protestors = citizenPool.slice(0, protestorAmount);

  const targetOrg = GameManager.getInstance().gameData.player.organizationId;
  return new GameEvent(protestEventConfig, {
    zone,
    targetOrganization: targetOrg,
    protestors,
  });
};

type ProtestEventResolveArgs = {
  stopWithForce: boolean;
};
function resolveProtest(this: GameEvent, resolveArgs: ProtestEventResolveArgs) {
  const params = this.params as ProtestEventParams;
  const { zone, protestors } = params;
  if (resolveArgs.stopWithForce) {
    // select 10% of the empire agents
    const agents = people.getPeople({
      personFilter: {
        organizationId:
          GameManager.getInstance().gameData.player.organizationId,
      },
      agentFilter: {
        agentsOnly: true,
      },
    });
    const responseForce = agents.slice(0, Math.floor(agents.length * 0.1));

    const responseForceSecurityTotal = responseForce.reduce(
      (acc, agent) => acc + agent.skills.security,
      0,
    );

    const protestorSecurityTotal = protestors.reduce(
      (acc, protestor) => acc + protestor.skills.security,
      0,
    );
    if (responseForceSecurityTotal > protestorSecurityTotal) {
      // protest is stopped
      this.eventText = 'The protest was stopped by force';
    } else {
      // protest is successful
      this.eventText = 'The protest was successful';
      const z: Zone = {
        ...GameManager.getInstance().gameData.zones[zone],
        intelAttributes: {
          ...GameManager.getInstance().gameData.zones[zone].intelAttributes,
          intelligenceLevel:
            GameManager.getInstance().gameData.zones[zone].intelAttributes
              .intelligenceLevel - 10,
        },
      };
      GameManager.getInstance().updateGameData({
        zones: {
          ...GameManager.getInstance().gameData.zones,
          [zone]: z,
        },
      });
    }
  }

  this.eventData = {
    type: 'recon-zone',
    resolution: {},
  };
  return this.eventData;
}

export const protestEventConfig = {
  name: 'Protest',
  resolve: resolveProtest,
  getEventText(this: GameEvent) {
    this.eventText = 'A protest has been started';
  },
  icon: 'protest',
  type: 'protest',
  forceStop: true,
};
