import { GameManager } from '../../GameManager';
import { getPeople } from '../../actions/people';
import { getEvilEmpire } from '../../organization';
import { Person } from '../../types/interfaces/entities';
import { randomInt } from '../../utilities';

const authorPropaganda = (participantArray: string[]) => {
  if (participantArray.length === 0) {
    return null;
  }
  participantArray.forEach((participant) => {
    const agent = GameManager.getInstance().gameData.people[participant];
    // Determine the quality of the propaganda
    const propagandaQuality = randomInt(
      1,
      agent.standardAttributes.intelligence,
    );
    const propagandaEffect = propagandaQuality * 0.1;
    const skillIncrease = 0.5;
    const updatedAgent = {
      ...agent,
      skills: {
        ...agent.skills,
        administration: agent.skills.administration + skillIncrease,
      },
    };
    GameManager.getInstance().updateGameData({
      people: {
        [updatedAgent.id]: updatedAgent,
      },
    });
    getPeople({
      zone: {
        zoneId: agent.homeZoneId,
      },
    }).map((person) => {
      const updatedPerson: Person = {
        ...person,
        intelAttributes: {
          ...person.intelAttributes,
          loyalties: {
            ...person.intelAttributes.loyalties,
            [agent.nationId]:
              person.intelAttributes.loyalties[agent.nationId] +
              propagandaEffect,
          },
        },
      };
      GameManager.getInstance().updateGameData({
        people: {
          [updatedPerson.id]: updatedPerson,
        },
      });
    });
  });
};

export default authorPropaganda;
